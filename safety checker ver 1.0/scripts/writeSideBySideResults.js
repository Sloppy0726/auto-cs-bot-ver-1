"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { checkDraft } = require("../src/safetyChecker");
const { standardCases } = require("../test/safetyChecker.cases");

function cell(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function inputFor(c) {
  return {
    draft: { action: c.action, text: c.text, citations: c.citations || [] },
    decision: { action: c.action, forbiddenCapabilities: c.forbidden || [], grounding: c.grounding || [], clarificationText: c.clarificationText || null },
    knowledge: { bestMatch: c.answer ? { id: "x", answer: c.answer } : null, grounding: c.grounding || [] },
    intent: { riskLevel: c.intentRisk || "none" },
    gateway: { route: c.gatewayRoute || "send_to_llm" }
  };
}

const lines = [
  "# Safety Checker ver 1.0 - Side-by-side results",
  "",
  "| Case | Expected | Actual |",
  "|---|---|---|"
];

for (const c of standardCases) {
  const result = checkDraft(inputFor(c));
  lines.push(`| ${cell(c.name)} | ${cell({ verdict: c.expectVerdict, safeToSend: c.expectSafe })} | ${cell({ verdict: result.verdict, safeToSend: result.safeToSend, violations: result.violations.map((v) => v.code), reasons: result.reasons })} |`);
}
lines.push("");

const out = path.join(__dirname, "..", "safety-checker-side-by-side-results.md");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${standardCases.length} rows to ${out}`);
