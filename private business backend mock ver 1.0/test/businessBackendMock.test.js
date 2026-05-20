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

const tomorrowFacialSlots = backend.checkAvailability({ businessId: "beauty_demo", date: "2026-05-21", service: "facial" });
assert.equal(tomorrowFacialSlots.found, true, "beauty slot-list lookup should find tomorrow facial records");
assert.equal(tomorrowFacialSlots.available, true, "beauty slot-list lookup should report available slots");
assert.deepEqual(
  tomorrowFacialSlots.facts.find((fact) => fact.key === "availableSlots")?.value,
  ["13:00", "18:30"],
  "beauty slot-list lookup should expose available times only"
);

console.log(`businessBackendMock: ${standardCases.length + 9} tests passed`);
