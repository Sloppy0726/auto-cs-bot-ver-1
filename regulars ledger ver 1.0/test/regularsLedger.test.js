"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createRegularsLedger, inferRegularRebook, senderRef } = require("../src/regularsLedger");

const nowFn = () => new Date("2026-06-20T04:00:00.000Z");
let passed = 0;
function check(name, fn) { fn(); passed += 1; }

// Three consistent Tuesday 15:00 party-of-4 visits.
function seedRegular(ledger, businessId, senderId) {
  for (const date of ["2026-06-02", "2026-06-09", "2026-06-16"]) { // all Tuesdays
    ledger.recordVisit({ businessId, senderId, booking: { date, time: "15:00", partySize: 4, at: `${date}T07:00:00Z` } });
  }
}

check("recordVisit stores only derived fields, sender pseudonymised", () => {
  const l = createRegularsLedger({ nowFn });
  l.recordVisit({ businessId: "restaurant_demo", senderId: "web-may", booking: { date: "2026-06-02", time: "15:00", partySize: 4 } });
  const dump = JSON.stringify(l.all());
  assert.equal(dump.includes("web-may"), false, "raw senderId not stored");
  assert.ok(dump.includes(senderRef("web-may")), "senderRef hash stored");
});

check("profile detects a regular with a dominant modal slot", () => {
  const l = createRegularsLedger({ nowFn });
  seedRegular(l, "restaurant_demo", "web-may");
  const p = l.profile({ businessId: "restaurant_demo", senderId: "web-may" });
  assert.equal(p.visitCount, 3);
  assert.equal(p.isRegular, true);
  assert.equal(p.modal.weekday.value, 2, "Tuesday");
  assert.equal(p.modal.time.value, "15:00");
  assert.equal(p.modal.partySize.value, 4);
});

check("below threshold is not a regular", () => {
  const l = createRegularsLedger({ nowFn });
  l.recordVisit({ businessId: "restaurant_demo", senderId: "web-once", booking: { date: "2026-06-02", time: "15:00", partySize: 4 } });
  const p = l.profile({ businessId: "restaurant_demo", senderId: "web-once" });
  assert.equal(p.isRegular, false);
  assert.equal(p.visitCount, 1);
});

check("no dominant pattern yields no modal suggestion", () => {
  const l = createRegularsLedger({ nowFn });
  // 3 visits, all different weekdays/times → no value covers ≥50%
  l.recordVisit({ businessId: "x", senderId: "s", booking: { date: "2026-06-01", time: "10:00", partySize: 2 } }); // Mon
  l.recordVisit({ businessId: "x", senderId: "s", booking: { date: "2026-06-03", time: "14:00", partySize: 5 } }); // Wed
  l.recordVisit({ businessId: "x", senderId: "s", booking: { date: "2026-06-05", time: "19:00", partySize: 8 } }); // Fri
  const p = l.profile({ businessId: "x", senderId: "s" });
  assert.equal(p.modal.weekday, null, "no dominant weekday");
});

check("retention window excludes stale visits", () => {
  const l = createRegularsLedger({ nowFn, retentionDays: 30 });
  l.recordVisit({ businessId: "x", senderId: "s", booking: { date: "2020-01-01", time: "15:00", partySize: 4, at: "2020-01-01T00:00:00Z" } });
  assert.equal(l.profile({ businessId: "x", senderId: "s" }).visitCount, 0, "old visit dropped by retention");
});

check("forget() erases the profile (PDPO)", () => {
  const l = createRegularsLedger({ nowFn });
  seedRegular(l, "restaurant_demo", "web-may");
  assert.equal(l.forget({ businessId: "restaurant_demo", senderId: "web-may" }), true);
  assert.equal(l.profile({ businessId: "restaurant_demo", senderId: "web-may" }).visitCount, 0);
});

check("seedFromBookings backfills profiles", () => {
  const l = createRegularsLedger({ nowFn });
  const bookings = ["2026-06-02", "2026-06-09", "2026-06-16"].map((date) => ({ businessId: "restaurant_demo", senderId: "web-bob", date, time: "19:00", partySize: 2, at: `${date}T11:00:00Z` }));
  l.seedFromBookings(bookings);
  assert.equal(l.profile({ businessId: "restaurant_demo", senderId: "web-bob" }).isRegular, true);
});

// --- inferRegularRebook ---
const regularProfile = (() => { const l = createRegularsLedger({ nowFn }); seedRegular(l, "restaurant_demo", "web-may"); return l.profile({ businessId: "restaurant_demo", senderId: "web-may" }); })();

check("inferRegularRebook offers the usual slot for a regular with no time pinned", () => {
  const r = inferRegularRebook({ profile: regularProfile, intent: { primaryIntent: "booking" }, query: {}, language: "zh-HK" });
  assert.ok(r && /照舊/.test(r.text));
  assert.ok(/星期二/.test(r.text) && /下午3點/.test(r.text) && /4位/.test(r.text));
  assert.ok(/覆「係」/.test(r.text), "confirm-don't-assume");
});

check("inferRegularRebook stays silent when a time is already pinned", () => {
  assert.equal(inferRegularRebook({ profile: regularProfile, intent: { primaryIntent: "booking" }, query: { time: "18:00" } }), null);
});

check("inferRegularRebook stays silent for non-regulars and non-booking intents", () => {
  assert.equal(inferRegularRebook({ profile: { isRegular: false }, intent: { primaryIntent: "booking" }, query: {} }), null);
  assert.equal(inferRegularRebook({ profile: regularProfile, intent: { primaryIntent: "pricing" }, query: {} }), null);
});

check("ledger persists and rehydrates", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "reg-"));
  const filePath = path.join(dir, "regulars.json");
  const l1 = createRegularsLedger({ filePath, nowFn });
  seedRegular(l1, "restaurant_demo", "web-may");
  const l2 = createRegularsLedger({ filePath, nowFn });
  assert.equal(l2.profile({ businessId: "restaurant_demo", senderId: "web-may" }).isRegular, true);
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`regularsLedger: ${passed} tests passed`);
