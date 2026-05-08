"use strict";

const assert = require("node:assert/strict");
const { classifyIntent } = require("../src/intentClassifier");
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

console.log(`intentClassifier: ${standardCases.length} tests passed`);
