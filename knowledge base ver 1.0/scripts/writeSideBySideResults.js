"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createKnowledgeBase } = require("../src/knowledgeBase");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { standardCases, seed } = require("../test/knowledgeBase.cases");

const kb = createKnowledgeBase({ entries: seed });

function cell(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function expectedSummary(testCase) {
  return {
    bestMatchId: testCase.expectBestMatchId === null
      ? "(none)"
      : testCase.expectBestMatchId || (testCase.expectBestMatchAnyOf || []).join(" | "),
    gap: testCase.expectGap ?? "",
    handoff: testCase.expectHandoff ?? false,
    backendBound: testCase.expectBackendBound ?? ""
  };
}

function actualSummary(result) {
  return {
    bestMatchId: result.bestMatch ? result.bestMatch.id : "(none)",
    bestMatchScore: result.bestMatch ? result.bestMatch.score : "",
    primaryIntent: result.primaryIntent,
    language: result.language,
    gap: result.gap,
    handoff: result.handoff,
    backendBound: result.backendBound,
    grounding: result.grounding,
    answerPreview: result.bestMatch ? result.bestMatch.answer.slice(0, 80) : "",
    suggestedClarification: result.suggestedClarification || ""
  };
}

const rows = standardCases.map((c) => {
  const gateway = routeMessage(c.input);
  const intent = classifyIntent(gateway);
  const result = kb.lookup({ businessId: c.businessId, sanitizedText: gateway.sanitizedText, intent });
  return {
    name: c.name,
    input: c.input,
    businessId: c.businessId,
    expected: expectedSummary(c),
    actual: actualSummary(result)
  };
});

const lines = [];
lines.push("# Knowledge Base ver 1.0 — Side-by-side results");
lines.push("");
lines.push("Pipeline: raw text → privacy gateway → intent classifier → knowledge base.");
lines.push("");
lines.push("| Case | Business | Input | Expected | Actual |");
lines.push("|---|---|---|---|---|");
for (const row of rows) {
  lines.push(`| ${cell(row.name)} | ${cell(row.businessId)} | ${cell(row.input)} | ${cell(row.expected)} | ${cell(row.actual)} |`);
}
lines.push("");

const outPath = path.join(__dirname, "..", "knowledge-base-side-by-side-results.md");
fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${rows.length} rows to ${outPath}`);
