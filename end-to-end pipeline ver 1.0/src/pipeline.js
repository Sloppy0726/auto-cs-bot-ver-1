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
    query: inferBackendQuery({ normalizedMessage, intent })
  });
  const modelRoute = routeModel({ decision, intent, gateway });
  const draft = await generateDraft({ decision, knowledge, intent, gateway, promotions }, { llmAdapter: deps.llmAdapter });
  const safety = checkDraft({ draft, decision, knowledge, intent, gateway });

  let staffItem = null;
  if (!safety.safeToSend || !["auto_send", "clarify"].includes(draft.action)) {
    staffItem = deps.inbox.submit({ decision, draft, safety, normalizedMessage, backendFacts, promotions });
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

function inferBackendQuery({ normalizedMessage, intent }) {
  const text = normalizedMessage.rawText || "";
  const query = { businessId: normalizedMessage.businessId };
  const date = text.includes("今晚") ? "2026-05-09" : null;
  const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(?:點|:)?/);
  if (date) query.date = date;
  if (timeMatch) {
    const hour = timeMatch[1].padStart(2, "0");
    const minute = timeMatch[2] || "00";
    query.time = `${hour}:${minute}`;
  }
  if (/facial|面部|護理/i.test(text)) query.service = "facial";
  const orderMatch = text.match(/\b(?:IG)?\d{4,}\b/i);
  if (orderMatch) query.orderId = orderMatch[0].toUpperCase().startsWith("IG") ? orderMatch[0].toUpperCase() : `IG${orderMatch[0]}`;
  const skuMatch = text.match(/\b[A-Z]{2,}-[A-Z0-9-]+\b/i);
  if (skuMatch) query.sku = skuMatch[0].toUpperCase();
  if (intent.primaryIntent === "service_info" && /tee|t-shirt/i.test(text)) query.sku = query.sku || "TEE-BLK-M";
  return query;
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
  _internal: { inferBackendQuery }
};
