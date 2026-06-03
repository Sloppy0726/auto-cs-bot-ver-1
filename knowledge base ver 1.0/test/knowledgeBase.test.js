"use strict";

const assert = require("node:assert/strict");
const { createKnowledgeBase, _internal } = require("../src/knowledgeBase");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { standardCases, seed } = require("./knowledgeBase.cases");

const kb = createKnowledgeBase({ entries: seed });

function runCase(testCase) {
  const gateway = routeMessage(testCase.input);
  const intent = classifyIntent(gateway);
  const result = kb.lookup({
    businessId: testCase.businessId,
    sanitizedText: gateway.sanitizedText,
    intent
  });

  const label = testCase.name;

  if (testCase.expectHandoff) {
    assert.equal(result.handoff, true, `${label}: expected handoff`);
  }

  if (testCase.expectGap !== undefined) {
    assert.equal(result.gap, testCase.expectGap, `${label}: expected gap=${testCase.expectGap}`);
  }

  if (testCase.expectBestMatchId === null) {
    assert.equal(result.bestMatch, null, `${label}: bestMatch should be null`);
  } else if (testCase.expectBestMatchId) {
    assert.ok(result.bestMatch, `${label}: bestMatch missing`);
    assert.equal(result.bestMatch.id, testCase.expectBestMatchId, `${label}: wrong bestMatch.id`);
  }

  if (testCase.expectBestMatchAnyOf) {
    assert.ok(result.bestMatch, `${label}: bestMatch missing`);
    assert.ok(
      testCase.expectBestMatchAnyOf.includes(result.bestMatch.id),
      `${label}: bestMatch ${result.bestMatch.id} not in ${testCase.expectBestMatchAnyOf.join("/")}`
    );
  }

  if (testCase.expectBackendBound !== undefined) {
    assert.equal(result.backendBound, testCase.expectBackendBound, `${label}: backendBound mismatch`);
  }

  if (testCase.expectLanguage) {
    assert.equal(result.language, testCase.expectLanguage, `${label}: wrong language`);
  }

  if (testCase.expectClarification) {
    assert.ok(result.suggestedClarification && result.suggestedClarification.length > 0, `${label}: clarification missing`);
  }
  if (testCase.expectAutoReplyIncludes) {
    const ids = result.autoReplyMatches.map((match) => match.id);
    for (const id of testCase.expectAutoReplyIncludes) {
      assert.ok(ids.includes(id), `${label}: autoReplyMatches missing ${id}`);
    }
    assert.ok(result.autoReplyText, `${label}: autoReplyText missing`);
  }

  // Invariants for every case:
  for (const match of result.matches) {
    assert.equal(match.approved, true, `${label}: every returned match must be approved`);
    assert.ok(match.answer.length > 0, `${label}: match answer must not be empty`);
  }
  if (result.bestMatch) {
    assert.ok(result.grounding.includes(result.bestMatch.id), `${label}: grounding must cite bestMatch`);
  }
}

for (const c of standardCases) runCase(c);

// --- Direct unit checks ---

// Unapproved entries must never be indexed.
const kbWithUnapproved = createKnowledgeBase({
  entries: [
    { id: "x", businessId: "b", intent: "pricing", question: "?", answer: "ignored", approved: false, keywords: ["price"] }
  ]
});
assert.deepEqual(kbWithUnapproved.listEntries("b"), [], "unapproved entries must not be indexed");

// Empty businessId → still returns a structured result, not a crash.
const emptyResult = kb.lookup({});
assert.equal(emptyResult.gap, true, "empty input must return gap=true");
assert.ok(emptyResult.suggestedClarification, "empty input must propose a clarification");

const stockResult = kb.lookup({
  businessId: "igshop_demo",
  sanitizedText: "有冇現貨 service",
  intent: { primaryIntent: "service_info", language: "mixed" }
});
assert.equal(stockResult.bestMatch.id, "igshop_stock", "stock KB entry should match");
assert.equal(stockResult.bestMatch.requiresBackend, true, "stock KB entry should carry requiresBackend");
assert.equal(stockResult.backendBound, true, "requiresBackend KB entry must make lookup backendBound");

const beautyClarify = kb.lookup({
  businessId: "beauty_demo",
  sanitizedText: "hi",
  intent: { primaryIntent: "general", language: "en" }
});
assert.match(beautyClarify.suggestedClarification, /^Hi, this is Solara Beauty\.\n/, "beauty clarify should greet with company name");
assert.match(
  _internal.clarificationFor("general", "zh-HK", "beauty_demo"),
  /^你好，呢度係 Solara Beauty。\n/,
  "beauty Chinese clarification should greet with company name"
);

console.log(`knowledgeBase: ${standardCases.length + 5} tests passed`);
