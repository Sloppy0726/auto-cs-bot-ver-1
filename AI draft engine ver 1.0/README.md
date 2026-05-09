# AI Draft Engine ver 1.0

Grounded draft generator for the Hong Kong AI Customer Support SaaS.

The draft engine sits after the business rules module. It consumes the typed decision contract and produces either a customer reply candidate, a clarification, a staff-only handoff summary, or a quarantine result. It does not make policy decisions; it only obeys the decision it receives.

## Why this matters for HK SMEs

| Competitor pattern | What goes wrong for HK SMEs | Draft Engine v1.0 answer |
|---|---|---|
| Raw LLM replies directly to customers | Model invents prices, confirms slots, or gives risky advice | `auto_send` quotes the approved KB answer verbatim; risky branches go to staff |
| Policy hidden inside a prompt | One jailbreak or model drift can override policy | The prompt is built from `allowedCapabilities` and `forbiddenCapabilities` from typed JS rules |
| Human handoff with no context | Staff wastes time reconstructing the issue | `handoff` creates a staff-facing Cantonese summary, never a customer reply |
| Online-only test flow | Tests become slow, flaky, and costly | Default LLM adapter is an offline stub; real Anthropic adapter is injected |

Pillars covered: **#5 AI draft engine**, partial **#6 safety contract**, partial **#9 model router seed**.

## Folder layout

```
AI draft engine ver 1.0/
├── src/draftEngine.js              # generateDraft({ decision, knowledge, intent, gateway }, options)
├── src/anthropicAdapter.js         # optional real adapter, reads ANTHROPIC_API_KEY
├── test/draftEngine.cases.js
├── test/draftEngine.test.js
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
| `staff_review` | Calls the injected LLM adapter with a sandwich prompt: capabilities, forbidden list, approved KB source, tone, customer context, final self-check. Produces 1-2 Cantonese draft candidates for staff review only. |
| `clarify` | Returns `decision.clarificationText` verbatim. No LLM call. |
| `handoff` | Calls the injected LLM adapter with a strict staff-only prompt and returns a Cantonese internal summary. |
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

`src/anthropicAdapter.js` reads `ANTHROPIC_API_KEY` from the environment. It chooses:

| Case | Model |
|---|---|
| simple draft work | `claude-haiku-4-5-20251001` |
| handoff, high-risk, complaint, sensitive, child, payment/order/reschedule | `claude-sonnet-4-6` |

The adapter sets `cache_control` on the system message because the capability/tone policy repeats heavily across tenant traffic.

## Promotion Context

When the pipeline provides `promotions`, the staff-review and handoff prompts include active time-bound promotions that were checked in Hong Kong time. The draft engine treats them as approved contextual facts, but still does not auto-send pricing or treatment claims for conservative archetypes such as `beauty_clinic`.

## Integration

```
privacy gateway -> intent classifier -> knowledge base -> business rules -> AI draft engine -> [safety checker v1.0]
                                                        |
                                                        +-> staff inbox / handoff
```

The draft engine only consumes sanitized text from the gateway. It never receives raw customer text.

## HK-specific guards

1. **Approved-only facts** - staff-review prompts name the approved KB answer as the only factual source.
2. **No direct confirmation** - generated text is withheld if it appears to confirm bookings, refunds, payments, shipments, delivery ETAs, medical advice, or treatment results when those capabilities are forbidden.
3. **Staff-only handoff** - handoff prompts explicitly forbid customer-facing replies and ask for an internal Cantonese summary.
4. **Offline by default** - tests and side-by-side reports do not call a paid model.
5. **Tone follows archetype** - `luxury_beauty`, `friendly_local`, `casual_ig`, `education`, and `polite_professional` are inherited from the rules decision.

## Run

```bash
node "AI draft engine ver 1.0/test/draftEngine.test.js"
node "AI draft engine ver 1.0/scripts/writeSideBySideResults.js"
```

## Roadmap

- v1.1: structured draft output with separate `drafts[]`, `warnings[]`, and `citations[]`.
- v1.2: tenant-specific prompt templates and tone overrides.
- v1.3: richer model-router handoff to choose model by cost, latency, language, and escalation risk.
- v2.0: use Safety Checker v1.0 as a required post-generation gate before any staff inbox or auto-send path.
