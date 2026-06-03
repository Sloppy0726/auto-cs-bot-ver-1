"use strict";

const crypto = require("node:crypto");

function createWhatsAppWebPilot(options = {}) {
  const {
    adapter,
    pipeline,
    usageTracker = null,
    logger = console,
    config = {}
  } = options;

  if (!adapter) throw new Error("adapter_required");
  if (!pipeline?.runMessage) throw new Error("pipeline_required");

  const state = {
    started: false,
    seenMessageIds: new Set(),
    recentTextByChat: new Map()
  };

  const pilotConfig = {
    businessId: config.businessId || "beauty_demo",
    dryRun: config.dryRun !== false,
    allowAnyChat: config.allowAnyChat === true,
    allowedChatTitleList: normalizeAllowedChatTitleList(config.allowedChatTitles),
    allowedChatTitles: normalizeAllowedChatTitles(config.allowedChatTitles),
    scanChats: config.scanChats === true,
    scanLimit: Number(config.scanLimit || 20),
    scanUnreadOnly: config.scanUnreadOnly === true,
    verboseScan: config.verboseScan === true,
    duplicateTextWindowMs: Number(config.duplicateTextWindowMs || 60_000),
    sendHeldNotice: config.sendHeldNotice === true,
    heldNoticeText: config.heldNoticeText || "收到，我先幫你轉俾同事跟進。",
    channel: "whatsapp"
  };

  return {
    async start() {
      if (state.started) return;
      if (adapter.start) await adapter.start();
      state.started = true;
    },

    async tick() {
      if (!state.started) await this.start();

      if (pilotConfig.scanChats && adapter.listVisibleChats && adapter.openChat) {
        return scanVisibleChats({ adapter, pilotConfig, pipeline, usageTracker, logger, state });
      }

      const inbound = await adapter.readLatestIncomingMessage();
      return processInbound({ inbound, adapter, pilotConfig, pipeline, usageTracker, logger, state });
    },

    async runLoop(options = {}) {
      const intervalMs = Number(options.intervalMs || 3000);
      await this.start();
      logger.log?.(`[wa-pilot] running every ${intervalMs}ms. Press Ctrl+C to stop.`);

      while (true) {
        try {
          await this.tick();
        } catch (error) {
          logger.error?.(`[wa-pilot] ${error.stack || error.message}`);
        }
        await delay(intervalMs);
      }
    },

    async stop() {
      if (adapter.stop) await adapter.stop();
      state.started = false;
    },

    _state: state,
    _config: pilotConfig
  };
}

async function scanVisibleChats({ adapter, pilotConfig, pipeline, usageTracker, logger, state }) {
  if (!pilotConfig.allowAnyChat && pilotConfig.allowedChatTitleList.length > 0) {
    return scanKnownChats({ adapter, pilotConfig, pipeline, usageTracker, logger, state });
  }

  const visibleChats = await adapter.listVisibleChats({ limit: pilotConfig.scanLimit });
  const candidates = visibleChats.filter((chat) => {
    const allowed = isChatAllowed(chat.title, pilotConfig).allowed;
    if (!allowed) return false;
    if (pilotConfig.scanUnreadOnly && !chat.unread) return false;
    return true;
  });

  if (pilotConfig.verboseScan) {
    logger.log?.(`[wa-pilot] scan visible=${visibleChats.length} candidates=${candidates.map((chat) => chat.title).join(", ") || "(none)"}`);
  }

  if (candidates.length === 0) return { status: "idle", reason: "no_allowed_visible_chats" };

  const results = [];
  for (const chat of candidates) {
    try {
      await adapter.openChat(chat.title);
      const inbound = await adapter.readLatestIncomingMessage();
      const result = await processInbound({ inbound, adapter, pilotConfig, pipeline, usageTracker, logger, state });
      results.push({ chatTitle: chat.title, unread: chat.unread, ...result });
    } catch (error) {
      logger.warn?.(`[wa-pilot] scan failed for "${chat.title}": ${error.message}`);
      results.push({ chatTitle: chat.title, status: "error", reason: error.message });
    }
  }

  const active = results.filter((item) => item.status !== "idle");
  return {
    status: active.length > 0 ? "scan_complete" : "idle",
    reason: active.length > 0 ? "processed_visible_chats" : "no_new_messages",
    scanned: candidates.length,
    results
  };
}

async function scanKnownChats({ adapter, pilotConfig, pipeline, usageTracker, logger, state }) {
  const candidates = pilotConfig.allowedChatTitleList;

  if (pilotConfig.verboseScan) {
    logger.log?.(`[wa-pilot] scan known=${candidates.join(", ") || "(none)"}`);
  }

  if (candidates.length === 0) return { status: "idle", reason: "no_allowed_known_chats" };

  const results = [];
  for (const title of candidates) {
    try {
      await adapter.openChat(title);
      const inbound = await adapter.readLatestIncomingMessage();
      const result = await processInbound({ inbound, adapter, pilotConfig, pipeline, usageTracker, logger, state });
      if (pilotConfig.verboseScan) {
        logger.log?.(`[wa-pilot] ${title}: ${result.status}${result.reason ? ` (${result.reason})` : ""}`);
        if (result.reason === "no_inbound_message" && adapter.debugSnapshot) {
          const snapshot = await adapter.debugSnapshot();
          logger.log?.(`[wa-pilot] ${title} snapshot: ${JSON.stringify(snapshot)}`);
        }
      }
      results.push({ chatTitle: title, ...result });
    } catch (error) {
      logger.warn?.(`[wa-pilot] known-chat scan failed for "${title}": ${error.message}`);
      results.push({ chatTitle: title, status: "error", reason: error.message });
    }
  }

  const active = results.filter((item) => item.status !== "idle");
  return {
    status: active.length > 0 ? "scan_complete" : "idle",
    reason: active.length > 0 ? "processed_known_chats" : "no_new_messages",
    scanned: candidates.length,
    results
  };
}

async function processInbound({ inbound, adapter, pilotConfig, pipeline, usageTracker, logger, state }) {
  if (!inbound?.text) return { status: "idle", reason: "no_inbound_message" };

  const messageId = stableMessageId(inbound);
  if (state.seenMessageIds.has(messageId)) {
    return { status: "idle", reason: "message_already_seen", messageId };
  }

  const duplicateTextKey = recentTextKey(inbound);
  const lastSeenAt = state.recentTextByChat.get(duplicateTextKey);
  const now = Date.now();
  if (lastSeenAt && now - lastSeenAt < pilotConfig.duplicateTextWindowMs) {
    state.seenMessageIds.add(messageId);
    return { status: "idle", reason: "recent_duplicate_text", messageId };
  }

  state.seenMessageIds.add(messageId);
  state.recentTextByChat.set(duplicateTextKey, now);

  const chatAllowed = isChatAllowed(inbound.chatTitle, pilotConfig);
  if (!chatAllowed.allowed) {
    logger.warn?.(`[wa-pilot] blocked chat "${inbound.chatTitle || "unknown"}": ${chatAllowed.reason}`);
    return { status: "blocked", reason: chatAllowed.reason, messageId };
  }

  const result = await pipeline.runMessage({
    channel: pilotConfig.channel,
    businessId: pilotConfig.businessId,
    from: inbound.senderId || inbound.chatTitle || "whatsapp_web_sender",
    text: inbound.text,
    timestamp: inbound.timestamp || new Date().toISOString(),
    messageId
  });

  const reply = replyTextForPipelineResult(result, pilotConfig);
  const usageRecord = usageTracker?.recordTurn({
    businessId: pilotConfig.businessId,
    channel: pilotConfig.channel,
    chatId: inbound.chatTitle || inbound.senderId || null,
    messageId,
    inboundText: inbound.text,
    replyText: reply || "",
    result
  }) || null;

  if (!reply) {
    return {
      status: "held",
      reason: "pipeline_not_ready_to_send",
      messageId,
      finalStatus: result.finalStatus,
      action: result.decision?.action || null,
      usageRecord
    };
  }

  if (pilotConfig.dryRun) {
    logger.log?.(`[wa-pilot] dry run reply to "${inbound.chatTitle || "current chat"}": ${reply}`);
    return {
      status: "dry_run",
      messageId,
      reply,
      finalStatus: result.finalStatus,
      action: result.decision?.action || null,
      usageRecord
    };
  }

  await adapter.sendText(reply);
  logger.log?.(`[wa-pilot] sent reply to "${inbound.chatTitle || "current chat"}"`);
  return {
    status: "sent",
    messageId,
    reply,
    finalStatus: result.finalStatus,
    action: result.decision?.action || null,
    usageRecord
  };
}

function replyTextForPipelineResult(result, config = {}) {
  const text = result?.outbound?.payload?.text?.body
    || result?.outbound?.payload?.text
    || null;

  if (result?.outbound?.status === "ready_to_send" && text) return String(text);
  if (config.sendHeldNotice) return String(config.heldNoticeText || "收到，我先幫你轉俾同事跟進。");
  return null;
}

function isChatAllowed(chatTitle, config = {}) {
  if (config.allowAnyChat) return { allowed: true, reason: "allow_any_chat" };
  const title = normalizeTitle(chatTitle);
  if (!title) return { allowed: false, reason: "missing_chat_title" };
  if (config.allowedChatTitles?.has(title)) return { allowed: true, reason: "allowed_chat_title" };
  return { allowed: false, reason: "chat_not_in_allowlist" };
}

function normalizeAllowedChatTitles(value) {
  return new Set(normalizeAllowedChatTitleList(value).map(normalizeTitle));
}

function normalizeAllowedChatTitleList(value) {
  if (!value) return [];
  const items = Array.isArray(value) ? value : String(value).split(",");
  return items.map((item) => String(item || "").trim()).filter(Boolean);
}

function normalizeTitle(value) {
  return String(value || "").trim().toLowerCase();
}

function stableMessageId(message = {}) {
  if (message.id) return String(message.id);
  const source = [
    message.chatTitle || "",
    message.senderId || "",
    message.text || "",
    Number.isFinite(Number(message.position)) ? String(message.position) : "",
    normalizeTimestampForIdentity(message.timestamp)
  ].join("|");
  return crypto.createHash("sha256").update(source).digest("hex").slice(0, 24);
}

function normalizeTimestampForIdentity(value) {
  const text = String(value || "").trim();
  if (!text || /^\d+$/.test(text)) return "";
  return text;
}

function recentTextKey(message = {}) {
  return [
    normalizeTitle(message.chatTitle || message.senderId || ""),
    normalizeTextForIdentity(message.text)
  ].join("|");
}

function normalizeTextForIdentity(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  createWhatsAppWebPilot,
  _internal: {
    isChatAllowed,
    normalizeAllowedChatTitleList,
    normalizeAllowedChatTitles,
    normalizeTitle,
    normalizeTextForIdentity,
    normalizeTimestampForIdentity,
    recentTextKey,
    replyTextForPipelineResult,
    stableMessageId
  }
};
