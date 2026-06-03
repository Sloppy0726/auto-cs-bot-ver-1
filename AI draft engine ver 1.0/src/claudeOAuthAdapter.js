"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const DEFAULT_AUTH_PATH = path.join(os.homedir(), ".hermes", "auth.json");
const DEFAULT_BASE_URL = "https://api.anthropic.com";
const DEFAULT_MODEL = "claude-opus-4-6";
const DEFAULT_VERSION = "2.1.146";
const OAUTH_CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
const OAUTH_BETAS = Object.freeze([
  "interleaved-thinking-2025-05-14",
  "fine-grained-tool-streaming-2025-05-14",
  "claude-code-20250219",
  "oauth-2025-04-20"
]);

function createClaudeOAuthAdapter(config = {}) {
  return async function claudeOAuthAdapter(prompt, context = {}) {
    const model = config.model || process.env.CLAUDE_OAUTH_MODEL || context.modelRoute?.model || DEFAULT_MODEL;
    const maxTokens = Number(config.maxTokens || process.env.CLAUDE_OAUTH_MAX_TOKENS || context.modelRoute?.maxTokens || 700);
    const version = config.claudeCodeVersion || process.env.CLAUDE_CODE_VERSION || DEFAULT_VERSION;
    const fetchImpl = config.fetch || fetch;
    const credential = await resolveCredential({
      config,
      fetchImpl,
      now: config.nowFn ? config.nowFn() : Date.now(),
      version
    });

    const response = await fetchImpl(`${(credential.base_url || DEFAULT_BASE_URL).replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: buildClaudeOAuthHeaders({ accessToken: credential.access_token, version }),
      body: JSON.stringify(buildMessagesPayload({ prompt, context, model, maxTokens }))
    });

    const rawBody = await response.text().catch(() => "");
    const json = rawBody ? safeJsonParse(rawBody) : {};
    if (!response.ok) {
      const detail = json.error?.message
        || (rawBody && rawBody.slice(0, 240))
        || response.statusText
        || "no body";
      throw new Error(`Claude OAuth request failed (HTTP ${response.status}): ${detail}`);
    }

    return {
      text: extractText(json),
      model,
      usage: normalizeClaudeUsage(json.usage),
      raw: {
        provider: "claude_oauth",
        credentialId: credential.id || null,
        serviceTier: json.usage?.service_tier || null
      }
    };
  };
}

async function resolveCredential({ config = {}, fetchImpl = fetch, now = Date.now(), version = DEFAULT_VERSION }) {
  // 1. Caller-supplied config takes precedence (used by tests and internal callers).
  if (config.authPath) {
    return loadAndRefreshHermes({ authPath: config.authPath, fetchImpl, now, version });
  }
  if (config.staticToken) {
    return {
      id: "config:staticToken",
      access_token: config.staticToken,
      base_url: config.baseUrl || DEFAULT_BASE_URL
    };
  }
  // 2. Env-var bearer token — OSS-friendly path. Pairs with `claude setup-token`.
  if (process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    return {
      id: "env:CLAUDE_CODE_OAUTH_TOKEN",
      access_token: process.env.CLAUDE_CODE_OAUTH_TOKEN,
      base_url: process.env.ANTHROPIC_BASE_URL || DEFAULT_BASE_URL
    };
  }
  // 3. Hermes credential-pool file — env override, then default location.
  const authPath = process.env.CLAUDE_OAUTH_AUTH_PATH || DEFAULT_AUTH_PATH;
  if (fs.existsSync(authPath)) {
    return loadAndRefreshHermes({ authPath, fetchImpl, now, version });
  }
  throw new Error(
    "No Claude OAuth credentials available. " +
    "Set CLAUDE_CODE_OAUTH_TOKEN (from `claude setup-token`), " +
    `or provide a Hermes credential-pool file at ${authPath} ` +
    "(override with CLAUDE_OAUTH_AUTH_PATH)."
  );
}

async function loadAndRefreshHermes({ authPath, fetchImpl, now, version }) {
  const tokenStore = loadHermesAnthropicCredential(authPath);
  return ensureFreshCredential({
    tokenStore,
    authPath,
    fetchImpl,
    now,
    version
  });
}

function loadHermesAnthropicCredential(authPath = DEFAULT_AUTH_PATH) {
  if (!fs.existsSync(authPath)) {
    throw new Error(`Hermes auth file not found: ${authPath}`);
  }
  const data = JSON.parse(fs.readFileSync(authPath, "utf8"));
  const entries = data.credential_pool?.anthropic || [];
  const credential = entries.find((item) => item.auth_type === "oauth" && item.refresh_token)
    || entries.find((item) => item.access_token || item.refresh_token);
  if (!credential) {
    throw new Error("No Anthropic OAuth credential found in Hermes credential pool.");
  }
  return { data, credential };
}

async function ensureFreshCredential({ tokenStore, authPath, fetchImpl, now = Date.now(), version = DEFAULT_VERSION }) {
  const credential = tokenStore.credential;
  if (isCredentialFresh(credential, now)) return credential;
  if (!credential.refresh_token) throw new Error("Anthropic OAuth credential is expired and has no refresh token.");

  const refreshed = await refreshClaudeOAuthToken({
    refreshToken: credential.refresh_token,
    fetchImpl,
    version
  });

  credential.access_token = refreshed.access_token;
  credential.refresh_token = refreshed.refresh_token || credential.refresh_token;
  credential.expires_at_ms = now + Number(refreshed.expires_in || 3600) * 1000;
  credential.last_status = "ok";
  credential.last_status_at = new Date(now).toISOString();
  tokenStore.data.updated_at = new Date(now).toISOString();
  writeHermesAuthFile(authPath, tokenStore.data);
  return credential;
}

function isCredentialFresh(credential, now = Date.now()) {
  if (!credential?.access_token) return false;
  const expiresAt = Number(credential.expires_at_ms || 0);
  if (!expiresAt) return true;
  return now < expiresAt - 60_000;
}

async function refreshClaudeOAuthToken({ refreshToken, fetchImpl = fetch, version = DEFAULT_VERSION }) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: OAUTH_CLIENT_ID
  });
  const endpoints = [
    "https://platform.claude.com/v1/oauth/token",
    "https://console.anthropic.com/v1/oauth/token"
  ];
  let lastError = null;

  for (const endpoint of endpoints) {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": claudeUserAgent(version)
      },
      body
    });
    const json = await response.json().catch(() => ({}));
    if (response.ok && json.access_token) return json;
    lastError = json.error_description || json.error?.message || response.statusText || `HTTP ${response.status}`;
  }

  throw new Error(`Claude OAuth refresh failed: ${lastError || "unknown error"}`);
}

function writeHermesAuthFile(authPath, data) {
  const tmp = `${authPath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { encoding: "utf8", mode: 0o600 });
  fs.renameSync(tmp, authPath);
}

function buildClaudeOAuthHeaders({ accessToken, version = DEFAULT_VERSION }) {
  return {
    authorization: `Bearer ${accessToken}`,
    "content-type": "application/json",
    "anthropic-version": "2023-06-01",
    "anthropic-beta": OAUTH_BETAS.join(","),
    "user-agent": claudeUserAgent(version),
    "x-app": "cli"
  };
}

function buildMessagesPayload({ prompt, context = {}, model = DEFAULT_MODEL, maxTokens = 700 }) {
  return {
    model,
    max_tokens: Math.max(1, Number(maxTokens) || 700),
    system: [
      { type: "text", text: "You are Claude Code, Anthropic's official CLI for Claude." },
      {
        type: "text",
        text: [
          "You are being used as a text-generation adapter inside a SME customer-support bot.",
          "Do not run tools. Do not inspect files. Do not edit files. Do not mention Claude Code or OAuth.",
          "Return only the final draft text requested by the bot prompt. No analysis, no markdown fence, no extra explanation.",
          "Follow the business safety rules in the bot system prompt exactly.",
          "",
          context.systemPrompt || ""
        ].join("\n")
      }
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: context.userPrompt || String(prompt || "")
          }
        ]
      }
    ]
  };
}

function claudeUserAgent(version = DEFAULT_VERSION) {
  return `claude-cli/${version || DEFAULT_VERSION} (external, cli)`;
}

function safeJsonParse(text) {
  try { return JSON.parse(text); } catch { return {}; }
}

function extractText(json) {
  return (json.content || [])
    .filter((block) => block && block.type === "text")
    .map((block) => block.text || "")
    .join("");
}

function normalizeClaudeUsage(usage) {
  if (!usage) return null;
  return {
    inputTokens: Number(usage.input_tokens || 0),
    outputTokens: Number(usage.output_tokens || 0),
    source: "claude_oauth"
  };
}

module.exports = {
  DEFAULT_AUTH_PATH,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_VERSION,
  createClaudeOAuthAdapter,
  _internal: {
    OAUTH_BETAS,
    buildClaudeOAuthHeaders,
    buildMessagesPayload,
    claudeUserAgent,
    ensureFreshCredential,
    extractText,
    isCredentialFresh,
    loadHermesAnthropicCredential,
    normalizeClaudeUsage,
    refreshClaudeOAuthToken,
    resolveCredential
  }
};
