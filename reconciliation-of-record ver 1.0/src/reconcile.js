"use strict";

// Reconciliation-of-Record ver 1.0  (假過數對數閘)
// A deterministic fraud gate that runs BEFORE the bot acknowledges any deposit claim.
//
// HK shops taking 訂金 over WhatsApp get fake "過咗數" screenshots, reused old codes,
// and wrong amounts. Today the bot acknowledges any claim with a matching code (then a
// human verifies). This gate adds a read-only risk assessment first: the claimed amount
// AND reference must exactly match an OPEN, sender-bound, unexpired record — otherwise
// the claim is flagged and routed to staff_review WITHOUT a clean acknowledgement, and
// logged so the shop gets a monthly "閘咗 $X 可疑走數" loss-prevention number.
//
// Pure string/number comparison — replayable through the action journal. The bot still
// never confirms money; this only decides whether a claim looks legitimate enough to
// acknowledge as "received, verifying" vs. flag as suspicious.

const { normalizeCode, senderRef } = require("../../deposit ledger ver 1.0/src/depositLedger");

const RISK = Object.freeze({
  CLEAN: "clean",
  NO_CODE: "no_code",
  UNKNOWN_REFERENCE: "unknown_reference",
  WRONG_SENDER: "wrong_sender",
  REUSED_CODE: "reused_code",
  EXPIRED: "expired",
  AMOUNT_MISMATCH: "amount_mismatch",
  SUSPICIOUS_PROXY: "suspicious_proxy"
});

// risks that should NOT be acknowledged as a normal claim
const SUSPICIOUS = Object.freeze(new Set([
  RISK.UNKNOWN_REFERENCE, RISK.WRONG_SENDER, RISK.REUSED_CODE, RISK.EXPIRED, RISK.AMOUNT_MISMATCH, RISK.SUSPICIOUS_PROXY
]));

// Parse an amount the customer states in a payment claim: HK$200 / $200 / 200蚊 / 200元.
function parseClaimedAmount(text) {
  const t = String(text || "");
  const m = t.match(/(?:hk\$|\$|HK\$)\s*(\d{2,6})(?:\.\d{1,2})?/i) || t.match(/(\d{2,6})\s*(?:蚊|元|蚊雞|hkd)/i);
  return m ? Number(m[1]) : null;
}

// Read-only assessment of a payment claim. Never mutates the ledger.
function assessClaim(input = {}) {
  const { depositLedger, businessId, senderId, text, now, suspiciousProxies = [], proxyId = null } = input;
  const claimedAmount = parseClaimedAmount(text);
  const reasons = [];

  // Counterparty proxy screening (injectable list; usually empty without a bank feed).
  if (proxyId && Array.isArray(suspiciousProxies) && suspiciousProxies.includes(proxyId)) {
    return verdict(RISK.SUSPICIOUS_PROXY, { claimedAmount, reasons: ["counterparty proxy on suspicious list"] });
  }

  const code = normalizeCode(text);
  if (!code) {
    // No code quoted → defer to the sender-proof path; not itself suspicious.
    return verdict(RISK.NO_CODE, { claimedAmount, reasons: ["no deposit code in message"] });
  }

  const record = depositLedger.findByCode(code);
  if (!record || (businessId && record.businessId !== businessId)) {
    return verdict(RISK.UNKNOWN_REFERENCE, { code, claimedAmount, reasons: [`no open deposit for ${code}`] });
  }

  const ref = senderRef(senderId);
  if (record.senderRef && ref && record.senderRef !== ref) {
    return verdict(RISK.WRONG_SENDER, { code, record, claimedAmount, expectedAmount: record.amount, reasons: ["code belongs to a different customer"] });
  }

  if (record.status !== "pending") {
    return verdict(RISK.REUSED_CODE, { code, record, claimedAmount, expectedAmount: record.amount, reasons: [`code already ${record.status}`] });
  }

  if (record.expiresAt && now && new Date(record.expiresAt).getTime() < new Date(now).getTime()) {
    return verdict(RISK.EXPIRED, { code, record, claimedAmount, expectedAmount: record.amount, reasons: ["deposit hold expired"] });
  }

  if (claimedAmount != null && record.amount != null && claimedAmount !== record.amount) {
    return verdict(RISK.AMOUNT_MISMATCH, { code, record, claimedAmount, expectedAmount: record.amount, reasons: [`claimed ${claimedAmount} ≠ expected ${record.amount}`] });
  }

  return verdict(RISK.CLEAN, { code, record, claimedAmount, expectedAmount: record.amount, reasons: ["amount and reference match an open hold"] });
}

function verdict(risk, extra = {}) {
  return { risk, suspicious: SUSPICIOUS.has(risk), ...extra };
}

// Loss-prevention number for the owner: claims blocked at the gate this period.
// Framed as "claims blocked", never "audited dollars saved" (counterfactual).
function lossPreventionSummary(depositLedger, input = {}) {
  const flagged = depositLedger.listSuspicious(input);
  const byRisk = {};
  let blockedAmount = 0;
  for (const s of flagged) {
    byRisk[s.risk] = (byRisk[s.risk] || 0) + 1;
    // Use the expected amount of the targeted hold where known (what a fake claim
    // would have tried to pass off), else the claimed amount.
    blockedAmount += Number(s.expectedAmount ?? s.claimedAmount ?? 0) || 0;
  }
  return { blockedCount: flagged.length, blockedAmount, byRisk };
}

// Neutral acknowledgement for a flagged claim — never accusatory (a legit customer may
// have fat-fingered an amount) and never confirms money.
function suspiciousClaimAckText(opts = {}) {
  const en = opts.language === "en";
  return en
    ? "Thanks — we've received your payment notice. Our staff need to check it against our bank records before we can confirm, so please bear with us. (Not yet a payment confirmation.)"
    : "多謝你！我哋收到你嘅過數通知，同事需要對返銀行紀錄先可以幫你確認，麻煩你稍等。（此訊息未代表已確認收款）";
}

function lossPreventionText(summary, opts = {}) {
  const en = opts.language === "en";
  if (summary.blockedCount === 0) {
    return en ? "No suspicious deposit claims were blocked this period." : "今期未有可疑過數被攔截。";
  }
  return en
    ? `Blocked ${summary.blockedCount} suspicious deposit claim(s) at the gate this period (up to HK$${summary.blockedAmount} of mismatched/fake transfers flagged for staff).`
    : `今期喺對數閘攔截咗 ${summary.blockedCount} 宗可疑過數（最多 HK$${summary.blockedAmount} 唔對數/可疑轉帳，已轉同事跟進）。`;
}

// Export the deposit money-trail (verified/waived + flagged) as CSV for the owner /
// accountant. Honest: deposits are state-machine records; the dollar figures are what
// the shop verified, not an audited bank reconciliation.
function reconcileExport(input = {}) {
  const { depositLedger, businessId, fromDate, toDate } = input;
  const inRange = (d) => (!fromDate || String(d) >= fromDate) && (!toDate || String(d) <= toDate);
  const rows = depositLedger.all()
    .filter((r) => (!businessId || r.businessId === businessId) && inRange(r.createdAt))
    .map((r) => ({
      date: String(r.createdAt).slice(0, 10),
      code: r.code,
      status: r.status,
      amount: r.amount ?? "",
      currency: r.currency || "HKD",
      date_time: [r.bookingDraft?.date, r.bookingDraft?.time].filter(Boolean).join(" "),
      verifiedAt: (r.history || []).find((h) => h.status === "verified")?.at || ""
    }));
  const header = ["date", "code", "status", "amount", "currency", "booking", "verified_at"];
  const csv = [header.join(",")]
    .concat(rows.map((r) => [r.date, r.code, r.status, r.amount, r.currency, `"${r.date_time}"`, r.verifiedAt].join(",")))
    .join("\n");
  const suspicious = depositLedger.listSuspicious({ businessId, fromDate, toDate });
  return { csv, rowCount: rows.length, suspiciousCount: suspicious.length, summary: lossPreventionSummary(depositLedger, { businessId, fromDate, toDate }) };
}

module.exports = {
  RISK,
  SUSPICIOUS,
  assessClaim,
  parseClaimedAmount,
  lossPreventionSummary,
  lossPreventionText,
  suspiciousClaimAckText,
  reconcileExport
};
