"use strict";

const path = require("node:path");
const { checkDraft } = require("../src/safetyChecker");
const { standardCases } = require("../test/safetyChecker.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

function inputFor(c) {
  return {
    draft: { action: c.action, text: c.text, citations: c.citations || [] },
    decision: { action: c.action, forbiddenCapabilities: c.forbidden || [], grounding: c.grounding || [], clarificationText: c.clarificationText || null },
    knowledge: { bestMatch: c.answer ? { id: "restaurant_hours", answer: c.answer } : null, grounding: c.grounding || [] },
    intent: { riskLevel: c.intentRisk || "none" },
    gateway: { route: c.gatewayRoute || "send_to_llm" }
  };
}

const rows = standardCases.map((c) => {
  const input = inputFor(c);
  const result = checkDraft(input);
  const expected = { verdict: c.expectVerdict, safeToSend: c.expectSafe, violation: c.expectViolation || "" };
  const actual = {
    verdict: result.verdict,
    safeToSend: result.safeToSend,
    violations: result.violations.map((v) => ({ code: v.code, severity: v.severity, meta: v.meta })),
    repairedText: result.repairedText,
    reasons: result.reasons
  };
  const problems = [];
  if (actual.verdict !== expected.verdict) problems.push(`verdict expected ${expected.verdict}, got ${actual.verdict}`);
  if (expected.safeToSend !== undefined && actual.safeToSend !== expected.safeToSend) problems.push(`safeToSend expected ${expected.safeToSend}, got ${actual.safeToSend}`);
  if (expected.violation && !actual.violations.some((item) => item.code === expected.violation)) problems.push(`missing violation ${expected.violation}`);
  return {
    name: c.name,
    status: problems.length ? "FAIL" : "PASS",
    keyResult: `${actual.verdict} / safe=${actual.safeToSend}`,
    context: input,
    expected,
    actual,
    problems
  };
});

const out = path.join(__dirname, "..", "safety-checker-side-by-side-results.md");
writeReadableReport(out, {
  title: "Safety Checker ver 1.0 - Readable Side-by-side Results",
  description: "Each case compares a draft and policy contract with the deterministic post-generation safety verdict.",
  rows
});
console.log(`Wrote ${rows.length} readable rows to ${out}`);
if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
