"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const DEFAULT_CODEX_PATH = "/Applications/Codex.app/Contents/Resources/codex";
const DEFAULT_MODEL = "gpt-5.5";
const DEFAULT_AUTH_MODE = "oauth";
const OAUTH_LOGIN_CACHE = new Set();

function createCodexCliAdapter(config = {}) {
  return async function codexCliAdapter(prompt, context = {}) {
    const seedCwd = config.cwd || process.env.CODEX_LLM_CWD || process.cwd();
    const envFile = config.envFile || process.env.CODEX_LLM_ENV_FILE || findNearestEnvFile(seedCwd);
    const envFromFile = config.loadEnv === false ? {} : loadEnvFile(envFile);
    const mergedEnv = { ...process.env, ...envFromFile, ...(config.env || {}) };

    const codexPath = config.codexPath || mergedEnv.CODEX_CLI_PATH || DEFAULT_CODEX_PATH;
    const model = config.model || mergedEnv.CODEX_LLM_MODEL || DEFAULT_MODEL;
    const cwd = config.cwd || mergedEnv.CODEX_LLM_CWD || process.cwd();
    const timeoutMs = Number(config.timeoutMs || mergedEnv.CODEX_LLM_TIMEOUT_MS || 90_000);
    const loginTimeoutMs = Number(config.loginTimeoutMs || mergedEnv.CODEX_LOGIN_TIMEOUT_MS || 30_000);
    const sandbox = config.sandbox || mergedEnv.CODEX_LLM_SANDBOX || "read-only";
    const authMode = normalizeAuthMode(config.authMode || mergedEnv.CODEX_LLM_AUTH_MODE || DEFAULT_AUTH_MODE);
    const execEnv = buildCodexEnv({ baseEnv: mergedEnv, authMode });
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "auto-cs-codex-llm-"));
    const outputFile = path.join(outputDir, "last-message.txt");
    const args = buildCodexExecArgs({ model, cwd, outputFile, sandbox });
    const input = buildCodexPrompt({ prompt, context });
    const runner = config.runner || runCodexCli;
    const loginRunner = config.loginRunner || runCodexLoginWithAccessToken;

    try {
      if (shouldLoginFromAccessToken({ authMode, mergedEnv, config })) {
        await ensureCodexOauthLogin({
          codexPath,
          accessToken: mergedEnv.CODEX_ACCESS_TOKEN,
          timeoutMs: loginTimeoutMs,
          env: execEnv,
          loginRunner
        });
      }

      const result = await runner({
        codexPath,
        args,
        input,
        timeoutMs,
        env: execEnv
      });
      const text = readOutputText(outputFile);
      if (result.exitCode !== 0) {
        throw new Error(`Codex CLI adapter failed with exit code ${result.exitCode}: ${tail(result.stderr || result.stdout || "", 1200)}`);
      }
      if (!text) {
        throw new Error(`Codex CLI adapter produced no final message: ${tail(result.stderr || result.stdout || "", 1200)}`);
      }

      return {
        text,
        model,
        usage: extractCodexTokenUsage(`${result.stdout || ""}\n${result.stderr || ""}`),
        raw: {
          provider: "codex_cli",
          authMode,
          exitCode: result.exitCode
        }
      };
    } finally {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  };
}

function buildCodexExecArgs({ model, cwd, outputFile, sandbox }) {
  return [
    "-a", "never",
    "exec",
    "--ephemeral",
    "--ignore-user-config",
    "--ignore-rules",
    "--sandbox", sandbox || "read-only",
    "-m", model || DEFAULT_MODEL,
    "-C", cwd || process.cwd(),
    "-o", outputFile,
    "-"
  ];
}

function buildCodexPrompt({ prompt, context = {} }) {
  const systemPrompt = context.systemPrompt || "";
  const userPrompt = context.userPrompt || "";
  return [
    "You are being used as a text-generation adapter inside a SME customer-support bot.",
    "Do not run tools. Do not inspect files. Do not edit files. Do not mention Codex.",
    "Return only the final draft text requested by the bot prompt. No analysis, no markdown fence, no extra explanation.",
    "Follow the business safety rules in the provided system prompt exactly.",
    "",
    "BOT_SYSTEM_PROMPT:",
    "<<<SYSTEM_PROMPT",
    systemPrompt,
    "SYSTEM_PROMPT>>>",
    "",
    "BOT_USER_PROMPT:",
    "<<<USER_PROMPT",
    userPrompt || String(prompt || ""),
    "USER_PROMPT>>>",
    "",
    "BOT_FULL_PROMPT:",
    "<<<FULL_PROMPT",
    String(prompt || ""),
    "FULL_PROMPT>>>"
  ].join("\n");
}

function buildCodexEnv({ baseEnv = process.env, authMode = DEFAULT_AUTH_MODE } = {}) {
  const env = { ...baseEnv };
  if (normalizeAuthMode(authMode) === "oauth") {
    // Codex CLI will prefer API-key auth if OPENAI_API_KEY is inherited. Remove
    // OpenAI API-key settings in OAuth mode so it uses ~/.codex/auth.json or a
    // CODEX_ACCESS_TOKEN that we first import via `codex login --with-access-token`.
    delete env.OPENAI_API_KEY;
    delete env.OPENAI_API_BASE;
    delete env.OPENAI_BASE_URL;
    delete env.OPENAI_ORG_ID;
    delete env.OPENAI_ORGANIZATION;
    delete env.OPENAI_PROJECT;
  }
  // Do not leak a bearer access token to the long-running exec child; it is only
  // consumed through stdin by the explicit login step above.
  delete env.CODEX_ACCESS_TOKEN;
  return env;
}

function normalizeAuthMode(value) {
  const mode = String(value || DEFAULT_AUTH_MODE).trim().toLowerCase().replace(/-/g, "_");
  if (mode === "api" || mode === "api_key" || mode === "apikey") return "api_key";
  return "oauth";
}

function shouldLoginFromAccessToken({ authMode, mergedEnv, config }) {
  if (normalizeAuthMode(authMode) !== "oauth") return false;
  if (config.loginFromAccessToken === false) return false;
  return Boolean(mergedEnv.CODEX_ACCESS_TOKEN);
}

async function ensureCodexOauthLogin({ codexPath, accessToken, timeoutMs, env, loginRunner }) {
  if (!accessToken) return;
  const cacheKey = `${codexPath}|${env.CODEX_HOME || path.join(os.homedir(), ".codex")}`;
  if (OAUTH_LOGIN_CACHE.has(cacheKey)) return;
  const result = await loginRunner({ codexPath, accessToken, timeoutMs, env });
  if (result.exitCode !== 0) {
    throw new Error(`Codex OAuth login failed with exit code ${result.exitCode}: ${tail(result.stderr || result.stdout || "", 1200)}`);
  }
  OAUTH_LOGIN_CACHE.add(cacheKey);
}

function runCodexCli({ codexPath, args, input, timeoutMs, env }) {
  return runChildProcess({
    command: codexPath,
    args,
    input,
    timeoutMs,
    env,
    cwd: process.cwd(),
    timeoutMessage: `Codex CLI adapter timed out after ${timeoutMs}ms`
  });
}

function runCodexLoginWithAccessToken({ codexPath, accessToken, timeoutMs, env }) {
  return runChildProcess({
    command: codexPath,
    args: ["login", "--with-access-token"],
    input: `${String(accessToken).trim()}\n`,
    timeoutMs,
    env,
    cwd: process.cwd(),
    timeoutMessage: `Codex OAuth login timed out after ${timeoutMs}ms`
  });
}

function runChildProcess({ command, args, input, timeoutMs, env, cwd, timeoutMessage }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (exitCode) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ exitCode, stdout, stderr });
    });

    child.stdin.end(input, "utf8");
  });
}

function findNearestEnvFile(startDir) {
  let dir = path.resolve(startDir || process.cwd());
  try {
    if (fs.existsSync(dir) && !fs.statSync(dir).isDirectory()) {
      dir = path.dirname(dir);
    }
  } catch (_) {
    dir = process.cwd();
  }
  while (true) {
    const candidate = path.join(dir, ".env");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return candidate;
    dir = parent;
  }
}

function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
  const out = {};
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[match[1]] = value;
  }
  return out;
}

function readOutputText(outputFile) {
  if (!fs.existsSync(outputFile)) return "";
  return fs.readFileSync(outputFile, "utf8").trim();
}

function extractCodexTokenUsage(output) {
  const match = String(output || "").match(/tokens used\s+([\d,]+)/i);
  if (!match) return { source: "codex_cli" };
  return {
    totalTokens: Number(match[1].replace(/,/g, "")),
    source: "codex_cli"
  };
}

function tail(text, maxChars) {
  const value = String(text || "");
  return value.length > maxChars ? value.slice(value.length - maxChars) : value;
}

module.exports = {
  DEFAULT_AUTH_MODE,
  DEFAULT_CODEX_PATH,
  DEFAULT_MODEL,
  createCodexCliAdapter,
  _internal: {
    buildCodexEnv,
    buildCodexExecArgs,
    buildCodexPrompt,
    ensureCodexOauthLogin,
    extractCodexTokenUsage,
    findNearestEnvFile,
    loadEnvFile,
    normalizeAuthMode,
    runCodexCli,
    runCodexLoginWithAccessToken
  }
};
