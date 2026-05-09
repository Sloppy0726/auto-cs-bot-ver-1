"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createBusinessBackend } = require("../src/businessBackendMock");
const { standardCases } = require("../test/businessBackendMock.cases");

const backend = createBusinessBackend();

function cell(value) {
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|");
}

const lines = [
  "# Private Business Backend Mock ver 1.0 - Side-by-side results",
  "",
  "| Case | Expected | Actual |",
  "|---|---|---|"
];

for (const c of standardCases) {
  const result = backend[c.fn](c.query);
  lines.push(`| ${cell(c.name)} | ${cell({ found: c.expectFound, available: c.expectAvailable })} | ${cell(result)} |`);
}
lines.push("");

const out = path.join(__dirname, "..", "private-business-backend-mock-side-by-side-results.md");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${standardCases.length} rows to ${out}`);
