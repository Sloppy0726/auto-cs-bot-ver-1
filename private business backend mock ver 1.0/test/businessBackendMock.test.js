"use strict";

const assert = require("node:assert/strict");
const { createBusinessBackend } = require("../src/businessBackendMock");
const { standardCases } = require("./businessBackendMock.cases");

const backend = createBusinessBackend();

for (const c of standardCases) {
  const result = backend[c.fn](c.query);
  assert.equal(result.found, c.expectFound, `${c.name}: found mismatch`);
  if (c.expectAvailable !== undefined) {
    assert.equal(result.available, c.expectAvailable, `${c.name}: available mismatch`);
  }
  assert.ok(Array.isArray(result.facts), `${c.name}: facts must be array`);
}

const minimal = backend.getMinimalFacts({
  businessId: "igshop_demo",
  intent: { primaryIntent: "order_status" },
  query: { businessId: "igshop_demo", orderId: "IG1001", senderId: "ig_sender_1001" }
});
assert.equal(minimal.found, true, "getMinimalFacts should route order_status lookup");

const unverifiedOrder = backend.lookupOrder({ businessId: "igshop_demo", orderId: "IG1001", senderId: "wrong_sender" });
assert.equal(unverifiedOrder.found, false, "order lookup must not expose facts to a mismatched sender");

const unverifiedPayment = backend.lookupPayment({ businessId: "igshop_demo", reference: "FPS-IG1001" });
assert.equal(unverifiedPayment.found, false, "payment lookup must require sender verification when records are customer-bound");

const browserDemoOrder = backend.lookupOrder({ businessId: "igshop_demo", orderId: "IG2001", senderId: "local-browser-demo" });
assert.equal(browserDemoOrder.found, true, "browser demo order should exist for local testing");

const browserDemoPayment = backend.lookupPayment({ businessId: "igshop_demo", reference: "FPS-IG2001", senderId: "local-browser-demo" });
assert.equal(browserDemoPayment.found, true, "browser demo payment should exist for local testing");

const todayRestaurantTable = backend.checkAvailability({ businessId: "restaurant_demo", date: "2026-05-20", time: "18:30", partySize: 2 });
assert.equal(todayRestaurantTable.found, true, "today restaurant table should exist for local testing");

const beautyPricing = backend.lookupPricing({ businessId: "beauty_demo", service: "facial" });
assert.equal(beautyPricing.found, true, "beauty facial pricing plans should exist for local testing");
assert.ok(
  beautyPricing.facts.some((fact) => fact.key === "planNameZh" && fact.value === "面部護理五次套票"),
  "beauty pricing should include Chinese plan names"
);
assert.ok(
  beautyPricing.facts.some((fact) => fact.key === "planNameEn" && fact.value === "Five-Session Facial Package"),
  "beauty pricing should include English plan names"
);

const tomorrowFacialSlots = backend.checkAvailability({ businessId: "beauty_demo", date: "2026-05-21", service: "facial" });
assert.equal(tomorrowFacialSlots.found, true, "beauty slot-list lookup should find tomorrow facial records");
assert.equal(tomorrowFacialSlots.available, true, "beauty slot-list lookup should report available slots");
assert.deepEqual(
  tomorrowFacialSlots.facts.find((fact) => fact.key === "availableSlots")?.value,
  ["13:00", "18:30"],
  "beauty slot-list lookup should expose available times only"
);

const memberOne = backend.lookupMember({ businessId: "beauty_demo", memberId: "00000001" });
assert.equal(memberOne.found, true, "member 00000001 should exist");
assert.equal(memberOne.facts.find((fact) => fact.key === "points")?.value, 1, "member 00000001 should have 1 point");
assert.equal(memberOne.facts.find((fact) => fact.key === "pointsUntilNextReward")?.value, 9, "member 00000001 should need 9 more points");

const memberTen = backend.lookupMember({ businessId: "beauty_demo", memberId: "00000010" });
assert.equal(memberTen.found, true, "member 00000010 should exist");
assert.equal(memberTen.facts.find((fact) => fact.key === "points")?.value, 10, "member 00000010 should have 10 points");
assert.equal(memberTen.facts.find((fact) => fact.key === "freeTreatmentsAvailable")?.value, 1, "member 00000010 should have a free treatment");

const missingMember = backend.getMinimalFacts({
  businessId: "beauty_demo",
  intent: { primaryIntent: "membership" },
  query: { businessId: "beauty_demo" }
});
assert.equal(missingMember.found, false, "membership lookup without ID should ask for member ID");

console.log(`businessBackendMock: ${standardCases.length + 18} tests passed`);
