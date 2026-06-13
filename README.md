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
  -> canto sentiment          (鬧爆 / review-threat ladder)
  -> intent classifier
  -> package ops context
  -> knowledge base
  -> hk calendar              (年初二 / 中秋 / 平安夜 date resolution)
  -> promotion sync context
  -> weather policy           (打風自動制: T8 / black-rain mode)
  -> regulars ledger          (熟客「照舊」rebooking for missing-detail bookings)
  -> business rules
  -> private business backend mock
  -> model router
  -> deposit ledger           (FPS/PayMe 留位收訂 + 過數對數)
  -> AI draft engine
  -> safety checker
  -> send reply or staff inbox
  -> action journal           (tamper-evident record; powers 套票 receipts)
```

Owner/staff fast-paths: `核銷 <customer> <service>` redeems a prepaid session and WhatsApps the customer a receipt.

All modules run on the Node.js stdlib; **68 test files** pass with `npm test`.

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
| 18 | `action journal ver 1.0` | Tamper-evident SHA-256 hash-chained record of every turn, with a verifier that **replays the deterministic policy gate** to prove each decision reproduces. Privacy-minimised; opt-in. |
| 19 | `hk calendar ver 1.0` | Resolves how HK customers name dates — `年初二`, `中秋翌日`, `平安夜`, `冬至` — from a gazette-sourced table, 100% reliable where prompt-based bots guess. |
| 20 | `canto sentiment ver 1.0` | Cantonese anger lexicon + Hong Kong review-pile-on threat detection (`上OpenRice俾你一星`), forcing handoff and suppressing promos. |
| 21 | `weather policy ver 1.0` | 打風自動制 — HKO T8 / black-rainstorm signals flip the bot into closure mode with auto deposit-waiver, fully deterministic. |
| 22 | `deposit ledger ver 1.0` | FPS/PayMe 留位收訂: issues a DEP code, reconciles `過咗數 DEP-7K3Q` to the booking, one-tap staff verify — the bot never confirms money. |
| 23 | `package redemption ledger ver 1.0` | 套票核銷: append-only hash-chained session ledger; `核銷` decrements and WhatsApps the customer a receipt + Small-Claims-ready statement. |
| 24 | `regulars ledger ver 1.0` | 熟客 modal-pattern memory; a regular's vague booking gets a `照舊星期二 下午3點、4位？` confirm — derived stats only, no LLM, PDPO-bounded. |
| 25 | `reconciliation-of-record ver 1.0` | 假過數對數閘: assesses a deposit claim's amount+reference before any ack; mismatch/reused/expired/unknown → staff, logged for a 「閘咗 $X 可疑過數」 number. |
| 26 | `winback ver 1.0` | 搵錢實證: surfaces expiring/lapsed prepaid value (recoverable HK$), staff-approved nudges, hash-chained recovered-$ attribution. |
| 27 | `owner reads ver 1.0` | 一句搞掂: owner texts 「今日收咗幾多訂 / 邊個套票就到期 / 流失幾多 / 閘咗幾多假過數」 → deterministic cross-ledger answer. |
| 28 | `ird ledger ver 1.0` | IRO s.51C projector: folds ledgers into a tamper-evident, exportable books extract (evidentiary, honestly "records the bot emitted"). |
| 29 | `owner digest ver 1.0` | 每朝一覽: one bilingual morning brief (deposits/packages/weather/holiday/risk), only non-empty lines, once-per-day. |

## Inevitability layer (makes adoption hard to leave)

A second wave, researched specifically for **lock-in** for the deposit-heavy ICP (salon / tutor / beauty / fitness / clinic taking 訂金 over WhatsApp). The honest moat is **not** "all their money lives here" (walk-in cash/card never enter) — it is the accreted hash-chained deposit/redemption history + dispute-grade evidence + the daily habit of operating through the console; leaving means re-keying months of money-state and losing the loss-prevention/recovered-$ figures.

- **假過數對數閘 (A)** — fraud gate: a fake/mismatched/reused 過數 claim is flagged before any acknowledgement; monthly 「閘咗 $X」 loss-prevention number.
- **搵錢實證 (C)** — reframes the bot as a profit centre: recoverable expiring/lapsed value + a hash-chained recovered-HK$ ledger (the month-1-dollar that stops month-2 churn).
- **一句搞掂 (B)** — operate the shop through one WhatsApp line; the daily-habit surface over A/C/D.
- **IRO s.51C 帳簿 (D)** — tamper-evident, exportable record of the bot-mediated revenue (evidentiary, not a compliance funnel — never overclaimed).
- **每朝一覽 (E)** — the morning-brief spine that surfaces A/C/D daily and forms the habit.

Deliberately **rejected** after adversarial review (see HANDOFF §29): pending-cooling-off-law compliance clocks, cross-shop fraud/benchmark networks (cold-start), FPS-QR/cross-rail reconciliation (needs a real bank feed), and a standalone PDPO consent vault.

## What makes this build different

Deterministic differentiators no English-first / prompt-first competitor (Intercom Fin, Zendesk AI, Sierra, Decagon, SleekFlow, Omnichat, Tidio, Bistrochat, Fresha) ships — each impossible to copy without rearchitecting away from LLM tool-calling.

**Money & operations (the SME 剛需):**
- **No-show deposits done the HK way.** `deposit ledger` issues an FPS/PayMe code, reconciles the customer's `過咗數 DEP-7K3Q` to the held booking, and hands staff a one-tap verify — the bot **never** confirms money. Card-rail competitors can't reconcile a WhatsApp FPS screenshot.
- **套票核銷 that ends disputes.** `package redemption ledger` folds an append-only, hash-chained event log into a balance and WhatsApps the customer a receipt after every visit (HK's #1 Consumer Council complaint category). Exportable as a Small-Claims statement; history is never edited.
- **熟客 memory without an LLM.** `regulars ledger` mines modal booking patterns to offer `照舊…？`, sender-bound and PDPO-bounded — privacy-safe memory enterprise-only competitors charge for.

**Hong Kong-native intelligence:**
- **打風自動制.** `weather policy` turns HKO T8 / black-rain signals into an automatic closure + deposit-waiver state machine. The sweep confirmed **zero** competitors offer any HKO-signal workflow.
- **農曆 time.** `hk calendar` resolves `年初二 / 中秋翌日 / 平安夜` deterministically where competitors hand dates to an LLM that fumbles them.
- **Cantonese escalation.** `canto sentiment` detects 粗口 and the distinctly HK review-pile-on threat (`上OpenRice俾你一星`), then suppresses promotions to a furious customer.

**Trust tech:** the `action journal` hash-chains turns and can *re-run the deterministic policy gate to prove a decision reproduces* — the same tamper-evident primitive that powers the 套票 receipts and statements. (Best value as a SaaS/compliance artifact rather than for single-shop self-use.)

Every feature is **default-safe** (off / no-op until configured) and **stdlib-only**, preserving the privacy-before-LLM and safety-before-send ordering.

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
- `auto_send` must quote approved KB text exactly.
- Staff review is required for pricing, backend-bound actions, handoff, safety violations, and privacy blocks.
- Current channel/server/backend/staff inbox pieces are local skeletons, not production integrations.

See [HANDOFF.md](HANDOFF.md) for detailed session notes and known limitations.
