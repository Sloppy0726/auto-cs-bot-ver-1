"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const { createWebhookServer, startWebhookServer, _internal } = require("../src/server");

(async () => {
  assert.equal(_internal.statusCodeForError(new SyntaxError("bad json")), 400, "SyntaxError should be treated as bad request");
  assert.equal(_internal.statusCodeForError(new Error("request_too_large")), 413, "request_too_large should be payload too large");
  assert.equal(_internal.statusCodeForError(new Error("request_timeout")), 408, "request_timeout should be treated as request timeout");
  assert.equal(_internal.statusCodeForError(Object.assign(new Error("missing_webhook_signature"), { statusCode: 401 })), 401, "auth errors should be unauthorized");
  assert.equal(_internal.statusCodeForError(new Error("database unavailable")), 500, "unexpected errors stay server errors");
  assert.equal(_internal.publicErrorMessage(new Error("database unavailable"), 500), "internal_server_error", "500s should not expose internal messages");
  assert.equal(_internal.publicErrorMessage(Object.assign(new Error("invalid_webhook_signature"), { statusCode: 401 }), 401), "unauthorized", "auth failures should not expose verifier details");
  assert.equal(_internal.publicErrorMessage(new SyntaxError("bad json"), 400), "bad_request", "bad requests should not expose parser details");
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalAllowDemo = process.env.ALLOW_LOCAL_DEMO_LLM;
  delete process.env.OPENAI_API_KEY;
  delete process.env.ALLOW_LOCAL_DEMO_LLM;
  assert.throws(
    () => startWebhookServer({ port: 0, envFiles: [] }),
    /OPENAI_API_KEY is required/,
    "default server startup should require an LLM-backed adapter"
  );
  if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalApiKey;
  if (originalAllowDemo === undefined) delete process.env.ALLOW_LOCAL_DEMO_LLM;
  else process.env.ALLOW_LOCAL_DEMO_LLM = originalAllowDemo;

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
  assert.throws(() => _internal.authorizeWebhookPayload(
    { channel: "website", businessId: "beauty_demo", text: "hello" },
    { credentialId: "default" }
  ), /business_id_binding_required/, "tenant-scoped payloads require a server-side business binding");
  assert.deepEqual(
    _internal.authorizeWebhookPayload(
      { channel: "instagram", businessId: "igshop_demo", text: "hello" },
      { unsigned: true },
      { allowUnsignedWebhooks: true }
    ),
    { channel: "instagram", businessId: "igshop_demo", text: "hello" },
    "unsigned local mode should allow payload-selected fake businesses"
  );
  assert.throws(() => _internal.verifyUnsignedWebhookMode({ allowUnsignedWebhooks: true, nodeEnv: "production" }), /webhook_signature_required/, "unsigned webhook mode must not run in production");

  await assertServerRejectsUnsignedBeforePipeline({ body, secret, timestamp });
  await assertServerAcceptsSignedWebhook({ body, secret, timestamp, signature });
  await assertServerDerivesBusinessIdFromCredential({ secret, timestamp });
  await assertServerRejectsBusinessIdImpersonation({ secret, timestamp });
  await assertServerRejectsUnboundSingleSecretBusinessId({ body, secret, timestamp, signature });
  await assertServerMasksAuthAndBadRequestDetails({ secret, timestamp });
  await assertServerRejectsUnsupportedContentType({ body, secret, timestamp });
  await assertServerRejectsDeclaredOversizeBody({ body, secret, timestamp, signature });
  await assertServerStitchesApiConversationContext();

  console.log("server: 31 tests passed");
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
    webhookBusinessId: "restaurant_demo",
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
  assert.equal(response.body.error, "unauthorized");
  assert.equal(called, false, "pipeline must not run for unsigned requests");
}

async function assertServerAcceptsSignedWebhook({ body, secret, timestamp, signature }) {
  let receivedPayload = null;
  const server = createWebhookServer({
    webhookSecret: secret,
    webhookBusinessId: "restaurant_demo",
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
  assert.equal(response.body.error, "unauthorized");
  assert.equal(called, false, "pipeline must not run when signed credentials claim another businessId");
}

async function assertServerRejectsUnboundSingleSecretBusinessId({ body, secret, timestamp, signature }) {
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

  const response = await sendJson({
    server,
    payload: body,
    headers: {
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=" + signature
    }
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "unauthorized");
  assert.equal(called, false, "pipeline must not run when a single secret is not bound to a businessId");
}

async function assertServerStitchesApiConversationContext() {
  const receivedPayloads = [];
  const server = createWebhookServer({
    allowUnsignedWebhooks: true,
    pipeline: {
      async runMessage(payload) {
        receivedPayloads.push(payload);
        return {
          finalStatus: "ready_to_send",
          outbound: { status: "ready_to_send", payload: { text: "ok" } },
          staffItem: null,
          decision: { action: "auto_send" }
        };
      }
    }
  });

  const first = await sendJson({
    server,
    payload: { channel: "whatsapp", businessId: "beauty_demo", from: "api_sender_1", text: "想book位", debug: true }
  });
  assert.equal(first.statusCode, 200);
  assert.equal(first.body.debug.conversationContext.changed, false);

  const second = await sendJson({
    server,
    payload: { channel: "whatsapp", businessId: "beauty_demo", from: "api_sender_1", text: "今晚四點", debug: true }
  });
  assert.equal(second.statusCode, 200);
  assert.equal(receivedPayloads[1].text, "想book 今晚四點", "API server should stitch fragmented booking follow-ups");
  assert.equal(second.body.debug.conversationContext.changed, true);
  assert.equal(second.body.debug.conversationContext.originalText, "今晚四點");
  assert.equal(second.body.debug.conversationContext.stitchedText, "想book 今晚四點");
}

async function assertServerMasksAuthAndBadRequestDetails({ secret, timestamp }) {
  const server = createWebhookServer({
    webhookSecret: secret,
    webhookBusinessId: "restaurant_demo",
    nowFn: () => new Date(Number(timestamp) * 1000),
    pipeline: {
      async runMessage() {
        throw new Error("pipeline should not run");
      }
    }
  });

  const authResponse = await sendJson({
    server,
    payload: { channel: "website", businessId: "restaurant_demo", sessionId: "s4", text: "hello" },
    headers: {
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=abcdef"
    }
  });
  assert.equal(authResponse.statusCode, 401);
  assert.equal(authResponse.body.error, "unauthorized");

  const invalidJson = "{";
  const jsonSignature = _internal.signBody({ body: invalidJson, timestamp, secret });
  const jsonServer = createWebhookServer({
    webhookSecret: secret,
    webhookBusinessId: "restaurant_demo",
    nowFn: () => new Date(Number(timestamp) * 1000),
    pipeline: {
      async runMessage() {
        throw new Error("pipeline should not run");
      }
    }
  });
  const badRequestResponse = await sendJson({
    server: jsonServer,
    payload: invalidJson,
    headers: {
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=" + jsonSignature
    }
  });
  assert.equal(badRequestResponse.statusCode, 400);
  assert.equal(badRequestResponse.body.error, "bad_request");
}

async function assertServerRejectsUnsupportedContentType({ body, secret, timestamp }) {
  let called = false;
  const server = createWebhookServer({
    webhookSecret: secret,
    webhookBusinessId: "restaurant_demo",
    nowFn: () => new Date(Number(timestamp) * 1000),
    pipeline: {
      async runMessage() {
        called = true;
        throw new Error("pipeline should not run");
      }
    }
  });

  const signature = _internal.signBody({ body, timestamp, secret });
  const response = await sendJson({
    server,
    payload: body,
    headers: {
      "content-type": "text/plain",
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=" + signature
    }
  });
  assert.equal(response.statusCode, 415);
  assert.equal(response.body.error, "unsupported_media_type");
  assert.equal(called, false, "pipeline must not run for unsupported content types");
}

async function assertServerRejectsDeclaredOversizeBody({ body, secret, timestamp, signature }) {
  let called = false;
  const server = createWebhookServer({
    webhookSecret: secret,
    webhookBusinessId: "restaurant_demo",
    maxBodyBytes: 4,
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
      "content-length": "100",
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": "sha256=" + signature
    }
  });
  assert.equal(response.statusCode, 413);
  assert.equal(response.body.error, "request_too_large");
  assert.equal(called, false, "pipeline must not run for oversized declared bodies");
}
