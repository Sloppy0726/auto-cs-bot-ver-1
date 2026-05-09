"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createPipeline } = require("../src/pipeline");
const { standardCases } = require("../test/pipeline.cases");

function cell(value) {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

async function main() {
  const pipeline = createPipeline({
    llmAdapter: async (prompt, context) => {
      if (context.decision.action === "handoff") return { text: "【員工交接】\n意圖：" + context.intent.primaryIntent + "\n建議下一步：由同事跟進。" };
      return { text: context.knowledge.bestMatch?.answer || "請問你想了解邊方面？" };
    }
  });
  const lines = [
    "# End-to-end Pipeline ver 1.0 - Side-by-side results",
    "",
    "Pipeline: channel -> privacy -> intent -> KB -> rules -> backend mock -> model route -> draft -> safety -> outbound/staff inbox.",
    "",
    "| Case | Expected | Actual |",
    "|---|---|---|"
  ];
  for (const c of standardCases) {
    const result = await pipeline.runMessage(c.input);
    lines.push(`| ${cell(c.name)} | ${cell({ finalStatus: c.expectStatus, action: c.expectAction })} | ${cell({ finalStatus: result.finalStatus, action: result.decision.action, safety: result.safety.verdict, outbound: result.outbound?.status, staffItemId: result.staffItem?.id || null })} |`);
  }
  lines.push("");

  const out = path.join(__dirname, "..", "end-to-end-pipeline-side-by-side-results.md");
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Wrote ${standardCases.length} rows to ${out}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
