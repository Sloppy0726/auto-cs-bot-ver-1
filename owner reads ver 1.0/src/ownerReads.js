"use strict";

// Owner Reads ver 1.0  (一句搞掂 — 跨帳簿即時查詢)
// The read half of the one-message command console: an owner texts "今日收咗幾多訂" /
// "邊個套票就到期" / "流失幾多" / "閘咗幾多假過數" and gets a deterministic, cross-ledger
// answer — no LLM, no dashboard. Operating the shop through WhatsApp every day is the
// habit that makes the bot inevitable.
//
// Write intents (核銷, 照舊, 收訂) are already pipeline fast-paths; this module is the
// read aggregator that surfaces the fraud-gate / win-back / deposit / package numbers.

const { hkDateKey } = require("../../google drive promo sync ver 1.0/src/hkTime");
const { lossPreventionSummary, lossPreventionText } = require("../../reconciliation-of-record ver 1.0/src/reconcile");
const { createWinback } = require("../../winback ver 1.0/src/winback");

const READS = [
  { kind: "deposits_today", test: (t) => /(今日|今朝|today).*(收|落|幾多).*訂|今日訂金|今日收訂|收咗幾多訂/i.test(t) },
  { kind: "packages_expiring", test: (t) => /套票.*(到期|過期|就到)|就到期|邊個套票|expiring|套票.*剩/i.test(t) },
  { kind: "winback", test: (t) => /流失|好耐冇(返|嚟|見)|召回|win.?back|搵返幾多|實收返/i.test(t) },
  { kind: "fraud_blocked", test: (t) => /假過數|閘咗|攔截|可疑.*(過數|轉帳|轉賬)|fraud|騙/i.test(t) }
];

function parseOwnerRead(text) {
  const t = String(text || "").trim();
  if (!t) return null;
  for (const r of READS) if (r.test(t)) return r.kind;
  return null;
}

// Returns { handled: true, text } for a recognised read-intent with a data source,
// else { handled: false }. Degrades gracefully when a ledger isn't configured.
function answerOwnerQuery(input = {}) {
  const { deps = {}, businessId, now = new Date(), language = "zh-HK" } = input;
  const kind = parseOwnerRead(input.text);
  if (!kind) return { handled: false };
  const today = hkDateKey(now);

  if (kind === "deposits_today") {
    if (!deps.depositLedger) return { handled: false };
    const verified = deps.depositLedger.all().filter((r) =>
      (!businessId || r.businessId === businessId) && r.status === "verified" &&
      hkDateKey((r.history || []).find((h) => h.status === "verified")?.at || r.updatedAt || r.createdAt) === today);
    const sum = verified.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const pending = deps.depositLedger.listActive({ businessId }).filter((r) => r.status === "pending").length;
    return { handled: true, kind, text: `今日已確認收訂 ${verified.length} 筆，共 HK$${sum}。仲有 ${pending} 個待過數/待確認。` };
  }

  if (kind === "packages_expiring") {
    if (!deps.redemptionLedger) return { handled: false };
    const wb = createWinback({ redemptionLedger: deps.redemptionLedger, nowFn: () => now });
    const cands = wb.sweep({ businessId, now }).candidates.filter((c) => c.type === "package_expiry");
    if (cands.length === 0) return { handled: true, kind, text: "未來一個月暫時冇套票就到期。" };
    const lines = cands.slice(0, 8).map((c) => `• ${c.customerName || c.customerExternalId}：${c.serviceName || "套票"} 剩 ${c.remaining} 次，${c.expiryDate} 到期${c.dollarRemaining != null ? `（HK$${c.dollarRemaining}）` : ""}`);
    return { handled: true, kind, text: `就到期套票（${cands.length} 個）：\n${lines.join("\n")}` };
  }

  if (kind === "winback") {
    if (!deps.winback && !deps.redemptionLedger) return { handled: false };
    // Prefer a configured winback (carries attribution history); else an ephemeral one
    // over the redemption ledger gives the at-risk figure.
    const wb = deps.winback || createWinback({ redemptionLedger: deps.redemptionLedger, nowFn: () => now });
    return { handled: true, kind, text: wb.digest({ businessId, now, language }).text };
  }

  if (kind === "fraud_blocked") {
    if (!deps.depositLedger) return { handled: false };
    const summary = lossPreventionSummary(deps.depositLedger, { businessId });
    return { handled: true, kind, text: lossPreventionText(summary, { language }) };
  }

  return { handled: false };
}

module.exports = { parseOwnerRead, answerOwnerQuery, _internal: { READS } };
