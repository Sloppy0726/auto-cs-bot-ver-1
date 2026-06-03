"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createPipeline } = require("../../end-to-end pipeline ver 1.0/src/pipeline");
const { createAnthropicAdapter } = require("../../AI draft engine ver 1.0/src/anthropicAdapter");
const { createCodexCliAdapter } = require("../../AI draft engine ver 1.0/src/codexCliAdapter");
const { createClaudeOAuthAdapter } = require("../../AI draft engine ver 1.0/src/claudeOAuthAdapter");
const { createTokenUsageTracker } = require("../../usage tracker ver 0.1/src/tokenUsage");
const { createWhatsAppWebPilot } = require("../src/whatsappWebPilot");
const { createPlaywrightWhatsAppWebAdapter } = require("../src/playwrightWhatsAppWebAdapter");

loadLocalEnv(path.join(process.cwd(), ".env"));

const businessId = process.env.WA_BUSINESS_ID || "beauty_demo";
const allowedChatTitles = process.env.WA_TEST_CHAT || "";
const allowAnyChat = process.env.WA_ALLOW_ANY_CHAT === "1";
const dryRun = process.env.WA_SEND !== "1";

if (!allowAnyChat && !allowedChatTitles) {
  console.error([
    "Missing WA_TEST_CHAT.",
    "Set it to the exact WhatsApp chat title you will test with.",
    "Example: WA_TEST_CHAT='May Chan' WA_SEND=1 node \"whatsapp web automation prototype ver 0.1/scripts/runWhatsAppWebPilot.js\"",
    "For a risky burner-number-only test across the currently opened chat, set WA_ALLOW_ANY_CHAT=1."
  ].join("\n"));
  process.exit(1);
}

const llmAdapter = createLlmAdapter(process.env.WA_LLM_ADAPTER || "local-stub");

function createLlmAdapter(adapterName) {
  const normalized = String(adapterName || "local-stub").trim().toLowerCase();
  if (isClaudeApiAdapter(normalized)) {
    const config = {};
    const model = process.env.CLAUDE_API_MODEL || process.env.ANTHROPIC_MODEL;
    const maxTokens = process.env.CLAUDE_API_MAX_TOKENS || process.env.ANTHROPIC_MAX_TOKENS;
    if (model) config.model = model;
    if (maxTokens) config.maxTokens = Number(maxTokens);
    return createAnthropicAdapter(config);
  }
  if (isClaudeOAuthAdapter(normalized)) {
    return createClaudeOAuthAdapter({
      model: process.env.CLAUDE_OAUTH_MODEL || "claude-opus-4-6",
      maxTokens: Number(process.env.CLAUDE_OAUTH_MAX_TOKENS || 700)
    });
  }
  if (normalized === "codex") {
    return createCodexCliAdapter({
      cwd: process.cwd(),
      model: process.env.CODEX_LLM_MODEL || "gpt-5.4-mini",
      timeoutMs: Number(process.env.CODEX_LLM_TIMEOUT_MS || 90_000)
    });
  }
  return async (_prompt, context) => {
    if (context?.decision?.action === "clarify") {
      return { text: context.decision.clarificationText || "請問你想了解邊方面？" };
    }
    return { text: "收到，我先幫你轉俾同事跟進。" };
  };
}

const pipeline = createPipeline({ llmAdapter });

const adapter = createPlaywrightWhatsAppWebAdapter({
  profileDir: process.env.WA_PROFILE_DIR || path.join(process.cwd(), ".local", "whatsapp-web-profile")
});

const usageTracker = createTokenUsageTracker({
  outputPath: process.env.TOKEN_USAGE_LOG || path.join(process.cwd(), ".local", "token-usage.jsonl")
});

const pilot = createWhatsAppWebPilot({
  adapter,
  pipeline,
  usageTracker,
  config: {
    businessId,
    allowedChatTitles,
    allowAnyChat,
    scanChats: process.env.WA_SCAN_CHATS === "1",
    scanLimit: Number(process.env.WA_SCAN_LIMIT || 20),
    scanUnreadOnly: process.env.WA_SCAN_UNREAD_ONLY === "1",
    verboseScan: process.env.WA_VERBOSE_SCAN === "1",
    dryRun,
    sendHeldNotice: process.env.WA_SEND_HELD_NOTICE === "1"
  }
});

console.log(`[wa-pilot] token usage log: ${usageTracker.outputPath}`);
console.log(`[wa-pilot] LLM adapter: ${describeLlmAdapter(process.env.WA_LLM_ADAPTER || "local-stub")}`);
if (process.env.WA_SCAN_CHATS === "1") {
  console.log("[wa-pilot] scan mode enabled for visible allowlisted chats.");
}

function describeLlmAdapter(adapterName) {
  const normalized = String(adapterName || "local-stub").trim().toLowerCase();
  if (isClaudeApiAdapter(normalized)) {
    return `claude-api (${process.env.CLAUDE_API_MODEL || process.env.ANTHROPIC_MODEL || "router-selected model"})`;
  }
  if (isClaudeOAuthAdapter(normalized)) {
    return `claude-oauth (${process.env.CLAUDE_OAUTH_MODEL || "claude-opus-4-6"})`;
  }
  if (normalized === "codex") return `codex-cli (${process.env.CODEX_LLM_MODEL || "gpt-5.4-mini"})`;
  return "local-stub";
}

function isClaudeApiAdapter(adapterName) {
  return ["claude-api", "claude_api", "anthropic", "anthropic-api", "anthropic_api"].includes(adapterName);
}

function isClaudeOAuthAdapter(adapterName) {
  return ["claude", "claude-oauth", "claude_oauth", "anthropic-oauth", "anthropic_oauth"].includes(adapterName);
}

function loadLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

process.on("SIGINT", async () => {
  await pilot.stop();
  process.exit(0);
});

pilot.runLoop({
  intervalMs: Number(process.env.WA_POLL_MS || 3000)
});
