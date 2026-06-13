"use strict";

// Win-Back + Attribution Engine ver 1.0  (搵錢實證 + 召回引擎)
// Reframes the bot from a cost into a profit centre: it surfaces the lapsed customers
// and expiring prepaid value the shop is about to lose, hands the owner a one-tap nudge
// (staff approves — nothing auto-sends), and keeps a tamper-evident "recovered HK$X this
// month" ledger. Once the owner reads that line as P&L, turning the bot off costs money.
//
// Deterministic, stdlib-only. Reads the existing redemption ledger (which holds the raw
// customer id, remaining sessions, expiry and per-session price). Lapsed-regular /
// waitlist / stale-enquiry triggers are injectable event seams (default empty), because
// the regulars ledger pseudonymises its sender ids by design and cannot supply contacts.
//
// Differentiator vs GHL/Fresha reactivation: the recovered-$ provenance is hash-chained
// (reuses the action journal primitives), so the P&L line is auditable, not self-asserted UI.

const fs = require("node:fs");
const path = require("node:path");
const { sha256, canonicalize } = require("../../action journal ver 1.0/src/actionJournal");

const GENESIS_HASH = "0".repeat(64);
const DEFAULT_LAPSE_DAYS = 90;
const DEFAULT_EXPIRY_WINDOW_DAYS = 30;

// Default consent gate: a reminder about a customer's OWN purchased package is service
// communication (allowed); a generic win-back is marketing (left to staff discretion —
// the human approval IS the consent safeguard until a real consent vault is wired).
function defaultCanSend({ kind }) {
  return { ok: true, basis: kind === "service" ? "service_message" : "staff_discretion" };
}

function createWinback(config = {}) {
  const nowFn = config.nowFn || (() => new Date());
  const lapseDays = config.lapseDays || DEFAULT_LAPSE_DAYS;
  const expiryWindowDays = config.expiryWindowDays || DEFAULT_EXPIRY_WINDOW_DAYS;
  const canSend = config.canSend || defaultCanSend;
  const redemptionLedger = config.redemptionLedger || null;
  const filePath = config.filePath || null;
  let attributions = [];

  if (filePath && fs.existsSync(filePath)) attributions = load(filePath);

  function persist() {
    if (!filePath) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, JSON.stringify({ attributions }, null, 2), "utf8");
    fs.renameSync(tmp, filePath);
  }

  // Lazy sweep (no timers): surface recoverable value from the redemption ledger plus
  // any injected cancellation/enquiry events.
  function sweep(input = {}) {
    const now = input.now || nowFn();
    const businessId = input.businessId || null;
    const candidates = [];

    if (redemptionLedger) {
      const all = redemptionLedger.all();
      for (const packageId of Object.keys(all)) {
        const bal = redemptionLedger.balance(packageId);
        if (!bal || bal.remaining <= 0) continue;
        if (businessId && bal.businessId !== businessId) continue;
        if (!bal.customerExternalId) continue; // can't reach them → skip

        const daysToExpiry = bal.expiryDate ? daysBetween(dateKey(now), bal.expiryDate) : null;
        const lastRedemption = lastRedemptionAt(all[packageId]);
        const daysSince = lastRedemption ? daysBetween(dateKey(lastRedemption), dateKey(now)) : null;

        if (daysToExpiry != null && daysToExpiry >= 0 && daysToExpiry <= expiryWindowDays) {
          candidates.push(makeCandidate("package_expiry", "service", bal, packageId, { daysToExpiry }));
        } else if (daysSince != null && daysSince >= lapseDays) {
          candidates.push(makeCandidate("package_lapsed", "marketing", bal, packageId, { daysSince }));
        }
      }
    }

    // Injected event seams (default none): a cancellation opens a slot to offer the
    // waitlist; a stale enquiry got no booking. Caller supplies contacts + context.
    for (const ev of input.waitlistEvents || []) candidates.push({ type: "waitlist_fill", kind: "service", ...ev, estValue: ev.estValue ?? null });
    for (const ev of input.staleEnquiries || []) candidates.push({ type: "stale_enquiry", kind: "marketing", ...ev, estValue: ev.estValue ?? null });

    // Sort by recoverable value desc (nulls last).
    candidates.sort((a, b) => (b.estValue ?? -1) - (a.estValue ?? -1));
    return { now: now.toISOString(), candidates, atRiskValue: candidates.reduce((s, c) => s + (Number(c.estValue) || 0), 0) };
  }

  // Submit candidates to the staff inbox for human approval. Nothing auto-sends.
  function submitCandidates(inbox, candidates, opts = {}) {
    const submitted = [];
    for (const c of candidates) {
      const gate = canSend({ businessId: c.businessId, customerExternalId: c.customerExternalId, kind: c.kind });
      if (!gate.ok) continue; // consent gate blocked it
      const item = inbox.submit({
        decision: { action: "staff_review", businessId: c.businessId, escalationLabel: "winback", reasons: [`${c.type}: est HK$${c.estValue ?? "?"} recoverable`, `consent: ${gate.basis}`] },
        draft: { action: "staff_review", text: `${c.suggestedText}\n（召回建議 — ${c.kind === "marketing" ? "確認客人願意收推廣訊息先好發" : "服務提示"}；批准先會發出）` },
        safety: { verdict: "pass", safeToSend: false, reasons: ["winback nudge awaiting staff approval"] },
        normalizedMessage: { businessId: c.businessId, senderId: c.customerExternalId, channel: opts.channel || "whatsapp" },
        customerText: ""
      });
      submitted.push({ candidate: c, staffItemId: item.id, consent: gate.basis });
    }
    return submitted;
  }

  // Record a confirmed recovery (staff-approved nudge → booking/redemption). Hash-chained
  // for auditable provenance. Honest: "candidate recovered", within a tight window.
  function attribute(input = {}) {
    const now = input.now || nowFn();
    const prevHash = attributions.length ? attributions[attributions.length - 1].entryHash : GENESIS_HASH;
    const body = {
      seq: attributions.length + 1,
      prevHash,
      at: now.toISOString(),
      businessId: input.businessId || null,
      customerRef: input.customerExternalId ? sha256(`sender:${input.customerExternalId}`).slice(0, 16) : null,
      type: input.type || "package_expiry",
      packageId: input.packageId || null,
      recoveredValue: Number(input.recoveredValue) || 0,
      currency: input.currency || "HKD"
    };
    const entry = { ...body, entryHash: sha256(`${prevHash}:${canonicalize(body)}`) };
    attributions.push(entry);
    persist();
    return entry;
  }

  function verify() {
    let prevHash = GENESIS_HASH;
    for (let i = 0; i < attributions.length; i += 1) {
      const { entryHash, ...body } = attributions[i];
      if (body.prevHash !== prevHash) return { ok: false, brokenAt: i };
      if (sha256(`${prevHash}:${canonicalize(body)}`) !== entryHash) return { ok: false, brokenAt: i };
      prevHash = entryHash;
    }
    return { ok: true, total: attributions.length };
  }

  // Owner P&L summary: recoverable value at risk now + recovered value this period.
  function digest(input = {}) {
    const now = input.now || nowFn();
    const businessId = input.businessId || null;
    const fromDate = input.fromDate || null;
    const swept = sweep({ now, businessId });
    const recovered = attributions.filter((a) =>
      (!businessId || a.businessId === businessId) && (!fromDate || String(a.at) >= fromDate));
    const recoveredValue = recovered.reduce((s, a) => s + (Number(a.recoveredValue) || 0), 0);
    return {
      atRiskValue: swept.atRiskValue,
      atRiskCount: swept.candidates.length,
      recoveredValue,
      recoveredCount: recovered.length,
      text: digestText({ atRiskValue: swept.atRiskValue, atRiskCount: swept.candidates.length, recoveredValue, recoveredCount: recovered.length }, input)
    };
  }

  return { sweep, submitCandidates, attribute, verify, digest, attributions: () => attributions.slice(), _canSend: canSend };
}

function makeCandidate(type, kind, bal, packageId, extra) {
  const service = bal.serviceName || bal.packageName || "套票";
  const name = bal.customerName || "你";
  let suggestedText;
  if (type === "package_expiry") {
    suggestedText = `${name}你張${service}套票仲有 ${bal.remaining} 次，${bal.expiryDate} 就到期喇${bal.dollarRemaining != null ? `（價值約 HK$${bal.dollarRemaining}）` : ""}。想唔想我幫你約返個時間用返佢？`;
  } else {
    suggestedText = `${name}好耐冇見啦！你張${service}套票仲有 ${bal.remaining} 次未用${bal.dollarRemaining != null ? `（HK$${bal.dollarRemaining}）` : ""}。幾時得閒返嚟做返個？`;
  }
  return {
    type, kind, packageId, businessId: bal.businessId,
    customerExternalId: bal.customerExternalId, customerName: bal.customerName,
    serviceName: bal.serviceName, packageName: bal.packageName,
    remaining: bal.remaining, dollarRemaining: bal.dollarRemaining, expiryDate: bal.expiryDate,
    estValue: bal.dollarRemaining ?? null, suggestedText, ...extra
  };
}

function digestText(s, opts = {}) {
  const en = opts.language === "en";
  if (en) {
    return `Win-back: HK$${s.atRiskValue} of prepaid value across ${s.atRiskCount} customer(s) is expiring or lapsed; HK$${s.recoveredValue} recovered this period (${s.recoveredCount} confirmed).`;
  }
  return `召回實證：今期有 HK$${s.atRiskValue} 套票價值（${s.atRiskCount} 位客）就到期或耐冇用；已實收返 HK$${s.recoveredValue}（${s.recoveredCount} 宗確認）。`;
}

function lastRedemptionAt(chain) {
  let last = null;
  for (const e of chain || []) {
    if (e.type === "redemption" && e.by !== "seed") last = e.at; // ignore seed backfill timestamps
  }
  return last;
}

function dateKey(value) {
  const d = value instanceof Date ? value : new Date(value);
  const hk = new Date(d.getTime() + 8 * 60 * 60000);
  return hk.toISOString().slice(0, 10);
}

function daysBetween(fromKey, toKey) {
  const a = Date.UTC(+fromKey.slice(0, 4), +fromKey.slice(5, 7) - 1, +fromKey.slice(8, 10));
  const b = Date.UTC(+toKey.slice(0, 4), +toKey.slice(5, 7) - 1, +toKey.slice(8, 10));
  return Math.round((b - a) / 86400000);
}

function load(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(parsed.attributions) ? parsed.attributions : [];
  } catch (_e) {
    return [];
  }
}

module.exports = {
  DEFAULT_LAPSE_DAYS,
  DEFAULT_EXPIRY_WINDOW_DAYS,
  createWinback,
  defaultCanSend,
  _internal: { makeCandidate, lastRedemptionAt, daysBetween, dateKey, digestText }
};
