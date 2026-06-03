"use strict";

const assert = require("node:assert/strict");
const { estimateTokens, _internal } = require("../src/tokenUsage");

assert.equal(estimateTokens(""), 0);
assert.ok(estimateTokens("你哋幾點開門？") >= 6, "Traditional Chinese text should have a non-zero estimate");
assert.ok(estimateTokens("Solara Bazi pricing is HK$100") >= 7, "English price text should be estimated");

const record = _internal.buildUsageRecord({
  businessId: "solara_bazi",
  channel: "whatsapp",
  chatId: "Tester A",
  messageId: "m1",
  inboundText: "詳細批幾錢？",
  replyText: "HK$1,000 詳細批。",
  result: {
    finalStatus: "ready_to_send",
    decision: { action: "auto_send" },
    intent: { primaryIntent: "pricing" },
    draft: { llmUsed: false }
  }
}, {
  nowFn: () => new Date("2026-05-19T00:00:00.000Z")
});

assert.equal(record.recordedAt, "2026-05-19T00:00:00.000Z");
assert.equal(record.businessId, "solara_bazi");
assert.equal(record.chatId, "Tester A");
assert.equal(record.action, "auto_send");
assert.equal(record.intent, "pricing");
assert.equal(record.llmUsed, false);
assert.equal(record.totalEstimatedTokens, record.estimated.inputTokens + record.estimated.outputTokens);

const actual = _internal.normalizeActualUsage({ input_tokens: 12, output_tokens: 8 });
assert.deepEqual(actual, { inputTokens: 12, outputTokens: 8, source: "provider" });

const codexActual = _internal.normalizeActualUsage({ totalTokens: 1234, source: "codex_cli" });
assert.deepEqual(codexActual, { inputTokens: 0, outputTokens: 0, totalTokens: 1234, source: "codex_cli" });

const codexRecord = _internal.buildUsageRecord({
  inboundText: "我已經PayMe咗，收唔收到？",
  replyText: "",
  result: {
    draft: { llmUsed: true, tokenUsage: { totalTokens: 1234, source: "codex_cli" } }
  }
});
assert.equal(codexRecord.totalActualTokens, 1234, "Codex CLI total-only usage should remain visible");

console.log("tokenUsage: 13 tests passed");
