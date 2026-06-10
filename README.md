# Chinese-Language Customer Support Guardrails

Privacy-first Traditional Chinese / English AI customer-support safety framework for SMEs.

This repo provides a local, dependency-light reference workflow for building AI-assisted customer-support replies without sending raw private customer messages directly to an LLM. It combines deterministic privacy filtering, approved-knowledge grounding, business-rule checks, model routing, safety review, and staff handoff before any AI-generated text can reach a customer.

## Current status

Local v1.0 workflow skeleton is complete:

```text
customer channel
  -> channel adapter
  -> conversation context
  -> privacy filter
  -> privacy gateway
  -> intent classifier
  -> package ops context
  -> knowledge base
  -> promotion sync context
  -> business rules
  -> private business backend mock
  -> model router
  -> AI draft engine
  -> safety checker
  -> send reply or staff inbox
```

Current test total: **3,125 passing** across 52 plain Node.js test runners. Run them all with `npm test`.

The core pipeline has no runtime npm dependencies — every module runs on the Node.js stdlib. The only devDependency is `jsdom`, used by the WhatsApp Web bridge's sidebar-script tests in [`whatsapp-web-test-bridge/`](whatsapp-web-test-bridge/).

## Why this exists

Most customer-support AI examples are English-first and prompt-first. This project is built around safer small-team adoption:

- **PII before prompts**: customer identifiers are redacted before any model boundary.
- **Approved knowledge only**: auto-send replies must quote approved business knowledge exactly.
- **Rules beat prompts**: booking, payment, refund, medical, legal, and financial boundaries live in deterministic JavaScript rules.
- **Human-in-the-loop by default**: risky or uncertain cases go to staff review instead of being sent automatically.
- **Traditional Chinese / English examples**: tests cover mixed-language customer-support intent, safety, and routing patterns.

## Modules

| # | Module | Purpose |
|---|---|---|
| 1 | `privacy filter ver 1.0` | Redacts PII and flags locale-specific risk before any LLM call. |
| 2 | `privacy gateway ver 1.0` | Routes sanitized messages: send, review, or block. |
| 3 | `intent classifier ver 1.0` | Classifies Cantonese / English / mixed enquiries into stable intents. |
| 4 | `knowledge base ver 1.0` | Approved-only business answers and grounding IDs. |
| 5 | `business rules ver 1.0` | Deterministic policy gate and capability contract. |
| 6 | `google drive promo sync ver 1.0` | Daily Google Drive promotion sync with Hong Kong time expiry checks. |
| 7 | `AI draft engine ver 1.0` | Produces grounded drafts or staff-only summaries. |
| 8 | `safety checker ver 1.0` | Re-validates drafts before anything can be sent. |
| 9 | `channel adapter ver 1.0` | Normalizes WhatsApp / IG / FB / website payloads and builds outbound payloads. |
| 10 | `model router ver 1.0` | Chooses no-LLM / Haiku / Sonnet by action and risk. |
| 11 | `private business backend mock ver 1.0` | Mock booking, order, stock, and payment facts. |
| 12 | `staff inbox ver 1.0` | In-memory review / handoff queue. |
| 13 | `end-to-end pipeline ver 1.0` | Orchestrates the whole local workflow. |
| 14 | `conversation context ver 1.0` | Shared deterministic stitching for fragmented booking follow-ups before the pipeline. |
| 15 | `package ops ver 1.0` | Read-only prepaid package entitlement lookup (remaining sessions, expiry, usage history) for beauty / fitness / education shops. |
| 16 | `usage tracker ver 0.1` | Per-turn token-usage JSONL recording for cost observability. |
| 17 | `whatsapp web automation prototype ver 0.1` | Local burner-number WhatsApp Web demo. Prototype only — not a production channel integration. |

## Legal and trust drafts

Draft customer-facing trust/legal documents live in [`legal/`](legal/). They are product-specific working drafts and need jurisdiction-specific legal review before use with paying customers.

| Document | Purpose |
|---|---|
| [`legal/draft-trust-and-safety-overview.md`](legal/draft-trust-and-safety-overview.md) | Plain-English explanation of privacy filtering, approved knowledge, staff review, and AI limitations. |
| [`legal/draft-pilot-terms-of-service.md`](legal/draft-pilot-terms-of-service.md) | Pilot/subscription terms covering scope, AI output, customer duties, support, payment, liability, and termination. |
| [`legal/draft-privacy-policy.md`](legal/draft-privacy-policy.md) | Privacy notice covering account data, end-customer messages, AI processing, subprocessors, retention, deletion, and security. |
| [`legal/draft-data-processing-addendum.md`](legal/draft-data-processing-addendum.md) | B2B processing terms for SME customers using the product with their customer messages. |

## Local run

Copy or edit the local environment file first:

```bash
cp .env.example .env
```

Optional LLM adapter modes:

- `WA_LLM_ADAPTER=claude-api` with `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`.
- `WA_LLM_ADAPTER=claude` for local OAuth-based Claude smoke testing. The adapter accepts either a `CLAUDE_CODE_OAUTH_TOKEN` env var (from `claude setup-token`, requires Claude Pro / Max / Enterprise) or a Hermes credential-pool file at `~/.hermes/auth.json` (override with `CLAUDE_OAUTH_AUTH_PATH`). The env-var path is direct to `api.anthropic.com`; do not set `ANTHROPIC_BASE_URL` for that mode.
- `CODEX_LLM_AUTH_MODE=oauth` with a local Codex CLI session for Codex adapter smoke testing.

Start the local webhook server:

```bash
npm start
```

By default it listens at `http://127.0.0.1:3000/webhook` in unsigned local mode for `restaurant_demo`.
Opening that URL in a browser shows a local website chat simulator with fake customers, orders, payments, stock, and booking scenarios.

The fake database lives at:

```text
private business backend mock ver 1.0/seed/mockBusinessData.js
```

Send a test message:

```bash
curl -X POST http://127.0.0.1:3000/webhook \
  -H "content-type: application/json" \
  -d '{"channel":"website","sessionId":"local-demo-001","text":"你哋幾點開門？"}'
```

To run signed mode, set a webhook secret first:

```bash
WEBHOOK_SECRET="dev-secret" WEBHOOK_BUSINESS_ID="restaurant_demo" npm start
```

## WhatsApp Web Local Testing

The WhatsApp Web bridge is packaged separately in:

```text
whatsapp-web-test-bridge/
```

This is a development adapter for Safari + WhatsApp Web only. It does not replace the webhook/API infrastructure that a real WhatsApp Business API integration should use.

Fresh machine setup:

```bash
cd whatsapp-web-test-bridge
cp .env.example .env
npm start
```

For live LLM calls, put proxy-style `ANTHROPIC_BASE_URL` plus `ANTHROPIC_AUTH_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN`, or `ANTHROPIC_API_KEY` in `whatsapp-web-test-bridge/.env`. Generate the OAuth token with `claude setup-token` (Claude Pro/Max/Enterprise subscription), or create an API key in the Anthropic Console. The bot tries the proxy auth token first, falls back to Claude OAuth if the proxy request fails, then tries a direct Anthropic API key, and only then falls back to `OPENAI_OAUTH_TOKEN` if no Claude credential is configured.

The packaged starter runs the local bot server if needed, starts the WhatsApp Web bridge in `screen`, and writes logs under `whatsapp-web-test-bridge/logs/`. See [`whatsapp-web-test-bridge/README.md`](whatsapp-web-test-bridge/README.md) for setup, safety switches, and troubleshooting.

Example:

```bash
node - <<'NODE'
const { createPipeline } = require("./end-to-end pipeline ver 1.0/src/pipeline");

(async () => {
  const pipeline = createPipeline({
    llmAdapter: async (prompt, context) => {
      if (context.decision.action === "handoff") {
        return { text: "【員工交接】
意圖：" + context.intent.primaryIntent + "
建議下一步：由同事跟進。" };
      }
      return { text: context.knowledge.bestMatch?.answer || "請問你想了解哪一方面？" };
    }
  });

  const result = await pipeline.runMessage({
    channel: "website",
    businessId: "restaurant_demo",
    sessionId: "local-demo-001",
    text: "你們幾點營業？"
  });

  console.log(JSON.stringify({
    finalStatus: result.finalStatus,
    action: result.decision.action,
    intent: result.intent.primaryIntent,
    safety: result.safety.verdict,
    replyText: result.outbound?.payload?.text || result.draft?.text
  }, null, 2));
})();
NODE
```

## Test commands

Run from the repo root:

```bash
node "privacy filter ver 1.0/test/privacyFilter.test.js"
node "privacy filter ver 1.0/test/privacyFilter.edge.test.js"
node "privacy gateway ver 1.0/test/privacyGateway.test.js"
node "conversation context ver 1.0/test/conversationContext.test.js"
node "intent classifier ver 1.0/test/intentClassifier.test.js"
node "intent classifier ver 1.0/test/intentClassifier.edge.test.js"
node "knowledge base ver 1.0/test/knowledgeBase.test.js"
node "business rules ver 1.0/test/businessRules.test.js"
node "google drive promo sync ver 1.0/test/promoSync.test.js"
node "AI draft engine ver 1.0/test/draftEngine.test.js"
node "safety checker ver 1.0/test/safetyChecker.test.js"
node "channel adapter ver 1.0/test/channelAdapter.test.js"
node "model router ver 1.0/test/modelRouter.test.js"
node "private business backend mock ver 1.0/test/businessBackendMock.test.js"
node "staff inbox ver 1.0/test/staffInbox.test.js"
node "end-to-end pipeline ver 1.0/test/pipeline.test.js"
node "end-to-end pipeline ver 1.0/test/server.test.js"
```

The test runner discovers all `*.test.js` files outside ignored generated-output folders and runs each one with Node.

## Demo businesses

| businessId | Archetype |
|---|---|
| `beauty_demo` | beauty clinic |
| `restaurant_demo` | restaurant |
| `igshop_demo` | Instagram shop |
| `edu_demo` | education centre |
| `solara_bazi` | consultation page |

## Important constraints

- Privacy gateway runs before any LLM call.
- Business policy lives in typed JS rules, not only prompts.
- Promotion expiry is checked using configurable UTC+8 locale time.
- `auto_send` must quote approved KB text exactly. When paraphrasing is enabled, the rewrite must preserve every source fact and may not introduce any new price/time/date/id.
- Staff review is required for pricing, backend-bound actions, handoff, safety violations, and privacy blocks.
- Owner toolkit commands only run on operator-verified channels (default `whatsapp`; override with `OWNER_CHANNELS`). The website channel never grants owner privileges, because its `sessionId` is client-chosen.
- Admin and debug endpoints (`/admin/*`, `/debug/fake-db`) require `ADMIN_TOKEN` and are blocked in production without it. Set `TRUST_PROXY=true` only when a trusted reverse proxy sets `X-Forwarded-For`.
- Current channel/server/backend/staff inbox pieces are local skeletons, not production integrations.

See [HANDOFF.md](HANDOFF.md) for detailed session notes and known limitations.
