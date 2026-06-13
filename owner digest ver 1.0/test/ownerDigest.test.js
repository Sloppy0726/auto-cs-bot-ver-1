"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createOwnerDigest, isDigestCommand } = require("../src/ownerDigest");
const { createDepositLedger } = require("../../deposit ledger ver 1.0/src/depositLedger");
const { createRedemptionLedger } = require("../../package redemption ledger ver 1.0/src/redemptionLedger");
const { createWeatherStore } = require("../../weather policy ver 1.0/src/weatherPolicy");
const { createStaffInbox } = require("../../staff inbox ver 1.0/src/staffInbox");
const { createOutboxStore } = require("../../channel adapter ver 1.0/src/outboxStore");

const nowFn = () => new Date("2026-07-10T04:00:00.000Z");
let passed = 0;
function check(name, fn) { fn(); passed += 1; }

function depWithActivity() {
  const dep = createDepositLedger({ nowFn });
  const r = dep.request({ businessId: "beauty_demo", senderId: "wa:x", bookingDraft: { date: "2026-07-12", time: "15:00" }, amount: 500, now: new Date("2026-07-10T03:00:00Z") });
  dep.claimByReference({ businessId: "beauty_demo", senderId: "wa:x", reference: r.code, now: new Date("2026-07-10T03:30:00Z") });
  dep.verify(r.id, { actor: "boss", now: new Date("2026-07-10T03:40:00Z") });
  dep.request({ businessId: "beauty_demo", senderId: "wa:z", bookingDraft: { date: "2026-07-15", time: "15:00" }, amount: 200, now: new Date("2026-07-10T03:50:00Z") }); // pending
  return dep;
}

check("build folds weather + deposits + near-expiry into non-empty lines", () => {
  const redeem = createRedemptionLedger({ nowFn });
  redeem.seedFromPackages([{ id: "p1", businessId: "beauty_demo", customerExternalId: "111", customerName: "May", serviceName: "facial", unitPrice: 480, totalSessions: 6, usedSessions: 3, expiryDate: "2026-07-31" }]);
  const ws = createWeatherStore(); ws.setSignal("tc3");
  const d = createOwnerDigest({ nowFn });
  const out = d.build({ deps: { depositLedger: depWithActivity(), redemptionLedger: redeem, weatherStore: ws }, businessId: "beauty_demo" });
  assert.equal(out.hasContent, true);
  assert.match(out.text, /三號強風信號/);
  assert.match(out.text, /1 個訂金待過數/);
  assert.match(out.text, /今日已確認收訂 1 筆，共 HK\$500/);
  assert.match(out.text, /1 個套票快到期，HK\$1440/);
});

check("empty state produces a single no-op line, never spam", () => {
  const d = createOwnerDigest({ nowFn });
  const out = d.build({ deps: { depositLedger: createDepositLedger({ nowFn }) }, businessId: "beauty_demo" });
  assert.equal(out.hasContent, false);
  assert.match(out.text, /冇特別/);
});

check("upcoming HK public holiday surfaces a line", () => {
  // now = 2026-06-18; 2026-06-19 is Tuen Ng (a public holiday)
  const d = createOwnerDigest({ nowFn: () => new Date("2026-06-18T04:00:00Z") });
  const out = d.build({ deps: { depositLedger: createDepositLedger({ nowFn }) }, businessId: "beauty_demo" });
  assert.match(out.text, /公眾假期/);
  assert.match(out.text, /2026-06-19/);
});

check("open reputation-risk and suspicious-deposit items surface", () => {
  const inbox = createStaffInbox();
  inbox.submit({ decision: { action: "handoff", businessId: "beauty_demo", escalationLabel: "reputation_risk", reasons: [] }, draft: { action: "handoff", text: "x" }, safety: { verdict: "pass", safeToSend: false }, normalizedMessage: { businessId: "beauty_demo", channel: "whatsapp", senderId: "wa:a" } });
  inbox.submit({ decision: { action: "staff_review", businessId: "beauty_demo", escalationLabel: "deposit_suspicious", reasons: [] }, draft: { action: "staff_review", text: "y" }, safety: { verdict: "pass", safeToSend: false }, normalizedMessage: { businessId: "beauty_demo", channel: "whatsapp", senderId: "wa:b" } });
  const d = createOwnerDigest({ nowFn });
  const out = d.build({ deps: { inbox }, businessId: "beauty_demo" });
  assert.match(out.text, /負評風險/);
  assert.match(out.text, /可疑過數/);
});

check("runOnce sends once a day to the owner, then dedupes", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dg-"));
  const outbox = createOutboxStore({ filePath: path.join(dir, "o.json") });
  const d = createOwnerDigest({ nowFn, filePath: path.join(dir, "state.json") });
  const deps = { depositLedger: depWithActivity(), config: { env: { OWNER_PHONES: "85290001111" } } };
  const r1 = d.runOnce({ deps, businessId: "beauty_demo", outbox });
  const r2 = d.runOnce({ deps, businessId: "beauty_demo", outbox });
  assert.equal(r1.sent, true);
  assert.equal(r2.sent, false);
  assert.equal(r2.reason, "already_sent_today");
  const pending = outbox.listPending({ businessId: "beauty_demo" });
  assert.equal(pending.length, 1, "exactly one digest queued");
  assert.equal(pending[0].chatKey, "85290001111", "sent to the owner phone");
  fs.rmSync(dir, { recursive: true, force: true });
});

check("runOnce skips an empty digest (no spam)", () => {
  const d = createOwnerDigest({ nowFn });
  const r = d.runOnce({ deps: { depositLedger: createDepositLedger({ nowFn }), config: { env: { OWNER_PHONES: "8529" } } }, businessId: "beauty_demo", outbox: createOutboxStore() });
  assert.equal(r.sent, false);
  assert.equal(r.reason, "empty");
});

check("isDigestCommand recognises the morning-brief triggers", () => {
  assert.equal(isDigestCommand("今日概況"), true);
  assert.equal(isDigestCommand("/digest"), true);
  assert.equal(isDigestCommand("每朝"), true);
  assert.equal(isDigestCommand("你哋幾點開門"), false);
});

console.log(`ownerDigest: ${passed} tests passed`);
