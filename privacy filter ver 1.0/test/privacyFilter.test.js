"use strict";

const assert = require("node:assert/strict");
const { filterForLLM } = require("../src/privacyFilter");
const { allCases } = require("./privacyFilter.cases");

assert.equal(allCases.length, 500, "test suite should contain exactly 500 cases");

for (const testCase of allCases) {
  const result = filterForLLM(testCase.input, testCase.options);
  assert.equal(result.sanitizedText, testCase.expectedText, testCase.name);
  assert.deepEqual(result.findings.map((item) => item.type), testCase.expectedTypes, testCase.name);
  assert.equal(result.shouldSendToLLM, testCase.shouldSendToLLM, testCase.name);
  assert.equal(result.needsHumanReview, testCase.needsHumanReview, testCase.name);

  if (testCase.expectedHints) {
    assert.deepEqual(result.hints.map((item) => item.type), testCase.expectedHints, testCase.name);
  } else {
    assert.deepEqual(result.hints.map((item) => item.type), [], testCase.name);
  }
}

console.log(`privacyFilter: ${allCases.length} tests passed`);
