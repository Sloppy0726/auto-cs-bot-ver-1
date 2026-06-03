"use strict";

const path = require("node:path");
const {
  DEFAULT_CODEX_PATH,
  _internal
} = require("../src/codexCliAdapter");

const repoRoot = path.resolve(__dirname, "..", "..");
const envFile = process.env.CODEX_LLM_ENV_FILE || path.join(repoRoot, ".env");
const fileEnv = _internal.loadEnvFile(envFile);
const mergedEnv = { ...process.env, ...fileEnv };
const codexPath = mergedEnv.CODEX_CLI_PATH || DEFAULT_CODEX_PATH;
const accessToken = mergedEnv.CODEX_ACCESS_TOKEN;
const timeoutMs = Number(mergedEnv.CODEX_LOGIN_TIMEOUT_MS || 30_000);
const loginEnv = _internal.buildCodexEnv({ baseEnv: mergedEnv, authMode: "oauth" });

async function run() {
  if (!accessToken) {
    throw new Error(`CODEX_ACCESS_TOKEN is missing. Add it to ${envFile} first.`);
  }
  const result = await _internal.runCodexLoginWithAccessToken({
    codexPath,
    accessToken,
    timeoutMs,
    env: loginEnv
  });
  if (result.exitCode !== 0) {
    throw new Error(`codex login --with-access-token failed with exit code ${result.exitCode}: ${(result.stderr || result.stdout || "").slice(-1000)}`);
  }
  console.log(`Codex OAuth login imported successfully from ${envFile}. Token value was not printed.`);
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
