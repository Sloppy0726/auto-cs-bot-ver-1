"use strict";

// Per-business monthly LLM token budget.
//
// Tracks how many tokens each shop (businessId) has spent in the current
// Hong Kong calendar month and answers "is this shop still under its cap?".
// The server uses it as a cross-cutting gate (like the rate limiter): when a
// shop is over budget the webhook skips the LLM entirely and sends a fixed
// fallback reply, so a single runaway shop can never blow the whole API bill.
//
// Accounting is fed by the existing onUsage callback (exact token counts);
// the gate is checked before any LLM call. Usage resets automatically when
// the HK month rolls over.
//
// Disabled by default: with no limit configured every check() is allowed, so
// existing deployments are unaffected until an operator sets a cap.
//
// Tunable via env (see createTokenBudgetFromEnv):
//   TOKEN_BUDGET_FILE        — JSON file to persist monthly usage
//   TOKEN_BUDGET_MONTHLY     — default monthly cap (tokens) for every shop
//   TOKEN_BUDGET_<BUSINESS>  — per-shop override, e.g. TOKEN_BUDGET_PRINCE_SNOOKER

const fs = require("node:fs");
const path = require("node:path");
const { hkDateKey } = require("../../google drive promo sync ver 1.0/src/hkTime");

function createTokenBudget(options = {}) {
  const filePath = options.filePath || null;
  const nowFn = typeof options.nowFn === "function" ? options.nowFn : () => new Date();
  const defaultLimit = toLimit(options.defaultLimit);
  const limits = normalizeLimits(options.limits);

  let state = loadFromDisk(filePath) || { month: monthKey(nowFn()), usage: {} };

  function limitFor(businessId) {
    if (businessId && Object.prototype.hasOwnProperty.call(limits, businessId)) return limits[businessId];
    return defaultLimit;
  }

  // Roll usage to zero when the HK month changes. Called lazily on every op so
  // a long-running process resets without a scheduler.
  function rollIfNeeded() {
    const current = monthKey(nowFn());
    if (state.month !== current) {
      state = { month: current, usage: {} };
      persist();
    }
  }

  function check(businessId) {
    rollIfNeeded();
    const limit = limitFor(businessId);
    const used = state.usage[businessId] || 0;
    if (limit == null) return { allowed: true, used, limit: null, remaining: null, month: state.month };
    return {
      allowed: used < limit,
      used,
      limit,
      remaining: Math.max(0, limit - used),
      month: state.month
    };
  }

  function record(businessId, tokens) {
    const amount = Number(tokens);
    if (!businessId || !Number.isFinite(amount) || amount <= 0) return;
    rollIfNeeded();
    state.usage[businessId] = (state.usage[businessId] || 0) + amount;
    persist();
  }

  function snapshot() {
    rollIfNeeded();
    const shops = Object.keys(state.usage).map((businessId) => {
      const used = state.usage[businessId] || 0;
      const limit = limitFor(businessId);
      return {
        businessId,
        used,
        limit: limit == null ? null : limit,
        remaining: limit == null ? null : Math.max(0, limit - used),
        overBudget: limit != null && used >= limit
      };
    });
    return { month: state.month, defaultLimit, shops };
  }

  function persist() {
    if (!filePath) return;
    saveToDisk(filePath, state);
  }

  return { check, record, snapshot, _state: () => state };
}

// Reads budget config from process.env. Returns null when no cap is set at all,
// which keeps the feature off (and the server skips wiring it) by default.
function createTokenBudgetFromEnv(env = process.env, options = {}) {
  const defaultLimit = toLimit(env.TOKEN_BUDGET_MONTHLY);
  const limits = {};
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith("TOKEN_BUDGET_")) continue;
    if (key === "TOKEN_BUDGET_MONTHLY" || key === "TOKEN_BUDGET_FILE" || key === "TOKEN_BUDGET_MESSAGE") continue;
    const limit = toLimit(value);
    if (limit == null) continue;
    limits[businessIdFromEnvKey(key)] = limit;
  }

  if (defaultLimit == null && Object.keys(limits).length === 0) return null;

  return createTokenBudget({
    filePath: env.TOKEN_BUDGET_FILE || null,
    defaultLimit,
    limits,
    nowFn: options.nowFn
  });
}

// "TOKEN_BUDGET_PRINCE_SNOOKER" -> "prince_snooker"
function businessIdFromEnvKey(key) {
  return key.slice("TOKEN_BUDGET_".length).toLowerCase();
}

function monthKey(date) {
  return hkDateKey(date).slice(0, 7); // "YYYY-MM"
}

function toLimit(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function normalizeLimits(raw) {
  const out = {};
  for (const [businessId, value] of Object.entries(raw || {})) {
    const limit = toLimit(value);
    if (limit != null) out[businessId] = limit;
  }
  return out;
}

function loadFromDisk(filePath) {
  if (!filePath) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const usage = parsed.usage && typeof parsed.usage === "object" ? parsed.usage : {};
    const clean = {};
    for (const [businessId, value] of Object.entries(usage)) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) clean[businessId] = n;
    }
    return { month: typeof parsed.month === "string" ? parsed.month : monthKey(new Date()), usage: clean };
  } catch {
    return null; // missing or corrupt file: start fresh
  }
}

function saveToDisk(filePath, state) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, filePath);
}

module.exports = {
  createTokenBudget,
  createTokenBudgetFromEnv,
  _internal: { monthKey, toLimit, businessIdFromEnvKey, loadFromDisk, saveToDisk }
};
