"use strict";

const assert = require("node:assert/strict");
const { scoreAnger } = require("../src/cantoSentiment");
const { cases } = require("./cantoSentiment.cases");

let passed = 0;

for (const c of cases) {
  const r = scoreAnger(c.text, c.history || []);
  for (const [key, value] of Object.entries(c.expect)) {
    assert.equal(r[key], value, `${c.name}: ${key} expected ${JSON.stringify(value)}, got ${JSON.stringify(r[key])}`);
  }
  passed += 1;
}

// Determinism
assert.deepEqual(
  scoreAnger("你哋仆街呀，上OpenRice俾你一星"),
  scoreAnger("你哋仆街呀，上OpenRice俾你一星"),
  "scoreAnger must be deterministic"
);
passed += 1;

// Combined threat + profanity: reputation label wins over generic anger label.
const combined = scoreAnger("你哋班on9，我出po去Google俾負評");
assert.equal(combined.reputationThreat, true);
assert.equal(combined.severity, 3, "profanity still registers tier 3");
assert.equal(combined.label, "reputation_risk", "threat label takes precedence");
passed += 1;

// Empty / nullish input is calm, never throws.
assert.equal(scoreAnger("").severity, 0);
assert.equal(scoreAnger(null).escalate, false);
assert.equal(scoreAnger(undefined).suppressPromo, false);
passed += 1;

console.log(`cantoSentiment: ${passed} tests passed`);
