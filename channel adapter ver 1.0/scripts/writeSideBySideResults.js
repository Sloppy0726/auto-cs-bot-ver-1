"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { normalizeInbound } = require("../src/channelAdapter");
const { standardCases } = require("../test/channelAdapter.cases");

function cell(value) {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|");
}

const lines = [
  "# Channel Adapter ver 1.0 - Side-by-side results",
  "",
  "| Case | Expected | Actual |",
  "|---|---|---|"
];
for (const c of standardCases) {
  const result = normalizeInbound(c.input);
  lines.push(`| ${cell(c.name)} | ${cell({ channel: c.expectChannel, text: c.expectText, sender: c.expectSender })} | ${cell({ channel: result.channel, text: result.rawText, sender: result.senderId, errors: result.errors })} |`);
}
lines.push("");

const out = path.join(__dirname, "..", "channel-adapter-side-by-side-results.md");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${standardCases.length} rows to ${out}`);
