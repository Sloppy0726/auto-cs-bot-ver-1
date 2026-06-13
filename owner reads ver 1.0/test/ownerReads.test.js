"use strict";

const assert = require("node:assert/strict");
const { parseOwnerRead, answerOwnerQuery } = require("../src/ownerReads");
const { createPipeline } = require("../../end-to-end pipeline ver 1.0/src/pipeline");
const { createDepositLedger } = require("../../deposit ledger ver 1.0/src/depositLedger");
const { createRedemptionLedger } = require("../../package redemption ledger ver 1.0/src/redemptionLedger");

const nowFn = () => new Date("2026-07-10T04:00:00.000Z");
let passed = 0;
function check(name, fn) { fn(); passed += 1; }

check("parseOwnerRead classifies the four read intents and ignores others", () => {
  assert.equal(parseOwnerRead("今日收咗幾多訂"), "deposits_today");
  assert.equal(parseOwnerRead("邊個套票就到期"), "packages_expiring");
  assert.equal(parseOwnerRead("今個月流失幾多"), "winback");
  assert.equal(parseOwnerRead("閘咗幾多假過數"), "fraud_blocked");
  assert.equal(parseOwnerRead("今日生意點"), null, "SMB-toolkit query is not hijacked");
  assert.equal(parseOwnerRead("你哋幾點開"), null);
});

function depWithToday() {
  const dep = createDepositLedger({ nowFn });
  const r = dep.request({ businessId: "beauty_demo", senderId: "wa:x", bookingDraft: { date: "2026-07-12", time: "15:00" }, amount: 500, now: new Date("2026-07-10T03:00:00Z") });
  dep.claimByReference({ businessId: "beauty_demo", senderId: "wa:x", reference: r.code, now: new Date("2026-07-10T03:30:00Z") });
  dep.verify(r.id, { actor: "boss", now: new Date("2026-07-10T03:40:00Z") });
  dep.flagSuspicious({ businessId: "beauty_demo", senderId: "wa:y", code: "DEP-9Z9Z", risk: "unknown_reference", claimedAmount: 200 });
  return dep;
}

check("deposits_today sums today's verified deposits", () => {
  const a = answerOwnerQuery({ text: "今日收咗幾多訂", deps: { depositLedger: depWithToday() }, businessId: "beauty_demo", now: nowFn() });
  assert.equal(a.handled, true);
  assert.match(a.text, /1 筆/);
  assert.match(a.text, /HK\$500/);
});

check("packages_expiring lists near-expiry packages with value and service name", () => {
  const redeem = createRedemptionLedger({ nowFn });
  redeem.seedFromPackages([{ id: "p1", businessId: "beauty_demo", customerExternalId: "111", customerName: "May", serviceName: "保濕 facial", unitPrice: 480, totalSessions: 6, usedSessions: 3, expiryDate: "2026-07-31" }]);
  const a = answerOwnerQuery({ text: "邊個套票就到期", deps: { redemptionLedger: redeem }, businessId: "beauty_demo", now: nowFn() });
  assert.match(a.text, /就到期套票（1 個）/);
  assert.match(a.text, /保濕 facial/);
  assert.match(a.text, /HK\$1440/);
});

check("fraud_blocked reports the loss-prevention number", () => {
  const a = answerOwnerQuery({ text: "閘咗幾多假過數", deps: { depositLedger: depWithToday() }, businessId: "beauty_demo", now: nowFn() });
  assert.match(a.text, /攔截咗 1 宗/);
});

check("unconfigured ledger → not handled (graceful)", () => {
  assert.equal(answerOwnerQuery({ text: "今日收咗幾多訂", deps: {}, businessId: "beauty_demo", now: nowFn() }).handled, false);
});

// --- pipeline integration: owner-gated ---
(async () => {
  const dep = depWithToday();
  const p = createPipeline({ depositLedger: dep, env: { OWNER_PHONES: "85290001111" }, nowFn });

  check("owner read answered in-pipeline", () => {});
  const ownerRes = await p.runMessage({ channel: "whatsapp", from: "85290001111", businessId: "beauty_demo", text: "今日收咗幾多訂" });
  assert.match(ownerRes.draft.text, /已確認收訂/);
  passed += 1;

  const custRes = await p.runMessage({ channel: "whatsapp", from: "85261112222", businessId: "beauty_demo", text: "今日收咗幾多訂" });
  assert.doesNotMatch(custRes.draft.text || "", /已確認收訂/, "a non-owner does not get owner reads");
  passed += 1;

  console.log(`ownerReads: ${passed} tests passed`);
})().catch((err) => { console.error(err); process.exitCode = 1; });
