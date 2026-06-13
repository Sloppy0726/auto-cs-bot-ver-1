"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  STATES,
  createDepositLedger,
  evaluateDepositPolicy,
  depositInstructionText,
  claimAcknowledgementText,
  deriveCode,
  normalizeCode,
  senderRef
} = require("../src/depositLedger");
const { checkDraft } = require("../../safety checker ver 1.0/src/safetyChecker");
const cases = require("./depositLedger.cases");

let passed = 0;
function check(name, fn) { fn(); passed += 1; }

const now = new Date("2026-06-13T04:00:00.000Z");
const nowFn = () => now;

// --- policy evaluation ---
check("policy matches a Friday 6+ evening party", () => {
  const r = evaluateDepositPolicy(cases.fridayBigParty, cases.restaurantPolicyConfig, now);
  assert.equal(r.required, true);
  assert.equal(r.amount, 500);
  assert.equal(r.rails.fps, "163829005");
});
check("policy skips a small Tuesday party", () => {
  assert.equal(evaluateDepositPolicy(cases.tuesdaySmallParty, cases.restaurantPolicyConfig, now).required, false);
});
check("policy skips a Friday lunch (outside the evening window)", () => {
  assert.equal(evaluateDepositPolicy(cases.fridayLunch, cases.restaurantPolicyConfig, now).required, false);
});
check("policy matches first-time laser, skips facial", () => {
  assert.equal(evaluateDepositPolicy(cases.laserBooking, cases.beautyPolicyConfig, now).required, true);
  assert.equal(evaluateDepositPolicy(cases.facialBooking, cases.beautyPolicyConfig, now).required, false);
});
check("no depositPolicy config -> not required", () => {
  assert.equal(evaluateDepositPolicy(cases.fridayBigParty, { businessId: "x" }, now).required, false);
});

// --- request + code ---
check("request creates a pending hold with a DEP code and expiry", () => {
  const ledger = createDepositLedger({ nowFn });
  const rec = ledger.request({ businessId: "restaurant_demo", senderId: "wa:8529", bookingDraft: cases.fridayBigParty, amount: 500, ttlMinutes: 120 });
  assert.equal(rec.status, STATES.PENDING);
  assert.match(rec.code, /^DEP-[0-9A-Z]{4}$/);
  assert.equal(rec.senderRef, senderRef("wa:8529"));
  assert.equal(new Date(rec.expiresAt).getTime() - now.getTime(), 120 * 60000);
});
check("codes are deterministic and collision-salted", () => {
  const a = deriveCode("seedX");
  assert.equal(a, deriveCode("seedX"), "same seed -> same code");
  const b = deriveCode("seedX", new Set([a]));
  assert.notEqual(b, a, "collision -> different code");
});

// --- reconciliation ---
check("claimByReference matches a pending deposit, sender-bound", () => {
  const ledger = createDepositLedger({ nowFn });
  const rec = ledger.request({ businessId: "restaurant_demo", senderId: "wa:A", bookingDraft: cases.fridayBigParty, amount: 500 });
  const wrongSender = ledger.claimByReference({ businessId: "restaurant_demo", senderId: "wa:B", reference: rec.code });
  assert.equal(wrongSender.ok, false, "another customer cannot claim someone's deposit");
  const ok = ledger.claimByReference({ businessId: "restaurant_demo", senderId: "wa:A", reference: `過咗數 ${rec.code}` });
  assert.equal(ok.ok, true);
  assert.equal(ok.record.status, STATES.CLAIMED);
});
check("claimBySenderProof claims a sole pending, refuses when ambiguous", () => {
  const ledger = createDepositLedger({ nowFn });
  ledger.request({ businessId: "restaurant_demo", senderId: "wa:C", bookingDraft: cases.fridayBigParty, amount: 500 });
  assert.equal(ledger.claimBySenderProof({ businessId: "restaurant_demo", senderId: "wa:C" }).ok, true);
  const ledger2 = createDepositLedger({ nowFn });
  ledger2.request({ businessId: "restaurant_demo", senderId: "wa:D", bookingDraft: cases.fridayBigParty, amount: 500 });
  ledger2.request({ businessId: "restaurant_demo", senderId: "wa:D", bookingDraft: { ...cases.fridayBigParty, time: "21:00" }, amount: 500 });
  assert.equal(ledger2.claimBySenderProof({ businessId: "restaurant_demo", senderId: "wa:D" }).reason, "ambiguous_multiple_pending");
});

// --- human-only verify ---
check("verify transitions claimed -> verified (the only money-confirming path)", () => {
  const ledger = createDepositLedger({ nowFn });
  const rec = ledger.request({ businessId: "restaurant_demo", senderId: "wa:E", bookingDraft: cases.fridayBigParty, amount: 500 });
  ledger.claimByReference({ businessId: "restaurant_demo", senderId: "wa:E", reference: rec.code });
  const v = ledger.verify(rec.id, { actor: "boss" });
  assert.equal(v.ok, true);
  assert.equal(v.record.status, STATES.VERIFIED);
  assert.equal(v.record.history.at(-1).actor, "boss");
});

// --- weather waiver synergy ---
check("waiveAllActive waives every active deposit for a business", () => {
  const ledger = createDepositLedger({ nowFn });
  ledger.request({ businessId: "restaurant_demo", senderId: "wa:F", bookingDraft: cases.fridayBigParty, amount: 500 });
  ledger.request({ businessId: "beauty_demo", senderId: "wa:G", bookingDraft: cases.laserBooking, amount: 200 });
  const waived = ledger.waiveAllActive("restaurant_demo", { reason: "T8" });
  assert.equal(waived.length, 1);
  assert.equal(waived[0].status, STATES.WAIVED);
  assert.equal(ledger.listActive({ businessId: "beauty_demo" }).length, 1, "other business untouched");
});

// --- TTL sweep ---
check("sweep reminds before expiry, then expires past TTL", () => {
  const ledger = createDepositLedger({ nowFn });
  const rec = ledger.request({ businessId: "restaurant_demo", senderId: "wa:H", bookingDraft: cases.fridayBigParty, amount: 500, ttlMinutes: 120 });
  // 100 min later: within reminder lead (30 min before the 120-min expiry)
  const remindNow = new Date(now.getTime() + 100 * 60000);
  const r1 = ledger.sweep({ now: remindNow, reminderLeadMinutes: 30 });
  assert.equal(r1.remind.length, 1, "one reminder fired");
  assert.equal(r1.expired.length, 0);
  const r1b = ledger.sweep({ now: remindNow, reminderLeadMinutes: 30 });
  assert.equal(r1b.remind.length, 0, "reminder fires only once");
  // 121 min later: expired
  const expireNow = new Date(now.getTime() + 121 * 60000);
  const r2 = ledger.sweep({ now: expireNow });
  assert.equal(r2.expired.length, 1);
  assert.equal(ledger.get(rec.id).status, STATES.EXPIRED);
});

// --- persistence ---
check("ledger persists and rehydrates", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dep-"));
  const filePath = path.join(dir, "deposits.json");
  const l1 = createDepositLedger({ filePath, nowFn });
  const rec = l1.request({ businessId: "restaurant_demo", senderId: "wa:I", bookingDraft: cases.fridayBigParty, amount: 500 });
  const l2 = createDepositLedger({ filePath, nowFn });
  assert.equal(l2.get(rec.id).code, rec.code, "record survives reload");
  assert.equal(l2.claimByReference({ businessId: "restaurant_demo", senderId: "wa:I", reference: rec.code }).ok, true);
  fs.rmSync(dir, { recursive: true, force: true });
});

// --- privacy: no raw sender id stored ---
check("raw sender id never stored in a record", () => {
  const ledger = createDepositLedger({ nowFn });
  const rec = ledger.request({ businessId: "restaurant_demo", senderId: "wa:85291234567", bookingDraft: cases.fridayBigParty, amount: 500 });
  assert.equal(JSON.stringify(rec).includes("85291234567"), false);
});

// --- customer-facing text safety (must pass the safety checker) ---
check("deposit instruction passes the safety checker (no PII/forbidden surface)", () => {
  const ledger = createDepositLedger({ nowFn });
  const rec = ledger.request({ businessId: "restaurant_demo", senderId: "wa:J", bookingDraft: cases.fridayBigParty, amount: 500 });
  const text = depositInstructionText(rec, { rails: cases.restaurantPolicyConfig.depositPolicy.rails, language: "zh-HK" });
  assert.ok(text.includes(rec.code) && text.includes("訂金"), "instruction quotes the code and deposit");
  const safety = checkDraft({
    draft: { action: "clarify", text },
    decision: { action: "clarify", forbiddenCapabilities: ["confirm_booking", "promise_slot_availability"] },
    knowledge: {}, intent: { primaryIntent: "booking" }, gateway: { sanitizedText: "想book位" }
  });
  assert.equal(safety.safeToSend, true, `deposit instruction must be safe to send: ${JSON.stringify(safety.violations)}`);
});
check("claim acknowledgement never claims money was received", () => {
  const ledger = createDepositLedger({ nowFn });
  const rec = ledger.request({ businessId: "restaurant_demo", senderId: "wa:K", bookingDraft: cases.fridayBigParty, amount: 500 });
  const text = claimAcknowledgementText(rec, { language: "zh-HK" });
  const safety = checkDraft({
    draft: { action: "clarify", text },
    decision: { action: "clarify", forbiddenCapabilities: ["confirm_payment_received", "decide_refund"] },
    knowledge: {}, intent: { primaryIntent: "payment" }, gateway: { sanitizedText: "過咗數" }
  });
  assert.equal(safety.safeToSend, true, `ack must be safe: ${JSON.stringify(safety.violations)}`);
  assert.ok(/核實緊|未代表/.test(text), "ack says checking, not confirmed");
});

// normalizeCode tolerance
check("normalizeCode extracts the code from messy input", () => {
  assert.equal(normalizeCode("過咗數 dep-7k3q 唔該"), "DEP-7K3Q");
  assert.equal(normalizeCode("DEP7K3Q"), "DEP-7K3Q");
  assert.equal(normalizeCode("no code here"), null);
});

console.log(`depositLedger: ${passed} tests passed`);
