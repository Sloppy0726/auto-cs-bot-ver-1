"use strict";

const path = require("node:path");
const { createPipeline } = require("../../end-to-end pipeline ver 1.0/src/pipeline");
const { createTokenUsageTracker } = require("../../usage tracker ver 0.1/src/tokenUsage");
const { createWhatsAppWebPilot } = require("../src/whatsappWebPilot");
const { createPlaywrightWhatsAppWebAdapter } = require("../src/playwrightWhatsAppWebAdapter");

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

const pipeline = createPipeline({
  llmAdapter: async (_prompt, context) => {
    if (context?.decision?.action === "clarify") {
      return { text: context.decision.clarificationText || "請問你想了解邊方面？" };
    }
    return { text: "收到，我先幫你轉俾同事跟進。" };
  }
});

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
if (process.env.WA_SCAN_CHATS === "1") {
  console.log("[wa-pilot] scan mode enabled for visible allowlisted chats.");
}

process.on("SIGINT", async () => {
  await pilot.stop();
  process.exit(0);
});

pilot.runLoop({
  intervalMs: Number(process.env.WA_POLL_MS || 3000)
});
