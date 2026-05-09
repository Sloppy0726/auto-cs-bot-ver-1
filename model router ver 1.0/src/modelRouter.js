"use strict";

// Model Router ver 1.0
// Cost-aware deterministic model choice. No network calls.

const PROVIDERS = Object.freeze({
  NONE: "none",
  ANTHROPIC: "anthropic"
});

const MODELS = Object.freeze({
  NONE: "no_llm",
  HAIKU: "claude-haiku-4-5-20251001",
  SONNET: "claude-sonnet-4-6"
});

const NO_LLM_ACTIONS = Object.freeze(["auto_send", "clarify", "block"]);
const COMPLEX_INTENTS = Object.freeze(["complaint", "sensitive_health", "child_data", "human_request", "payment", "order_status", "reschedule"]);

function routeModel(input = {}, options = {}) {
  const decision = input.decision || {};
  const intent = input.intent || {};
  const draft = input.draft || {};
  const action = decision.action || draft.action || "unknown";
  const reasons = [];

  if (NO_LLM_ACTIONS.includes(action)) {
    return choice({
      provider: PROVIDERS.NONE,
      model: MODELS.NONE,
      shouldCallLLM: false,
      promptCache: false,
      maxTokens: 0,
      reasons: [`action ${action} is deterministic`]
    });
  }

  const force = options.forceModel || null;
  if (force) {
    return choice({
      provider: PROVIDERS.ANTHROPIC,
      model: force,
      shouldCallLLM: true,
      promptCache: true,
      maxTokens: options.maxTokens || defaultMaxTokens(action),
      reasons: ["model forced by options"]
    });
  }

  const highRisk = intent.riskLevel === "high" || intent.riskLevel === "blocked";
  const complexIntent = COMPLEX_INTENTS.includes(intent.primaryIntent);
  const handoff = action === "handoff";
  const longContext = String(input.gateway?.sanitizedText || "").length > 500;

  if (handoff || highRisk || complexIntent || longContext) {
    if (handoff) reasons.push("handoff summary needs stronger reasoning");
    if (highRisk) reasons.push(`riskLevel=${intent.riskLevel}`);
    if (complexIntent) reasons.push(`complex intent=${intent.primaryIntent}`);
    if (longContext) reasons.push("long customer context");
    return choice({
      provider: PROVIDERS.ANTHROPIC,
      model: MODELS.SONNET,
      shouldCallLLM: true,
      promptCache: true,
      maxTokens: options.maxTokens || defaultMaxTokens(action),
      reasons
    });
  }

  return choice({
    provider: PROVIDERS.ANTHROPIC,
    model: MODELS.HAIKU,
    shouldCallLLM: true,
    promptCache: true,
    maxTokens: options.maxTokens || defaultMaxTokens(action),
    reasons: [`action ${action} can use low-cost draft model`]
  });
}

function choice(payload) {
  return {
    provider: payload.provider,
    model: payload.model,
    shouldCallLLM: Boolean(payload.shouldCallLLM),
    promptCache: Boolean(payload.promptCache),
    maxTokens: payload.maxTokens,
    reasons: payload.reasons || []
  };
}

function defaultMaxTokens(action) {
  if (action === "handoff") return 500;
  if (action === "staff_review") return 700;
  return 0;
}

module.exports = {
  PROVIDERS,
  MODELS,
  routeModel,
  _internal: { COMPLEX_INTENTS, NO_LLM_ACTIONS, defaultMaxTokens }
};
