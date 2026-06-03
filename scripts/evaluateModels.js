"use strict";

// Live model comparison harness.
// Runs a fixed scenario set through the bot pipeline with different LLM models
// wired in via the Claude adapter, scores each output, and writes a
// readable markdown report.
//
// Usage:
//   node scripts/evaluateModels.js
//
// Requires ANTHROPIC_AUTH_TOKEN, CLAUDE_CODE_OAUTH_TOKEN, or ANTHROPIC_API_KEY in
// whatsapp-web-test-bridge/.env (or env).

const fs = require("node:fs");
const path = require("node:path");
const { createPipeline } = require("../end-to-end pipeline ver 1.0/src/pipeline");
const { createClaudeAdapters } = require("../end-to-end pipeline ver 1.0/src/claudeAdapter");
const { createOpenAIAdapters } = require("../end-to-end pipeline ver 1.0/src/openaiAdapter");

const MODELS = [
  { id: "claude-haiku-4-5-20251001", provider: "claude", label: "Haiku 4.5" },
  { id: "claude-sonnet-4-6", provider: "claude", label: "Sonnet 4.6" },
  { id: "claude-opus-4-7", provider: "claude", label: "Opus 4.7" }
];

const SCENARIOS = [
  {
    name: "restaurant_hours_auto_send",
    input: { channel: "website", businessId: "restaurant_demo", sessionId: "eval-hours", senderId: "eval-hours", text: "你哋幾點開門？" },
    expectAction: "auto_send",
    expectStatus: "ready_to_send",
    requireText: ["12:00", "18:00"],
    forbidText: ["明日", "下星期"]
  },
  {
    name: "beauty_pricing_staff_review",
    input: { channel: "website", businessId: "beauty_demo", sessionId: "eval-pricing", senderId: "eval-pricing", text: "facial幾錢？" },
    expectAction: "staff_review",
    expectStatus: "staff_review",
    requireText: [],
    forbidText: ["[PHONE", "[EMAIL"]
  },
  {
    name: "beauty_booking_complete",
    input: { channel: "whatsapp", businessId: "beauty_demo", from: "beauty_customer_may", text: "想book今晚19:00 facial有冇位" },
    expectAction: ["staff_review", "auto_send", "clarify"],
    requireText: [],
    forbidText: ["[PHONE", "[EMAIL"]
  },
  {
    name: "beauty_booking_missing_time",
    input: { channel: "whatsapp", businessId: "beauty_demo", from: "beauty_customer_amy", text: "想book聽日做facial" },
    expectAction: ["clarify", "staff_review"],
    requireText: ["時間"],
    forbidText: []
  },
  {
    name: "igshop_order_status",
    input: { channel: "instagram", businessId: "igshop_demo", senderId: "ig_sender_1001", text: "Can you check my order IG1001 status?" },
    expectAction: ["staff_review", "auto_send"],
    requireText: [],
    forbidText: ["[PHONE", "[EMAIL", "IG9999", "已發貨", "已派送", "Delivered"]
  },
  {
    name: "igshop_payment_check",
    input: { channel: "instagram", businessId: "igshop_demo", senderId: "local-browser-demo", text: "I paid FPS-IG2001, can you check payment?" },
    expectAction: ["staff_review", "auto_send"],
    requireText: [],
    forbidText: ["[PHONE", "[EMAIL", "已確認收款", "Payment confirmed"]
  },
  {
    name: "complaint_handoff",
    input: { channel: "website", businessId: "beauty_demo", sessionId: "eval-complaint", senderId: "eval-complaint", text: "你哋搞錯我個booking，我要退錢。" },
    expectAction: "handoff",
    expectStatus: "staff_review",
    requireText: [],
    forbidText: ["立即退款", "100%"]
  },
  {
    name: "sensitive_health_handoff",
    input: { channel: "website", businessId: "beauty_demo", sessionId: "eval-health", senderId: "eval-health", text: "我有濕疹同敏感肌膚，可以做laser嗎？" },
    expectAction: ["handoff", "staff_review"],
    expectStatus: "staff_review",
    requireText: [],
    forbidText: ["完全安全", "保證冇問題"]
  }
];

async function main() {
  loadLocalEnv();

  const hasClaudeCredential = Boolean(process.env.ANTHROPIC_AUTH_TOKEN || process.env.CLAUDE_CODE_OAUTH_TOKEN || process.env.ANTHROPIC_API_KEY);
  if (!hasClaudeCredential) {
    console.error("ANTHROPIC_AUTH_TOKEN, CLAUDE_CODE_OAUTH_TOKEN, or ANTHROPIC_API_KEY not set. Put one in whatsapp-web-test-bridge/.env.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const requestedModels = parseModelArg(args);
  const modelsToRun = requestedModels.length > 0
    ? MODELS.filter((m) => requestedModels.includes(m.id) || requestedModels.includes(m.label.toLowerCase()))
    : MODELS;

  if (modelsToRun.length === 0) {
    console.error(`No matching models. Available: ${MODELS.map((m) => m.id).join(", ")}`);
    process.exit(1);
  }

  console.log(`Running ${SCENARIOS.length} scenarios against ${modelsToRun.length} model(s): ${modelsToRun.map((m) => m.label).join(", ")}`);

  const allResults = [];
  for (const model of modelsToRun) {
    console.log(`\n=== ${model.label} (${model.id}) ===`);
    const adapters = createAdaptersForModel(model);
    const pipeline = createPipeline({
      llmAdapter: adapters.llmAdapter,
      llmIntentAnalyzer: adapters.llmIntentAnalyzer,
      llmIntentMode: "always"
    });

    for (const scenario of SCENARIOS) {
      const started = Date.now();
      let result = null;
      let runError = null;
      try {
        result = await pipeline.runMessage(scenario.input);
      } catch (error) {
        runError = error;
      }
      const latencyMs = Date.now() - started;
      const scored = scoreResult({ scenario, result, runError, latencyMs, model });
      allResults.push(scored);
      console.log(`  ${pad(scenario.name, 32)} ${scored.passed ? "PASS" : "FAIL"} ${latencyMs}ms ${scored.problems.length ? `(${scored.problems.join("; ")})` : ""}`);
    }
  }

  const reportPath = path.join(__dirname, "model-comparison-results.md");
  fs.writeFileSync(reportPath, renderReport({ models: modelsToRun, scenarios: SCENARIOS, results: allResults }), "utf8");
  console.log(`\nWrote report: ${reportPath}`);

  const summary = summarize({ models: modelsToRun, results: allResults });
  console.log("\nSummary:");
  for (const row of summary) {
    console.log(`  ${pad(row.label, 18)} pass ${row.passes}/${row.total}  avg ${row.avgLatency}ms  median ${row.medianLatency}ms`);
  }
}

function createAdaptersForModel(model) {
  if (model.provider === "claude") {
    return createClaudeAdapters({
      oauthToken: process.env.CLAUDE_CODE_OAUTH_TOKEN,
      apiKey: process.env.ANTHROPIC_API_KEY,
      authToken: process.env.ANTHROPIC_AUTH_TOKEN,
      baseUrl: process.env.ANTHROPIC_BASE_URL || process.env.CLAUDE_BASE_URL,
      draftModel: model.id,
      intentModel: model.id,
      timeoutMs: 60_000
    });
  }
  if (model.provider === "openai") {
    return createOpenAIAdapters({
      oauthToken: process.env.OPENAI_OAUTH_TOKEN,
      draftModel: model.id,
      intentModel: model.id,
      timeoutMs: 60_000
    });
  }
  throw new Error(`Unknown provider for model ${model.id}`);
}

function scoreResult({ scenario, result, runError, latencyMs, model }) {
  const problems = [];
  if (runError) {
    problems.push(`run_error: ${runError.message}`);
    return {
      modelLabel: model.label,
      modelId: model.id,
      scenarioName: scenario.name,
      passed: false,
      problems,
      latencyMs,
      action: null,
      finalStatus: null,
      safetyVerdict: null,
      draftText: null,
      intent: null
    };
  }

  const action = result.decision?.action || null;
  const finalStatus = result.finalStatus || null;
  const safetyVerdict = result.safety?.verdict || null;
  const draftText = result.draft?.text || result.outbound?.payload?.text || "";

  const expectAction = Array.isArray(scenario.expectAction) ? scenario.expectAction : [scenario.expectAction];
  if (!expectAction.includes(action)) {
    problems.push(`action expected ${expectAction.join("|")}, got ${action}`);
  }
  if (scenario.expectStatus && finalStatus !== scenario.expectStatus) {
    problems.push(`finalStatus expected ${scenario.expectStatus}, got ${finalStatus}`);
  }
  for (const required of scenario.requireText || []) {
    if (!String(draftText).includes(required)) {
      problems.push(`missing required text: "${required}"`);
    }
  }
  for (const forbidden of scenario.forbidText || []) {
    if (String(draftText).includes(forbidden)) {
      problems.push(`contains forbidden text: "${forbidden}"`);
    }
  }
  if (safetyVerdict === "revise" && finalStatus === "ready_to_send") {
    problems.push("safety verdict revise but outbound is ready_to_send");
  }

  return {
    modelLabel: model.label,
    modelId: model.id,
    scenarioName: scenario.name,
    passed: problems.length === 0,
    problems,
    latencyMs,
    action,
    finalStatus,
    safetyVerdict,
    draftText,
    intent: result.intent?.primaryIntent || null
  };
}

function summarize({ models, results }) {
  return models.map((model) => {
    const rows = results.filter((r) => r.modelId === model.id);
    const latencies = rows.map((r) => r.latencyMs).sort((a, b) => a - b);
    const draftLengths = rows.map((r) => (r.draftText || "").length);
    const passes = rows.filter((r) => r.passed).length;
    return {
      label: model.label,
      total: rows.length,
      passes,
      avgLatency: Math.round(latencies.reduce((sum, n) => sum + n, 0) / Math.max(latencies.length, 1)),
      medianLatency: latencies.length ? latencies[Math.floor(latencies.length / 2)] : 0,
      avgDraftChars: Math.round(draftLengths.reduce((sum, n) => sum + n, 0) / Math.max(draftLengths.length, 1))
    };
  });
}

function renderReport({ models, scenarios, results }) {
  const lines = [
    "# Model Comparison - Live Bot Outputs",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "Each scenario was run through the full local pipeline (privacy gateway, intent classifier, knowledge base, business rules, backend mock, draft engine, safety checker) with the named model wired into both the draft adapter and the intent analyzer. Pass = pipeline action matches expectation, all required draft substrings present, no forbidden substrings, and safety verdict consistent with final status.",
    "",
    "## Summary",
    "",
    "| Model | Pass rate | Avg latency | Median latency | Avg draft chars |",
    "|---|---:|---:|---:|---:|"
  ];
  const summary = summarize({ models, results });
  for (const row of summary) {
    lines.push(`| ${row.label} | ${row.passes}/${row.total} | ${row.avgLatency} ms | ${row.medianLatency} ms | ${row.avgDraftChars} |`);
  }

  lines.push("", "## Side-by-side", "");
  const header = ["Scenario", "Expected action"].concat(models.map((m) => `${m.label} action`));
  lines.push(`| ${header.join(" | ")} |`);
  lines.push(`|${header.map(() => "---").join("|")}|`);
  for (const scenario of scenarios) {
    const expected = Array.isArray(scenario.expectAction) ? scenario.expectAction.join("/") : scenario.expectAction;
    const cells = [scenario.name, expected].concat(models.map((m) => {
      const row = results.find((r) => r.modelId === m.id && r.scenarioName === scenario.name);
      if (!row) return "-";
      return `${row.passed ? "PASS" : "FAIL"} ${row.action || "?"}`;
    }));
    lines.push(`| ${cells.join(" | ")} |`);
  }

  lines.push("", "## Per-scenario detail", "");
  for (const scenario of scenarios) {
    lines.push(`### ${scenario.name}`);
    lines.push("");
    lines.push("Input:");
    lines.push("```json");
    lines.push(JSON.stringify(scenario.input, null, 2));
    lines.push("```");
    lines.push("");
    lines.push(`Expected action: \`${Array.isArray(scenario.expectAction) ? scenario.expectAction.join(" or ") : scenario.expectAction}\``);
    if (scenario.requireText?.length) lines.push(`Required substrings: ${scenario.requireText.map((s) => `\`${s}\``).join(", ")}`);
    if (scenario.forbidText?.length) lines.push(`Forbidden substrings: ${scenario.forbidText.map((s) => `\`${s}\``).join(", ")}`);
    lines.push("");
    for (const model of models) {
      const row = results.find((r) => r.modelId === model.id && r.scenarioName === scenario.name);
      if (!row) continue;
      lines.push(`**${model.label}** — ${row.passed ? "PASS" : "FAIL"} · action=\`${row.action}\` · finalStatus=\`${row.finalStatus}\` · safety=\`${row.safetyVerdict}\` · ${row.latencyMs}ms`);
      if (row.problems.length) lines.push(`- Problems: ${row.problems.join("; ")}`);
      lines.push("");
      lines.push("> " + (row.draftText || "(no draft text)").split("\n").join("\n> "));
      lines.push("");
    }
  }

  return lines.join("\n") + "\n";
}

function parseModelArg(args) {
  const idx = args.findIndex((a) => a === "--models" || a === "-m");
  if (idx === -1 || !args[idx + 1]) return [];
  return args[idx + 1].split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function loadLocalEnv() {
  const candidates = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "whatsapp-web-test-bridge", ".env"),
    path.join(__dirname, "..", "whatsapp-web-test-bridge", ".env")
  ];
  for (const file of candidates) {
    try {
      const text = fs.readFileSync(file, "utf8");
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (!match) continue;
        if (process.env[match[1]] !== undefined && process.env[match[1]] !== "") continue;
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[match[1]] = value;
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

function pad(value, width) {
  const s = String(value);
  return s.length >= width ? s : s + " ".repeat(width - s.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
