"use strict";

// Pings the ANTHROPIC_AUTH_TOKEN credential against the proxy in
// whatsapp-web-test-bridge/.env. The goal is to measure how often the
// auth_token itself fails (upstream rate limit), separately from cases
// where the proxy is just unreachable (timeout / 5xx).
//
// Exit codes:
//   0  OK            — request returned 200 with text
//   3  RATE_LIMIT    — 429 from proxy or upstream Anthropic
//   4  AUTH_ERROR    — 401 / 403 (token invalid or revoked)
//   5  UPSTREAM_DOWN — 502 / 503 / 504, network error, or local timeout
//   6  OTHER         — any other non-OK response
//   2  CONFIG        — missing env, can't run the test
//
// Run: node scripts/testAuthToken.js

const fs = require("node:fs");
const path = require("node:path");

loadEnv(path.join(__dirname, "..", "whatsapp-web-test-bridge", ".env"));

const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
const baseUrl = (process.env.CLAUDE_BASE_URL || process.env.ANTHROPIC_BASE_URL || "").replace(/\/+$/, "");
const model = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";
const TIMEOUT_MS = 10000;

if (!authToken) exitWith("CONFIG", 2, "ANTHROPIC_AUTH_TOKEN not set");
if (!baseUrl) exitWith("CONFIG", 2, "ANTHROPIC_BASE_URL / CLAUDE_BASE_URL not set");

const url = /\/v\d+$/.test(baseUrl) ? `${baseUrl}/messages` : `${baseUrl}/v1/messages`;
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

const startedAt = Date.now();
fetch(url, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "anthropic-version": "2023-06-01",
    "authorization": `Bearer ${authToken}`
  },
  body: JSON.stringify({
    model,
    max_tokens: 16,
    messages: [{ role: "user", content: "ping. reply OK." }]
  }),
  signal: controller.signal
}).then(async (response) => {
  clearTimeout(timer);
  const ms = Date.now() - startedAt;
  const status = response.status;
  let body = null;
  try { body = await response.json(); } catch { body = null; }

  if (response.ok) {
    const reply = (body?.content || []).filter((b) => b?.type === "text").map((b) => b.text).join("").trim();
    exitWith("OK", 0, `${ms}ms · status=${status} · reply=${truncate(reply, 60)}`);
  }

  const detail = truncate(body?.error?.message || response.statusText || "no message", 160);
  if (status === 429) {
    exitWith("RATE_LIMIT", 3, `${ms}ms · status=429 · ${detail}`);
  }
  if (status === 401 || status === 403) {
    exitWith("AUTH_ERROR", 4, `${ms}ms · status=${status} · ${detail}`);
  }
  if (status === 502 || status === 503 || status === 504) {
    exitWith("UPSTREAM_DOWN", 5, `${ms}ms · status=${status} · ${detail}`);
  }
  exitWith("OTHER", 6, `${ms}ms · status=${status} · ${detail}`);
}).catch((error) => {
  clearTimeout(timer);
  const ms = Date.now() - startedAt;
  // AbortError → timeout; everything else (DNS, ECONNREFUSED, connection reset) is also "upstream down" from our POV.
  const reason = error?.name === "AbortError" ? "timeout" : (error?.code || error?.message || "network_error");
  exitWith("UPSTREAM_DOWN", 5, `${ms}ms · ${reason}`);
});

function exitWith(verdict, code, detail) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] auth_token ping ${verdict} :: model=${model} · baseUrl=${baseUrl} · ${detail}`);
  process.exit(code);
}

function truncate(text, max) {
  const s = String(text || "");
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function loadEnv(filePath) {
  // .env values override the shell env (Claude Desktop injects
  // ANTHROPIC_BASE_URL=https://api.anthropic.com which would mask the proxy).
  let text;
  try { text = fs.readFileSync(filePath, "utf8"); } catch { return; }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value === "") continue;
    process.env[key] = value;
  }
}
