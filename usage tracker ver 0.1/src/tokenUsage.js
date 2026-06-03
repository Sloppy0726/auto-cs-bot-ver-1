"use strict";

const fs = require("node:fs");
const path = require("node:path");

function estimateTokens(text) {
  const value = String(text || "");
  if (!value) return 0;

  const cjk = (value.match(/[\u3400-\u9fff]/g) || []).length;
  const asciiChunks = value.match(/[A-Za-z0-9_@$./#:+-]+/g) || [];
  const asciiTokens = asciiChunks.reduce((sum, chunk) => sum + Math.max(1, Math.ceil(chunk.length / 4)), 0);
  const punctuation = (value.match(/[^\s\w\u3400-\u9fff]/g) || []).length;

  return Math.max(1, cjk + asciiTokens + Math.ceil(punctuation / 4));
}

function createTokenUsageTracker(options = {}) {
  const outputPath = options.outputPath || path.join(process.cwd(), ".local", "token-usage.jsonl");
  const nowFn = options.nowFn || (() => new Date());

  return {
    outputPath,

    recordTurn(turn = {}) {
      const record = buildUsageRecord(turn, { nowFn });
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.appendFileSync(outputPath, JSON.stringify(record) + "\n", "utf8");
      return record;
    }
  };
}

function buildUsageRecord(turn = {}, deps = {}) {
  const nowFn = deps.nowFn || (() => new Date());
  const inboundText = String(turn.inboundText || "");
  const replyText = String(turn.replyText || "");
  const actual = normalizeActualUsage(turn.actualUsage || turn.result?.draft?.tokenUsage);
  const estimated = {
    inputTokens: estimateTokens(inboundText),
    outputTokens: estimateTokens(replyText)
  };

  return {
    recordedAt: nowFn().toISOString(),
    businessId: turn.businessId || turn.result?.normalizedMessage?.businessId || null,
    channel: turn.channel || turn.result?.normalizedMessage?.channel || null,
    chatId: turn.chatId || null,
    messageId: turn.messageId || null,
    finalStatus: turn.result?.finalStatus || null,
    action: turn.result?.decision?.action || null,
    intent: turn.result?.intent?.primaryIntent || null,
    llmUsed: Boolean(turn.result?.draft?.llmUsed),
    estimated,
    actual,
    totalEstimatedTokens: estimated.inputTokens + estimated.outputTokens,
    totalActualTokens: actual ? actual.totalTokens ?? actual.inputTokens + actual.outputTokens : null
  };
}

function normalizeActualUsage(usage) {
  if (!usage) return null;
  const inputRaw = usage.inputTokens ?? usage.input_tokens ?? usage.prompt_tokens ?? usage.promptTokens;
  const outputRaw = usage.outputTokens ?? usage.output_tokens ?? usage.completion_tokens ?? usage.completionTokens;
  const totalRaw = usage.totalTokens ?? usage.total_tokens;
  const inputTokens = Number(inputRaw);
  const outputTokens = Number(outputRaw);
  const totalTokens = Number(totalRaw);
  const hasInput = inputRaw != null && Number.isFinite(inputTokens);
  const hasOutput = outputRaw != null && Number.isFinite(outputTokens);
  const hasTotal = totalRaw != null && Number.isFinite(totalTokens);
  if (!hasInput && !hasOutput && !hasTotal) return null;
  return {
    inputTokens: hasInput ? inputTokens : 0,
    outputTokens: hasOutput ? outputTokens : 0,
    ...(hasTotal ? { totalTokens } : {}),
    source: usage.source || "provider"
  };
}

module.exports = {
  createTokenUsageTracker,
  estimateTokens,
  _internal: { buildUsageRecord, normalizeActualUsage }
};
