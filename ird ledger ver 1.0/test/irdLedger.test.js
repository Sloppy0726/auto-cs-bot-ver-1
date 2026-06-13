"use strict";

const assert = require("node:assert/strict");
const { createIrdLedger } = require("../src/irdLedger");
const { createDepositLedger } = require("../../deposit ledger ver 1.0/src/depositLedger");
const { createRedemptionLedger } = require("../../package redemption ledger ver 1.0/src/redemptionLedger");

const nowFn = () => new Date("2026-06-30T04:00:00.000Z");
let passed = 0;
function check(name, fn) { fn(); passed += 1; }

function fixtures() {
  const dep = createDepositLedger({ nowFn });
  // a verified deposit (cash in) and a waived one (recorded, $0)
  const r1 = dep.request({ businessId: "restaurant_demo", senderId: "wa:a", bookingDraft: { date: "2026-06-20", time: "20:00" }, amount: 500, now: new Date("2026-06-15T04:00:00Z") });
  dep.claimByReference({ businessId: "restaurant_demo", senderId: "wa:a", reference: r1.code });
  dep.verify(r1.id, { actor: "boss", now: new Date("2026-06-15T05:00:00Z") });
  const r2 = dep.request({ businessId: "restaurant_demo", senderId: "wa:b", bookingDraft: { date: "2026-06-21", time: "19:00" }, amount: 800, now: new Date("2026-06-16T04:00:00Z") });
  dep.waive(r2.id, { reason: "T8", now: new Date("2026-06-16T06:00:00Z") });

  const redeem = createRedemptionLedger({ nowFn });
  redeem.seedFromPackages([{ id: "pkg_x", businessId: "restaurant_demo", customerExternalId: "wa:a", packageName: "套餐 5 次", serviceName: "set dinner", unitPrice: 300, totalSessions: 5, usedSessions: 1, purchaseDate: "2026-06-10T04:00:00Z", expiryDate: "2026-12-31" }]);
  return { dep, redeem };
}

check("project folds deposits + package purchase into cash-in takings", () => {
  const { dep, redeem } = fixtures();
  const ird = createIrdLedger({ depositLedger: dep, redemptionLedger: redeem, nowFn });
  const p = ird.project({ businessId: "restaurant_demo" });
  // cash-in = verified deposit 500 + package purchase 5*300=1500 = 2000 (waived deposit = 0, redemption = non-cash)
  assert.equal(p.totalTakings, 2000);
  const types = p.lineItems.map((l) => l.type).sort();
  assert.ok(types.includes("deposit_verified"));
  assert.ok(types.includes("deposit_waived"));
  assert.ok(types.includes("package_purchase"));
  assert.ok(types.includes("package_redemption"));
  // redemption is non-cash → not in takings
  const redemptionLine = p.lineItems.find((l) => l.type === "package_redemption");
  assert.equal(redemptionLine.cashIn, false);
  assert.equal(redemptionLine.amount, 0);
});

check("daily takings are keyed by HK date", () => {
  const { dep, redeem } = fixtures();
  const ird = createIrdLedger({ depositLedger: dep, redemptionLedger: redeem, nowFn });
  const p = ird.project({ businessId: "restaurant_demo" });
  // verified deposit on 2026-06-15, package purchase on 2026-06-10
  assert.equal(p.dailyTakings["2026-06-15"], 500);
  assert.equal(p.dailyTakings["2026-06-10"], 1500);
});

check("date range filters line items", () => {
  const { dep, redeem } = fixtures();
  const ird = createIrdLedger({ depositLedger: dep, redemptionLedger: redeem, nowFn });
  const p = ird.project({ businessId: "restaurant_demo", fromDate: "2026-06-14", toDate: "2026-06-30" });
  // excludes the 2026-06-10 package purchase
  assert.equal(p.dailyTakings["2026-06-10"], undefined);
  assert.equal(p.totalTakings, 500);
});

check("counterparties are pseudonymised, no raw id leaks", () => {
  const { dep, redeem } = fixtures();
  const ird = createIrdLedger({ depositLedger: dep, redemptionLedger: redeem, nowFn });
  const p = ird.project({ businessId: "restaurant_demo" });
  assert.equal(JSON.stringify(p.lineItems).includes("wa:a"), false);
  assert.equal(JSON.stringify(p.lineItems).includes("wa:b"), false);
});

check("CSV export has a header and one row per line item", () => {
  const { dep, redeem } = fixtures();
  const ird = createIrdLedger({ depositLedger: dep, redemptionLedger: redeem, nowFn });
  const { csv, projection } = ird.exportCsv({ businessId: "restaurant_demo" });
  assert.match(csv, /^date,type,amount,currency,ref,detail,counterparty,cash_in/);
  assert.equal(csv.trim().split("\n").length, projection.lineCount + 1);
});

check("statement states honest scope and reports chain verification", () => {
  const { dep, redeem } = fixtures();
  const ird = createIrdLedger({ depositLedger: dep, redemptionLedger: redeem, nowFn });
  const s = ird.statement({ businessId: "restaurant_demo", language: "zh-HK" });
  assert.match(s.scope, /並非貴店全部帳目/, "honest: not the full books");
  assert.match(s.scope, /51C/);
  assert.match(s.totals, /HK\$2000/);
  assert.match(s.integrity, /已通過核證/);
  assert.equal(s.projection.chainVerified, true);
  // English variant
  const en = ird.statement({ businessId: "restaurant_demo", language: "en" });
  assert.match(en.scope, /NOT your full statutory books/);
});

check("missing per-session price → purchase amount not fabricated", () => {
  const redeem = createRedemptionLedger({ nowFn });
  redeem.seedFromPackages([{ id: "pkg_np", businessId: "beauty_demo", customerExternalId: "c1", serviceName: "facial", totalSessions: 5, usedSessions: 0, purchaseDate: "2026-06-10T04:00:00Z", expiryDate: "2026-12-31" }]); // no unitPrice
  const ird = createIrdLedger({ redemptionLedger: redeem, nowFn });
  const p = ird.project({ businessId: "beauty_demo" });
  const purchase = p.lineItems.find((l) => l.type === "package_purchase");
  assert.equal(purchase.amountKnown, false);
  assert.equal(p.totalTakings, 0, "no price → not counted as fabricated takings");
});

console.log(`irdLedger: ${passed} tests passed`);
