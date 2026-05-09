"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createStaffInbox } = require("../src/staffInbox");
const { standardCases } = require("../test/staffInbox.cases");

const inbox = createStaffInbox();

function cell(value) {
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|");
}

const lines = [
  "# Staff Inbox ver 1.0 - Side-by-side results",
  "",
  "| Case | Expected | Actual |",
  "|---|---|---|"
];

for (const c of standardCases) {
  const item = inbox.submit(c);
  lines.push(`| ${cell(c.name)} | ${cell({ priority: c.expectPriority, status: "open" })} | ${cell({ id: item.id, priority: item.priority, status: item.status, action: item.action })} |`);
}
lines.push("");

const out = path.join(__dirname, "..", "staff-inbox-side-by-side-results.md");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${standardCases.length} rows to ${out}`);
