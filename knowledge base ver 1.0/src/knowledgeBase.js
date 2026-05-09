"use strict";

// Knowledge Base ver 1.0
// Returns approved business answers only. Never invents facts.
// Consumes the output of the intent classifier + privacy gateway and
// produces grounded matches that the AI draft engine can quote verbatim.

const DEFAULT_OPTIONS = Object.freeze({
  minScore: 0.35,
  maxMatches: 3,
  // Some intents must NEVER be answered straight from KB even if a match exists.
  // They must always go to staff (the business rules engine will enforce too,
  // but defence-in-depth is cheap).
  alwaysHandoffIntents: ["complaint", "sensitive_health", "child_data", "human_request"],
  // Intents whose answer depends on real-time backend (slot, stock, payment status).
  // KB can suggest a templated reply, but the entry must be flagged requiresBackend.
  backendBoundIntents: ["booking", "reschedule", "order_status", "payment"]
});

function createKnowledgeBase(config = {}) {
  const entriesByBusiness = indexEntries(config.entries || []);
  const options = { ...DEFAULT_OPTIONS, ...(config.options || {}) };

  return {
    lookup(input) {
      return lookup(input, entriesByBusiness, options);
    },
    listEntries(businessId) {
      return (entriesByBusiness.get(businessId) || []).map(toPublicEntry);
    },
    has(businessId) {
      return entriesByBusiness.has(businessId);
    }
  };
}

function lookup(input, entriesByBusiness, options) {
  const businessId = input?.businessId || "default";
  const intentResult = input?.intent || {};
  const sanitizedText = String(input?.sanitizedText || intentResult.sanitizedText || "");
  const primaryIntent = intentResult.primaryIntent || "general";
  const language = intentResult.language || detectLanguage(sanitizedText);

  const businessEntries = entriesByBusiness.get(businessId) || [];

  // Hard rule: certain intents must hand off to a human regardless of KB content.
  if (options.alwaysHandoffIntents.includes(primaryIntent)) {
    return buildResult({
      businessId,
      primaryIntent,
      matches: [],
      bestMatch: null,
      gap: false,
      handoff: true,
      handoffReason: `Intent "${primaryIntent}" must be handled by staff.`,
      grounding: [],
      suggestedClarification: null,
      language
    });
  }

  if (businessEntries.length === 0) {
    return buildResult({
      businessId,
      primaryIntent,
      matches: [],
      bestMatch: null,
      gap: true,
      handoff: false,
      handoffReason: null,
      grounding: [],
      suggestedClarification: clarificationFor(primaryIntent, language),
      language,
      reasons: [`No knowledge base loaded for business "${businessId}"`]
    });
  }

  const lowerText = sanitizedText.toLowerCase();
  const tokens = tokenize(sanitizedText);
  const scored = businessEntries
    .map((entry) => ({ entry, score: scoreEntry(entry, primaryIntent, tokens, lowerText) }))
    .filter((item) => item.score >= options.minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxMatches);

  const matches = scored.map(({ entry, score }) => ({
    id: entry.id,
    intent: entry.intent,
    question: entry.question,
    answer: pickAnswer(entry, language),
    score: round(score),
    tone: entry.tone || "polite_professional",
    requiresBackend: Boolean(entry.requiresBackend),
    policyRef: entry.policyRef || null,
    approved: entry.approved !== false
  }));

  const bestMatch = matches[0] || null;
  const backendBound = options.backendBoundIntents.includes(primaryIntent)
    || matches.some((match) => match.requiresBackend);

  return buildResult({
    businessId,
    primaryIntent,
    matches,
    bestMatch,
    gap: matches.length === 0,
    handoff: false,
    handoffReason: null,
    grounding: matches.map((match) => match.id),
    suggestedClarification: matches.length === 0 ? clarificationFor(primaryIntent, language) : null,
    language,
    backendBound,
    reasons: matches.length === 0
      ? [`No approved entry matched intent "${primaryIntent}" with score >= ${options.minScore}`]
      : matches.map((m) => `Matched entry ${m.id} (score ${m.score})`)
  });
}

function buildResult(payload) {
  return {
    businessId: payload.businessId,
    primaryIntent: payload.primaryIntent,
    language: payload.language,
    matches: payload.matches,
    bestMatch: payload.bestMatch,
    grounding: payload.grounding,
    gap: payload.gap,
    handoff: payload.handoff,
    handoffReason: payload.handoffReason,
    backendBound: Boolean(payload.backendBound),
    suggestedClarification: payload.suggestedClarification,
    reasons: payload.reasons || []
  };
}

function indexEntries(rawEntries) {
  const map = new Map();
  for (const raw of rawEntries) {
    const entry = normalizeEntry(raw);
    if (!entry) continue;
    if (!map.has(entry.businessId)) map.set(entry.businessId, []);
    map.get(entry.businessId).push(entry);
  }
  return map;
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.approved === false) return null; // refuse to index unapproved
  const id = raw.id || `kb_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    businessId: raw.businessId || "default",
    intent: raw.intent || "general",
    question: String(raw.question || ""),
    answers: normalizeAnswers(raw),
    keywords: (raw.keywords || []).map((k) => String(k).toLowerCase()),
    tone: raw.tone || "polite_professional",
    requiresBackend: Boolean(raw.requiresBackend),
    policyRef: raw.policyRef || null,
    approved: true
  };
}

function normalizeAnswers(raw) {
  if (raw.answers && typeof raw.answers === "object") {
    return {
      "zh-HK": raw.answers["zh-HK"] || raw.answers.zh || raw.answer || "",
      en: raw.answers.en || raw.answer || "",
      mixed: raw.answers.mixed || raw.answers["zh-HK"] || raw.answer || ""
    };
  }
  const single = String(raw.answer || "");
  return { "zh-HK": single, en: single, mixed: single };
}

function pickAnswer(entry, language) {
  return entry.answers[language] || entry.answers["zh-HK"] || entry.answers.en || "";
}

function scoreEntry(entry, primaryIntent, tokens, lowerText) {
  const intentBoost = entry.intent === primaryIntent ? 0.6 : 0;
  if (entry.keywords.length === 0) return intentBoost;

  const keywordSet = new Set(entry.keywords);
  let hits = 0;
  for (const token of tokens) {
    if (keywordSet.has(token)) hits += 1;
  }
  // Substring sweep against the original lowercased text — needed for CJK
  // keywords like "現貨" / "順豐" that never appear as standalone tokens.
  for (const kw of entry.keywords) {
    if (kw.length >= 2 && lowerText.includes(kw)) hits += 1;
  }
  const keywordScore = Math.min(0.6, hits * 0.4);
  return intentBoost + keywordScore;
}

function tokenize(text) {
  const lower = text.toLowerCase();
  const ascii = lower.match(/[a-z0-9]+/g) || [];
  const cjk = lower.match(/[一-鿿]/g) || [];
  return [...ascii, ...cjk];
}

function detectLanguage(text) {
  const hasCjk = /[一-鿿]/.test(text);
  const hasAscii = /[A-Za-z]/.test(text);
  if (hasCjk && hasAscii) return "mixed";
  if (hasCjk) return "zh-HK";
  if (hasAscii) return "en";
  return "unknown";
}

function clarificationFor(intent, language) {
  const zh = {
    pricing: "唔好意思，可以講多少少你想了解邊個服務嘅價錢？",
    booking: "請問你想預約邊個日期同時間？",
    reschedule: "請問你原本嘅預約係幾時？想改去邊個時間？",
    hours_location: "請問你想知道邊間分店嘅資料？",
    service_info: "可唔可以講多少少你想了解邊個服務？",
    aftercare: "請問係邊個療程之後嘅護理？",
    order_status: "可唔可以提供你嘅訂單號碼？",
    general: "唔好意思，可唔可以講多少少你想問咩？"
  };
  const en = {
    pricing: "Could you tell me which service you'd like the price for?",
    booking: "What date and time would you like to book?",
    reschedule: "What's the original appointment, and when would you like to move it to?",
    hours_location: "Which branch would you like info on?",
    service_info: "Could you share which service you're asking about?",
    aftercare: "Which treatment is the aftercare for?",
    order_status: "Could you share your order reference?",
    general: "Could you share a bit more about what you'd like to ask?"
  };
  const table = language === "en" ? en : zh;
  return table[intent] || table.general;
}

function toPublicEntry(entry) {
  return {
    id: entry.id,
    businessId: entry.businessId,
    intent: entry.intent,
    question: entry.question,
    tone: entry.tone,
    requiresBackend: entry.requiresBackend,
    policyRef: entry.policyRef
  };
}

function round(value) {
  return Math.round(value * 100) / 100;
}

module.exports = {
  createKnowledgeBase,
  // exported for unit tests / advanced wiring
  _internal: { tokenize, scoreEntry, normalizeEntry, detectLanguage }
};
