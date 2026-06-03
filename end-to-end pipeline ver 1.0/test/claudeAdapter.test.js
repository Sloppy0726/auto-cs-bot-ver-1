"use strict";

const assert = require("node:assert/strict");
const { createClaudeAdapters, _internal } = require("../src/claudeAdapter");

async function run() {
  const originalClaudeToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
  const originalAnthropicAuthToken = process.env.ANTHROPIC_AUTH_TOKEN;
  const originalAnthropicBaseUrl = process.env.ANTHROPIC_BASE_URL;
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
  delete process.env.ANTHROPIC_BASE_URL;

  try {
    await runWithCleanClaudeEnv();
  } finally {
    if (originalClaudeToken === undefined) delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
    else process.env.CLAUDE_CODE_OAUTH_TOKEN = originalClaudeToken;
    if (originalAnthropicKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalAnthropicKey;
    if (originalAnthropicAuthToken === undefined) delete process.env.ANTHROPIC_AUTH_TOKEN;
    else process.env.ANTHROPIC_AUTH_TOKEN = originalAnthropicAuthToken;
    if (originalAnthropicBaseUrl === undefined) delete process.env.ANTHROPIC_BASE_URL;
    else process.env.ANTHROPIC_BASE_URL = originalAnthropicBaseUrl;
  }
}

async function runWithCleanClaudeEnv() {
  const calls = [];
  const fetchImpl = async (url, request) => {
    calls.push({ url, headers: request.headers, body: JSON.parse(request.body) });
    const isIntent = request.body.includes("expectedJsonShape");
    const responseText = isIntent
      ? JSON.stringify({
          primaryIntent: "booking",
          secondaryIntents: ["service_info"],
          confidence: 0.83,
          language: "zh-HK",
          customerGoal: "Customer wants to book a treatment.",
          entities: { service: "laser" },
          riskLevel: "low",
          needsHumanReview: false,
          reasons: ["Customer mentions booking context."]
        })
      : "可以呀，麻煩提供日期同時間，我哋再幫你確認。";
    return {
      ok: true,
      json: async () => ({ content: [{ type: "text", text: responseText }] })
    };
  };

  const adapters = createClaudeAdapters({
    oauthToken: "test-oauth-token",
    draftModel: "claude-test-draft",
    intentModel: "claude-test-intent",
    fetchImpl
  });

  const draft = await adapters.llmAdapter("full prompt", {
    systemPrompt: "system policy",
    userPrompt: "customer prompt"
  });
  assert.equal(draft.text, "可以呀，麻煩提供日期同時間，我哋再幫你確認。");

  const intent = await adapters.llmIntentAnalyzer({
    sanitizedText: "想book脫毛",
    deterministicGuess: { primaryIntent: "service_info", confidence: 0.52 }
  });
  assert.equal(intent.primaryIntent, "booking");
  assert.equal(intent.confidence, 0.83);
  assert.equal(intent.entities.service, "laser");

  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "https://api.anthropic.com/v1/messages");
  assert.equal(calls[0].headers.authorization, "Bearer test-oauth-token");
  assert.equal(calls[0].headers["anthropic-version"], "2023-06-01");
  assert.equal(calls[0].headers["anthropic-beta"], "oauth-2025-04-20");
  assert.equal(calls[0].body.model, "claude-test-draft");
  assert.equal(calls[1].body.model, "claude-test-intent");
  assert.equal(calls[0].body.system[0].text, _internal.CLAUDE_CODE_SYSTEM_PREFIX, "system prompt must start with the Claude Code identity");
  assert.equal(calls[0].body.system[1].text, "system policy", "caller system prompt should follow the identity block");
  assert.equal(calls[0].body.messages[0].content[0].text.includes("customer prompt"), true);

  assert.equal(
    _internal.claudeHeaders({ oauthToken: "Bearer oauth-prefixed-token" }).authorization,
    "Bearer oauth-prefixed-token"
  );
  assert.deepEqual(
    _internal.claudeHeaders({ oauthToken: "key" }),
    {
      authorization: "Bearer key",
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "oauth-2025-04-20"
    }
  );
  assert.deepEqual(
    _internal.claudeHeaders({ apiKey: "sk-ant-test-key" }),
    {
      "x-api-key": "sk-ant-test-key",
      "content-type": "application/json",
      "anthropic-version": "2023-06-01"
    },
    "normal Anthropic API keys should use x-api-key without the OAuth beta header"
  );
  assert.deepEqual(
    _internal.claudeCredentials({
      oauthToken: "oauth-token",
      apiKey: "sk-ant-test-key",
      authToken: "routeai-token"
    }).map((credential) => credential.type),
    ["auth_token", "oauth", "api_key"],
    "Claude credentials should prefer RouteAI/proxy auth, then OAuth, then direct API key"
  );

  const prefixed = _internal.buildSystemBlocks(_internal.CLAUDE_CODE_SYSTEM_PREFIX + " You are a draft writer.");
  assert.equal(prefixed.length, 1, "caller-provided identity prefix must not be duplicated");
  const apiKeySystem = _internal.buildSystemBlocks("plain system", { includeClaudeCodePrefix: false });
  assert.deepEqual(apiKeySystem, [{ type: "text", text: "plain system" }], "API key system prompts should not add Claude Code identity");
  assert.equal(
    _internal.stripClaudeCodePrefix(_internal.CLAUDE_CODE_SYSTEM_PREFIX + " You are a draft writer."),
    "You are a draft writer.",
    "API key fallback should strip a standalone Claude Code prefix"
  );

  const apiKeyCalls = [];
  const apiKeyAdapters = createClaudeAdapters({
    apiKey: "sk-ant-direct",
    draftModel: "claude-test-api-key",
    fetchImpl: async (url, request) => {
      apiKeyCalls.push({ url, headers: request.headers, body: JSON.parse(request.body) });
      return {
        ok: true,
        json: async () => ({ content: [{ type: "text", text: "api key reply" }] })
      };
    }
  });
  const apiKeyDraft = await apiKeyAdapters.llmAdapter("full prompt", { systemPrompt: "normal system" });
  assert.equal(apiKeyDraft.text, "api key reply");
  assert.equal(apiKeyCalls[0].headers["x-api-key"], "sk-ant-direct");
  assert.equal(apiKeyCalls[0].headers.authorization, undefined);
  assert.equal(apiKeyCalls[0].headers["anthropic-beta"], undefined);
  assert.deepEqual(apiKeyCalls[0].body.system, [{ type: "text", text: "normal system" }]);

  const authTokenCalls = [];
  const authTokenAdapters = createClaudeAdapters({
    authToken: "routeai-token",
    baseUrl: "https://hk.routeai.cc",
    draftModel: "claude-test-auth-token",
    fetchImpl: async (url, request) => {
      authTokenCalls.push({ url, headers: request.headers, body: JSON.parse(request.body) });
      return {
        ok: true,
        json: async () => ({ content: [{ type: "text", text: "auth token reply" }] })
      };
    }
  });
  const authTokenDraft = await authTokenAdapters.llmAdapter("full prompt", { systemPrompt: "route system" });
  assert.equal(authTokenDraft.text, "auth token reply");
  assert.equal(authTokenCalls[0].url, "https://hk.routeai.cc/v1/messages");
  assert.equal(authTokenCalls[0].headers.authorization, "Bearer routeai-token");
  assert.equal(authTokenCalls[0].headers["x-api-key"], undefined);
  assert.equal(authTokenCalls[0].headers["anthropic-beta"], undefined);
  assert.deepEqual(authTokenCalls[0].body.system, [{ type: "text", text: "route system" }]);

  process.env.ANTHROPIC_AUTH_TOKEN = "env-route-token";
  process.env.ANTHROPIC_BASE_URL = "https://env.routeai.test";
  const envAliasCalls = [];
  const envAliasAdapters = createClaudeAdapters({
    draftModel: "claude-test-env-alias",
    fetchImpl: async (url, request) => {
      envAliasCalls.push({ url, headers: request.headers, body: JSON.parse(request.body) });
      return {
        ok: true,
        json: async () => ({ content: [{ type: "text", text: "env alias reply" }] })
      };
    }
  });
  const envAliasDraft = await envAliasAdapters.llmAdapter("full prompt", { systemPrompt: "env alias system" });
  assert.equal(envAliasDraft.text, "env alias reply");
  assert.equal(envAliasCalls[0].url, "https://env.routeai.test/v1/messages");
  assert.equal(envAliasCalls[0].headers.authorization, "Bearer env-route-token");
  delete process.env.ANTHROPIC_AUTH_TOKEN;
  delete process.env.ANTHROPIC_BASE_URL;

  assert.equal(_internal.normalizeClaudeBaseUrl("https://hk.routeai.cc"), "https://hk.routeai.cc/v1");
  assert.equal(_internal.normalizeClaudeBaseUrl("https://api.anthropic.com/v1"), "https://api.anthropic.com/v1");
  assert.equal(_internal.normalizeClaudeBaseUrl("https://proxy.example/custom"), "https://proxy.example/custom");

  const fallbackCalls = [];
  const fallbackAdapters = createClaudeAdapters({
    authToken: "exhausted-routeai-token",
    oauthToken: "oauth-fallback-token",
    fetchImpl: async (url, request) => {
      fallbackCalls.push({ url, headers: request.headers, body: JSON.parse(request.body) });
      if (request.headers.authorization === "Bearer exhausted-routeai-token") {
        return {
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
          json: async () => ({ error: { message: "not enough tokens" } })
        };
      }
      return {
        ok: true,
        json: async () => ({ content: [{ type: "text", text: "fallback reply" }] })
      };
    }
  });
  const fallbackDraft = await fallbackAdapters.llmAdapter("prompt", { systemPrompt: "fallback system" });
  assert.equal(fallbackDraft.text, "fallback reply");
  assert.equal(fallbackCalls.length, 2, "Auth-token failure should retry once with OAuth");
  assert.equal(fallbackCalls[0].headers.authorization, "Bearer exhausted-routeai-token");
  assert.equal(fallbackCalls[0].headers["anthropic-beta"], undefined);
  assert.equal(fallbackCalls[1].headers.authorization, "Bearer oauth-fallback-token");
  assert.equal(fallbackCalls[1].headers["anthropic-beta"], "oauth-2025-04-20");
  assert.deepEqual(fallbackCalls[1].body.system[0].text, _internal.CLAUDE_CODE_SYSTEM_PREFIX);

  assert.deepEqual(createClaudeAdapters({ fetchImpl }), {}, "missing Claude credentials returns empty adapter map");
  assert.deepEqual(_internal.parseJsonObject("prefix {\"primaryIntent\":\"pricing\"} suffix"), { primaryIntent: "pricing" });

  const errorFetch = async () => ({
    ok: false,
    status: 401,
    statusText: "Unauthorized",
    json: async () => ({ error: { message: "OAuth token revoked." } })
  });
  const errorAdapters = createClaudeAdapters({ oauthToken: "bad-token", fetchImpl: errorFetch });
  await assert.rejects(
    errorAdapters.llmAdapter("prompt", {}),
    /claude_401: OAuth token revoked\./
  );

  console.log("claudeAdapter: 41 tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
