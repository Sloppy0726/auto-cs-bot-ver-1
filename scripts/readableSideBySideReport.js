"use strict";

const fs = require("node:fs");

function renderReadableReport(config) {
  const rows = config.rows || [];
  const passCount = rows.filter((row) => row.status === "PASS").length;
  const lines = [
    `# ${config.title}`,
    "",
    config.description || "",
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Total rows: ${rows.length}`,
    `Passed: ${passCount}`,
    `Failed: ${rows.length - passCount}`,
    "",
    "## Quick Index",
    "",
    "| # | Status | Case | Key result |",
    "|---:|---|---|---|"
  ];

  rows.forEach((row, index) => {
    lines.push(`| ${index + 1} | ${row.status} | ${escapeTable(row.name)} | ${escapeTable(row.keyResult || "")} |`);
  });

  lines.push("");
  lines.push("## Details");
  lines.push("");

  rows.forEach((row, index) => {
    lines.push(`### ${String(index + 1).padStart(3, "0")} ${row.status} - ${row.name}`);
    if (row.context) {
      lines.push("");
      lines.push("Context:");
      lines.push("```json");
      lines.push(JSON.stringify(row.context, null, 2));
      lines.push("```");
    }
    lines.push("");
    lines.push("Expected:");
    lines.push("```json");
    lines.push(JSON.stringify(row.expected || {}, null, 2));
    lines.push("```");
    lines.push("");
    lines.push("Actual:");
    lines.push("```json");
    lines.push(JSON.stringify(row.actual || {}, null, 2));
    lines.push("```");
    if (row.problems && row.problems.length > 0) {
      lines.push("");
      lines.push("Notes:");
      for (const problem of row.problems) lines.push(`- ${problem}`);
    }
    lines.push("");
  });

  return `${lines.join("\n")}\n`;
}

function writeReadableReport(filePath, config) {
  fs.writeFileSync(filePath, renderReadableReport(config), "utf8");
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

module.exports = {
  renderReadableReport,
  writeReadableReport
};
