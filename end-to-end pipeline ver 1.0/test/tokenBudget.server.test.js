"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const { createWebhookServer, _internal } = require("../src/server");
const { createTokenBudget } = require("../src/tokenBudget");
const { createLogger, createMetrics } = require("../src/observability");

const { createUsageReporter } = _internal;

function postWebhook(server, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const { port } = server.address();
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path: "/webhook",
      method: "POST",
      headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body) }
    }, (res) => {
      let buf = "";
      res.on("data", (chunk) => { buf += chunk; });
      res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body: buf }));
    });
    req.on("error", reject);
    req.end(body);
  });
}

function getPath(server, path) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const req = http.request({ hostname: "127.0.0.1", port, path, method: "GET" }, (res) => {
      let buf = "";
      res.on("data", (chunk) => { buf += chunk; });
      res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body: buf }));
    });
    req.on("error", reject);
    req.end();
  });
}

(async () => {
  // A pipeline spy: records whether runMessage was called so we can prove the
  // gate skips the LLM path entirely when over budget.
  let pipelineCalls = 0;
  const spyPipeline = {
    async runMessage() {
      pipelineCalls += 1;
      return { finalStatus: "ready_to_send", outbound: { status: "ready_to_send", payload: { text: "ok" } }, staffItem: null, decision: { action: "auto_send" } };
    }
  };

  // shopX has a tiny cap and is already over it; shopY is under budget.
  const budget = createTokenBudget({ limits: { shopX: 10, shopY: 1000 } });
  budget.record("shopX", 10); // exactly at cap → over budget

  const metrics = createMetrics();
  const server = createWebhookServer({
    allowUnsignedWebhooks: true,
    conversationContextStore: false,
    budget,
    metrics,
    budgetMessage: "請直接聯絡店主",
    pipeline: spyPipeline
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  // --- over-budget shop: canned reply, pipeline NOT called ---
  const overRes = await postWebhook(server, { channel: "website", businessId: "shopX", sessionId: "s1", text: "hi" });
  assert.equal(overRes.statusCode, 200, "over-budget request should still return 200 to the channel");
  const overBody = JSON.parse(overRes.body);
  assert.equal(overBody.action, "budget_exceeded", "over-budget action should be budget_exceeded");
  assert.equal(overBody.finalStatus, "ready_to_send", "canned reply should be ready to send");
  assert.equal(overBody.outbound.payload.text, "請直接聯絡店主", "over-budget reply should use the configured fallback text");
  assert.equal(pipelineCalls, 0, "over-budget request must NOT invoke the pipeline (no token spend)");

  // --- under-budget shop: passes through to the pipeline ---
  const okRes = await postWebhook(server, { channel: "website", businessId: "shopY", sessionId: "s1", text: "hi" });
  assert.equal(okRes.statusCode, 200, "under-budget request should pass");
  const okBody = JSON.parse(okRes.body);
  assert.equal(okBody.action, "auto_send", "under-budget request should reach the pipeline");
  assert.equal(pipelineCalls, 1, "under-budget request should invoke the pipeline exactly once");

  // --- metrics record the budget denial ---
  const metricsRes = await getPath(server, "/metrics");
  assert.ok(metricsRes.body.includes('webhook_requests_total{outcome="budget_exceeded"} 1'), "metrics should count the budget denial");

  // --- /debug/token-budget exposes the snapshot ---
  const debugRes = await getPath(server, "/debug/token-budget");
  assert.equal(debugRes.statusCode, 200, "/debug/token-budget should return 200");
  const snap = JSON.parse(debugRes.body);
  const shopX = snap.shops.find((s) => s.businessId === "shopX");
  assert.equal(shopX.overBudget, true, "snapshot should show shopX over budget");

  await new Promise((resolve) => server.close(resolve));

  // --- usage reporter bills the right shop's budget ---
  const billBudget = createTokenBudget({ defaultLimit: 1000 });
  const logger = createLogger({ sink: () => {} });
  const report = createUsageReporter({ logger, metrics: createMetrics(), budget: billBudget });
  report({ provider: "claude", model: "m", kind: "draft", businessId: "shopZ", usage: { input_tokens: 100, output_tokens: 40, cache_read_input_tokens: 10 } });
  assert.equal(billBudget.check("shopZ").used, 150, "reporter should bill input + output + cache tokens to the shop");

  // --- debug endpoint reports disabled when no budget is configured ---
  const noBudgetServer = createWebhookServer({ allowUnsignedWebhooks: true, conversationContextStore: false, pipeline: spyPipeline });
  await new Promise((resolve) => noBudgetServer.listen(0, "127.0.0.1", resolve));
  const disabledRes = await getPath(noBudgetServer, "/debug/token-budget");
  assert.equal(JSON.parse(disabledRes.body).enabled, false, "no budget configured should report disabled");
  await new Promise((resolve) => noBudgetServer.close(resolve));

  console.log("tokenBudget.server: 10 tests passed");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
