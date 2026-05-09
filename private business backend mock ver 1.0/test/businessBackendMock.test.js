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
  query: { businessId: "igshop_demo", orderId: "IG1001" }
});
assert.equal(minimal.found, true, "getMinimalFacts should route order_status lookup");

console.log(`businessBackendMock: ${standardCases.length + 1} tests passed`);
