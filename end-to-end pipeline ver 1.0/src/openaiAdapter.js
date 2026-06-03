"use strict";

const { VALID_INTENTS } = require("../../intent classifier ver 1.0/src/intentClassifier");

const DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_TIMEOUT_MS = 20_000;

function createOpenAIAdapters(config = {}) {
  const oauthToken = config.oauthToken || process.env.OPENAI_OAUTH_TOKEN;
  if (!oauthToken) return {};

  const client = createOpenAIChatClient({
    oauthToken,
    baseUrl: config.baseUrl || process.env.OPENAI_BASE_URL,
    organization: config.organization || process.env.OPENAI_ORGANIZATION,
    project: config.project || process.env.OPENAI_PROJECT,
    fetchImpl: config.fetchImpl,
    timeoutMs: config.timeoutMs || Number(process.env.OPENAI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS
  });
  const draftModel = config.draftModel || process.env.OPENAI_DRAFT_MODEL || process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const intentModel = config.intentModel || process.env.OPENAI_INTENT_MODEL || process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const onUsage = typeof config.onUsage === "function" ? config.onUsage : null;

  return {
    llmAdapter: createDraftAdapter({ client, model: draftModel, onUsage }),
    llmIntentAnalyzer: createIntentAnalyzer({ client, model: intentModel, onUsage })
  };
}

function createDraftAdapter({ client, model, onUsage }) {
  return async function openAIDraftAdapter(prompt, context = {}) {
    const approvedContext = formatApprovedContext(context);
    const result = await client.chatCompletion({
      model,
      temperature: 0.2,
      maxTokens: 450,
      messages: [
        {
          role: "system",
          content: context.systemPrompt || "You are a careful customer-support draft writer. Follow the supplied policy exactly."
        },
        {
          role: "user",
          content: [context.userPrompt || prompt, approvedContext].filter(Boolean).join("\n\n")
        }
      ]
    });
    reportUsage(onUsage, { provider: "openai", model, kind: "draft", usage: result.usage });
    return { text: result.text };
  };
}

function formatApprovedContext(context = {}) {
  const payload = {
    backendFacts: context.backendFacts || null,
    decision: context.decision
      ? {
          action: context.decision.action,
          reason: context.decision.reason,
          allowedCapabilities: context.decision.allowedCapabilities || [],
          forbiddenCapabilities: context.decision.forbiddenCapabilities || []
        }
      : null,
    intent: context.intent
      ? {
          primaryIntent: context.intent.primaryIntent,
          confidence: context.intent.confidence,
          customerGoal: context.intent.customerGoal,
          entities: context.intent.entities || {}
        }
      : null
  };
  return [
    "APPROVED_STRUCTURED_CONTEXT:",
    JSON.stringify(payload, null, 2),
    "Use backendFacts as approved factual source when present. Do not invent facts beyond approved KB, promotions, and backendFacts."
  ].join("\n");
}

function createIntentAnalyzer({ client, model, onUsage }) {
  return async function openAIIntentAnalyzer(input = {}) {
    const result = await client.chatCompletion({
      model,
      temperature: 0,
      maxTokens: 500,
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You are an intent and confidence analyzer for a Hong Kong SME customer-support bot.",
            "The privacy gateway has already filtered the text. Do not answer the customer.",
            "Return JSON only. Choose primaryIntent from this exact list: " + VALID_INTENTS.join(", ") + ".",
            "Use confidence from 0.10 to 0.99. Be conservative when the customer is vague.",
            "Do not downgrade privacy, complaint, sensitive-health, child-data, or human-request risks from the deterministic guess.",
            "Extract only fields directly supported by the text or deterministic guess; never invent facts."
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({
            sanitizedText: input.sanitizedText || "",
            privacyRoute: input.privacyRoute || "",
            privacyFindings: input.privacyFindings || [],
            riskHints: input.riskHints || [],
            deterministicGuess: input.deterministicGuess || null,
            expectedJsonShape: {
              primaryIntent: "booking",
              secondaryIntents: ["service_info"],
              confidence: 0.82,
              language: "zh-HK|en|mixed|unknown",
              customerGoal: "One short sentence.",
              entities: {
                service: "facial|laser|assessment|p3_english|null",
                requestedTime: "short text or null",
                memberId: "8 digits or null"
              },
              riskLevel: "none|low|medium|high|blocked",
              needsHumanReview: false,
              reasons: ["short reason"]
            }
          })
        }
      ]
    });
    reportUsage(onUsage, { provider: "openai", model, kind: "intent", usage: result.usage });
    return normalizeIntentJson(result.text);
  };
}

function reportUsage(onUsage, record) {
  if (!onUsage || !record) return;
  try { onUsage(record); } catch { /* never let telemetry break inference */ }
}

function extractUsage(body) {
  const usage = body?.usage;
  if (!usage || typeof usage !== "object") return null;
  return {
    input_tokens: Number(usage.prompt_tokens) || 0,
    output_tokens: Number(usage.completion_tokens) || 0,
    cache_read_input_tokens: Number(usage.prompt_tokens_details?.cached_tokens) || 0,
    cache_creation_input_tokens: 0
  };
}

function createOpenAIChatClient(config = {}) {
  const oauthToken = config.oauthToken;
  const baseUrl = String(config.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  const fetchImpl = config.fetchImpl || globalThis.fetch;
  const timeoutMs = config.timeoutMs || DEFAULT_TIMEOUT_MS;
  const organization = config.organization || null;
  const project = config.project || null;

  if (!oauthToken) throw new Error("OPENAI_OAUTH_TOKEN is required");
  if (typeof fetchImpl !== "function") throw new Error("fetch is required for OpenAI adapter");

  return {
    async chatCompletion(request) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: openAIHeaders({ oauthToken, organization, project }),
          body: JSON.stringify({
            model: request.model,
            messages: request.messages,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            response_format: request.responseFormat
          }),
          signal: controller.signal
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          const detail = body?.error?.message || response.statusText || "OpenAI request failed";
          throw new Error(`openai_${response.status}: ${detail}`);
        }
        return {
          text: body?.choices?.[0]?.message?.content || "",
          usage: extractUsage(body)
        };
      } finally {
        clearTimeout(timeout);
      }
    }
  };
}

function openAIHeaders({ oauthToken, organization, project }) {
  const headers = {
    authorization: authorizationHeaderForToken(oauthToken),
    "content-type": "application/json"
  };
  if (organization) headers["OpenAI-Organization"] = organization;
  if (project) headers["OpenAI-Project"] = project;
  return headers;
}

function authorizationHeaderForToken(token) {
  const trimmed = String(token || "").trim();
  if (/^Bearer\s+/i.test(trimmed)) return trimmed;
  return `Bearer ${trimmed}`;
}

function normalizeIntentJson(content) {
  const parsed = parseJsonObject(content);
  return {
    primaryIntent: parsed.primaryIntent,
    secondaryIntents: Array.isArray(parsed.secondaryIntents) ? parsed.secondaryIntents : [],
    confidence: Number(parsed.confidence),
    language: parsed.language,
    customerGoal: parsed.customerGoal,
    entities: parsed.entities && typeof parsed.entities === "object" ? parsed.entities : {},
    riskLevel: parsed.riskLevel,
    needsHumanReview: Boolean(parsed.needsHumanReview),
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons : ["LLM intent analyzer returned JSON"]
  };
}

function parseJsonObject(content) {
  const text = String(content || "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]);
    } catch {
      return {};
    }
  }
}

module.exports = {
  createOpenAIAdapters,
  createOpenAIChatClient,
  _internal: { createDraftAdapter, createIntentAnalyzer, normalizeIntentJson, parseJsonObject, formatApprovedContext, openAIHeaders, authorizationHeaderForToken, extractUsage, reportUsage, DEFAULT_MODEL }
};
