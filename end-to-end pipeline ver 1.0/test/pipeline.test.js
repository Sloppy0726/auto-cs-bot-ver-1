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
  assert.equal(_internal.inferPartySize("Can I book for 4 people?"), 4, "English headcount should be extracted");
  assert.equal(_internal.inferPartySize("今晚兩位"), 2, "Chinese headcount should be extracted");
  assert.equal(_internal.inferRequestedTime("今晚六點"), "18:00", "Chinese evening time should be extracted");
  assert.equal(_internal.inferRequestedTime("下午六點半"), "18:30", "Chinese half-hour time should be extracted");

  const paymentQuery = _internal.inferBackendQuery({
    normalizedMessage: { businessId: "igshop_demo", rawText: "I paid FPS-IG2001 for order IG2001", senderId: "local-browser-demo" },
    intent: { primaryIntent: "payment" },
    now: new Date("2026-05-20T08:00:00.000Z")
  });
  assert.equal(paymentQuery.reference, "FPS-IG2001", "payment reference should be extracted");
  assert.equal(paymentQuery.orderId, "IG2001", "order reference should still be extracted");
  const chineseBookingQuery = _internal.inferBackendQuery({
    normalizedMessage: { businessId: "beauty_demo", rawText: "想book facial 今晚六點", senderId: "beauty_customer_may" },
    intent: { primaryIntent: "booking" },
    now: new Date("2026-05-20T08:00:00.000Z")
  });
  assert.equal(chineseBookingQuery.date, "2026-05-20", "Chinese booking should carry HK date");
  assert.equal(chineseBookingQuery.time, "18:00", "Chinese booking should carry HK time");
  assert.equal(chineseBookingQuery.service, "facial", "Chinese booking should carry service");
  const firstTrialSlotsQuery = _internal.inferBackendQuery({
    normalizedMessage: { businessId: "beauty_demo", rawText: "預約首次 你聽日有咩時間", senderId: "beauty_customer_may" },
    intent: { primaryIntent: "booking" },
    now: new Date("2026-05-20T08:00:00.000Z")
  });
  assert.equal(firstTrialSlotsQuery.date, "2026-05-21", "first-trial booking should infer tomorrow");
  assert.equal(firstTrialSlotsQuery.service, "facial", "first-trial booking should infer facial");
  assert.equal(firstTrialSlotsQuery.time, undefined, "slot-list booking should not invent an exact time");

  const slotPipeline = createPipeline({
    nowFn: () => new Date("2026-05-20T08:00:00.000Z"),
    llmAdapter: async (prompt, context) => ({ text: context.knowledge.bestMatch?.answer || "請問你想了解邊方面？" })
  });
  const firstTrialSlots = await slotPipeline.runMessage({
    channel: "whatsapp",
    businessId: "beauty_demo",
    from: "slot-list-test",
    text: "預約首次 你聽日有咩時間"
  });
  assert.equal(firstTrialSlots.intent.primaryIntent, "booking", "available-times wording should stay booking intent");
  assert.equal(firstTrialSlots.backendFacts.found, true, "available-times booking should find backend slot facts");
  assert.deepEqual(
    firstTrialSlots.backendFacts.facts.find((fact) => fact.key === "availableSlots")?.value,
    ["13:00", "18:30"],
    "available-times booking should list matching slots"
  );
  assert.ok(adapterCalls.some((context) => context.modelRoute?.model), "draft adapter context should include modelRoute");

  assert.ok(pipeline.inbox.list().length >= 2, "staff inbox should collect held items");
  console.log(`pipeline: ${standardCases.length + 14} tests passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
