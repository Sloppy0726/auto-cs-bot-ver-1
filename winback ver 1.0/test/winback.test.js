"use strict";

const assert = require("node:assert/strict");
const { createWinback } = require("../src/winback");
const { createRedemptionLedger } = require("../../package redemption ledger ver 1.0/src/redemptionLedger");
const { createStaffInbox } = require("../../staff inbox ver 1.0/src/staffInbox");

const nowFn = () => new Date("2026-07-10T04:00:00.000Z");
let passed = 0;
function check(name, fn) { fn(); passed += 1; }

// One package expiring 2026-07-31 (21 days out at now), 3 of 6 left @ $480 → HK$1440.
function ledgerExpiringSoon() {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages([{ id: "pkg_exp", businessId: "beauty_demo", customerExternalId: "85261112222", customerName: "May", packageName: "保濕 facial 6 次", serviceName: "保濕 facial", unitPrice: 480, totalSessions: 6, usedSessions: 3, expiryDate: "2026-07-31" }]);
  return l;
}

check("sweep surfaces a near-expiry package with its recoverable value", () => {
  const wb = createWinback({ redemptionLedger: ledgerExpiringSoon(), nowFn });
  const { candidates, atRiskValue } = wb.sweep({ businessId: "beauty_demo" });
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].type, "package_expiry");
  assert.equal(candidates[0].kind, "service");
  assert.equal(candidates[0].estValue, 1440);
  assert.equal(atRiskValue, 1440);
  assert.match(candidates[0].suggestedText, /仲有 3 次/);
  assert.match(candidates[0].suggestedText, /HK\$1440/);
});

check("sweep skips fully-used, far-future, and contactless packages", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages([
    { id: "pkg_done", businessId: "beauty_demo", customerExternalId: "111", unitPrice: 480, totalSessions: 4, usedSessions: 4, expiryDate: "2026-07-31", serviceName: "facial" }, // none left
    { id: "pkg_far", businessId: "beauty_demo", customerExternalId: "222", unitPrice: 480, totalSessions: 6, usedSessions: 1, expiryDate: "2027-12-31", serviceName: "facial" }, // not near expiry, not lapsed
    { id: "pkg_noid", businessId: "beauty_demo", customerExternalId: null, unitPrice: 480, totalSessions: 6, usedSessions: 1, expiryDate: "2026-07-20", serviceName: "facial" } // no contact
  ]);
  const wb = createWinback({ redemptionLedger: l, nowFn });
  assert.equal(wb.sweep({ businessId: "beauty_demo" }).candidates.length, 0);
});

check("sweep surfaces a lapsed package from a real (non-seed) old redemption", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages([{ id: "pkg_lapse", businessId: "beauty_demo", customerExternalId: "333", customerName: "Bob", unitPrice: 680, totalSessions: 10, usedSessions: 2, expiryDate: "2027-06-30", serviceName: "laser" }]);
  l.redeem({ packageId: "pkg_lapse", now: new Date("2026-03-01T04:00:00Z") }); // real redemption ~131 days before now
  const wb = createWinback({ redemptionLedger: l, nowFn, lapseDays: 90 });
  const cands = wb.sweep({ businessId: "beauty_demo" }).candidates;
  assert.equal(cands.length, 1);
  assert.equal(cands[0].type, "package_lapsed");
  assert.equal(cands[0].kind, "marketing");
});

check("submitCandidates queues staff items; consent gate can suppress marketing", () => {
  const wb = createWinback({ redemptionLedger: ledgerExpiringSoon(), nowFn });
  const inbox = createStaffInbox();
  const cands = wb.sweep({ businessId: "beauty_demo" }).candidates;
  const submitted = wb.submitCandidates(inbox, cands);
  assert.equal(submitted.length, 1);
  assert.equal(inbox.list({ escalationLabel: "winback" }).length, 1, "nothing auto-sends; queued for staff");

  // a gate that denies marketing
  const wb2 = createWinback({ redemptionLedger: ledgerExpiringSoon(), nowFn, canSend: ({ kind }) => ({ ok: kind === "service", basis: "policy" }) });
  const inbox2 = createStaffInbox();
  // make it a marketing candidate by forcing lapsed via injected event
  const out = wb2.submitCandidates(inbox2, [{ type: "stale_enquiry", kind: "marketing", businessId: "beauty_demo", customerExternalId: "999", suggestedText: "返嚟啦", estValue: 0 }]);
  assert.equal(out.length, 0, "consent gate blocked the marketing nudge");
});

check("attribution is hash-chained and tamper-evident", () => {
  const wb = createWinback({ redemptionLedger: ledgerExpiringSoon(), nowFn });
  wb.attribute({ businessId: "beauty_demo", customerExternalId: "85261112222", packageId: "pkg_exp", recoveredValue: 480 });
  wb.attribute({ businessId: "beauty_demo", customerExternalId: "85261112222", packageId: "pkg_exp", recoveredValue: 480 });
  assert.equal(wb.verify().ok, true);
  const chain = wb.attributions();
  assert.equal(chain[1].prevHash, chain[0].entryHash);
  assert.equal(JSON.stringify(chain).includes("85261112222"), false, "customer id pseudonymised in attribution");
});

check("digest reports at-risk and recovered HK$", () => {
  const wb = createWinback({ redemptionLedger: ledgerExpiringSoon(), nowFn });
  wb.attribute({ businessId: "beauty_demo", customerExternalId: "85261112222", recoveredValue: 480 });
  const d = wb.digest({ businessId: "beauty_demo" });
  assert.equal(d.atRiskValue, 1440);
  assert.equal(d.recoveredValue, 480);
  assert.match(d.text, /HK\$1440/);
  assert.match(d.text, /已實收返 HK\$480/);
});

check("injected waitlist/stale events flow through as candidates", () => {
  const wb = createWinback({ redemptionLedger: createRedemptionLedger({ nowFn }), nowFn });
  const out = wb.sweep({
    businessId: "beauty_demo",
    waitlistEvents: [{ businessId: "beauty_demo", customerExternalId: "555", suggestedText: "啱啱有位", estValue: 300 }],
    staleEnquiries: [{ businessId: "beauty_demo", customerExternalId: "666", suggestedText: "仲考慮緊?", estValue: 0 }]
  });
  assert.equal(out.candidates.length, 2);
  assert.equal(out.candidates[0].estValue, 300, "sorted by recoverable value desc");
});

console.log(`winback: ${passed} tests passed`);
