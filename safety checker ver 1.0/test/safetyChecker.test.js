"use strict";

const assert = require("node:assert/strict");
const { checkDraft, VERDICTS } = require("../src/safetyChecker");
const { standardCases } = require("./safetyChecker.cases");

function inputFor(c) {
  return {
    draft: {
      action: c.action,
      text: c.text,
      citations: c.citations || []
    },
    decision: {
      action: c.action,
      forbiddenCapabilities: c.forbidden || [],
      grounding: c.grounding || [],
      clarificationText: c.clarificationText || null
    },
    knowledge: {
      bestMatch: c.answer ? { id: "restaurant_hours", answer: c.answer } : null,
      grounding: c.grounding || []
    },
    intent: { riskLevel: c.intentRisk || "none" },
    gateway: { route: c.gatewayRoute || "send_to_llm" }
  };
}

for (const c of standardCases) {
  const result = checkDraft(inputFor(c));
  assert.equal(result.verdict, c.expectVerdict, `${c.name}: verdict mismatch`);
  if (c.expectSafe !== undefined) {
    assert.equal(result.safeToSend, c.expectSafe, `${c.name}: safeToSend mismatch`);
  }
  if (c.expectViolation) {
    assert.ok(result.violations.some((item) => item.code === c.expectViolation), `${c.name}: missing ${c.expectViolation}`);
  }
  assert.ok(Object.values(VERDICTS).includes(result.verdict), `${c.name}: unknown verdict`);
  assert.ok(Array.isArray(result.violations), `${c.name}: violations must be array`);
}

const pii = checkDraft({
  draft: { action: "staff_review", text: "客人電話 6123 4567", citations: [] },
  decision: { action: "staff_review", forbiddenCapabilities: ["leak_pii"], grounding: [] },
  knowledge: {},
  intent: {},
  gateway: {}
});
assert.equal(pii.verdict, "block", "PII-like text must block");

const redactionPlaceholder = checkDraft({
  draft: { action: "staff_review", text: "請同事覆客人 [PHONE_1]", citations: [] },
  decision: { action: "staff_review", forbiddenCapabilities: [], grounding: [] },
  knowledge: {},
  intent: {},
  gateway: {}
});
assert.equal(redactionPlaceholder.verdict, "revise", "bracketed redaction placeholders should not be sendable");
assert.ok(redactionPlaceholder.violations.some((item) => item.code === "placeholder_leak"), "bracketed redaction placeholder should be flagged");

console.log(`safetyChecker: ${standardCases.length + 2} tests passed`);
