"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  TYPES,
  createRedemptionLedger,
  receiptText,
  parseRedeemCommand,
  redeemAndReceipt
} = require("../src/redemptionLedger");
const { createOutboxStore } = require("../../channel adapter ver 1.0/src/outboxStore");
const packageSeed = require("../../package ops ver 1.0/seed/packageSeed");

const nowFn = () => new Date("2026-06-13T04:00:00.000Z");
let passed = 0;
function check(name, fn) { fn(); passed += 1; }

const samplePackages = [
  { id: "pkg_test", businessId: "beauty_demo", customerExternalId: "85261112222", customerName: "May", packageName: "保濕 facial 6 次套票", serviceName: "保濕 facial", totalSessions: 6, usedSessions: 3, expiryDate: "2026-09-30" }
];

check("seedFromPackages folds to the right balance", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages(samplePackages);
  const bal = l.balance("pkg_test");
  assert.equal(bal.total, 6);
  assert.equal(bal.used, 3);
  assert.equal(bal.remaining, 3);
});

check("redeem decrements and produces a receipt", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages(samplePackages);
  const res = l.redeem({ packageId: "pkg_test", by: "boss" });
  assert.equal(res.ok, true);
  assert.equal(res.balance.remaining, 2);
  assert.equal(res.balance.used, 4);
  const receipt = receiptText(res.balance, { language: "zh-HK" });
  assert.match(receipt, /第 4 次/);
  assert.match(receipt, /仲剩返 2 次/);
  assert.match(receipt, /2026-09-30/);
});

check("redeem refuses when no sessions remain", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages([{ ...samplePackages[0], id: "pkg_empty", totalSessions: 2, usedSessions: 2 }]);
  assert.equal(l.redeem({ packageId: "pkg_empty" }).reason, "insufficient_sessions");
});

check("idempotency key prevents a double-tap burning two sessions", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages(samplePackages);
  const a = l.redeem({ packageId: "pkg_test", idempotencyKey: "tap-1" });
  const b = l.redeem({ packageId: "pkg_test", idempotencyKey: "tap-1" });
  assert.equal(a.balance.remaining, 2);
  assert.equal(b.deduped, true);
  assert.equal(b.balance.remaining, 2, "balance unchanged on duplicate");
});

check("adjust appends a compensating entry and needs a reason", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages(samplePackages);
  assert.equal(l.adjust({ packageId: "pkg_test", sessions: 1 }).reason, "reason_required");
  const res = l.adjust({ packageId: "pkg_test", sessions: 1, reason: "誤扣一次，補返", by: "boss" });
  assert.equal(res.ok, true);
  assert.equal(res.balance.remaining, 4, "remaining restored from 3 to 4");
  // history is appended, never edited
  const chain = l.chain("pkg_test");
  assert.equal(chain[chain.length - 1].type, TYPES.ADJUSTMENT);
  assert.equal(chain[chain.length - 1].reason, "誤扣一次，補返");
});

check("hash chain verifies, and tampering is detected", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages(samplePackages);
  l.redeem({ packageId: "pkg_test" });
  assert.equal(l.verify("pkg_test").ok, true);
  // tamper: forge a redemption into a no-op by editing sessions in place
  const chain = l.chain("pkg_test");
  const all = l.all();
  all.pkg_test[1].sessions = 0; // edit a historical redemption
  const forged = createRedemptionLedger({ nowFn });
  // rebuild a ledger from the forged chain to test verify on tampered data
  assert.equal(require("../src/redemptionLedger")._internal.verifyChain(all.pkg_test).ok, false, "edited history fails verification");
});

check("statement exports folded history with verification", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages(samplePackages);
  l.redeem({ packageId: "pkg_test" });
  const stmt = l.statement("pkg_test", { language: "zh-HK" });
  assert.equal(stmt.chainVerified, true);
  assert.match(stmt.footer, /餘額：2 \/ 6/);
  assert.ok(stmt.lines.length >= 5, "purchase + redemptions listed");
});

check("findPackage locates a customer's active package by id and service", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages(samplePackages);
  const found = l.findPackage({ businessId: "beauty_demo", customerExternalId: "85261112222", service: "facial" });
  assert.equal(found.packageId, "pkg_test");
  assert.equal(l.findPackage({ businessId: "beauty_demo", customerExternalId: "0000" }), null);
});

check("parseRedeemCommand reads owner shorthand", () => {
  assert.deepEqual(parseRedeemCommand("核銷 85261112222 facial"), { ref: "85261112222", service: "facial" });
  assert.deepEqual(parseRedeemCommand("核銷 pkg_test"), { ref: "pkg_test", service: null });
  assert.equal(parseRedeemCommand("今日生意點"), null);
});

check("redeemAndReceipt redeems and enqueues a WhatsApp receipt to the customer", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "redeem-"));
  const outbox = createOutboxStore({ filePath: path.join(dir, "outbox.json") });
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages(samplePackages);
  const res = redeemAndReceipt(l, outbox, { businessId: "beauty_demo", ref: "85261112222", service: "facial", by: "boss", language: "zh-HK" });
  assert.equal(res.ok, true);
  assert.equal(res.balance.remaining, 2);
  const pending = outbox.listPending({ businessId: "beauty_demo" });
  assert.equal(pending.length, 1, "a receipt is queued to the customer");
  assert.match(pending[0].text, /已為你核銷/);
  assert.equal(pending[0].chatKey, "85261112222");
  fs.rmSync(dir, { recursive: true, force: true });
});

check("ledger persists and rehydrates with an intact chain", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "redeem-"));
  const filePath = path.join(dir, "ledger.json");
  const l1 = createRedemptionLedger({ filePath, nowFn });
  l1.seedFromPackages(samplePackages);
  l1.redeem({ packageId: "pkg_test" });
  const l2 = createRedemptionLedger({ filePath, nowFn });
  assert.equal(l2.balance("pkg_test").remaining, 2);
  assert.equal(l2.verify("pkg_test").ok, true);
  fs.rmSync(dir, { recursive: true, force: true });
});

check("real package seed folds without error", () => {
  const l = createRedemptionLedger({ nowFn });
  l.seedFromPackages(packageSeed);
  assert.equal(l.verify().ok, true, "every seeded chain verifies");
});

console.log(`redemptionLedger: ${passed} tests passed`);
