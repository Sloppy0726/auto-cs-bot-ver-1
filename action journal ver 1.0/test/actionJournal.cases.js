"use strict";

// Synthetic pipeline results used to exercise the journal. Each mirrors the shape
// runMessage() returns. No raw PII — gateway text is already sanitized.

const autoSendTurn = {
  result: {
    normalizedMessage: { businessId: "restaurant_demo", channel: "whatsapp", senderId: "wa:85291234567" },
    gateway: { route: "allow", sanitizedText: "你哋幾點開門？", shouldCallLLM: false, businessId: "restaurant_demo" },
    intent: { primaryIntent: "hours_location", language: "zh-HK", confidence: 0.97 },
    knowledge: { businessId: "restaurant_demo", matched: true, grounding: ["kb:hours_location:restaurant_demo"], language: "zh-HK", answer: "我哋每日 11:00–22:00 營業。", score: 0.9 },
    packageFacts: null,
    decision: { action: "auto_send", escalationLabel: null, reason: "approved hours answer", forbiddenCapabilities: [], grounding: ["kb:hours_location:restaurant_demo"] },
    modelRoute: { provider: "none", model: "no_llm", shouldCallLLM: false },
    draft: { action: "auto_send", text: "我哋每日 11:00–22:00 營業。" },
    safety: { verdict: "pass", safeToSend: true },
    finalStatus: "ready_to_send"
  }
};

const handoffTurn = {
  result: {
    normalizedMessage: { businessId: "beauty_demo", channel: "instagram", senderId: "ig:angrycustomer" },
    gateway: { route: "review", sanitizedText: "我要退錢 你哋搞錯咗", shouldCallLLM: true, businessId: "beauty_demo" },
    intent: { primaryIntent: "complaint", language: "zh-HK", confidence: 0.88 },
    knowledge: { businessId: "beauty_demo", matched: false, grounding: [], language: "zh-HK", answer: null, score: 0 },
    packageFacts: null,
    decision: { action: "handoff", escalationLabel: "refund_request", reason: "refund decisions need staff", forbiddenCapabilities: ["decide_refund"], grounding: [] },
    modelRoute: { provider: "anthropic", model: "claude-sonnet-4-6", shouldCallLLM: true },
    draft: { action: "handoff", text: "（員工備註）客人要求退款，需要人手跟進。" },
    safety: { verdict: "pass", safeToSend: false },
    finalStatus: "staff_review"
  }
};

const clarifyTurn = {
  result: {
    normalizedMessage: { businessId: "edu_demo", channel: "website", senderId: "web:session-7" },
    gateway: { route: "allow", sanitizedText: "想book P3英文評估", shouldCallLLM: false, businessId: "edu_demo" },
    intent: { primaryIntent: "booking", language: "zh-HK", confidence: 0.91 },
    knowledge: { businessId: "edu_demo", matched: true, grounding: ["kb:booking:edu_demo"], language: "zh-HK", answer: null, score: 0.5 },
    packageFacts: null,
    requiredClarification: { reason: "booking missing date,time", text: "可以呀，請問你想預約邊個日期、時間？" },
    decision: { action: "clarify", escalationLabel: null, reason: "booking missing date,time", forbiddenCapabilities: ["confirm_booking"], grounding: ["kb:booking:edu_demo"] },
    modelRoute: { provider: "none", model: "no_llm", shouldCallLLM: false },
    draft: { action: "clarify", text: "可以呀，請問你想預約邊個日期、時間？" },
    safety: { verdict: "pass", safeToSend: true },
    finalStatus: "ready_to_send"
  }
};

const orderedTurns = [autoSendTurn, clarifyTurn, handoffTurn];

module.exports = { autoSendTurn, handoffTurn, clarifyTurn, orderedTurns };
