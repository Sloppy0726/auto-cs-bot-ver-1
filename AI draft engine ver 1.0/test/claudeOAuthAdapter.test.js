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

  // --- Env-var bearer fallback (CLAUDE_CODE_OAUTH_TOKEN) ---

  const prevToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  const prevAuthPath = process.env.CLAUDE_OAUTH_AUTH_PATH;
  const prevBaseUrl = process.env.ANTHROPIC_BASE_URL;

  try {
    process.env.CLAUDE_CODE_OAUTH_TOKEN = "env-bearer-xyz";
    delete process.env.CLAUDE_OAUTH_AUTH_PATH;
    delete process.env.ANTHROPIC_BASE_URL;

    const envCalls = [];
    const envFetch = async (url, options) => {
      envCalls.push({ url, options });
      return jsonResponse(200, {
        content: [{ type: "text", text: "env-mode draft" }],
        usage: { input_tokens: 5, output_tokens: 2 }
      });
    };
    const envAdapter = createClaudeOAuthAdapter({ fetch: envFetch });
    const envResult = await envAdapter("prompt");
    assert.equal(envResult.text, "env-mode draft");
    assert.equal(envCalls.length, 1, "env-bearer mode should skip the refresh round-trip");
    assert.equal(envCalls[0].options.headers.authorization, "Bearer env-bearer-xyz", "env bearer token should be used directly");
    assert.equal(String(envCalls[0].url), "https://api.anthropic.com/v1/messages", "default base URL should be used when ANTHROPIC_BASE_URL is unset");

    // ANTHROPIC_BASE_URL override
    process.env.ANTHROPIC_BASE_URL = "https://proxy.example.com/v1";
    const baseUrlCalls = [];
    const baseUrlFetch = async (url, options) => {
      baseUrlCalls.push({ url });
      return jsonResponse(200, { content: [{ type: "text", text: "ok" }], usage: { input_tokens: 1, output_tokens: 1 } });
    };
    const baseUrlAdapter = createClaudeOAuthAdapter({ fetch: baseUrlFetch });
    await baseUrlAdapter("prompt");
    assert.equal(String(baseUrlCalls[0].url), "https://proxy.example.com/v1/v1/messages", "ANTHROPIC_BASE_URL should override the default endpoint");

    // Explicit config.authPath still wins over env var (precedence test)
    const winsTmp = fs.mkdtempSync(path.join(os.tmpdir(), "claude-oauth-precedence-"));
    const winsAuthPath = path.join(winsTmp, "auth.json");
    fs.writeFileSync(winsAuthPath, JSON.stringify({
      credential_pool: {
        anthropic: [{
          id: "explicit-cred",
          auth_type: "oauth",
          access_token: "hermes-access",
          refresh_token: "hermes-refresh",
          expires_at_ms: Date.now() + 300_000
        }]
      }
    }), "utf8");
    const precedenceCalls = [];
    const precedenceFetch = async (url, options) => {
      precedenceCalls.push({ options });
      return jsonResponse(200, { content: [{ type: "text", text: "hermes wins" }], usage: { input_tokens: 1, output_tokens: 1 } });
    };
    const precedenceAdapter = createClaudeOAuthAdapter({ authPath: winsAuthPath, fetch: precedenceFetch });
    const precedenceResult = await precedenceAdapter("prompt");
    assert.equal(precedenceResult.text, "hermes wins");
    assert.equal(precedenceCalls[0].options.headers.authorization, "Bearer hermes-access", "explicit authPath should outrank CLAUDE_CODE_OAUTH_TOKEN");
    fs.rmSync(winsTmp, { recursive: true, force: true });
  } finally {
    if (prevToken === undefined) delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
    else process.env.CLAUDE_CODE_OAUTH_TOKEN = prevToken;
    if (prevAuthPath === undefined) delete process.env.CLAUDE_OAUTH_AUTH_PATH;
    else process.env.CLAUDE_OAUTH_AUTH_PATH = prevAuthPath;
    if (prevBaseUrl === undefined) delete process.env.ANTHROPIC_BASE_URL;
    else process.env.ANTHROPIC_BASE_URL = prevBaseUrl;
  }

  // --- Helpful error when no creds are available ---

  const errPrevToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  const errPrevAuthPath = process.env.CLAUDE_OAUTH_AUTH_PATH;
  try {
    delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
    process.env.CLAUDE_OAUTH_AUTH_PATH = "/definitely/not/a/real/path/auth.json";
    const errAdapter = createClaudeOAuthAdapter({
      fetch: async () => { throw new Error("fetch should not be called"); }
    });
    let caught = null;
    try { await errAdapter("prompt"); } catch (err) { caught = err; }
    assert.ok(caught, "missing-creds path should throw");
    assert.match(caught.message, /CLAUDE_CODE_OAUTH_TOKEN/, "error should mention the env-var fallback");
    assert.match(caught.message, /Hermes/, "error should mention the Hermes file path");
    assert.match(caught.message, /not\/a\/real\/path/, "error should include the resolved path so the user can fix it");
  } finally {
    if (errPrevToken === undefined) delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
    else process.env.CLAUDE_CODE_OAUTH_TOKEN = errPrevToken;
    if (errPrevAuthPath === undefined) delete process.env.CLAUDE_OAUTH_AUTH_PATH;
    else process.env.CLAUDE_OAUTH_AUTH_PATH = errPrevAuthPath;
  }

  console.log("claudeOAuthAdapter: 28 tests passed");
}

function jsonResponse(status, json) {
  const body = JSON.stringify(json);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    text: async () => body,
    json: async () => json
  };
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
