"use strict";

const assert = require("node:assert/strict");
const {
  RISK,
  assessClaim,
  parseClaimedAmount,
  lossPreventionSummary,
  lossPreventionText,
  suspiciousClaimAckText,
  reconcileExport
} = require("../src/reconcile");
const { createDepositLedger } = require("../../deposit ledger ver 1.0/src/depositLedger");

const nowFn = () => new Date("2026-06-13T04:00:00.000Z");
let passed = 0;
function check(name, fn) { fn(); passed += 1; }

function ledgerWithPending() {
  const l = createDepositLedger({ nowFn });
  const rec = l.request({ businessId: "restaurant_demo", senderId: "wa:owner", bookingDraft: { date: "2026-06-26", time: "20:00", partySize: 8 }, amount: 500, ttlMinutes: 120 });
  return { l, rec };
}

check("parseClaimedAmount reads HK$ / $ / 蚊 / 元", () => {
  assert.equal(parseClaimedAmount("過咗數 DEP-AAAA HK$200"), 200);
  assert.equal(parseClaimedAmount("俾咗$500"), 500);
  assert.equal(parseClaimedAmount("過咗 350蚊"), 350);
  assert.equal(parseClaimedAmount("過咗數"), null);
});

check("clean: correct code, matching amount", () => {
  const { l, rec } = ledgerWithPending();
  const v = assessClaim({ depositLedger: l, businessId: "restaurant_demo", senderId: "wa:owner", text: `過咗數 ${rec.code} HK$500`, now: nowFn() });
  assert.equal(v.risk, RISK.CLEAN);
  assert.equal(v.suspicious, false);
});

check("clean: correct code, no amount stated", () => {
  const { l, rec } = ledgerWithPending();
  const v = assessClaim({ depositLedger: l, businessId: "restaurant_demo", senderId: "wa:owner", text: `過咗數 ${rec.code}`, now: nowFn() });
  assert.equal(v.risk, RISK.CLEAN);
});

check("amount_mismatch is suspicious", () => {
  const { l, rec } = ledgerWithPending();
  const v = assessClaim({ depositLedger: l, businessId: "restaurant_demo", senderId: "wa:owner", text: `過咗數 ${rec.code} HK$200`, now: nowFn() });
  assert.equal(v.risk, RISK.AMOUNT_MISMATCH);
  assert.equal(v.suspicious, true);
  assert.equal(v.expectedAmount, 500);
  assert.equal(v.claimedAmount, 200);
});

check("wrong_sender (someone else's code) is suspicious", () => {
  const { l, rec } = ledgerWithPending();
  const v = assessClaim({ depositLedger: l, businessId: "restaurant_demo", senderId: "wa:stranger", text: `過咗數 ${rec.code}`, now: nowFn() });
  assert.equal(v.risk, RISK.WRONG_SENDER);
});

check("reused_code (already claimed) is suspicious", () => {
  const { l, rec } = ledgerWithPending();
  l.claimByReference({ businessId: "restaurant_demo", senderId: "wa:owner", reference: rec.code }); // now claimed
  const v = assessClaim({ depositLedger: l, businessId: "restaurant_demo", senderId: "wa:owner", text: `過咗數 ${rec.code}`, now: nowFn() });
  assert.equal(v.risk, RISK.REUSED_CODE);
});

check("expired hold is suspicious", () => {
  const { l, rec } = ledgerWithPending();
  const later = new Date(nowFn().getTime() + 121 * 60000);
  const v = assessClaim({ depositLedger: l, businessId: "restaurant_demo", senderId: "wa:owner", text: `過咗數 ${rec.code}`, now: later });
  assert.equal(v.risk, RISK.EXPIRED);
});

check("unknown_reference (made-up code) is suspicious", () => {
  const { l } = ledgerWithPending();
  const v = assessClaim({ depositLedger: l, businessId: "restaurant_demo", senderId: "wa:scam", text: "過咗數 DEP-9Z9Z", now: nowFn() });
  assert.equal(v.risk, RISK.UNKNOWN_REFERENCE);
});

check("no_code defers to sender-proof (not itself suspicious)", () => {
  const { l } = ledgerWithPending();
  const v = assessClaim({ depositLedger: l, businessId: "restaurant_demo", senderId: "wa:owner", text: "過咗數喇", now: nowFn() });
  assert.equal(v.risk, RISK.NO_CODE);
  assert.equal(v.suspicious, false);
});

check("suspicious_proxy fires on an injected blocklist", () => {
  const { l, rec } = ledgerWithPending();
  const v = assessClaim({ depositLedger: l, businessId: "restaurant_demo", senderId: "wa:owner", text: `過咗數 ${rec.code}`, now: nowFn(), proxyId: "63771234", suspiciousProxies: ["63771234"] });
  assert.equal(v.risk, RISK.SUSPICIOUS_PROXY);
});

check("loss-prevention summary counts flagged claims and amounts", () => {
  const { l, rec } = ledgerWithPending();
  l.flagSuspicious({ businessId: "restaurant_demo", senderId: "wa:x", code: rec.code, risk: RISK.AMOUNT_MISMATCH, claimedAmount: 200, expectedAmount: 500 });
  l.flagSuspicious({ businessId: "restaurant_demo", senderId: "wa:y", code: null, risk: RISK.UNKNOWN_REFERENCE, claimedAmount: null, expectedAmount: null });
  const s = lossPreventionSummary(l, { businessId: "restaurant_demo" });
  assert.equal(s.blockedCount, 2);
  assert.equal(s.blockedAmount, 500);
  assert.match(lossPreventionText(s, { language: "zh-HK" }), /攔截咗 2 宗/);
  assert.match(lossPreventionText({ blockedCount: 0, blockedAmount: 0, byRisk: {} }, {}), /未有可疑/);
});

check("reconcileExport produces a CSV of deposit records + summary", () => {
  const { l, rec } = ledgerWithPending();
  l.verify(rec.id, { actor: "boss" });
  const out = reconcileExport({ depositLedger: l, businessId: "restaurant_demo" });
  assert.match(out.csv, /date,code,status,amount/);
  assert.match(out.csv, new RegExp(rec.code));
  assert.match(out.csv, /verified/);
  assert.equal(out.rowCount, 1);
});

check("suspicious ack never confirms money and is not accusatory", () => {
  const zh = suspiciousClaimAckText({ language: "zh-HK" });
  assert.match(zh, /未代表已確認收款/);
  assert.doesNotMatch(zh, /已收到.*款|假|呃|騙/);
});

console.log(`reconcile: ${passed} tests passed`);
