"use strict";

const path = require("node:path");
const { createPipeline } = require("../../end-to-end pipeline ver 1.0/src/pipeline");
const { DEFAULT_MODEL, createCodexCliAdapter } = require("../src/codexCliAdapter");

const repoRoot = path.resolve(__dirname, "..", "..");
const businessId = process.env.LLM_SMOKE_BUSINESS_ID || process.env.WA_BUSINESS_ID || "beauty_demo";
const text = process.env.LLM_SMOKE_TEXT || "facial幾錢？";
const model = process.env.CODEX_LLM_MODEL || DEFAULT_MODEL;

async function run() {
  const pipeline = createPipeline({
    llmAdapter: createCodexCliAdapter({
      cwd: repoRoot,
      model,
      timeoutMs: Number(process.env.CODEX_LLM_TIMEOUT_MS || 90_000)
    })
  });

  const result = await pipeline.runMessage({
    channel: "whatsapp",
    businessId,
    from: "llm_smoke_sender",
    text,
    timestamp: new Date().toISOString(),
    messageId: `llm-smoke-${Date.now()}`
  });

  const summary = {
    businessId,
    inputText: text,
    finalStatus: result.finalStatus,
    action: result.decision?.action || null,
    intent: result.intent?.primaryIntent || null,
    llmUsed: Boolean(result.draft?.llmUsed),
    model,
    safety: result.safety?.verdict || null,
    safeToSend: Boolean(result.safety?.safeToSend),
    tokenUsage: result.draft?.tokenUsage || null,
    draftText: result.draft?.text || null,
    staffNote: result.draft?.staffNote || null
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!summary.llmUsed) {
    throw new Error("Smoke test did not enter the LLM path. Use a staff-review or handoff message.");
  }
  if (!summary.draftText) {
    throw new Error("LLM path ran but produced no draft text.");
  }
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
