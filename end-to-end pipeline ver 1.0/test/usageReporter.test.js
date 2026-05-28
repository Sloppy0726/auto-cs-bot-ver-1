"use strict";

const assert = require("node:assert/strict");
const { _internal } = require("../src/server");
const { createLogger, createMetrics } = require("../src/observability");
const { createClaudeAdapters } = require("../src/claudeAdapter");
const { createOpenAIAdapters } = require("../src/openaiAdapter");

const { createUsageReporter } = _internal;

(async () => {
  // --- createUsageReporter: per-prompt log + counters ---
  const lines = [];
  const logger = createLogger({ sink: (line) => lines.push(line) });
  const metrics = createMetrics();
  const report = createUsageReporter({ logger, metrics });

  report({ provider: "claude", model: "claude-haiku-4-5-20251001", kind: "draft", usage: { input_tokens: 120, output_tokens: 80, cache_read_input_tokens: 40 } });
  report({ provider: "claude", model: "claude-haiku-4-5-20251001", kind: "intent", usage: { input_tokens: 60, output_tokens: 20 } });

  assert.equal(lines.length, 2, "should emit one log line per LLM call");
  const first = JSON.parse(lines[0]);
  assert.equal(first.event, "llm_call", "log event should be llm_call");
  assert.equal(first.provider, "claude", "provider should be propagated");
  assert.equal(first.kind, "draft", "kind should be propagated");
  assert.equal(first.input_tokens, 120, "input tokens should be in log");
  assert.equal(first.output_tokens, 80, "output tokens should be in log");
  assert.equal(first.total_tokens, 200, "total tokens should sum input + output");

  const snap = metrics.snapshot();
  const calls = snap.counters.llm_calls_total;
  assert.equal(calls.length, 2, "llm_calls_total should have one series per kind");
  const input = snap.counters.llm_tokens_total.filter((s) => s.labels.direction === "input");
  const inputDraft = input.find((s) => s.labels.kind === "draft");
  assert.equal(inputDraft.value, 120, "input draft tokens should accumulate");

  const cache = snap.counters.llm_tokens_total.find((s) => s.labels.direction === "cache_read");
  assert.equal(cache.value, 40, "cache_read tokens should be counted when present");

  const prom = metrics.renderPrometheus();
  assert.ok(prom.includes('llm_tokens_total{direction="input",kind="draft",model="claude-haiku-4-5-20251001",provider="claude"} 120'), "prometheus output should expose llm_tokens_total");

  // --- claude adapter pipes onUsage through ---
  const captured = [];
  const claudeFetch = async () => ({
    ok: true,
    json: async () => ({
      content: [{ type: "text", text: "hello" }],
      usage: { input_tokens: 7, output_tokens: 3 }
    })
  });
  const claude = createClaudeAdapters({
    apiKey: "test-key",
    fetchImpl: claudeFetch,
    onUsage: (record) => captured.push(record)
  });
  const result = await claude.llmAdapter("hi", {});
  assert.equal(result.text, "hello", "draft adapter should still return text");
  assert.equal(captured.length, 1, "onUsage should fire once per claude draft call");
  assert.equal(captured[0].provider, "claude", "captured provider should be claude");
  assert.equal(captured[0].kind, "draft", "captured kind should be draft");
  assert.equal(captured[0].usage.input_tokens, 7, "captured input_tokens should match response");
  assert.equal(captured[0].usage.output_tokens, 3, "captured output_tokens should match response");

  // --- openai adapter pipes onUsage through ---
  const captured2 = [];
  const openAIFetch = async () => ({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: "ok" } }],
      usage: { prompt_tokens: 25, completion_tokens: 11, prompt_tokens_details: { cached_tokens: 4 } }
    })
  });
  const openai = createOpenAIAdapters({
    oauthToken: "test-token",
    fetchImpl: openAIFetch,
    onUsage: (record) => captured2.push(record)
  });
  const openaiResult = await openai.llmAdapter("hi", {});
  assert.equal(openaiResult.text, "ok", "openai adapter should still return text");
  assert.equal(captured2.length, 1, "onUsage should fire once per openai draft call");
  assert.equal(captured2[0].usage.input_tokens, 25, "openai prompt_tokens should map to input_tokens");
  assert.equal(captured2[0].usage.output_tokens, 11, "openai completion_tokens should map to output_tokens");
  assert.equal(captured2[0].usage.cache_read_input_tokens, 4, "openai cached_tokens should map to cache_read_input_tokens");

  // --- onUsage that throws does not break inference ---
  const safeClaude = createClaudeAdapters({
    apiKey: "test-key",
    fetchImpl: claudeFetch,
    onUsage: () => { throw new Error("telemetry boom"); }
  });
  const safeResult = await safeClaude.llmAdapter("hi", {});
  assert.equal(safeResult.text, "hello", "throwing onUsage callback must not propagate");

  console.log("usageReporter: 17 tests passed");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
