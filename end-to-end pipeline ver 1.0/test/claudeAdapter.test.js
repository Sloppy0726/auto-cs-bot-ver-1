"use strict";

const assert = require("node:assert/strict");
const { createClaudeAdapters, _internal } = require("../src/claudeAdapter");

async function run() {
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

  const prefixed = _internal.buildSystemBlocks(_internal.CLAUDE_CODE_SYSTEM_PREFIX + " You are a draft writer.");
  assert.equal(prefixed.length, 1, "caller-provided identity prefix must not be duplicated");

  assert.deepEqual(createClaudeAdapters({ fetchImpl }), {}, "missing oauth token returns empty adapter map");
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

  console.log("claudeAdapter: 17 tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
