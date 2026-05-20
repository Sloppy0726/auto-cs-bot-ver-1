"use strict";

// End-to-end Pipeline ver 1.0
// Orchestrates the workflow from channel payload to reply/staff item.

const { normalizeInbound, buildOutboundMessage } = require("../../channel adapter ver 1.0/src/channelAdapter");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { createKnowledgeBase } = require("../../knowledge base ver 1.0/src/knowledgeBase");
const seed = require("../../knowledge base ver 1.0/seed/hkSmeSeed");
const { evaluate } = require("../../business rules ver 1.0/src/businessRules");
const { getConfig } = require("../../business rules ver 1.0/src/archetypes");
const { generateDraft } = require("../../AI draft engine ver 1.0/src/draftEngine");
const { routeModel } = require("../../model router ver 1.0/src/modelRouter");
const { checkDraft } = require("../../safety checker ver 1.0/src/safetyChecker");
const { createBusinessBackend } = require("../../private business backend mock ver 1.0/src/businessBackendMock");
const { createStaffInbox } = require("../../staff inbox ver 1.0/src/staffInbox");
const { createPromotionStore } = require("../../google drive promo sync ver 1.0/src/promoSync");
const { hkDateKey } = require("../../google drive promo sync ver 1.0/src/hkTime");
const promoSeed = require("../../google drive promo sync ver 1.0/seed/promoSeed");

function createPipeline(config = {}) {
  const kb = config.knowledgeBase || createKnowledgeBase({ entries: config.seed || seed });
  const backend = config.backend || createBusinessBackend();
  const inbox = config.staffInbox || createStaffInbox();
  const promotionStore = config.promotionStore || createPromotionStore({ entries: config.promotionEntries || promoSeed });
  const llmAdapter = config.llmAdapter;
  const nowFn = config.nowFn || (() => new Date());

  return {
    async runMessage(input) {
      return runMessage(input, { kb, backend, inbox, promotionStore, llmAdapter, nowFn, config });
    },
    inbox,
    backend,
    kb,
    promotionStore
  };
}

async function runMessage(input = {}, deps = {}) {
  const normalizedMessage = normalizeInbound(input);
  if (normalizedMessage.errors.length > 0) {
    const staffItem = deps.inbox?.submit({
      decision: { action: "handoff", businessId: normalizedMessage.businessId, escalationLabel: "channel_payload_error", reasons: normalizedMessage.errors },
      draft: { action: "handoff", text: null },
      safety: { verdict: "revise", safeToSend: false, reasons: normalizedMessage.errors },
      normalizedMessage
    }) || null;
    return result({ normalizedMessage, staffItem, finalStatus: "staff_review", errors: normalizedMessage.errors });
  }

  const gateway = routeMessage(normalizedMessage.rawText);
  const intent = await classifyIntent(gateway);
  const knowledge = deps.kb.lookup({ businessId: normalizedMessage.businessId, sanitizedText: gateway.sanitizedText, intent });
  const promotions = deps.promotionStore.lookup({
    businessId: normalizedMessage.businessId,
    sanitizedText: gateway.sanitizedText,
    intent,
    now: deps.nowFn()
  });
  const businessConfig = getConfig(normalizedMessage.businessId);
  const decision = evaluate({ gateway, intent, knowledge, businessConfig });
  const backendFacts = deps.backend.getMinimalFacts({
    businessId: normalizedMessage.businessId,
    intent,
    query: inferBackendQuery({ normalizedMessage, intent, now: deps.nowFn() })
  });
  const modelRoute = routeModel({ decision, intent, gateway });
  const draft = await generateDraft({ decision, knowledge, intent, gateway, promotions, backendFacts, modelRoute }, { llmAdapter: deps.llmAdapter, modelRoute });
  const safety = checkDraft({ draft, decision, knowledge, intent, gateway });

  let staffItem = null;
  if (!safety.safeToSend || !["auto_send", "clarify"].includes(draft.action)) {
    staffItem = deps.inbox.submit({ decision, draft, safety, normalizedMessage, customerText: gateway.sanitizedText, backendFacts, promotions });
  }

  const outbound = buildOutboundMessage({ normalizedMessage, draft, safety, staffItem });
  const finalStatus = outbound.status === "ready_to_send" ? "ready_to_send" : "staff_review";

  return result({
    normalizedMessage,
    gateway,
    intent,
    knowledge,
    promotions,
    decision,
    backendFacts,
    modelRoute,
    draft,
    safety,
    staffItem,
    outbound,
    finalStatus,
    errors: []
  });
}

function inferBackendQuery({ normalizedMessage, intent, now }) {
  const text = normalizedMessage.rawText || "";
  const query = {
    businessId: normalizedMessage.businessId,
    senderId: normalizedMessage.senderId
  };
  const date = inferRequestedDate(text, now || new Date());
  const time = inferRequestedTime(text);
  const partySize = inferPartySize(text);
  if (date) query.date = date;
  if (partySize) query.partySize = partySize;
  if (time) query.time = time;
  if (/facial|面部|護理|首次|第一次|體驗|trial/i.test(text)) query.service = "facial";
  if (/assessment|評估/i.test(text)) query.service = "assessment";
  if (/p3|小三|english|英文/i.test(text)) query.service = "p3_english";
  if (/laser|脫毛|underarm|腋下/i.test(text)) query.service = "laser";
  const orderMatch = text.match(/\b(?:IG)?\d{4,}\b/i);
  const paymentRefMatch = text.match(/\b(?:FPS|PAYME|PM|DEP)-[A-Z0-9-]+\b/i);
  if (orderMatch) query.orderId = orderMatch[0].toUpperCase().startsWith("IG") ? orderMatch[0].toUpperCase() : `IG${orderMatch[0]}`;
  if (paymentRefMatch) query.reference = paymentRefMatch[0].toUpperCase();
  const skuMatch = text.match(/\b[A-Z]{2,}-[A-Z0-9-]+\b/i);
  if (skuMatch) query.sku = skuMatch[0].toUpperCase();
  if (intent.primaryIntent === "service_info" && /tee|t-shirt/i.test(text)) query.sku = query.sku || "TEE-BLK-M";
  return query;
}

function inferRequestedDate(text, now) {
  if (/今晚|今日|today|tonight/i.test(text)) return hkDateKey(now);

  if (/聽日|明日|明天|tomorrow/i.test(text)) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() + 1);
    return hkDateKey(date);
  }

  const isoDate = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoDate) return isoDate[1];

  return null;
}

function inferRequestedTime(text) {
  const numericTime = text.match(/(?:^|[^\d])(\d{1,2})(?::(\d{2}))?\s*(?:點|時)?(?:\s*(半))?/);
  if (numericTime) {
    const hour = normalizeHour(Number(numericTime[1]), text);
    const minute = numericTime[2] || (numericTime[3] ? "30" : "00");
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  const chineseNumber = "一兩二三四五六七八九十";
  const chineseTime = text.match(new RegExp(`([${chineseNumber}])\\s*(?:點|時)(?:\\s*(半))?`));
  if (chineseTime) {
    const hour = normalizeHour(chineseNumberValue(chineseTime[1]), text);
    const minute = chineseTime[2] ? "30" : "00";
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  return null;
}

function normalizeHour(hour, text) {
  if (hour < 1 || hour > 23) return hour;
  if (hour <= 11 && /今晚|夜晚|晚上|下午|pm/i.test(text)) return hour + 12;
  return hour;
}

function chineseNumberValue(value) {
  const chineseNumbers = {
    一: 1,
    兩: 2,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10
  };
  return chineseNumbers[value] || null;
}

function inferPartySize(text) {
  const digitMatch = text.match(/(\d{1,2})\s*(?:位|人|pax|people|persons|guests?)/i);
  if (digitMatch) return Number(digitMatch[1]);

  const chineseMatch = text.match(/([一兩二三四五六七八九十])\s*(?:位|人)/);
  return chineseMatch ? chineseNumberValue(chineseMatch[1]) : null;
}

function result(payload) {
  return {
    finalStatus: payload.finalStatus,
    normalizedMessage: payload.normalizedMessage || null,
    gateway: payload.gateway || null,
    intent: payload.intent || null,
    knowledge: payload.knowledge || null,
    promotions: payload.promotions || null,
    decision: payload.decision || null,
    backendFacts: payload.backendFacts || null,
    modelRoute: payload.modelRoute || null,
    draft: payload.draft || null,
    safety: payload.safety || null,
    staffItem: payload.staffItem || null,
    outbound: payload.outbound || null,
    errors: payload.errors || []
  };
}

module.exports = {
  createPipeline,
  runMessage,
  _internal: { inferBackendQuery, inferPartySize, inferRequestedDate, inferRequestedTime }
};
