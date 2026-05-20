"use strict";

const assert = require("node:assert/strict");
const { createWhatsAppWebPilot, _internal } = require("../src/whatsappWebPilot");

function test(name, fn) {
  Promise.resolve()
    .then(fn)
    .then(() => process.stdout.write("."))
    .catch((error) => {
      console.error(`\nFAIL ${name}`);
      console.error(error.stack || error.message);
      process.exitCode = 1;
    });
}

test("allowlist blocks chats not explicitly named", () => {
  const config = { allowedChatTitles: _internal.normalizeAllowedChatTitles("Tester A") };
  assert.deepEqual(_internal.isChatAllowed("Random Customer", config), {
    allowed: false,
    reason: "chat_not_in_allowlist"
  });
});

test("allowlist accepts configured chat title case-insensitively", () => {
  const config = { allowedChatTitles: _internal.normalizeAllowedChatTitles("Tester A") };
  assert.deepEqual(_internal.isChatAllowed("tester a", config), {
    allowed: true,
    reason: "allowed_chat_title"
  });
});

test("ready outbound text is extracted from WhatsApp payload", () => {
  const reply = _internal.replyTextForPipelineResult({
    outbound: {
      status: "ready_to_send",
      payload: { text: { body: "我哋11點開門。" } }
    }
  });
  assert.equal(reply, "我哋11點開門。");
});

test("held pipeline result has no reply unless held notice is enabled", () => {
  assert.equal(_internal.replyTextForPipelineResult({ outbound: { status: "held" } }), null);
  assert.equal(
    _internal.replyTextForPipelineResult({ outbound: { status: "held" } }, { sendHeldNotice: true, heldNoticeText: "收到。" }),
    "收到。"
  );
});

test("pilot sends only a new allowed ready_to_send inbound message", async () => {
  const sent = [];
  const adapter = {
    async start() {},
    async readLatestIncomingMessage() {
      return { id: "m1", chatTitle: "Tester A", text: "你哋幾點開門？", timestamp: "2026-05-19T00:00:00.000Z" };
    },
    async sendText(text) {
      sent.push(text);
    }
  };
  const pipeline = {
    async runMessage(input) {
      assert.equal(input.businessId, "beauty_demo");
      return {
        finalStatus: "ready_to_send",
        decision: { action: "auto_send" },
        outbound: { status: "ready_to_send", payload: { text: { body: "我哋11點開門。" } } }
      };
    }
  };

  const pilot = createWhatsAppWebPilot({
    adapter,
    pipeline,
    config: { allowedChatTitles: "Tester A", dryRun: false }
  });

  assert.equal((await pilot.tick()).status, "sent");
  assert.equal((await pilot.tick()).reason, "message_already_seen");
  assert.deepEqual(sent, ["我哋11點開門。"]);
});

test("pilot dry run does not send text", async () => {
  let sent = false;
  const pilot = createWhatsAppWebPilot({
    adapter: {
      async start() {},
      async readLatestIncomingMessage() {
        return { id: "m2", chatTitle: "Tester A", text: "hello" };
      },
      async sendText() {
        sent = true;
      }
    },
    pipeline: {
      async runMessage() {
        return {
          finalStatus: "ready_to_send",
          decision: { action: "auto_send" },
          outbound: { status: "ready_to_send", payload: { text: { body: "hello" } } }
        };
      }
    },
    config: { allowedChatTitles: "Tester A" }
  });

  const result = await pilot.tick();
  assert.equal(result.status, "dry_run");
  assert.equal(sent, false);
});

test("pilot records token usage per chat turn", async () => {
  const records = [];
  const pilot = createWhatsAppWebPilot({
    adapter: {
      async start() {},
      async readLatestIncomingMessage() {
        return { id: "m3", chatTitle: "Tester A", text: "詳細批幾錢？" };
      },
      async sendText() {}
    },
    pipeline: {
      async runMessage() {
        return {
          finalStatus: "ready_to_send",
          decision: { action: "auto_send" },
          intent: { primaryIntent: "pricing" },
          draft: { llmUsed: false },
          outbound: { status: "ready_to_send", payload: { text: { body: "HK$1,000 詳細批。" } } }
        };
      }
    },
    usageTracker: {
      recordTurn(record) {
        records.push(record);
        return { totalEstimatedTokens: 10 };
      }
    },
    config: { businessId: "solara_bazi", allowedChatTitles: "Tester A" }
  });

  const result = await pilot.tick();
  assert.equal(result.status, "dry_run");
  assert.equal(result.usageRecord.totalEstimatedTokens, 10);
  assert.equal(records[0].businessId, "solara_bazi");
  assert.equal(records[0].chatId, "Tester A");
  assert.equal(records[0].inboundText, "詳細批幾錢？");
  assert.equal(records[0].replyText, "HK$1,000 詳細批。");
});

test("message identity ignores volatile numeric timestamps", () => {
  const a = _internal.stableMessageId({ chatTitle: "卜仔", text: "hello", position: 4, timestamp: "9" });
  const b = _internal.stableMessageId({ chatTitle: "卜仔", text: "hello", position: 4, timestamp: "10" });
  assert.equal(a, b);
  const c = _internal.stableMessageId({ chatTitle: "卜仔", text: "hello", position: 5, timestamp: "10" });
  assert.notEqual(a, c);
});

test("scan mode opens visible allowlisted chats and skips blocked chats", async () => {
  const opened = [];
  const sent = [];
  let currentChat = null;
  const messages = {
    "Tester A": { id: "scan-a-1", chatTitle: "Tester A", text: "幾錢？" },
    "Tester B": { id: "scan-b-1", chatTitle: "Tester B", text: "點付款？" }
  };

  const pilot = createWhatsAppWebPilot({
    adapter: {
      async start() {},
      async listVisibleChats() {
        return [
          { title: "Tester A", unread: true },
          { title: "Blocked C", unread: true },
          { title: "Tester B", unread: false }
        ];
      },
      async openChat(title) {
        opened.push(title);
        currentChat = title;
      },
      async readLatestIncomingMessage() {
        return messages[currentChat] || null;
      },
      async sendText(text) {
        sent.push({ chat: currentChat, text });
      }
    },
    pipeline: {
      async runMessage(input) {
        return {
          finalStatus: "ready_to_send",
          decision: { action: "auto_send" },
          intent: { primaryIntent: input.text.includes("付款") ? "payment" : "pricing" },
          draft: { llmUsed: false },
          outbound: { status: "ready_to_send", payload: { text: { body: `${input.text} reply` } } }
        };
      }
    },
    config: {
      allowedChatTitles: "Tester A,Tester B",
      dryRun: false,
      scanChats: true
    }
  });

  const result = await pilot.tick();
  assert.equal(result.status, "scan_complete");
  assert.deepEqual(opened, ["Tester A", "Tester B"]);
  assert.deepEqual(sent, [
    { chat: "Tester A", text: "幾錢？ reply" },
    { chat: "Tester B", text: "點付款？ reply" }
  ]);

  const second = await pilot.tick();
  assert.equal(second.status, "idle");
});

test("pilot skips same chat same text inside duplicate window", async () => {
  let position = 1;
  let sentCount = 0;
  const pilot = createWhatsAppWebPilot({
    adapter: {
      async start() {},
      async readLatestIncomingMessage() {
        return { chatTitle: "Tester A", text: "可以PayMe嗎？", position: position++ };
      },
      async sendText() {
        sentCount += 1;
      }
    },
    pipeline: {
      async runMessage() {
        return {
          finalStatus: "ready_to_send",
          decision: { action: "auto_send" },
          intent: { primaryIntent: "payment" },
          draft: { llmUsed: false },
          outbound: { status: "ready_to_send", payload: { text: { body: "可以用 PayMe。" } } }
        };
      }
    },
    config: { allowedChatTitles: "Tester A", dryRun: false, duplicateTextWindowMs: 60_000 }
  });

  assert.equal((await pilot.tick()).status, "sent");
  const duplicate = await pilot.tick();
  assert.equal(duplicate.status, "idle");
  assert.equal(duplicate.reason, "recent_duplicate_text");
  assert.equal(sentCount, 1);
});

process.on("beforeExit", () => {
  if (process.exitCode) return;
  console.log("\nwhatsappWebPilot: 10 tests passed");
});
