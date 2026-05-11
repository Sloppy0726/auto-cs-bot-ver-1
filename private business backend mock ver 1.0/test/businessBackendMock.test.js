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

console.log(`businessBackendMock: ${standardCases.length + 3} tests passed`);
