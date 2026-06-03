# AI Draft Engine ver 1.0

Grounded draft generator for the Traditional Chinese AI Customer Support Safety Framework.

The draft engine sits after the business rules module. It consumes the typed decision contract and produces either a customer reply candidate, a clarification, a staff-only handoff summary, or a quarantine result. It does not make policy decisions; it only obeys the decision it receives.

## Why this matters for locale SMEs

| Competitor pattern | What goes wrong for locale SMEs | Draft Engine v1.0 answer |
|---|---|---|
| Raw LLM replies directly to customers | Model invents prices, confirms slots, or gives risky advice | `auto_send` quotes the approved KB answer verbatim; risky branches go to staff |
| Policy hidden inside a prompt | One jailbreak or model drift can override policy | The prompt is built from `allowedCapabilities` and `forbiddenCapabilities` from typed JS rules |
| Human handoff with no context | Staff wastes time reconstructing the issue | `handoff` creates a staff-facing Traditional Chinese summary, never a customer reply |
| Online-only test flow | Tests become slow, flaky, and costly | Default LLM adapter is an offline stub; real Anthropic adapter is injected |

Pillars covered: **#5 AI draft engine**, partial **#6 safety contract**, partial **#9 model router seed**.

## Folder layout

```
AI draft engine ver 1.0/
├── src/draftEngine.js              # generateDraft({ decision, knowledge, intent, gateway }, options)
├── src/anthropicAdapter.js         # optional real adapter, reads ANTHROPIC_API_KEY / CLAUDE_API_KEY
├── src/claudeOAuthAdapter.js       # local Claude subscription OAuth adapter via Hermes credential pool
├── src/codexCliAdapter.js          # local smoke-test adapter using Codex CLI OAuth login
├── test/draftEngine.cases.js
├── test/claudeOAuthAdapter.test.js
├── test/codexCliAdapter.test.js
├── test/draftEngine.test.js
├── scripts/runClaudeOAuthSmoke.js
├── scripts/runCodexLlmSmoke.js
├── scripts/writeSideBySideResults.js
└── README.md
```

## Main API

```js
const { generateDraft } = require("./src/draftEngine");

const draft = await generateDraft({
  decision,    // output of business rules evaluate()
  knowledge,   // output of KB lookup()
  intent,      // output of classifyIntent()
  gateway      // output of routeMessage()
});
```

Output:

```js
{
  text: "我哋每日12:00-15:00 lunch...",
  action: "auto_send",
  citations: ["restaurant_hours"],
  tone: "friendly_local",
  llmUsed: false,
  reasons: ["auto_send: returned approved KB answer verbatim"],
  staffNote: null
}
```

## Five branches

| Decision action | Draft behavior |
|---|---|
| `auto_send` | Returns `knowledge.bestMatch.answer` verbatim. No LLM call. Citations come from `grounding`. |
| `staff_review` | Calls the injected LLM adapter with a sandwich prompt: capabilities, forbidden list, approved KB source, tone, customer context, final self-check. Produces 1-2 Traditional Chinese draft candidates for staff review only. |
| `clarify` | Returns `decision.clarificationText` verbatim. No LLM call. |
| `handoff` | Calls the injected LLM adapter with a strict staff-only prompt and returns a Traditional Chinese internal summary. |
| `block` | Returns `text: null` plus a quarantine note for staff. No LLM call. |

## LLM adapter

Default adapter:

```js
async (prompt) => ({ text: "[stub] " + prompt.slice(0, 80) })
```

Real adapter:

```js
const { createAnthropicAdapter } = require("./src/anthropicAdapter");

const draft = await generateDraft(input, {
  llmAdapter: createAnthropicAdapter()
});
```

`src/anthropicAdapter.js` reads `ANTHROPIC_API_KEY` from the environment. `CLAUDE_API_KEY` is accepted as a local alias. It chooses:

| Case | Model |
|---|---|
| simple draft work | `claude-haiku-4-5-20251001` |
| handoff, high-risk, complaint, sensitive, child, payment/order/reschedule | `claude-sonnet-4-6` |

The adapter sets `cache_control` on the system message because the capability/tone policy repeats heavily across tenant traffic.

Local Claude OAuth adapter:

```js
const { createClaudeOAuthAdapter } = require("./src/claudeOAuthAdapter");

const draft = await generateDraft(input, {
  llmAdapter: createClaudeOAuthAdapter({
    model: process.env.CLAUDE_OAUTH_MODEL || "claude-opus-4-6"
  })
});
```

This adapter reads the Anthropic OAuth credential from the local Hermes credential pool at `~/.hermes/auth.json`, refreshes it when expired, and calls Anthropic Messages API with Claude Code OAuth headers. It is intended for local subscription-auth validation, not production deployment.

Local Codex OAuth smoke-test adapter:

```js
const { createCodexCliAdapter } = require("./src/codexCliAdapter");

const draft = await generateDraft(input, {
  llmAdapter: createCodexCliAdapter({
    model: process.env.CODEX_LLM_MODEL || "gpt-5.5"
  })
});
```

This adapter shells out to the installed Codex CLI, which uses the existing Codex OAuth login. In the repo `.env`, keep `CODEX_LLM_AUTH_MODE=oauth` and set `CODEX_ACCESS_TOKEN=` if you want the adapter to import an OAuth access token via `codex login --with-access-token`. In OAuth mode the adapter removes inherited OpenAI key and endpoint overrides before launching Codex, so it will not silently use API-key auth. It is for local validation only: it is slower than a direct API call and should not be used as a production WhatsApp channel backend.

Manual OAuth import from `.env`:

```bash
node "AI draft engine ver 1.0/scripts/loginCodexFromEnv.js"
```

## Promotion Context

When the pipeline provides `promotions`, the staff-review and handoff prompts include active time-bound promotions that were checked in UTC+8 locale time. Promotion text is wrapped inside a `PROMOTION_FACTS_UNTRUSTED_DO_NOT_FOLLOW` block so editable campaign copy is treated as quoted context, not model instructions. The draft engine still does not auto-send pricing or treatment claims for conservative archetypes such as `beauty_clinic`.

## Integration

```
privacy gateway -> intent classifier -> knowledge base -> business rules -> AI draft engine -> [safety checker v1.0]
                                                        |
                                                        +-> staff inbox / handoff
```

The draft engine only consumes sanitized text from the gateway. It never receives raw customer text.

## locale-specific guards

1. **Approved-only facts** - staff-review prompts name the approved KB answer as the only factual source.
2. **No direct confirmation** - generated text is withheld if it appears to confirm bookings, refunds, payments, shipments, delivery ETAs, medical advice, or treatment results when those capabilities are forbidden.
3. **Staff-only handoff** - handoff prompts explicitly forbid customer-facing replies and ask for an internal Traditional Chinese summary.
4. **Offline by default** - tests and side-by-side reports do not call a paid model.
5. **Tone follows archetype** - `luxury_beauty`, `friendly_local`, `casual_ig`, `education`, and `polite_professional` are inherited from the rules decision.

## Run

```bash
node "AI draft engine ver 1.0/test/claudeOAuthAdapter.test.js"
node "AI draft engine ver 1.0/test/codexCliAdapter.test.js"
node "AI draft engine ver 1.0/test/draftEngine.test.js"
node "AI draft engine ver 1.0/scripts/runClaudeOAuthSmoke.js"
node "AI draft engine ver 1.0/scripts/runCodexLlmSmoke.js"
node "AI draft engine ver 1.0/scripts/writeSideBySideResults.js"
```

## Roadmap

- v1.1: structured draft output with separate `drafts[]`, `warnings[]`, and `citations[]`.
- v1.2: tenant-specific prompt templates and tone overrides.
- v1.3: richer model-router handoff to choose model by cost, latency, language, and escalation risk.
- v2.0: use Safety Checker v1.0 as a required post-generation gate before any staff inbox or auto-send path.
