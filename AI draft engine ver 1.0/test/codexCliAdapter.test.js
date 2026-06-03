"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createCodexCliAdapter, _internal } = require("../src/codexCliAdapter");

async function run() {
  const args = _internal.buildCodexExecArgs({
    model: "gpt-test",
    cwd: "/tmp/workspace",
    outputFile: "/tmp/out.txt",
    sandbox: "read-only"
  });
  assert.deepEqual(args.slice(0, 4), ["-a", "never", "exec", "--ephemeral"], "adapter should force non-interactive no-approval mode");
  assert.ok(args.includes("--ignore-user-config"), "adapter should avoid user config drift");
  assert.ok(args.includes("--ignore-rules"), "adapter should avoid repo rule drift");
  assert.ok(args.includes("read-only"), "adapter should run Codex in read-only sandbox");
  assert.equal(args[args.length - 1], "-", "adapter should pass prompt through stdin");

  const prompt = _internal.buildCodexPrompt({
    prompt: "full prompt",
    context: { systemPrompt: "system rules", userPrompt: "customer draft request" }
  });
  assert.ok(prompt.includes("Do not run tools"), "prompt should forbid tool use");
  assert.ok(prompt.includes("system rules"), "prompt should include bot system prompt");
  assert.ok(prompt.includes("customer draft request"), "prompt should include bot user prompt");

  assert.deepEqual(
    _internal.extractCodexTokenUsage("codex\nhello\ntokens used\n12,345\n"),
    { totalTokens: 12345, source: "codex_cli" },
    "adapter should parse Codex CLI total-token output"
  );

  assert.deepEqual(
    _internal.loadEnvFile(writeTempEnv("CODEX_LLM_AUTH_MODE=oauth\nCODEX_ACCESS_TOKEN='abc.123'\n")),
    { CODEX_LLM_AUTH_MODE: "oauth", CODEX_ACCESS_TOKEN: "abc.123" },
    "adapter should parse simple .env files without dotenv dependency"
  );

  assert.equal(_internal.normalizeAuthMode("api-key"), "api_key", "api-key alias should normalize");
  assert.equal(_internal.normalizeAuthMode("oauth"), "oauth", "oauth should normalize");

  const oauthEnv = _internal.buildCodexEnv({
    baseEnv: {
      OPENAI_API_KEY: "sk-should-not-pass",
      OPENAI_BASE_URL: "https://api.openai.example",
      OPENAI_ORG_ID: "org-test",
      CODEX_ACCESS_TOKEN: "oauth-token",
      SAFE_VAR: "ok"
    },
    authMode: "oauth"
  });
  assert.equal(oauthEnv.OPENAI_API_KEY, undefined, "OAuth mode should strip OPENAI_API_KEY so Codex does not fall back to API-key auth");
  assert.equal(oauthEnv.OPENAI_BASE_URL, undefined, "OAuth mode should strip OpenAI base URL overrides");
  assert.equal(oauthEnv.OPENAI_ORG_ID, undefined, "OAuth mode should strip OpenAI org overrides");
  assert.equal(oauthEnv.CODEX_ACCESS_TOKEN, undefined, "exec child should not receive bearer access token");
  assert.equal(oauthEnv.SAFE_VAR, "ok", "non-secret env should be preserved");

  const apiKeyEnv = _internal.buildCodexEnv({
    baseEnv: { OPENAI_API_KEY: "sk-test", CODEX_ACCESS_TOKEN: "oauth-token" },
    authMode: "api_key"
  });
  assert.equal(apiKeyEnv.OPENAI_API_KEY, "sk-test", "api_key mode should preserve OPENAI_API_KEY when explicitly requested");
  assert.equal(apiKeyEnv.CODEX_ACCESS_TOKEN, undefined, "CODEX_ACCESS_TOKEN should still not be passed to exec child");

  const calls = [];
  const adapter = createCodexCliAdapter({
    codexPath: "/bin/codex-test",
    model: "gpt-test",
    cwd: "/tmp/workspace",
    runner: async (call) => {
      calls.push(call);
      const outputFile = call.args[call.args.indexOf("-o") + 1];
      fs.writeFileSync(outputFile, "草稿：請同事覆核後回覆。", "utf8");
      return { exitCode: 0, stdout: "tokens used\n1,234\n", stderr: "" };
    }
  });

  const result = await adapter("full prompt", {
    systemPrompt: "system",
    userPrompt: "user"
  });
  assert.equal(result.text, "草稿：請同事覆核後回覆。", "adapter should return Codex final message");
  assert.equal(result.model, "gpt-test", "adapter should expose selected model");
  assert.equal(result.raw.authMode, "oauth", "adapter should default to OAuth mode");
  assert.deepEqual(result.usage, { totalTokens: 1234, source: "codex_cli" }, "adapter should expose parsed total tokens");
  assert.equal(calls.length, 1, "adapter should call runner once");
  assert.ok(calls[0].input.includes("BOT_FULL_PROMPT"), "adapter should pass wrapped prompt through stdin");

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "auto-cs-codex-env-test-"));
  fs.writeFileSync(
    path.join(tmp, ".env"),
    [
      "CODEX_LLM_AUTH_MODE=oauth",
      "CODEX_ACCESS_TOKEN=oauth-token-from-env",
      "OPENAI_API_KEY=sk-should-be-ignored",
      "CODEX_LLM_MODEL=gpt-env-model"
    ].join("\n"),
    "utf8"
  );
  const envCalls = [];
  const loginCalls = [];
  const envAdapter = createCodexCliAdapter({
    codexPath: "/bin/codex-test",
    cwd: tmp,
    runner: async (call) => {
      envCalls.push(call);
      const outputFile = call.args[call.args.indexOf("-o") + 1];
      fs.writeFileSync(outputFile, "OAuth draft", "utf8");
      return { exitCode: 0, stdout: "", stderr: "" };
    },
    loginRunner: async (call) => {
      loginCalls.push(call);
      return { exitCode: 0, stdout: "logged in", stderr: "" };
    }
  });
  const envResult = await envAdapter("prompt", { userPrompt: "user" });
  assert.equal(envResult.model, "gpt-env-model", ".env should supply CODEX_LLM_MODEL");
  assert.equal(loginCalls.length, 1, "CODEX_ACCESS_TOKEN should trigger codex login --with-access-token once");
  assert.equal(loginCalls[0].accessToken, "oauth-token-from-env", "login runner should receive access token through function arg, not stdout");
  assert.equal(envCalls[0].env.OPENAI_API_KEY, undefined, ".env OPENAI_API_KEY should be stripped in OAuth mode");
  assert.equal(envCalls[0].env.CODEX_ACCESS_TOKEN, undefined, "exec child should not receive CODEX_ACCESS_TOKEN");

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("codexCliAdapter: 29 tests passed");
}

function writeTempEnv(text) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "auto-cs-env-"));
  const file = path.join(tmp, ".env");
  fs.writeFileSync(file, text, "utf8");
  return file;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
