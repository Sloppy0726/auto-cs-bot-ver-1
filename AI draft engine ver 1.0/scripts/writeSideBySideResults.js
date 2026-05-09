"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { generateDraft } = require("../src/draftEngine");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { createKnowledgeBase } = require("../../knowledge base ver 1.0/src/knowledgeBase");
const seed = require("../../knowledge base ver 1.0/seed/hkSmeSeed");
const { evaluate } = require("../../business rules ver 1.0/src/businessRules");
const { getConfig } = require("../../business rules ver 1.0/src/archetypes");
const { standardCases } = require("../test/draftEngine.cases");

const kb = createKnowledgeBase({ entries: seed });

function cell(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function preview(text) {
  if (!text) return "";
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function buildPipeline(c) {
  const gateway = routeMessage(c.input);
  const intent = classifyIntent(gateway);
  const knowledge = kb.lookup({ businessId: c.businessId, sanitizedText: gateway.sanitizedText, intent });
  const decision = evaluate({ gateway, intent, knowledge, businessConfig: getConfig(c.businessId) });
  return { gateway, intent, knowledge, decision };
}

async function reportAdapter(prompt, context) {
  if (context.decision.action === "handoff") {
    return {
      text: "【員工交接】\n意圖：" + (context.intent.primaryIntent || "general") +
        "\n客人想要：" + (context.intent.customerGoal || "需要真人跟進") +
        "\n升級原因：" + (context.decision.escalationLabel || "manual_review") +
        "\n建議下一步：由同事喺受控系統查看紀錄後回覆。"
    };
  }
  const answer = context.knowledge.bestMatch?.answer || "資料未足，建議先問客人補充。";
  return { text: `草稿一：${answer}\n草稿二：多謝你查詢，我哋會按以上已核准資料回覆，並由同事覆核後再發出。` };
}

async function main() {
  const rows = [];
  for (const c of standardCases) {
    const pipeline = buildPipeline(c);
    const result = await generateDraft(pipeline, { llmAdapter: reportAdapter });
    rows.push({
      name: c.name,
      businessId: c.businessId,
      input: c.input,
      expected: {
        action: c.expectAction,
        tone: c.expectTone,
        llmUsed: c.expectLlmUsed
      },
      actual: {
        action: result.action,
        tone: result.tone,
        llmUsed: result.llmUsed,
        citations: result.citations,
        staffNote: result.staffNote || "",
        textPreview: preview(result.text),
        reasons: result.reasons.slice(0, 3).join("; ")
      }
    });
  }

  const lines = [
    "# AI Draft Engine ver 1.0 - Side-by-side results",
    "",
    "Pipeline: raw text -> privacy gateway -> intent classifier -> knowledge base -> business rules -> AI draft engine.",
    "",
    "| Case | Business | Input | Expected | Actual |",
    "|---|---|---|---|---|"
  ];
  for (const row of rows) {
    lines.push(`| ${cell(row.name)} | ${cell(row.businessId)} | ${cell(row.input)} | ${cell(row.expected)} | ${cell(row.actual)} |`);
  }
  lines.push("");

  const out = path.join(__dirname, "..", "ai-draft-engine-side-by-side-results.md");
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Wrote ${rows.length} rows to ${out}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
