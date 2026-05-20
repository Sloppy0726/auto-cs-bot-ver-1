"use strict";

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

function createHandoffState(options = {}) {
  const filePath = options.filePath || path.join(__dirname, "..", "state", "handoff.json");
  const ttlMs = Number.isFinite(options.ttlMs) && options.ttlMs > 0 ? options.ttlMs : DEFAULT_TTL_MS;
  const enabled = options.enabled !== false;
  const nowFn = typeof options.nowFn === "function" ? options.nowFn : () => new Date();

  function active(chatKey) {
    if (!enabled) return null;
    const key = normalizeChatKey(chatKey);
    if (!key) return null;
    const state = prune(load());
    return state.paused[key] || null;
  }

  function pause(chatKey, details = {}) {
    if (!enabled) return null;
    const key = normalizeChatKey(chatKey);
    if (!key) return null;
    const now = nowFn();
    const record = {
      chatKey: key,
      pausedAt: now.toISOString(),
      pauseUntil: new Date(now.getTime() + ttlMs).toISOString(),
      stage: details.stage || "waiting_for_staff",
      reason: details.reason || "staff_handoff",
      intent: details.intent || null,
      staffItemId: details.staffItemId || null,
      lastCustomerText: details.lastCustomerText || null,
      botHandoffText: details.botHandoffText || null,
      botHandoffFingerprint: details.botHandoffFingerprint || null,
      staffReplyAt: null,
      staffReplyText: null,
      staffReplyFingerprint: null
    };
    const state = prune(load());
    state.paused[key] = record;
    save(state);
    return record;
  }

  function release(chatKey) {
    const key = normalizeChatKey(chatKey);
    if (!key) return false;
    const state = load();
    const existed = Boolean(state.paused[key]);
    delete state.paused[key];
    if (existed) save(state);
    return existed;
  }

  function markStaffReply(chatKey, details = {}) {
    if (!enabled) return null;
    const key = normalizeChatKey(chatKey);
    if (!key) return null;
    const state = prune(load());
    const record = state.paused[key];
    if (!record) return null;
    record.stage = "staff_replied";
    record.staffReplyAt = nowFn().toISOString();
    record.staffReplyText = details.text || null;
    record.staffReplyFingerprint = details.fingerprint || null;
    state.paused[key] = record;
    save(state);
    return record;
  }

  function clear() {
    save({ paused: {} });
  }

  function load() {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return normalizeState(parsed);
    } catch (error) {
      if (error.code !== "ENOENT") {
        return { paused: {} };
      }
      return { paused: {} };
    }
  }

  function prune(state) {
    const normalized = normalizeState(state);
    const now = nowFn().getTime();
    let changed = false;
    for (const [key, record] of Object.entries(normalized.paused)) {
      const pauseUntil = Date.parse(record.pauseUntil || "");
      if (!Number.isFinite(pauseUntil) || pauseUntil <= now) {
        delete normalized.paused[key];
        changed = true;
      }
    }
    if (changed) save(normalized);
    return normalized;
  }

  function save(state) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(normalizeState(state), null, 2));
  }

  return { active, pause, release, markStaffReply, clear, load: () => prune(load()) };
}

function normalizeState(state) {
  return {
    paused: state && typeof state.paused === "object" && state.paused !== null ? state.paused : {}
  };
}

function normalizeChatKey(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

module.exports = {
  createHandoffState,
  normalizeChatKey,
  DEFAULT_TTL_MS
};
