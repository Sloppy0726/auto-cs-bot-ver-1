"use strict";

const assert = require("node:assert/strict");
const { createPipeline, _internal } = require("../src/pipeline");
const { standardCases } = require("./pipeline.cases");

async function run() {
  const adapterCalls = [];
  const pipeline = createPipeline({
    nowFn: () => new Date("2026-05-09T00:00:00.000Z"),
    llmAdapter: async (prompt, context) => {
      adapterCalls.push(context);
      if (context.decision.action === "handoff") {
        return { text: "【員工交接】\n意圖：" + context.intent.primaryIntent + "\n建議下一步：由同事跟進。" };
      }
      const promo = context.promotions?.bestPromotion;
      if (promo) return { text: `${context.knowledge.bestMatch?.answer || ""}\n優惠：${promo.summary}`.trim() };
      return { text: context.knowledge.bestMatch?.answer || "請問你想了解邊方面？" };
    }
  });

  for (const c of standardCases) {
    const result = await pipeline.runMessage(c.input);
    assert.equal(result.finalStatus, c.expectStatus, `${c.name}: finalStatus mismatch`);
    assert.equal(result.decision.action, c.expectAction, `${c.name}: action mismatch`);
    if (c.expectStatus === "ready_to_send") {
      assert.equal(result.outbound.status, "ready_to_send", `${c.name}: outbound mismatch`);
      assert.ok(result.safety.safeToSend, `${c.name}: safety should allow send`);
    } else {
      assert.ok(result.staffItem, `${c.name}: staff item missing`);
    }
    if (c.expectPromotion) {
      assert.equal(result.promotions.bestPromotion?.id, c.expectPromotion, `${c.name}: promotion mismatch`);
      assert.equal(result.staffItem.promotions.bestPromotion.id, c.expectPromotion, `${c.name}: staff item promotion mismatch`);
    }
  }

  const tonightQuery = _internal.inferBackendQuery({
    normalizedMessage: { businessId: "beauty_demo", rawText: "想book今晚個facial有冇位" },
    intent: { primaryIntent: "booking" },
    now: new Date("2026-06-02T16:30:00.000Z")
  });
  assert.equal(tonightQuery.date, "2026-06-03", "tonight should resolve using Hong Kong date from injected clock");
  assert.ok(adapterCalls.some((context) => context.modelRoute?.model), "draft adapter context should include modelRoute");

  assert.ok(pipeline.inbox.list().length >= 2, "staff inbox should collect held items");
  console.log(`pipeline: ${standardCases.length + 3} tests passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
