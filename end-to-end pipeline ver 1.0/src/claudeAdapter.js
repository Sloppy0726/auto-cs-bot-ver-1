"use strict";

const { VALID_INTENTS } = require("../../intent classifier ver 1.0/src/intentClassifier");

const DEFAULT_DRAFT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_INTENT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_API_VERSION = "2023-06-01";
const DEFAULT_OAUTH_BETA = "oauth-2025-04-20";
const CLAUDE_CODE_SYSTEM_PREFIX = "You are Claude Code, Anthropic's official CLI for Claude.";

function createClaudeAdapters(config = {}) {
  const oauthToken = config.oauthToken || process.env.CLAUDE_CODE_OAUTH_TOKEN;
  const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
  const authToken = config.authToken || process.env.ANTHROPIC_AUTH_TOKEN;
  if (!oauthToken && !apiKey && !authToken) return {};

  const client = createClaudeMessagesClient({
    oauthToken,
    apiKey,
    authToken,
    baseUrl: config.baseUrl || process.env.CLAUDE_BASE_URL || process.env.ANTHROPIC_BASE_URL,
    apiVersion: config.apiVersion || process.env.CLAUDE_API_VERSION,
    betaHeader: config.betaHeader || process.env.CLAUDE_OAUTH_BETA,
    fetchImpl: config.fetchImpl,
    timeoutMs: config.timeoutMs || Number(process.env.CLAUDE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS
  });
  const draftModel = config.draftModel || process.env.CLAUDE_DRAFT_MODEL || process.env.CLAUDE_MODEL || DEFAULT_DRAFT_MODEL;
  const intentModel = config.intentModel || process.env.CLAUDE_INTENT_MODEL || process.env.CLAUDE_MODEL || DEFAULT_INTENT_MODEL;

  return {
    llmAdapter: createDraftAdapter({ client, model: draftModel }),
    llmIntentAnalyzer: createIntentAnalyzer({ client, model: intentModel })
  };
}

function createDraftAdapter({ client, model }) {
  return async function claudeDraftAdapter(prompt, context = {}) {
    const approvedContext = formatApprovedContext(context);
    const callerSystem = context.systemPrompt || "You are a careful customer-support draft writer. Follow the supplied policy exactly.";
    const userPrompt = [context.userPrompt || String(prompt || ""), approvedContext].filter(Boolean).join("\n\n");

    const content = await client.createMessage({
      model,
      temperature: 0.2,
      maxTokens: 600,
      system: buildSystemBlocks(callerSystem),
      apiKeySystem: buildSystemBlocks(callerSystem, { includeClaudeCodePrefix: false }),
      messages: [
        { role: "user", content: [{ type: "text", text: userPrompt }] }
      ]
    });
    return { text: content };
  };
}

function createIntentAnalyzer({ client, model }) {
  return async function claudeIntentAnalyzer(input = {}) {
    const callerSystem = [
      "You are an intent and confidence analyzer for a Hong Kong SME customer-support bot.",
      "The privacy gateway has already filtered the text. Do not answer the customer.",
      "Return JSON only, no markdown fences, no commentary. Choose primaryIntent from this exact list: " + VALID_INTENTS.join(", ") + ".",
      "Use confidence from 0.10 to 0.99. Be conservative when the customer is vague.",
      "Do not downgrade privacy, complaint, sensitive-health, child-data, or human-request risks from the deterministic guess.",
      "Extract only fields directly supported by the text or deterministic guess; never invent facts."
    ].join("\n");

    const userPayload = JSON.stringify({
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
    });

    const content = await client.createMessage({
      model,
      temperature: 0,
      maxTokens: 600,
      system: buildSystemBlocks(callerSystem),
      apiKeySystem: buildSystemBlocks(callerSystem, { includeClaudeCodePrefix: false }),
      messages: [
        { role: "user", content: [{ type: "text", text: userPayload }] }
      ]
    });
    return normalizeIntentJson(content);
  };
}

function buildSystemBlocks(callerSystem, options = {}) {
  const includeClaudeCodePrefix = options.includeClaudeCodePrefix !== false;
  const callerText = String(callerSystem || "").trim();
  if (!includeClaudeCodePrefix) {
    const apiKeyText = stripClaudeCodePrefix(callerText);
    return apiKeyText ? [{ type: "text", text: apiKeyText }] : [];
  }
  if (callerText.startsWith(CLAUDE_CODE_SYSTEM_PREFIX)) {
    return [{ type: "text", text: callerText }];
  }
  return [
    { type: "text", text: CLAUDE_CODE_SYSTEM_PREFIX },
    { type: "text", text: callerText }
  ];
}

function stripClaudeCodePrefix(text) {
  const value = String(text || "").trim();
  if (!value.startsWith(CLAUDE_CODE_SYSTEM_PREFIX)) return value;
  return value.slice(CLAUDE_CODE_SYSTEM_PREFIX.length).trim();
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

function createClaudeMessagesClient(config = {}) {
  const oauthToken = config.oauthToken;
  const apiKey = config.apiKey;
  const authToken = config.authToken;
  const baseUrl = normalizeClaudeBaseUrl(config.baseUrl || "https://api.anthropic.com/v1");
  const fetchImpl = config.fetchImpl || globalThis.fetch;
  const timeoutMs = config.timeoutMs || DEFAULT_TIMEOUT_MS;
  const apiVersion = config.apiVersion || DEFAULT_API_VERSION;
  const betaHeader = config.betaHeader || DEFAULT_OAUTH_BETA;
  const credentials = claudeCredentials({ oauthToken, apiKey, authToken });

  if (credentials.length === 0) throw new Error("CLAUDE_CODE_OAUTH_TOKEN, ANTHROPIC_API_KEY, or ANTHROPIC_AUTH_TOKEN is required");
  if (typeof fetchImpl !== "function") throw new Error("fetch is required for Claude adapter");

  return {
    async createMessage(request) {
      const failures = [];
      for (const credential of credentials) {
        try {
          return await sendClaudeMessage({
            credential,
            request,
            baseUrl,
            fetchImpl,
            timeoutMs,
            apiVersion,
            betaHeader
          });
        } catch (error) {
          failures.push({ credential, error });
        }
      }
      throw combinedCredentialError(failures);
    }
  };
}

function claudeCredentials({ oauthToken, apiKey, authToken } = {}) {
  const credentials = [];
  if (String(authToken || "").trim()) credentials.push({ type: "auth_token", value: authToken });
  if (String(oauthToken || "").trim()) credentials.push({ type: "oauth", value: oauthToken });
  if (String(apiKey || "").trim()) credentials.push({ type: "api_key", value: apiKey });
  return credentials;
}

function normalizeClaudeBaseUrl(baseUrl) {
  const trimmed = String(baseUrl || "https://api.anthropic.com/v1").trim().replace(/\/+$/, "");
  try {
    const parsed = new URL(trimmed);
    if (!parsed.pathname || parsed.pathname === "/") return `${trimmed}/v1`;
  } catch {
    return trimmed;
  }
  return trimmed;
}

async function sendClaudeMessage({ credential, request, baseUrl, fetchImpl, timeoutMs, apiVersion, betaHeader }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const requestBody = buildRequestBody({ request, authType: credential.type });
    const response = await fetchImpl(`${baseUrl}/messages`, {
      method: "POST",
      headers: claudeHeaders({ credential, apiVersion, betaHeader }),
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = responseBody?.error?.message || response.statusText || "Claude request failed";
      throw new Error(`claude_${response.status}: ${detail}`);
    }
    return extractText(responseBody);
  } finally {
    clearTimeout(timeout);
  }
}

function buildRequestBody({ request, authType }) {
  const system = authType === "oauth"
    ? request.system
    : request.apiKeySystem || request.system;
  const requestBody = {
    model: request.model,
    max_tokens: request.maxTokens,
    messages: request.messages
  };
  if (system && (!Array.isArray(system) || system.length > 0)) requestBody.system = system;
  if (request.temperature !== undefined && !modelDeprecatesTemperature(request.model)) {
    requestBody.temperature = request.temperature;
  }
  return requestBody;
}

function combinedCredentialError(failures) {
  if (failures.length === 1) return failures[0].error;
  const detail = failures
    .map((failure) => `${failure.credential.type} failed: ${failure.error.message}`)
    .join("; ");
  return new Error(`claude_all_credentials_failed: ${detail}`);
}

function modelDeprecatesTemperature(model) {
  const id = String(model || "").toLowerCase();
  return /claude-opus-4-7/.test(id);
}

function claudeHeaders({ oauthToken, apiKey, authToken, credential, apiVersion, betaHeader } = {}) {
  const resolvedCredential = credential || (authToken
      ? { type: "auth_token", value: authToken }
      : oauthToken
        ? { type: "oauth", value: oauthToken }
        : { type: "api_key", value: apiKey });
  const headers = {
    "content-type": "application/json",
    "anthropic-version": apiVersion || DEFAULT_API_VERSION
  };
  if (resolvedCredential.type === "api_key") {
    headers["x-api-key"] = String(resolvedCredential.value || "").trim();
    return headers;
  }
  headers.authorization = authorizationHeaderForToken(resolvedCredential.value);
  if (resolvedCredential.type === "oauth") {
    const resolvedBeta = betaHeader === undefined ? DEFAULT_OAUTH_BETA : betaHeader;
    if (resolvedBeta) headers["anthropic-beta"] = resolvedBeta;
  }
  return headers;
}

function authorizationHeaderForToken(token) {
  const trimmed = String(token || "").trim();
  if (/^Bearer\s+/i.test(trimmed)) return trimmed;
  return `Bearer ${trimmed}`;
}

function extractText(body) {
  return (body?.content || [])
    .filter((block) => block && block.type === "text")
    .map((block) => block.text || "")
    .join("");
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
  createClaudeAdapters,
  createClaudeMessagesClient,
  _internal: {
    createDraftAdapter,
    createIntentAnalyzer,
    buildSystemBlocks,
    stripClaudeCodePrefix,
    claudeCredentials,
    normalizeClaudeBaseUrl,
    sendClaudeMessage,
    buildRequestBody,
    combinedCredentialError,
    claudeHeaders,
    authorizationHeaderForToken,
    extractText,
    modelDeprecatesTemperature,
    normalizeIntentJson,
    parseJsonObject,
    formatApprovedContext,
    CLAUDE_CODE_SYSTEM_PREFIX,
    DEFAULT_DRAFT_MODEL,
    DEFAULT_INTENT_MODEL,
    DEFAULT_OAUTH_BETA
  }
};
