"use strict";

const assert = require("node:assert/strict");
const { generateDraft, _internal } = require("../src/draftEngine");
const { chooseModel, DEFAULT_MODELS } = require("../src/anthropicAdapter");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { createKnowledgeBase } = require("../../knowledge base ver 1.0/src/knowledgeBase");
const seed = require("../../knowledge base ver 1.0/seed/hkSmeSeed");
const { evaluate } = require("../../business rules ver 1.0/src/businessRules");
const { getConfig } = require("../../business rules ver 1.0/src/archetypes");
const { standardCases } = require("./draftEngine.cases");

const kb = createKnowledgeBase({ entries: seed });

function buildPipeline(testCase) {
  const gateway = routeMessage(testCase.input);
  const intent = classifyIntent(gateway);
  const knowledge = kb.lookup({ businessId: testCase.businessId, sanitizedText: gateway.sanitizedText, intent });
  const decision = evaluate({ gateway, intent, knowledge, businessConfig: getConfig(testCase.businessId) });
  return { gateway, intent, knowledge, decision };
}

async function runCase(testCase) {
  const pipeline = buildPipeline(testCase);
  const calls = [];
  const adapter = testCase.expectLlmUsed
    ? async (prompt, context) => {
      calls.push({ prompt, context });
      return { text: testCase.llmText };
    }
    : async () => {
      throw new Error(`${testCase.name}: LLM adapter should not be called`);
    };

  const result = await generateDraft(pipeline, { llmAdapter: adapter });
  const label = testCase.name;

  assert.equal(pipeline.decision.action, testCase.expectAction, `${label}: upstream action mismatch`);
  assert.equal(result.action, testCase.expectAction, `${label}: draft action mismatch`);
  assert.equal(result.tone, testCase.expectTone, `${label}: tone mismatch`);
  assert.equal(result.llmUsed, testCase.expectLlmUsed, `${label}: llmUsed mismatch`);

  if (testCase.expectCitation) {
    assert.ok(result.citations.includes(testCase.expectCitation), `${label}: missing citation`);
  }
  if (testCase.expectAction === "auto_send") {
    assert.equal(result.text, pipeline.knowledge.bestMatch.answer, `${label}: auto_send must quote KB verbatim`);
  }
  if (testCase.expectAction === "clarify") {
    assert.equal(result.text, pipeline.decision.clarificationText, `${label}: clarify must return decision text verbatim`);
  }
  if (testCase.expectAction === "block") {
    assert.equal(result.text, null, `${label}: block must not generate text`);
    assert.match(result.staffNote, /Quarantine/, `${label}: block must include quarantine note`);
  }
  if (testCase.expectLlmUsed) {
    assert.equal(calls.length, 1, `${label}: expected one LLM call`);
    for (const snippet of testCase.expectPromptContains || []) {
      assert.ok(calls[0].prompt.includes(snippet) || calls[0].context.systemPrompt.includes(snippet), `${label}: prompt missing ${snippet}`);
    }
  } else {
    assert.equal(calls.length, 0, `${label}: expected no LLM call`);
  }

  assert.ok(Array.isArray(result.reasons), `${label}: reasons must be an array`);
}

async function run() {
  for (const testCase of standardCases) {
    await runCase(testCase);
  }

  const beautyPricing = buildPipeline({ businessId: "beauty_demo", input: "facial幾錢？" });
  const defaultResult = await generateDraft(beautyPricing);
  assert.equal(defaultResult.action, "staff_review", "default stub case should be staff_review");
  assert.equal(defaultResult.llmUsed, true, "default stub should mark LLM used for staff_review");
  assert.ok(defaultResult.text.startsWith("[stub] "), "default LLM adapter should return stub text");

  const promoCalls = [];
  await generateDraft({
    ...beautyPricing,
    promotions: {
      activePromotions: [{
        id: "beauty_may_small_face_trial",
        title: "小顏管理五月體驗優惠",
        summary: "小顏管理五月首次體驗 HK$480，原價 HK$880。",
        expiresOn: "2026-05-31",
        staffInstruction: "唔好承諾一定瘦面。"
      }],
      grounding: ["beauty_may_small_face_trial"]
    }
  }, {
    llmAdapter: async (prompt, context) => {
      promoCalls.push({ prompt, context });
      return { text: "草稿：五月體驗優惠可由同事覆核後回覆。" };
    }
  });
  assert.ok(promoCalls[0].prompt.includes("Active time-bound promotions"), "prompt should include promotion section");
  assert.ok(promoCalls[0].prompt.includes("小顏管理五月體驗優惠"), "prompt should include active promotion title");
  assert.equal(promoCalls[0].context.promotions.grounding[0], "beauty_may_small_face_trial", "context should carry promotion grounding");

  const beautyBooking = buildPipeline({ businessId: "beauty_demo", input: "想book今晚個facial有冇位" });
  const guarded = await generateDraft(beautyBooking, {
    llmAdapter: async () => ({ text: "已確認預約今晚8點，客人可以直接嚟。" })
  });
  assert.equal(beautyBooking.decision.action, "staff_review", "booking should route to staff review");
  assert.equal(guarded.text, null, "forbidden booking confirmation must be withheld");
  assert.ok(guarded.reasons.some((reason) => reason.includes("confirm_booking")), "guard should name confirm_booking");

  assert.equal(
    _internal.validateAgainstForbidden("會退款畀你", ["decide_refund"]).ok,
    false,
    "refund-decision surface should be blocked"
  );
  assert.equal(
    chooseModel({ decision: { action: "staff_review" }, intent: { primaryIntent: "hours_location", riskLevel: "low" } }),
    DEFAULT_MODELS.cheap,
    "simple staff_review should choose cheap model"
  );
  assert.equal(
    chooseModel({ decision: { action: "handoff" }, intent: { primaryIntent: "complaint", riskLevel: "high" } }),
    DEFAULT_MODELS.complex,
    "handoff/complaint should choose complex model"
  );

  console.log(`draftEngine: ${standardCases.length + 8} tests passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
