"use strict";

const assert = require("node:assert/strict");
const { classifyIntent, _internal } = require("../src/intentClassifier");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { standardCases } = require("./intentClassifier.cases");

function assertIntent(testCase) {
  const gatewayOutput = routeMessage(testCase.input, testCase.gatewayOptions);
  const result = classifyIntent(gatewayOutput, testCase.classifierOptions || {});
  const label = testCase.name || testCase.input;

  assert.equal(result.primaryIntent, testCase.primaryIntent, label);
  assert.deepEqual(result.secondaryIntents, testCase.secondaryIntents || [], label);
  assert.equal(result.needsHumanReview, testCase.needsHumanReview ?? false, label);
  assert.equal(result.source, testCase.source || "deterministic", label);
  assert.ok(result.confidence >= (testCase.minConfidence || 0.68), label);
  if (testCase.language) assert.equal(result.language, testCase.language, label);
  if (testCase.riskLevel) assert.equal(result.riskLevel, testCase.riskLevel, label);

  assert.ok(result.customerGoal.length > 0, label);
  assert.ok(Array.isArray(result.reasons), label);

  for (const placeholder of testCase.expectedPlaceholders || []) {
    assert.ok(gatewayOutput.sanitizedText.includes(placeholder), label);
  }
}

for (const testCase of standardCases) {
  assertIntent(testCase);
}

const mergedSafetyIntent = _internal.mergeLlmIntentResult(
  {
    primaryIntent: "complaint",
    secondaryIntents: [],
    confidence: 0.94,
    riskLevel: "high",
    needsHumanReview: true,
    language: "zh-HK",
    customerGoal: "Complaint",
    entities: {},
    source: "deterministic",
    reasons: ["Matched complaint keyword"]
  },
  {
    primaryIntent: "general",
    confidence: 0.6,
    riskLevel: "low",
    needsHumanReview: false,
    reasons: ["LLM thought it was general"]
  }
);
assert.equal(mergedSafetyIntent.primaryIntent, "complaint", "LLM must not override protected complaint intent");
assert.equal(mergedSafetyIntent.riskLevel, "high", "LLM must not lower risk level");
assert.equal(mergedSafetyIntent.needsHumanReview, true, "LLM must not clear human review flag");

console.log(`intentClassifier: ${standardCases.length + 3} tests passed`);
