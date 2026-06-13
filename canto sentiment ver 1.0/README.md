# Canto Sentiment ver 1.0

A deterministic Cantonese **anger ladder** and **review-threat detector**. No LLM.

## Why this is unique

Sentiment escalation on the market is English-keyword or enterprise-only confidence triggers. Two things no competitor ships:

1. **A Cantonese-native anger lexicon** — 粗口 / 連登-style insults with romanised and leet variants (`on9`, `仆街`, `黐線`, `收皮`, `揾笨`), tiered by severity.
2. **Review-pile-on threat detection** — the distinctly Hong Kong move of threatening to post (`上OpenRice俾你一星`, `出po去Threads`, `投訴去消委會搵記者`). This signal is unreachable via any API, so catching it *in chat* is the only possible defence.

Pairing anger with **promotion suppression** is a deterministic guardrail prompt-based competitors cannot guarantee: never dangle a discount at a furious customer.

## Behaviour

`scoreAnger(sanitizedText, history)` returns:

| field | meaning |
|---|---|
| `severity` | 0 calm · 1 impatient · 2 angry · 3 profanity |
| `escalate` | `severity >= 2` or a review threat → force handoff |
| `suppressPromo` | `severity >= 1` or a threat → drop promotions from the reply |
| `reputationThreat` | a post-target **and** a post-action both present |
| `label` | `reputation_risk` › `angry_customer` › `null` |
| `velocity` | repeated unanswered question / message burst from prior turns |

It runs on **sanitized text only** (never raw PII), after the privacy gateway. The result feeds the business-rules gate (`severity >= 2` or a threat forces `handoff` with the matching `escalationLabel`) and the pipeline drops promotions from the customer-facing draft when `suppressPromo`. Both are opt-in inputs — `evaluate()` with no `sentiment` behaves exactly as before.

## Tests

```bash
node "canto sentiment ver 1.0/test/cantoSentiment.test.js"
```

Covers all four severity tiers, romanised profanity, review-threat target+action co-occurrence (and the no-false-positive case where only a target appears), authority-escalation threats, velocity (repeat / burst, ignoring outgoing messages), threat-label precedence over generic anger, and nullish-input safety.
