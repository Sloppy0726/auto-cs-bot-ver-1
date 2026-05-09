"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const { createWebhookServer, _internal } = require("../src/server");

(async () => {
  assert.equal(_internal.statusCodeForError(new SyntaxError("bad json")), 400, "SyntaxError should be treated as bad request");
  assert.equal(_internal.statusCodeForError(new Error("request_too_large")), 413, "request_too_large should be payload too large");
  assert.equal(_internal.statusCodeForError(Object.assign(new Error("missing_webhook_signature"), { statusCode: 401 })), 401, "auth errors should be unauthorized");
  assert.equal(_internal.statusCodeForError(new Error("database unavailable")), 500, "unexpected errors stay server errors");
  assert.equal(_internal.publicErrorMessage(new Error("database unavailable"), 500), "internal_server_error", "500s should not expose internal messages");

  const body = JSON.stringify({ channel: "website", businessId: "restaurant_demo", sessionId: "s1", text: "hello" });
  const timestamp = "1778400000";
  const secret = "test-secret";
  const signature = _internal.signBody({ body, timestamp, secret });

  assert.doesNotThrow(() => _internal.verifyWebhookRequest(
    requestWithHeaders({
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=" + signature
    }),
    body,
    { webhookSecret: secret, nowFn: () => new Date(Number(timestamp) * 1000) }
  ), "valid signatures should pass");

  assert.throws(() => _internal.verifyWebhookRequest(
    requestWithHeaders({
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=" + signature
    }),
    body.replace("hello", "tampered"),
    { webhookSecret: secret, nowFn: () => new Date(Number(timestamp) * 1000) }
  ), /invalid_webhook_signature/, "tampered bodies should fail signature verification");

  assert.throws(() => _internal.verifyWebhookRequest(
    requestWithHeaders({
      "x-webhook-timestamp": String(Number(timestamp) - 600),
      "x-webhook-signature": "sha256=" + signature
    }),
    body,
    { webhookSecret: secret, nowFn: () => new Date(Number(timestamp) * 1000), replayWindowSeconds: 300 }
  ), /stale_webhook_timestamp/, "stale timestamps should be rejected");

  assert.throws(() => _internal.verifyWebhookRequest(
    requestWithHeaders({}),
    body,
    { webhookSecret: secret, nowFn: () => new Date(Number(timestamp) * 1000) }
  ), /missing_webhook_signature/, "signed mode should require signature headers");

  const tenantContext = _internal.verifyWebhookRequest(
    requestWithHeaders({
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=" + signature
    }),
    body,
    { webhookSecrets: { restaurant_demo: secret }, nowFn: () => new Date(Number(timestamp) * 1000) }
  );
  assert.equal(tenantContext.businessId, "restaurant_demo", "matching tenant credentials should identify the authorized business");
  assert.deepEqual(
    _internal.authorizeWebhookPayload({ channel: "website", text: "hello" }, tenantContext),
    { channel: "website", text: "hello", businessId: "restaurant_demo" },
    "payloads without businessId should inherit the credential businessId"
  );
  assert.throws(() => _internal.authorizeWebhookPayload(
    { channel: "website", businessId: "beauty_demo", text: "hello" },
    tenantContext
  ), /business_id_not_authorized/, "payload businessId must not conflict with credential businessId");

  await assertServerRejectsUnsignedBeforePipeline({ body, secret, timestamp });
  await assertServerAcceptsSignedWebhook({ body, secret, timestamp, signature });
  await assertServerDerivesBusinessIdFromCredential({ secret, timestamp });
  await assertServerRejectsBusinessIdImpersonation({ secret, timestamp });

  console.log("server: 17 tests passed");
})();

function requestWithHeaders(headers) {
  return { headers };
}

function sendJson({ server, payload, headers = {} }) {
  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      const bodyText = typeof payload === "string" ? payload : JSON.stringify(payload);
      const req = http.request({
        hostname: "127.0.0.1",
        port,
        path: "/webhook",
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(bodyText),
          ...headers
        }
      }, (res) => {
        let responseBody = "";
        res.on("data", (chunk) => { responseBody += chunk; });
        res.on("end", () => {
          server.close(() => resolve({ statusCode: res.statusCode, body: JSON.parse(responseBody) }));
        });
      });
      req.on("error", reject);
      req.end(bodyText);
    });
  });
}

async function assertServerRejectsUnsignedBeforePipeline({ body, secret, timestamp }) {
  let called = false;
  const server = createWebhookServer({
    webhookSecret: secret,
    nowFn: () => new Date(Number(timestamp) * 1000),
    pipeline: {
      async runMessage() {
        called = true;
        throw new Error("pipeline should not run");
      }
    }
  });

  const response = await sendJson({ server, payload: body });
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "missing_webhook_signature");
  assert.equal(called, false, "pipeline must not run for unsigned requests");
}

async function assertServerAcceptsSignedWebhook({ body, secret, timestamp, signature }) {
  let receivedPayload = null;
  const server = createWebhookServer({
    webhookSecret: secret,
    nowFn: () => new Date(Number(timestamp) * 1000),
    pipeline: {
      async runMessage(payload) {
        receivedPayload = payload;
        return {
          finalStatus: "ready_to_send",
          outbound: { status: "ready_to_send", payload: { text: "ok" } },
          staffItem: null,
          decision: { action: "auto_send" }
        };
      }
    }
  });

  const response = await sendJson({
    server,
    payload: body,
    headers: {
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=" + signature
    }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.finalStatus, "ready_to_send");
  assert.deepEqual(receivedPayload, JSON.parse(body));
}


async function assertServerDerivesBusinessIdFromCredential({ secret, timestamp }) {
  let receivedPayload = null;
  const body = JSON.stringify({ channel: "website", sessionId: "s2", text: "hello" });
  const signature = _internal.signBody({ body, timestamp, secret });
  const server = createWebhookServer({
    webhookSecrets: { restaurant_demo: secret },
    nowFn: () => new Date(Number(timestamp) * 1000),
    pipeline: {
      async runMessage(payload) {
        receivedPayload = payload;
        return {
          finalStatus: "ready_to_send",
          outbound: { status: "ready_to_send", payload: { text: "ok" } },
          staffItem: null,
          decision: { action: "auto_send" }
        };
      }
    }
  });

  const response = await sendJson({
    server,
    payload: body,
    headers: {
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=" + signature
    }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(receivedPayload.businessId, "restaurant_demo");
}

async function assertServerRejectsBusinessIdImpersonation({ secret, timestamp }) {
  let called = false;
  const body = JSON.stringify({ channel: "website", businessId: "beauty_demo", sessionId: "s3", text: "hello" });
  const signature = _internal.signBody({ body, timestamp, secret });
  const server = createWebhookServer({
    webhookSecrets: { restaurant_demo: secret },
    nowFn: () => new Date(Number(timestamp) * 1000),
    pipeline: {
      async runMessage() {
        called = true;
        throw new Error("pipeline should not run");
      }
    }
  });

  const response = await sendJson({
    server,
    payload: body,
    headers: {
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=" + signature
    }
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "business_id_not_authorized");
  assert.equal(called, false, "pipeline must not run when signed credentials claim another businessId");
}
