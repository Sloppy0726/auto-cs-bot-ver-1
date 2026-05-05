"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { filterForLLM } = require("../src/privacyFilter");
const { allCases } = require("../test/privacyFilter.cases");

const outputPath = path.join(__dirname, "..", "privacy-filter-side-by-side-results.md");

function escapeCell(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

function statusFor(testCase, result) {
  const types = result.findings.map((item) => item.type);
  const hints = result.hints.map((item) => item.type);
  const expectedHints = testCase.expectedHints || [];
  const pass = result.sanitizedText === testCase.expectedText
    && JSON.stringify(types) === JSON.stringify(testCase.expectedTypes)
    && result.shouldSendToLLM === testCase.shouldSendToLLM
    && result.needsHumanReview === testCase.needsHumanReview
    && JSON.stringify(hints) === JSON.stringify(expectedHints);
  return pass ? "PASS" : "FAIL";
}

const rows = allCases.map((testCase, index) => {
  const result = filterForLLM(testCase.input, testCase.options);
  return [
    index + 1,
    statusFor(testCase, result),
    testCase.name,
    testCase.input,
    testCase.expectedText,
    result.sanitizedText,
    testCase.expectedTypes.join(", "),
    result.findings.map((item) => item.type).join(", "),
    (testCase.expectedHints || []).join(", "),
    result.hints.map((item) => item.type).join(", "),
    testCase.shouldSendToLLM,
    result.shouldSendToLLM,
    testCase.needsHumanReview,
    result.needsHumanReview
  ];
});

const lines = [
  "# Privacy Filter Side-by-Side Results",
  "",
  `Generated cases: ${allCases.length}`,
  "",
  "| # | Status | Case | Input | Expected sanitized | Actual sanitized | Expected types | Actual types | Expected hints | Actual hints | Expected send to LLM | Actual send to LLM | Expected review | Actual review |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`)
];

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);
console.log(outputPath);
