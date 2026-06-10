"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { normalizeInbound } = require("../../channel adapter ver 1.0/src/channelAdapter");
const { filterForLLM } = require("../../privacy filter ver 1.0/src/privacyFilter");

// Redact PII before it is written to the on-disk history. Stitching only needs
// dates/times/services/booking tokens, which the filter leaves intact, so this
// keeps context quality while not persisting raw HKIDs, cards, or phones.
function sanitizeForStorage(text) {
  if (!text) return text;
  return filterForLLM(text).sanitizedText;
}

const DEFAULT_MAX_MESSAGES = 30;
const DEFAULT_LOOKBACK_MESSAGES = 8;

function createConversationContextStore(options = {}) {
  const maxMessages = options.maxMessages || DEFAULT_MAX_MESSAGES;
  const lookbackMessages = options.lookbackMessages || DEFAULT_LOOKBACK_MESSAGES;
  const filePath = options.filePath || null;
  const histories = filePath ? loadFromDisk(filePath) : new Map();

  function persist() {
    if (!filePath) return;
    saveToDisk(filePath, histories);
  }

  return {
    enrichPayload(input = {}) {
      const normalized = normalizeInbound(input);
      const key = conversationKey(normalized);
      const history = histories.get(key) || [];
      const stitched = stitchText({
        text: normalized.rawText,
        history,
        lookbackMessages
      });
      const payload = stitched.changed ? applyTextToPayload(input, normalized.channel, stitched.text) : input;

      return {
        key,
        payload,
        originalText: normalized.rawText,
        stitchedText: stitched.text,
        changed: stitched.changed,
        reason: stitched.reason,
        commit() {
          const nextHistory = history.concat({
            incoming: true,
            text: sanitizeForStorage(normalized.rawText),
            stitchedText: stitched.changed ? sanitizeForStorage(stitched.text) : null,
            at: normalized.receivedAt,
            messageId: normalized.externalMessageId
          }).slice(-maxMessages);
          histories.set(key, nextHistory);
          persist();
        }
      };
    },
    getHistory(key) {
      return (histories.get(key) || []).slice();
    },
    clear() {
      histories.clear();
      persist();
    },
    _filePath: filePath
  };
}

function loadFromDisk(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const out = new Map();
    if (parsed && typeof parsed.histories === "object") {
      for (const [key, value] of Object.entries(parsed.histories)) {
        if (Array.isArray(value)) out.set(key, value);
      }
    }
    return out;
  } catch (error) {
    return new Map();
  }
}

function saveToDisk(filePath, histories) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify({ histories: Object.fromEntries(histories) }, null, 2));
  fs.renameSync(tmp, filePath);
}

function stitchText(input = {}) {
  const text = String(input.text || "");
  const history = Array.isArray(input.history) ? input.history : [];
  const lookbackMessages = input.lookbackMessages || DEFAULT_LOOKBACK_MESSAGES;
  const recent = history.slice(-lookbackMessages);

  const membershipFollowup = stitchMembershipFollowup(text, recent);
  if (membershipFollowup.changed) return membershipFollowup;
  if (!looksLikeBookingFollowup(text)) return unchanged(text);
  if (hasBookingIntent(text) && inferServiceFromText(text) && hasDateToken(text)) return unchanged(text);

  const lastIncoming = latestPreviousIncoming(recent, () => true);
  if (inferServiceFromText(text) && !hasDateOrTime(text) && isGreeting(messageText(lastIncoming))) {
    return unchanged(text);
  }

  const previousBooking = latestPreviousIncoming(recent, (message) => {
    return hasBookingIntent(messageText(message)) || askedForBookingDetails(messageText(message));
  });
  if (!previousBooking) return unchanged(text);

  const service = inferServiceFromText(text) || inferRecentService(recent);
  const date = hasDateToken(text) ? null : inferRecentDateToken(recent);
  const time = hasTimeToken(text) ? null : inferRecentTimeToken(recent);
  const intentPrefix = hasBookingIntent(text) ? null : "想book";
  const stitched = [intentPrefix, date, time, service, text].filter(Boolean).join(" ");

  if (stitched === text) return unchanged(text);
  return {
    text: stitched,
    changed: true,
    reason: "booking_followup_context"
  };
}

function conversationKey(normalized = {}) {
  return [
    normalized.businessId || "default",
    normalized.channel || "unknown",
    normalized.senderId || "unknown_sender"
  ].join(":");
}

function applyTextToPayload(input, channel, text) {
  const next = { ...input, text };

  if (channel === "whatsapp") {
    if (Array.isArray(input.messages) && input.messages[0]) {
      next.messages = input.messages.slice();
      next.messages[0] = replaceMessageText(next.messages[0], text);
    }
    if (input.message && typeof input.message === "object") {
      next.message = replaceMessageText(input.message, text);
    }
  }

  if (channel === "instagram" || channel === "facebook") {
    if (Array.isArray(input.messaging) && input.messaging[0]?.message) {
      next.messaging = input.messaging.slice();
      next.messaging[0] = {
        ...next.messaging[0],
        message: { ...next.messaging[0].message, text }
      };
    }
    if (Array.isArray(input.entry) && input.entry[0]?.messaging?.[0]?.message) {
      next.entry = cloneJson(input.entry);
      next.entry[0].messaging[0].message.text = text;
    }
  }

  return next;
}

function replaceMessageText(message, text) {
  const next = { ...message, body: text };
  if (message.text && typeof message.text === "object") {
    next.text = { ...message.text, body: text };
  }
  return next;
}

function latestPreviousIncoming(history, predicate) {
  return history.slice().reverse().find((message) => {
    return message?.incoming !== false && predicate(message);
  });
}

function latestPreviousMessage(history, predicate) {
  return history.slice().reverse().find((message) => predicate(message));
}

function stitchMembershipFollowup(text, history) {
  if (!looksLikeMemberIdFollowup(text)) return unchanged(text);

  const previousMembership = latestPreviousMessage(history, (message) => {
    const value = messageText(message);
    return hasMembershipIntent(value) || askedForMembershipDetails(value);
  });
  if (!previousMembership) return unchanged(text);

  return {
    text: `會員號碼 ${text.trim()}`,
    changed: true,
    reason: "membership_followup_context"
  };
}

function looksLikeMemberIdFollowup(text) {
  return /^\s*\d{8}\s*$/.test(text || "");
}

function hasMembershipIntent(text) {
  return /會員|membership|member\s*id|會員號碼|會員編號|積分|\bpoints?\b|free treatment|免費療程|換療程|redeem/i.test(text || "");
}

function askedForMembershipDetails(text) {
  return /8\s*-?\s*digit|8位|八位|會員編號|會員號碼|member\s*id|membership\s*id|積分|points|免費療程|free treatment/i.test(text || "");
}

function looksLikeBookingFollowup(text) {
  return (hasDateOrTime(text) || inferServiceFromText(text)) && !hasPricingIntent(text) && !hasGeneralQuestionIntent(text);
}

function hasBookingIntent(text) {
  return /book|booking|預約|約|有冇位|有無位|有咩時間|咩時間|有咩時段|咩時段|appointment|slot|reserve|schedule/i.test(text || "");
}

function askedForBookingDetails(text) {
  return /日期|時間|療程項目|預約|空位|留位/i.test(text || "");
}

function hasDateOrTime(text) {
  return /今晚|聽日|明日|明天|今日|today|tonight|tomorrow|\b20\d{2}-\d{2}-\d{2}\b|\b\d{1,2}(:\d{2})?\b|點/i.test(text || "");
}

function hasTimeToken(text) {
  return /\b\d{1,2}:\d{2}\b|(?:^|[^\d])\d{1,2}\s*(?:點|時)(?:\s*半)?|[一兩二三四五六七八九十]\s*(?:點|時)(?:\s*半)?/i.test(text || "");
}

function hasDateToken(text) {
  return /今晚|聽日|明日|明天|今日|today|tonight|tomorrow|\b20\d{2}-\d{2}-\d{2}\b/i.test(text || "");
}

function hasPricingIntent(text) {
  return /幾錢|幾多錢|價錢|價目|收費|price|pricing|how much|plans?|package|套票/i.test(text || "");
}

function hasGeneralQuestionIntent(text) {
  return /幾點開|幾點收|營業|開門|收工|hours|open|close/i.test(text || "");
}

function isGreeting(text) {
  return /^(hi|hello|hey|你好|哈囉|halo|喂|早晨|午安|晚安)\s*[!.。！?？]*$/i.test(String(text || "").trim());
}

function inferRecentService(history) {
  return inferServiceFromText(history.map((message) => messageText(message)).join(" "));
}

function inferServiceFromText(text) {
  if (/facial|面部|護理|首次|第一次|體驗|trial/i.test(text || "")) return "facial";
  if (/laser|脫毛|underarm|腋下/i.test(text || "")) return "laser";
  if (/assessment|評估/i.test(text || "")) return "assessment";
  return null;
}

function inferRecentDateToken(history) {
  const recentText = history.map((message) => messageText(message)).join(" ");
  if (/今晚|tonight/i.test(recentText)) return "今晚";
  if (/聽日|明日|明天|tomorrow/i.test(recentText)) return "聽日";
  if (/今日|today/i.test(recentText)) return "今日";
  const isoDate = recentText.match(/\b20\d{2}-\d{2}-\d{2}\b/);
  return isoDate ? isoDate[0] : null;
}

function inferRecentTimeToken(history) {
  const recentText = history
    .filter((message) => message?.incoming !== false)
    .map((message) => messageText(message))
    .join(" ");
  const numericClock = recentText.match(/\b\d{1,2}:\d{2}\b/);
  if (numericClock) return numericClock[0];
  const numericChineseUnit = recentText.match(/(?:^|[^\d])(\d{1,2}\s*(?:點|時)(?:\s*半)?)/);
  if (numericChineseUnit) return numericChineseUnit[1].replace(/\s+/g, "");
  const chineseTime = recentText.match(/([一兩二三四五六七八九十]\s*(?:點|時)(?:\s*半)?)/);
  return chineseTime ? chineseTime[1].replace(/\s+/g, "") : null;
}

function messageText(message) {
  return String(message?.stitchedText || message?.text || "");
}

function unchanged(text) {
  return { text, changed: false, reason: null };
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  createConversationContextStore,
  stitchText,
  _internal: {
    conversationKey,
    applyTextToPayload,
    inferServiceFromText,
    inferRecentDateToken,
    inferRecentTimeToken,
    hasBookingIntent,
    looksLikeBookingFollowup,
    stitchMembershipFollowup,
    looksLikeMemberIdFollowup,
    hasMembershipIntent,
    isGreeting
  }
};
