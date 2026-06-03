"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const { createWebhookServer } = require("../src/server");
const { createRateLimiter } = require("../src/rateLimiter");
const { createMetrics } = require("../src/observability");

function postWebhook(server, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const { port } = server.address();
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path: "/webhook",
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(body)
      }
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
  // --- rate limiter: third call within burst should 429 ---
  const limiter = createRateLimiter({ capacity: 2, refillPerSec: 0 });
  const metrics = createMetrics();
  const server = createWebhookServer({
    webhookBusinessId: "restaurant_demo",
    allowUnsignedWebhooks: true,
    rateLimiter: limiter,
    metrics,
    conversationContextStore: false,
    pipeline: {
      async runMessage() {
        return { finalStatus: "ready_to_send", outbound: { status: "ready_to_send", payload: { text: "ok" } }, staffItem: null, decision: { action: "auto_send" } };
      }
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const payload = { channel: "website", businessId: "restaurant_demo", sessionId: "s1", text: "hello" };
  const r1 = await postWebhook(server, payload);
  const r2 = await postWebhook(server, payload);
  const r3 = await postWebhook(server, payload);

  assert.equal(r1.statusCode, 200, "first request should pass");
  assert.equal(r2.statusCode, 200, "second request should pass");
  assert.equal(r3.statusCode, 429, "third request should be rate limited");
  assert.ok(r3.headers["retry-after"], "rate-limited response should set retry-after header");
  const body3 = JSON.parse(r3.body);
  assert.equal(body3.error, "rate_limited", "rate-limited body should signal rate_limited");

  // --- /metrics: exposes counters and histogram ---
  const metricsRes = await getPath(server, "/metrics");
  assert.equal(metricsRes.statusCode, 200, "/metrics should return 200");
  assert.ok(/text\/plain/.test(metricsRes.headers["content-type"]), "/metrics should be text/plain");
  assert.ok(metricsRes.body.includes('webhook_requests_total{outcome="ok"} 2'), "ok counter should reflect two successes");
  assert.ok(metricsRes.body.includes('webhook_requests_total{outcome="rate_limited"} 1'), "rate_limited counter should reflect one denial");
  assert.ok(metricsRes.body.includes("# TYPE webhook_latency_ms histogram"), "latency histogram should be exposed");

  await new Promise((resolve) => server.close(resolve));

  console.log("server.integrations: 8 tests passed");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
