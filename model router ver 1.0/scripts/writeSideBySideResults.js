"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { routeModel } = require("../src/modelRouter");
const { standardCases } = require("../test/modelRouter.cases");

function cell(value) {
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|");
}

const lines = [
  "# Model Router ver 1.0 - Side-by-side results",
  "",
  "| Case | Expected | Actual |",
  "|---|---|---|"
];

for (const c of standardCases) {
  const result = routeModel({ decision: c.decision, intent: c.intent, gateway: c.gateway || {} });
  lines.push(`| ${cell(c.name)} | ${cell({ model: c.expectModel, shouldCallLLM: c.expectShouldCall })} | ${cell(result)} |`);
}
lines.push("");

const out = path.join(__dirname, "..", "model-router-side-by-side-results.md");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${standardCases.length} rows to ${out}`);
