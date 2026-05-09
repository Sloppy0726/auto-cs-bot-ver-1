"use strict";

const path = require("node:path");
const { evaluate } = require("../src/businessRules");
const { getConfig } = require("../src/archetypes");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { createKnowledgeBase } = require("../../knowledge base ver 1.0/src/knowledgeBase");
const seed = require("../../knowledge base ver 1.0/seed/hkSmeSeed");
const { standardCases } = require("../test/businessRules.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

const kb = createKnowledgeBase({ entries: seed });

const rows = standardCases.map((c) => {
  const gateway = routeMessage(c.input);
  const intent = classifyIntent(gateway);
  const knowledge = kb.lookup({ businessId: c.businessId, sanitizedText: gateway.sanitizedText, intent });
  const result = evaluate({ gateway, intent, knowledge, businessConfig: getConfig(c.businessId) });
  const expected = {
    action: c.expectAction || c.expectActionOneOf || "",
    escalation: c.expectEscalation || "",
    mustForbid: c.expectMustForbid || [],
    mustAllow: c.expectMustAllow || []
  };
  const actual = {
    action: result.action,
    escalation: result.escalationLabel,
    suggestedTone: result.suggestedTone,
    allowedCapabilities: result.allowedCapabilities,
    forbiddenCapabilities: result.forbiddenCapabilities,
    grounding: result.grounding,
    reasons: result.reasons
  };
  const problems = [];
  if (Array.isArray(expected.action)) {
    if (!expected.action.includes(actual.action)) problems.push(`action expected one of ${expected.action.join(", ")}, got ${actual.action}`);
  } else if (expected.action && actual.action !== expected.action) {
    problems.push(`action expected ${expected.action}, got ${actual.action}`);
  }
  if (Array.isArray(expected.escalation) && expected.escalation.length && !expected.escalation.includes(actual.escalation)) problems.push(`escalation expected one of ${expected.escalation.join(", ")}, got ${actual.escalation}`);
  for (const cap of expected.mustForbid) if (!actual.forbiddenCapabilities.includes(cap)) problems.push(`missing forbidden capability ${cap}`);
  for (const cap of expected.mustAllow) if (!actual.allowedCapabilities.includes(cap)) problems.push(`missing allowed capability ${cap}`);
  return {
    name: c.name,
    status: problems.length ? "FAIL" : "PASS",
    keyResult: `${actual.action}${actual.escalation ? ` / ${actual.escalation}` : ""}`,
    context: { businessId: c.businessId, input: c.input, intent: intent.primaryIntent, kb: knowledge.bestMatch?.id || null },
    expected,
    actual,
    problems
  };
});

const out = path.join(__dirname, "..", "business-rules-side-by-side-results.md");
writeReadableReport(out, {
  title: "Business Rules ver 1.0 - Readable Side-by-side Results",
  description: "Each case compares the expected policy route with the actual deterministic decision and capability contract.",
  rows
});
console.log(`Wrote ${rows.length} readable rows to ${out}`);
if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
