# Chinese-Language Customer Support Guardrails

Privacy-first Traditional Chinese / English AI customer-support safety framework for SMEs.

This repo provides a local, dependency-light reference workflow for building AI-assisted customer-support replies without sending raw private customer messages directly to an LLM. It combines deterministic privacy filtering, approved-knowledge grounding, business-rule checks, model routing, safety review, and staff handoff before any AI-generated text can reach a customer.

## Current status

Local v1.0 workflow skeleton is complete:

```text
customer channel
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

Current test total: **1980 passing**.

No npm dependencies are required. Everything is plain Node.js stdlib.

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
| 3 | `intent classifier ver 1.0` | Classifies Traditional Chinese / English / mixed enquiries into stable intents. |
| 4 | `package ops ver 1.0` | Sender-bound prepaid package/session lookup for package status replies. |
| 5 | `knowledge base ver 1.0` | Approved-only business answers and grounding IDs. |
| 6 | `business rules ver 1.0` | Deterministic policy gate and capability contract. |
| 7 | `google drive promo sync ver 1.0` | Daily promotion sync with UTC+8 locale expiry checks. |
| 8 | `AI draft engine ver 1.0` | Produces grounded drafts or staff-only summaries. |
| 9 | `safety checker ver 1.0` | Re-validates drafts before anything can be sent. |
| 10 | `channel adapter ver 1.0` | Normalizes WhatsApp / IG / FB / website payloads and builds outbound payloads. |
| 11 | `model router ver 1.0` | Chooses no-LLM / small model / larger model by action and risk. |
| 12 | `private business backend mock ver 1.0` | Mock booking, order, stock, and payment facts. |
| 13 | `staff inbox ver 1.0` | In-memory review / handoff queue. |
| 14 | `end-to-end pipeline ver 1.0` | Orchestrates the whole local workflow. |
| 15 | `usage tracker ver 0.1` | Estimates and records token usage per chat turn. |
| 16 | `whatsapp web automation prototype ver 0.1` | Local browser-automation prototype for internal demos. |

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
- `WA_LLM_ADAPTER=claude` for local OAuth-based Claude smoke testing.
- `CODEX_LLM_AUTH_MODE=oauth` with a local Codex CLI session for Codex adapter smoke testing.

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
npm test
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
- `auto_send` must quote approved KB text exactly.
- Staff review is required for pricing, backend-bound actions, handoff, safety violations, and privacy blocks.
- Current channel/server/backend/staff inbox pieces are local skeletons, not production integrations.

See [HANDOFF.md](HANDOFF.md) for detailed session notes and known limitations.
