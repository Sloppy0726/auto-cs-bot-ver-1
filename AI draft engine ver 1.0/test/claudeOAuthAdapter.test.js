"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createClaudeOAuthAdapter, _internal } = require("../src/claudeOAuthAdapter");

async function run() {
  assert.equal(_internal.claudeUserAgent("2.1.146"), "claude-cli/2.1.146 (external, cli)");
  assert.equal(_internal.isCredentialFresh({ access_token: "tok", expires_at_ms: Date.now() + 120_000 }), true);
  assert.equal(_internal.isCredentialFresh({ access_token: "tok", expires_at_ms: Date.now() - 1 }), false);
  assert.equal(_internal.isCredentialFresh({ access_token: "" }), false);

  const headers = _internal.buildClaudeOAuthHeaders({ accessToken: "access", version: "2.1.146" });
  assert.equal(headers.authorization, "Bearer access");
  assert.ok(headers["anthropic-beta"].includes("oauth-2025-04-20"), "OAuth beta should be present");
  assert.equal(headers["x-app"], "cli");

  const payload = _internal.buildMessagesPayload({
    prompt: "full prompt",
    context: { systemPrompt: "system rules", userPrompt: "customer draft" },
    model: "claude-sonnet-4-6",
    maxTokens: 123
  });
  assert.equal(payload.model, "claude-sonnet-4-6");
  assert.equal(payload.max_tokens, 123);
  assert.ok(payload.system[0].text.includes("Claude Code"), "OAuth prompt should include Claude Code identity");
  assert.ok(payload.system[1].text.includes("system rules"), "bot system prompt should be carried");
  assert.equal(payload.messages[0].content[0].text, "customer draft");

  assert.equal(_internal.extractText({ content: [{ type: "text", text: "A" }, { type: "text", text: "B" }] }), "AB");
  assert.deepEqual(
    _internal.normalizeClaudeUsage({ input_tokens: 12, output_tokens: 3 }),
    { inputTokens: 12, outputTokens: 3, source: "claude_oauth" }
  );

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "claude-oauth-test-"));
  const authPath = path.join(tmpDir, "auth.json");
  fs.writeFileSync(authPath, JSON.stringify({
    version: 1,
    credential_pool: {
      anthropic: [{
        id: "cred-1",
        auth_type: "oauth",
        access_token: "expired-access",
        refresh_token: "refresh-token",
        expires_at_ms: 1,
        base_url: "https://api.anthropic.com"
      }]
    }
  }), "utf8");

  const calls = [];
  const fakeFetch = async (url, options) => {
    calls.push({ url, options });
    if (String(url).includes("/oauth/token")) {
      return jsonResponse(200, { access_token: "fresh-access", refresh_token: "fresh-refresh", expires_in: 3600 });
    }
    assert.equal(options.headers.authorization, "Bearer fresh-access", "messages call should use refreshed token");
    return jsonResponse(200, {
      content: [{ type: "text", text: "草稿：請同事覆核。" }],
      usage: { input_tokens: 99, output_tokens: 8, service_tier: "standard" }
    });
  };

  const adapter = createClaudeOAuthAdapter({
    authPath,
    fetch: fakeFetch,
    model: "claude-sonnet-4-6",
    nowFn: () => 1_000_000
  });
  const result = await adapter("full prompt", { systemPrompt: "system", userPrompt: "user" });
  assert.equal(result.text, "草稿：請同事覆核。");
  assert.deepEqual(result.usage, { inputTokens: 99, outputTokens: 8, source: "claude_oauth" });
  assert.equal(calls.length, 2, "expired credential should refresh then call messages");

  const updated = JSON.parse(fs.readFileSync(authPath, "utf8"));
  assert.equal(updated.credential_pool.anthropic[0].refresh_token, "fresh-refresh", "refresh token should be persisted");

  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log("claudeOAuthAdapter: 17 tests passed");
}

function jsonResponse(status, json) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: async () => json
  };
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
