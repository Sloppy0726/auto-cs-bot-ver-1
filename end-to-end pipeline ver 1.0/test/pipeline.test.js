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
      if (result.staffItem) {
        assert.equal(result.staffItem.promotions.bestPromotion.id, c.expectPromotion, `${c.name}: staff item promotion mismatch`);
      }
    }
    if (c.expectPackage) {
      assert.equal(result.packageFacts.bestPackage?.id, c.expectPackage, `${c.name}: package mismatch`);
    }
    if (c.expectReplyIncludes) {
      const replyText = result.outbound?.payload?.text?.body || result.outbound?.payload?.text || result.draft?.text || "";
      for (const snippet of c.expectReplyIncludes) {
        assert.ok(replyText.includes(snippet), `${c.name}: reply missing ${snippet}`);
      }
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
  assert.equal(_internal.inferRequestedTime("2點"), null, "bare 2 o'clock should not be forced to 02:00");
  assert.deepEqual(
    _internal.inferRequestedTimeDetails("2點"),
    { time: null, ambiguous: true, hour: 2, text: "2點" },
    "bare 2 o'clock should be marked ambiguous"
  );
  assert.equal(_internal.inferRequestedTime("下午2點"), "14:00", "explicit afternoon 2 o'clock should resolve to 14:00");

  const paymentQuery = _internal.inferBackendQuery({
    normalizedMessage: { businessId: "igshop_demo", rawText: "I paid FPS-IG2001 for order IG2001", senderId: "local-browser-demo" },
    intent: { primaryIntent: "payment" },
    now: new Date("2026-05-20T08:00:00.000Z")
  });
  assert.equal(paymentQuery.reference, "FPS-IG2001", "payment reference should be extracted");
  assert.equal(paymentQuery.orderId, "IG2001", "order reference should still be extracted");
  const memberQuery = _internal.inferBackendQuery({
    normalizedMessage: { businessId: "beauty_demo", rawText: "會員號碼 00000010 想查積分", senderId: "member-test" },
    intent: { primaryIntent: "membership" },
    now: new Date("2026-05-20T08:00:00.000Z")
  });
  assert.equal(memberQuery.memberId, "00000010", "8-digit member ID should be extracted");
  assert.equal(
    _internal.intentClassifierOptions({ llmIntentAnalyzer: async () => ({}) }).confidenceThreshold,
    0.99,
    "LLM intent analyzer should default to always-on mode"
  );
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

  const incompleteBookingQuery = _internal.inferBackendQuery({
    normalizedMessage: { businessId: "beauty_demo", rawText: "想book facial", senderId: "beauty_incomplete" },
    intent: { primaryIntent: "booking" },
    now: new Date("2026-05-20T08:00:00.000Z")
  });
  const incompleteBookingClarification = _internal.requiredClarificationForBackendIntent({
    normalizedMessage: { businessId: "beauty_demo", rawText: "想book facial" },
    intent: { primaryIntent: "booking" },
    query: incompleteBookingQuery,
    language: "mixed"
  });
  assert.ok(incompleteBookingClarification.text.includes("日期"), "incomplete beauty booking should ask for date");
  assert.ok(incompleteBookingClarification.text.includes("時間"), "incomplete beauty booking should ask for time");

  const ambiguousTimeQuery = _internal.inferBackendQuery({
    normalizedMessage: { businessId: "beauty_demo", rawText: "想book facial 5月25號 2點", senderId: "ambiguous-time" },
    intent: { primaryIntent: "booking" },
    now: new Date("2026-05-20T08:00:00.000Z")
  });
  assert.equal(ambiguousTimeQuery.date, "2026-05-25", "ambiguous time query should still carry date");
  assert.equal(ambiguousTimeQuery.service, "facial", "ambiguous time query should still carry service");
  assert.equal(ambiguousTimeQuery.time, undefined, "ambiguous time query should not send 02:00 to backend");
  assert.equal(ambiguousTimeQuery.ambiguousTime, true, "ambiguous time query should be marked for clarification");
  const ambiguousTimeClarification = _internal.requiredClarificationForBackendIntent({
    normalizedMessage: { businessId: "beauty_demo", rawText: "想book facial 5月25號 2點" },
    intent: { primaryIntent: "booking" },
    query: ambiguousTimeQuery,
    language: "zh-HK"
  });
  assert.ok(ambiguousTimeClarification.text.includes("上午"), "ambiguous time clarification should ask morning/afternoon/evening");
  assert.ok(ambiguousTimeClarification.text.includes("下午"), "ambiguous time clarification should ask morning/afternoon/evening");

  const slotPipeline = createPipeline({
    nowFn: () => new Date("2026-05-20T08:00:00.000Z"),
    llmAdapter: async (prompt, context) => ({ text: context.knowledge.bestMatch?.answer || "請問你想了解邊方面？" })
  });
  const incompleteBooking = await slotPipeline.runMessage({
    channel: "whatsapp",
    businessId: "beauty_demo",
    from: "incomplete-booking-test",
    text: "想book facial"
  });
  assert.equal(incompleteBooking.intent.primaryIntent, "booking", "incomplete booking should still classify as booking");
  assert.equal(incompleteBooking.decision.action, "clarify", "incomplete booking should clarify before staff review");
  assert.equal(incompleteBooking.finalStatus, "ready_to_send", "booking clarification should be sendable");
  assert.equal(incompleteBooking.staffItem, null, "booking clarification should not create handoff staff item");

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
  const ambiguousTimeBooking = await slotPipeline.runMessage({
    channel: "whatsapp",
    businessId: "beauty_demo",
    from: "ambiguous-time-pipeline",
    text: "想book facial 5月25號 2點"
  });
  assert.equal(ambiguousTimeBooking.decision.action, "clarify", "ambiguous booking time should clarify");
  assert.equal(ambiguousTimeBooking.finalStatus, "ready_to_send", "ambiguous booking time clarification should be sendable");
  assert.ok(ambiguousTimeBooking.draft.text.includes("上午"), "ambiguous booking reply should ask which part of day");
  assert.equal(ambiguousTimeBooking.staffItem, null, "ambiguous booking time should not create handoff staff item");
  assert.ok(adapterCalls.some((context) => context.modelRoute?.model), "draft adapter context should include modelRoute");

  assert.ok(pipeline.inbox.list().length >= 2, "staff inbox should collect held items");
  console.log(`pipeline: ${standardCases.length + 34} tests passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
