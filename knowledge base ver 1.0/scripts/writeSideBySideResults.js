"use strict";

const path = require("node:path");
const { createKnowledgeBase } = require("../src/knowledgeBase");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { standardCases, seed } = require("../test/knowledgeBase.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

const kb = createKnowledgeBase({ entries: seed });

const rows = standardCases.map((c) => {
  const gateway = routeMessage(c.input);
  const intent = classifyIntent(gateway);
  const result = kb.lookup({ businessId: c.businessId, sanitizedText: gateway.sanitizedText, intent });
  const expected = {
    bestMatchId: c.expectBestMatchId === null ? null : c.expectBestMatchId || c.expectBestMatchAnyOf || "",
    gap: c.expectGap,
    handoff: c.expectHandoff || false,
    backendBound: c.expectBackendBound
  };
  const actual = {
    bestMatchId: result.bestMatch ? result.bestMatch.id : null,
    score: result.bestMatch ? result.bestMatch.score : null,
    primaryIntent: result.primaryIntent,
    language: result.language,
    gap: result.gap,
    handoff: result.handoff,
    backendBound: result.backendBound,
    grounding: result.grounding,
    clarification: result.suggestedClarification || ""
  };
  const problems = [];
  if (Array.isArray(expected.bestMatchId)) {
    if (!expected.bestMatchId.includes(actual.bestMatchId)) problems.push(`bestMatchId expected one of ${expected.bestMatchId.join(", ")}, got ${actual.bestMatchId}`);
  } else if (expected.bestMatchId !== "" && actual.bestMatchId !== expected.bestMatchId) {
    problems.push(`bestMatchId expected ${expected.bestMatchId}, got ${actual.bestMatchId}`);
  }
  if (expected.gap !== undefined && actual.gap !== expected.gap) problems.push(`gap expected ${expected.gap}, got ${actual.gap}`);
  if (actual.handoff !== expected.handoff) problems.push(`handoff expected ${expected.handoff}, got ${actual.handoff}`);
  if (expected.backendBound !== undefined && actual.backendBound !== expected.backendBound) problems.push(`backendBound expected ${expected.backendBound}, got ${actual.backendBound}`);
  return {
    name: c.name,
    status: problems.length ? "FAIL" : "PASS",
    keyResult: `${actual.bestMatchId || "gap"} / ${actual.primaryIntent}`,
    context: { businessId: c.businessId, input: c.input, sanitizedText: gateway.sanitizedText },
    expected,
    actual,
    problems
  };
});

const out = path.join(__dirname, "..", "knowledge-base-side-by-side-results.md");
writeReadableReport(out, {
  title: "Knowledge Base ver 1.0 - Readable Side-by-side Results",
  description: "Each case compares sanitized customer text and classifier output with the approved KB match, gap, handoff, and backend-bound signals.",
  rows
});
console.log(`Wrote ${rows.length} readable rows to ${out}`);
if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
