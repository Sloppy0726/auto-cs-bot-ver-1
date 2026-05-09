"use strict";

const assert = require("node:assert/strict");
const { routeModel, MODELS, PROVIDERS } = require("../src/modelRouter");
const { standardCases } = require("./modelRouter.cases");

for (const c of standardCases) {
  const result = routeModel({ decision: c.decision, intent: c.intent, gateway: c.gateway || {} });
  assert.equal(result.model, c.expectModel, `${c.name}: model mismatch`);
  assert.equal(result.shouldCallLLM, c.expectShouldCall, `${c.name}: shouldCallLLM mismatch`);
  assert.ok(Object.values(MODELS).includes(result.model), `${c.name}: model unknown`);
}

const forced = routeModel({ decision: { action: "staff_review" }, intent: {} }, { forceModel: "custom-model" });
assert.equal(forced.provider, PROVIDERS.ANTHROPIC, "forced model should use Anthropic provider");
assert.equal(forced.model, "custom-model", "forced model should be respected");

console.log(`modelRouter: ${standardCases.length + 1} tests passed`);
