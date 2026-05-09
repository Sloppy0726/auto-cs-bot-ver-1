"use strict";

const path = require("node:path");
const { generateDraft } = require("../src/draftEngine");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { createKnowledgeBase } = require("../../knowledge base ver 1.0/src/knowledgeBase");
const seed = require("../../knowledge base ver 1.0/seed/hkSmeSeed");
const { evaluate } = require("../../business rules ver 1.0/src/businessRules");
const { getConfig } = require("../../business rules ver 1.0/src/archetypes");
const { standardCases } = require("../test/draftEngine.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

const kb = createKnowledgeBase({ entries: seed });

function buildPipeline(c) {
  const gateway = routeMessage(c.input);
  const intent = classifyIntent(gateway);
  const knowledge = kb.lookup({ businessId: c.businessId, sanitizedText: gateway.sanitizedText, intent });
  const decision = evaluate({ gateway, intent, knowledge, businessConfig: getConfig(c.businessId) });
  return { gateway, intent, knowledge, decision };
}

async function reportAdapter(prompt, context) {
  if (context.decision.action === "handoff") {
    return { text: "【員工交接】\n意圖：" + context.intent.primaryIntent + "\n建議下一步：由同事跟進。" };
  }
  return { text: "草稿一：按已核准資料回覆，並由同事覆核後再發出。" };
}

function preview(text) {
  if (!text) return null;
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

async function main() {
  const rows = [];
  for (const c of standardCases) {
    const pipeline = buildPipeline(c);
    const result = await generateDraft(pipeline, { llmAdapter: reportAdapter });
    const expected = { action: c.expectAction, tone: c.expectTone, llmUsed: c.expectLlmUsed };
    const actual = {
      action: result.action,
      tone: result.tone,
      llmUsed: result.llmUsed,
      citations: result.citations,
      staffNote: result.staffNote,
      textPreview: preview(result.text),
      reasons: result.reasons
    };
    const problems = [];
    if (actual.action !== expected.action) problems.push(`action expected ${expected.action}, got ${actual.action}`);
    if (actual.tone !== expected.tone) problems.push(`tone expected ${expected.tone}, got ${actual.tone}`);
    if (actual.llmUsed !== expected.llmUsed) problems.push(`llmUsed expected ${expected.llmUsed}, got ${actual.llmUsed}`);
    rows.push({
      name: c.name,
      status: problems.length ? "FAIL" : "PASS",
      keyResult: `${actual.action} / llm=${actual.llmUsed}`,
      context: { businessId: c.businessId, input: c.input, decision: pipeline.decision.action, intent: pipeline.intent.primaryIntent },
      expected,
      actual,
      problems
    });
  }

  const out = path.join(__dirname, "..", "ai-draft-engine-side-by-side-results.md");
  writeReadableReport(out, {
    title: "AI Draft Engine ver 1.0 - Readable Side-by-side Results",
    description: "Each case compares the business-rules decision with the draft branch, tone, citations, and LLM usage.",
    rows
  });
  console.log(`Wrote ${rows.length} readable rows to ${out}`);
  if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
