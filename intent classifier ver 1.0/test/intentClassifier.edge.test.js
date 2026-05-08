"use strict";

const assert = require("node:assert/strict");
const { classifyIntent, buildLLMIntentInput } = require("../src/intentClassifier");
const { routeMessage, ROUTES } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { edgeCases } = require("./intentClassifier.cases");

function assertEdge(input, expected) {
  const gatewayOutput = routeMessage(input, expected.gatewayOptions);
  const result = classifyIntent(gatewayOutput, expected.classifierOptions || {});

  assert.equal(result.primaryIntent, expected.primaryIntent, expected.name || input);
  if (expected.secondaryIntents) {
    assert.deepEqual(result.secondaryIntents, expected.secondaryIntents, expected.name || input);
  }
  if (expected.route) assert.equal(gatewayOutput.route, expected.route, expected.name || input);
  if (expected.expectedRoute) assert.equal(gatewayOutput.route, expected.expectedRoute, expected.name || input);
  if (expected.riskLevel) assert.equal(result.riskLevel, expected.riskLevel, expected.name || input);
  if (typeof expected.needsHumanReview === "boolean") {
    assert.equal(result.needsHumanReview, expected.needsHumanReview, expected.name || input);
  }
  if (expected.source) assert.equal(result.source, expected.source, expected.name || input);
  if (expected.minConfidence) assert.ok(result.confidence >= expected.minConfidence, expected.name || input);
  if (expected.maxConfidence) assert.ok(result.confidence <= expected.maxConfidence, expected.name || input);

  assert.ok(result.customerGoal.length > 0, expected.name || input);
  assert.ok(Array.isArray(result.reasons), expected.name || input);
  return { gatewayOutput, result };
}

for (const testCase of edgeCases) {
  assertEdge(testCase.input, testCase);
}

{
  const gatewayOutput = routeMessage("我電話係9123 4567，想問幾錢");
  const deterministic = classifyIntent(gatewayOutput);
  const llmInput = buildLLMIntentInput(gatewayOutput, deterministic);
  assert.equal(llmInput.sanitizedText.includes("9123"), false);
  assert.equal(llmInput.sanitizedText.includes("[PHONE_1]"), true);
  assert.deepEqual(llmInput.privacyFindings, ["hong_kong_phone"]);
}

{
  const gatewayOutput = routeMessage("HKID A123456(3) 想問underarm幾錢");
  assert.equal(gatewayOutput.route, ROUTES.REVIEW_BEFORE_LLM);
  let llmWasCalled = false;
  const result = classifyIntent(gatewayOutput, {
    confidenceThreshold: 0.99,
    llmClassifier: () => {
      llmWasCalled = true;
      return { primaryIntent: "pricing", confidence: 0.9 };
    }
  });
  assert.equal(result.primaryIntent, "pricing");
  assert.equal(result.needsHumanReview, true);
  assert.equal(result.source, "deterministic");
  assert.equal(llmWasCalled, false);
}

async function runLLMFallbackCase() {
  const gatewayOutput = routeMessage("想問下你哋個plan係點");
  const result = await classifyIntent(gatewayOutput, {
    confidenceThreshold: 0.8,
    llmClassifier: (input) => {
      assert.equal(input.sanitizedText, gatewayOutput.sanitizedText);
      assert.equal(input.deterministicGuess.primaryIntent, "general");
      return {
        primaryIntent: "service_info",
        confidence: 0.82,
        customerGoal: "Customer asks for plan details.",
        entities: { service: "plan" },
        reasons: ["LLM classified vague plan question as service info"]
      };
    }
  });

  assert.equal(result.primaryIntent, "service_info");
  assert.equal(result.source, "llm");
  assert.equal(result.entities.service, "plan");
}

runLLMFallbackCase().then(() => {
  console.log(`intentClassifier edge: ${edgeCases.length + 3} checks passed`);
});
