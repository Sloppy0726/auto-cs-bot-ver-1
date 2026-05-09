# End-to-end Pipeline ver 1.0

Orchestrates the workflow from channel payload to outbound reply or staff inbox item.

## Workflow

```
channel adapter
  -> privacy gateway
  -> intent classifier
  -> knowledge base
  -> Google Drive promo sync context
  -> business rules
  -> private backend mock
  -> model router
  -> AI draft engine
  -> safety checker
  -> outbound payload or staff inbox
```

This follows the architecture diagram: privacy runs before any model, business rules constrain generation, safety checks drafts before send, and private backend facts stay controlled.

Promotion context is checked using Hong Kong time (`Asia/Hong_Kong`, UTC+8). Active Google Drive promotions are passed into the draft engine and staff inbox before a reply is generated.

## Main API

```js
const { createPipeline } = require("./src/pipeline");

const pipeline = createPipeline({ llmAdapter });
const result = await pipeline.runMessage({
  channel: "website",
  businessId: "restaurant_demo",
  sessionId: "s1",
  text: "你哋幾點開門？"
});
```

## Server

`src/server.js` exposes `createWebhookServer()` using Node's built-in `http` module. It supports `POST /webhook`. Signed mode requires `x-webhook-timestamp` and `x-webhook-signature`; the signature is HMAC-SHA256 over `timestamp.rawBody`. For tenant isolation, configure per-business `webhookSecrets` so the verified credential derives the authorized `businessId` before the pipeline runs.

## Run

```bash
node "end-to-end pipeline ver 1.0/test/pipeline.test.js"
node "end-to-end pipeline ver 1.0/scripts/writeSideBySideResults.js"
```

## Changelog

### 2026-05-10 03:18:11 HKT - Stable Message ID Hash Hardening

- **Changed:** Channel adapter fallback `externalMessageId` generation now uses a SHA-256-derived digest instead of a 32-bit rolling hash.
- **Added:** Test coverage for deterministic and content-sensitive stable IDs.
- **Verified:** `channelAdapter.test.js` and `pipeline.test.js` passed after the change.

### 2026-05-10 03:15:04 HKT - Redaction Placeholder Leak Detection

- **Changed:** Safety checker now flags bracketed redaction placeholders like `[PHONE_1]` and `[EMAIL_1]` as placeholder leaks.
- **Changed:** Draft-engine forbidden capability checks now treat bracketed redaction placeholders as `leak_pii` surfaces.
- **Verified:** `safetyChecker.test.js`, `draftEngine.test.js`, and `pipeline.test.js` passed after the change.

### 2026-05-10 03:12:52 HKT - Prompt Injection Boundary Hardening

- **Changed:** Draft-engine prompts now quote sanitized customer text inside a `CUSTOMER_MESSAGE` untrusted-data block.
- **Added:** System and final-check prompt rules instruct the model to ignore instructions inside customer-provided text.
- **Verified:** `AI draft engine ver 1.0/test/draftEngine.test.js` and `end-to-end pipeline ver 1.0/test/pipeline.test.js` passed after the change.

### 2026-05-10 03:03:22 HKT - Data Exposure Reduction

- **Changed:** Default privacy gateway output no longer exposes raw `originalText` or detector `value` fields.
- **Added:** `includeSensitive: true` opt-in for controlled staff/debug tools that need raw privacy findings.
- **Changed:** Staff inbox submissions from the pipeline store sanitized customer text by default.
- **Verified:** `privacyGateway.test.js`, `staffInbox.test.js`, `pipeline.test.js`, and `draftEngine.test.js` passed after the change.

### 2026-05-10 02:45:32 HKT - Tenant-Bound Webhook Authorization

- **Changed:** Signed webhook credentials can now be bound to a specific `businessId` using per-business `webhookSecrets`.
- **Added:** Server-side authorization rejects signed requests when the payload `businessId` conflicts with the credential businessId.
- **Added:** Payloads without `businessId` inherit the verified credential businessId before reaching `pipeline.runMessage()`.
- **Verified:** `end-to-end pipeline ver 1.0/test/server.test.js` covers tenant-bound credentials and cross-business impersonation attempts.

### 2026-05-10 02:26:31 HKT - Webhook Authentication Hardening

- **Changed:** `createWebhookServer()` now verifies webhook signatures before parsing JSON or calling `pipeline.runMessage()`.
- **Added:** HMAC-SHA256 signing support using `x-webhook-timestamp` and `x-webhook-signature` headers.
- **Added:** 5-minute default replay protection for stale webhook timestamps.
- **Added:** Constant-time comparison for webhook signatures.
- **Changed:** Unexpected server errors now return `internal_server_error` instead of raw exception messages.
- **Verified:** `end-to-end pipeline ver 1.0/test/server.test.js` covers signed, unsigned, tampered, and stale webhook cases.
