"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { evaluate } = require("../src/businessRules");
const { getConfig } = require("../src/archetypes");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { createKnowledgeBase } = require("../../knowledge base ver 1.0/src/knowledgeBase");
const seed = require("../../knowledge base ver 1.0/seed/hkSmeSeed");
const { standardCases } = require("../test/businessRules.cases");

const kb = createKnowledgeBase({ entries: seed });

function cell(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function expected(c) {
  return {
    action: c.expectAction || (c.expectActionOneOf || []).join(" | "),
    escalation: (c.expectEscalation || []).join(" | "),
    mustForbid: (c.expectMustForbid || []).join(", "),
    mustAllow: (c.expectMustAllow || []).join(", ")
  };
}

function actual(result) {
  return {
    action: result.action,
    escalation: result.escalationLabel || "",
    suggestedTone: result.suggestedTone,
    bestMatchId: result.staffPacket?.bestMatchId || "(auto_send)",
    forbidden: result.forbiddenCapabilities.slice(0, 6).join(", ") + (result.forbiddenCapabilities.length > 6 ? " …" : ""),
    allowed: result.allowedCapabilities.slice(0, 4).join(", ") + (result.allowedCapabilities.length > 4 ? " …" : ""),
    reasons: result.reasons.slice(0, 3).join("; ")
  };
}

const rows = standardCases.map((c) => {
  const gateway = routeMessage(c.input);
  const intent = classifyIntent(gateway);
  const knowledge = kb.lookup({ businessId: c.businessId, sanitizedText: gateway.sanitizedText, intent });
  const result = evaluate({ gateway, intent, knowledge, businessConfig: getConfig(c.businessId) });
  return { name: c.name, businessId: c.businessId, input: c.input, expected: expected(c), actual: actual(result) };
});

const lines = [
  "# Business Rules ver 1.0 — Side-by-side results",
  "",
  "Pipeline: raw text → privacy gateway → intent classifier → knowledge base → business rules.",
  "",
  "| Case | Business | Input | Expected | Actual |",
  "|---|---|---|---|---|"
];
for (const r of rows) {
  lines.push(`| ${cell(r.name)} | ${cell(r.businessId)} | ${cell(r.input)} | ${cell(r.expected)} | ${cell(r.actual)} |`);
}
lines.push("");

const out = path.join(__dirname, "..", "business-rules-side-by-side-results.md");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${rows.length} rows to ${out}`);
