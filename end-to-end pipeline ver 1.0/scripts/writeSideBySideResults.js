"use strict";

const path = require("node:path");
const { createPipeline } = require("../src/pipeline");
const { standardCases } = require("../test/pipeline.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

async function main() {
  const pipeline = createPipeline({
    nowFn: () => new Date("2026-05-09T00:00:00.000Z"),
    llmAdapter: async (prompt, context) => {
      if (context.decision.action === "handoff") return { text: "【員工交接】\n意圖：" + context.intent.primaryIntent + "\n建議下一步：由同事跟進。" };
      const promo = context.promotions?.bestPromotion;
      if (promo) return { text: `${context.knowledge.bestMatch?.answer || ""}\n優惠：${promo.summary}`.trim() };
      return { text: context.knowledge.bestMatch?.answer || "請問你想了解邊方面？" };
    }
  });

  const rows = [];
  for (const c of standardCases) {
    const result = await pipeline.runMessage(c.input);
    const expected = { finalStatus: c.expectStatus, action: c.expectAction, promotion: c.expectPromotion || "" };
    const actual = {
      finalStatus: result.finalStatus,
      action: result.decision?.action || null,
      route: result.gateway?.route || null,
      intent: result.intent?.primaryIntent || null,
      kb: result.knowledge?.bestMatch?.id || null,
      safety: result.safety?.verdict || null,
      safeToSend: result.safety?.safeToSend || false,
      promotion: result.promotions?.bestPromotion?.id || "",
      outbound: result.outbound?.status || null,
      staffItemId: result.staffItem?.id || null
    };
    const problems = [];
    if (actual.finalStatus !== expected.finalStatus) problems.push(`finalStatus expected ${expected.finalStatus}, got ${actual.finalStatus}`);
    if (actual.action !== expected.action) problems.push(`action expected ${expected.action}, got ${actual.action}`);
    if (expected.promotion && actual.promotion !== expected.promotion) problems.push(`promotion expected ${expected.promotion}, got ${actual.promotion}`);
    rows.push({
      name: c.name,
      status: problems.length ? "FAIL" : "PASS",
      keyResult: `${actual.finalStatus} / ${actual.action}`,
      context: { input: c.input },
      expected,
      actual,
      problems
    });
  }

  const out = path.join(__dirname, "..", "end-to-end-pipeline-side-by-side-results.md");
  writeReadableReport(out, {
    title: "End-to-end Pipeline ver 1.0 - Readable Side-by-side Results",
    description: "Each case compares the expected final route with every major pipeline checkpoint: privacy, intent, KB, rules, safety, outbound, and staff inbox.",
    rows
  });
  console.log(`Wrote ${rows.length} readable rows to ${out}`);
  if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
