"use strict";

// Channel Adapter ver 1.0
// Normalises inbound channel payloads and builds outbound payloads.
// No network sends here; this is pure shape conversion.

const CHANNELS = Object.freeze({
  WHATSAPP: "whatsapp",
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  WEBSITE: "website"
});

const SENDABLE_ACTIONS = Object.freeze(["auto_send", "clarify"]);

function normalizeInbound(input = {}) {
  const channel = normalizeChannel(input.channel || detectChannel(input));
  const adapter = INBOUND_ADAPTERS[channel] || normalizeGeneric;
  const result = adapter(input);
  return {
    channel,
    businessId: result.businessId || input.businessId || "default",
    externalMessageId: result.externalMessageId || stableId(channel, result.senderId, result.rawText),
    senderId: result.senderId || "unknown_sender",
    rawText: String(result.rawText || ""),
    receivedAt: result.receivedAt || new Date(0).toISOString(),
    replyToken: result.replyToken || null,
    metadata: result.metadata || {},
    errors: validateInbound(result)
  };
}

function buildOutboundMessage(input = {}) {
  const { normalizedMessage = {}, draft = {}, safety = {}, staffItem = null } = input;
  const channel = normalizeChannel(normalizedMessage.channel || input.channel);
  const action = draft.action || input.action;
  const text = draft.text == null ? null : String(draft.text);

  if (!SENDABLE_ACTIONS.includes(action) || safety.safeToSend !== true || !text) {
    return {
      channel,
      status: "held",
      reason: safety.safeToSend === true ? `action ${action} is not directly sendable` : "safety checker did not mark safeToSend",
      payload: null,
      staffItemId: staffItem?.id || null
    };
  }

  return {
    channel,
    status: "ready_to_send",
    reason: "safe customer-visible reply",
    payload: outboundPayload(channel, normalizedMessage, text),
    staffItemId: null
  };
}

function normalizeGeneric(input) {
  return {
    businessId: input.businessId,
    externalMessageId: input.messageId || input.id,
    senderId: input.senderId || input.from || input.userId,
    rawText: input.text || input.body || input.message || "",
    receivedAt: input.timestamp || input.receivedAt,
    replyToken: input.replyToken || null,
    metadata: { raw: input }
  };
}

function normalizeWhatsApp(input) {
  const message = input.messages?.[0] || input.message || input;
  const text = message.text?.body || message.body || input.text || "";
  return {
    businessId: input.businessId,
    externalMessageId: message.id || input.messageId,
    senderId: message.from || input.from,
    rawText: text,
    receivedAt: timestampToIso(message.timestamp || input.timestamp),
    replyToken: message.id || input.replyToken || null,
    metadata: { phoneNumberId: input.metadata?.phone_number_id || input.phoneNumberId || null }
  };
}

function normalizeInstagram(input) {
  const messaging = input.entry?.[0]?.messaging?.[0] || input.messaging?.[0] || input;
  return {
    businessId: input.businessId,
    externalMessageId: messaging.message?.mid || input.messageId,
    senderId: messaging.sender?.id || input.senderId,
    rawText: messaging.message?.text || input.text || "",
    receivedAt: timestampToIso(messaging.timestamp || input.timestamp),
    replyToken: messaging.sender?.id || input.replyToken || null,
    metadata: { pageId: messaging.recipient?.id || input.pageId || null }
  };
}

function normalizeFacebook(input) {
  const messaging = input.entry?.[0]?.messaging?.[0] || input.messaging?.[0] || input;
  return {
    businessId: input.businessId,
    externalMessageId: messaging.message?.mid || input.messageId,
    senderId: messaging.sender?.id || input.senderId,
    rawText: messaging.message?.text || input.text || "",
    receivedAt: timestampToIso(messaging.timestamp || input.timestamp),
    replyToken: messaging.sender?.id || input.replyToken || null,
    metadata: { pageId: messaging.recipient?.id || input.pageId || null }
  };
}

function normalizeWebsite(input) {
  return {
    businessId: input.businessId,
    externalMessageId: input.messageId || input.id,
    senderId: input.sessionId || input.senderId || input.visitorId,
    rawText: input.text || input.message || "",
    receivedAt: input.receivedAt || input.timestamp,
    replyToken: input.sessionId || input.replyToken || null,
    metadata: { url: input.url || null, userAgent: input.userAgent || null }
  };
}

const INBOUND_ADAPTERS = Object.freeze({
  [CHANNELS.WHATSAPP]: normalizeWhatsApp,
  [CHANNELS.INSTAGRAM]: normalizeInstagram,
  [CHANNELS.FACEBOOK]: normalizeFacebook,
  [CHANNELS.WEBSITE]: normalizeWebsite
});

function outboundPayload(channel, message, text) {
  if (channel === CHANNELS.WHATSAPP) {
    return {
      messaging_product: "whatsapp",
      to: message.senderId,
      type: "text",
      text: { body: text }
    };
  }
  if (channel === CHANNELS.INSTAGRAM || channel === CHANNELS.FACEBOOK) {
    return {
      recipient: { id: message.senderId },
      message: { text }
    };
  }
  if (channel === CHANNELS.WEBSITE) {
    return {
      sessionId: message.replyToken || message.senderId,
      text
    };
  }
  return { to: message.senderId, text };
}

function validateInbound(result) {
  const errors = [];
  if (!result.rawText) errors.push("missing_text");
  if (!result.senderId) errors.push("missing_sender");
  return errors;
}

function normalizeChannel(channel) {
  const raw = String(channel || "website").toLowerCase();
  if (["wa", "whatsapp"].includes(raw)) return CHANNELS.WHATSAPP;
  if (["ig", "instagram"].includes(raw)) return CHANNELS.INSTAGRAM;
  if (["fb", "facebook", "messenger"].includes(raw)) return CHANNELS.FACEBOOK;
  if (["web", "website", "site"].includes(raw)) return CHANNELS.WEBSITE;
  return raw;
}

function detectChannel(input) {
  if (input.messages || input.metadata?.phone_number_id) return CHANNELS.WHATSAPP;
  if (input.object === "instagram") return CHANNELS.INSTAGRAM;
  if (input.object === "page") return CHANNELS.FACEBOOK;
  return CHANNELS.WEBSITE;
}

function timestampToIso(value) {
  if (!value) return undefined;
  const number = Number(value);
  if (Number.isFinite(number)) {
    const ms = number < 10000000000 ? number * 1000 : number;
    return new Date(ms).toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function stableId(channel, senderId, text) {
  const source = `${channel}:${senderId || ""}:${text || ""}`;
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return `${channel}_${Math.abs(hash)}`;
}

module.exports = {
  CHANNELS,
  SENDABLE_ACTIONS,
  normalizeInbound,
  buildOutboundMessage,
  _internal: { normalizeChannel, timestampToIso, stableId, outboundPayload }
};
