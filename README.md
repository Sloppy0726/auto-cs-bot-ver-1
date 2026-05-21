# Hong Kong AI Customer Support SaaS

Privacy-first Cantonese AI receptionist for Hong Kong SMEs.

The product goal is to answer repetitive WhatsApp / Instagram / Facebook / website enquiries quickly while letting SMEs configure the bot through both a website and a mobile app, including adding approved knowledge and reviewing bot replies, keeping private customer data away from the LLM, keeping business policy in deterministic code, and routing risky replies to staff.

## Current Status

Local v1.0 workflow skeleton is complete:

```text
customer channel
  -> channel adapter
  -> conversation context
  -> privacy filter
  -> privacy gateway
  -> intent classifier
  -> knowledge base
  -> Google Drive promo sync context
  -> business rules
  -> private business backend mock
  -> model router
  -> AI draft engine
  -> safety checker
  -> send reply or staff inbox
```

Current test total: **2,121 passing** across 16 plain Node.js test runners.

No npm dependencies are required. Everything is plain Node.js stdlib.

## Modules

| # | Module | Purpose |
|---|---|---|
| 1 | `privacy filter ver 1.0` | Redacts PII and flags HK-specific risk before any LLM call. |
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

## Legal and Trust Drafts

Draft customer-facing trust/legal documents live in [`legal/`](legal/). They are product-specific working drafts and need Hong Kong legal review before use with paying customers.

| Document | Purpose |
|---|---|
| [`legal/draft-trust-and-safety-overview.md`](legal/draft-trust-and-safety-overview.md) | Plain-English explanation of privacy filtering, approved knowledge, staff review, and AI limitations. |
| [`legal/draft-pilot-terms-of-service.md`](legal/draft-pilot-terms-of-service.md) | Pilot/subscription terms covering scope, AI output, customer duties, support, payment, liability, and termination. |
| [`legal/draft-privacy-policy.md`](legal/draft-privacy-policy.md) | Privacy notice covering account data, end-customer messages, AI processing, subprocessors, retention, deletion, and security. |
| [`legal/draft-data-processing-addendum.md`](legal/draft-data-processing-addendum.md) | B2B processing terms for SME customers using the product with their customer messages. |

## Local Run

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

For live LLM calls, put `CLAUDE_CODE_OAUTH_TOKEN` in `whatsapp-web-test-bridge/.env`. Generate it with `claude setup-token` (Claude Pro/Max/Enterprise subscription). The bot sends it as a bearer token for Anthropic Messages API requests, with the `anthropic-beta: oauth-2025-04-20` header. `OPENAI_OAUTH_TOKEN` still works as a fallback if no Claude token is set.

The packaged starter runs the local bot server if needed, starts the WhatsApp Web bridge in `screen`, and writes logs under `whatsapp-web-test-bridge/logs/`. See [`whatsapp-web-test-bridge/README.md`](whatsapp-web-test-bridge/README.md) for setup, safety switches, and troubleshooting.

Example:

```bash
node - <<'NODE'
const { createPipeline } = require("./end-to-end pipeline ver 1.0/src/pipeline");

(async () => {
  const pipeline = createPipeline({
    llmAdapter: async (prompt, context) => {
      if (context.decision.action === "handoff") {
        return { text: "【員工交接】\n意圖：" + context.intent.primaryIntent + "\n建議下一步：由同事跟進。" };
      }
      return { text: context.knowledge.bestMatch?.answer || "請問你想了解邊方面？" };
    }
  });

  const result = await pipeline.runMessage({
    channel: "website",
    businessId: "restaurant_demo",
    sessionId: "local-demo-001",
    text: "你哋幾點開門？"
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

Expected result:

```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "intent": "hours_location",
  "safety": "pass",
  "replyText": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。"
}
```

## Test Commands

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

## Side-by-side Reports

Each module with a report has:

```bash
node "<module>/scripts/writeSideBySideResults.js"
```

The generated markdown report lives at the module root.

## Demo Businesses

| businessId | Archetype |
|---|---|
| `beauty_demo` | beauty clinic |
| `restaurant_demo` | restaurant |
| `igshop_demo` | Instagram shop |
| `edu_demo` | education centre |

## Important Constraints

- Privacy gateway runs before any LLM call.
- Business policy lives in typed JS rules, not only prompts.
- Google Drive promotion expiry is checked using `Asia/Hong_Kong` / UTC+8 only.
- `auto_send` must quote approved KB text exactly.
- Staff review is required for pricing, backend-bound actions, handoff, safety violations, and privacy blocks.
- Current channel/server/backend/staff inbox pieces are local skeletons, not production integrations.

See [HANDOFF.md](HANDOFF.md) for detailed session notes and known limitations.
