# Business Rules ver 1.0

Deterministic policy gate. Sits between the knowledge base and the AI draft engine. **No LLM. No I/O.** Pure JS rules running on the output of the upstream modules.

## Why this matters for locale SMEs

| Competitor pattern | Failure mode | Our answer |
|---|---|---|
| Intercom Fin / SleekFlow AI agent — policy lives in the prompt | One model upgrade or one prompt-injection and "do not confirm bookings" gets ignored | Policy lives in **typed JS rules**. The LLM is sandwiched: rules decide *what is allowed* before generation, safety checker re-validates after. |
| Tidio FAQ bot — auto-replies anything that vaguely matches | Wrong price quoted, customer screenshots it on Threads | Six-tier rule order. `auto_send` requires score ≥ 0.7 AND confidence ≥ 0.7 AND no risk AND archetype opt-in AND no number-promise trip. Default is `staff_review`, never silent auto-send. |
| Gorgias macros — hard-coded replies, no policy awareness | Misses locale-specific guards (deposit, no-medical-claim, refund decisions) | `policyRef` + archetype `policies` derive `forbiddenCapabilities` per message. |

Pillars covered: **#4 Business rules engine**, partial **#6 (capability contract → safety checker)**, partial **#10 (angry-tone bump, ask-staff-before-promise mode, deposit/refund guards)**.

## Folder layout

```
business rules ver 1.0/
├── src/businessRules.js      # evaluate({ gateway, intent, knowledge, businessConfig }) → decision
├── src/archetypes.js         # 5 locale SME archetype defaults + getConfig(businessId)
├── test/businessRules.cases.js
├── test/businessRules.test.js
├── scripts/writeSideBySideResults.js
└── README.md
```

## Five output actions (the only verbs)

| Action | Meaning |
|---|---|
| `auto_send` | Approved KB hit, all guards pass — pipeline can send to customer immediately |
| `staff_review` | Generate the draft, route to staff inbox for approve/edit/reject |
| `clarify` | Don't generate a free-form reply; ask one templated clarification question |
| `handoff` | Mandatory human takeover, never goes through the LLM |
| `block` | Privacy gateway blocked — never touches the LLM, raw quarantined for staff |

## Six-tier rule order (first match wins)

1. **Hard block** — gateway `block_and_handoff` or `shouldCallLLM=false`.
2. **Mandatory handoff** — KB handoff, intent ∈ {complaint, sensitive_health, child_data, human_request}, angry/refund pattern in text, or gateway high-risk.
3. **Clarify** — KB gap on a non-`general` intent, or intent confidence < 0.5.
4. **Forced review** — `backendBound`, sensitive `policyRef` matched on the business config, gateway `review_before_llm`, or archetype `reviewIntents` lists this intent.
5. **Auto-send** — score ≥ 0.7, confidence ≥ 0.7, low risk, intent in `autoSendIntents`, AND if `askStaffBeforePromise` is on, no `$`/digit in the answer.
6. **Default** — `staff_review`. Conservative by design.

## Capability contract (the real differentiator)

Every decision returns:

```js
allowedCapabilities: ["quote_kb_verbatim", "cite_entry:beauty_pricing_facial",
                      "ask_one_clarifying_question", "use_tone:luxury_beauty"],
forbiddenCapabilities: ["invent_prices", "give_medical_advice",
                        "promise_treatment_result", "decide_refund",
                        "confirm_booking", "leak_pii", "give_legal_advice", ...]
```

`forbiddenCapabilities` is derived from:
- `ALWAYS_FORBIDDEN` — invent_prices, leak_pii, give_legal_advice, give_financial_advice, invent_business_facts
- intent table — booking → confirm_booking, payment → decide_refund, etc.
- policy table — `no_medical_claim` → give_medical_advice, promise_treatment_result, diagnose
- backend-bound flag — booking/order/payment intents lose all `confirm_*` capabilities

The Safety Checker (next module) will re-validate the LLM draft against this contract.

## Archetype configs (`src/archetypes.js`)

| Archetype | Auto-send intents | Review intents | Policies | Ask-staff-before-promise |
|---|---|---|---|---|
| `beauty_clinic` | hours_location | pricing, service_info, aftercare | no_medical_claim, deposit_required, no_refund_decision | **yes** |
| `restaurant` | hours_location, service_info | pricing | no_refund_decision | no |
| `ig_shop` | service_info, hours_location | pricing, order_status | no_refund_decision | no |
| `education` | hours_location | pricing, service_info | no_refund_decision | **yes** |
| `general_sme` | hours_location | pricing, service_info | — | **yes** |

Override per business via `getConfig(businessId, overrides)` or by passing `businessConfig` directly into `evaluate()`.

## Main API

```js
const { evaluate } = require("./src/businessRules");
const { getConfig } = require("./src/archetypes");

const decision = evaluate({
  gateway,            // output of routeMessage()
  intent,             // output of classifyIntent(gateway)
  knowledge,          // output of kb.lookup({ businessId, sanitizedText, intent })
  businessConfig: getConfig("beauty_demo")   // optional; defaults are auto-loaded
});

// decision = {
//   action: "staff_review",
//   reason: "Policy or backend dependency requires staff review before sending.",
//   escalationLabel: null,
//   suggestedTone: "luxury_beauty",
//   businessId: "beauty_demo",
//   archetype: "beauty_clinic",
//   allowedCapabilities: [...],
//   forbiddenCapabilities: [...],
//   grounding: ["beauty_booking_policy"],
//   clarificationText: null,
//   staffPacket: { ... },
//   reasons: ["knowledge.backendBound=true", "policyRef=deposit_required"]
// }
```

## How it connects

```
gateway ─► intent ─► knowledge base ─► business rules ─► [AI draft engine v1.0]
                                            │
                                            └─► staffPacket ─► [staff inbox v1.0]
```

The decision object is the **single source of truth** that the AI draft engine and the staff inbox consume. The draft engine reads `allowedCapabilities`/`forbiddenCapabilities` to constrain its prompt. The staff inbox reads `staffPacket` to render the review card.

## locale-specific guards baked in

- **Angry-tone bump** — `搞錯|嬲|不滿|退錢|退款|chargeback|refund|complaint|angry|furious` in the message → forces `handoff` with `escalationLabel: "angry_customer"`, even if KB has a clean match.
- **Ask-staff-before-promise mode** — when archetype enables it, any `$` or digit in the answer downgrades `auto_send` → `staff_review`. Keeps clinic/education businesses from auto-quoting prices.
- **Backend-bound is non-negotiable** — booking/reschedule/order_status/payment intents *cannot* `auto_send`. Hard-coded.
- **Defence in depth** — KB already hands off complaint/medical/child; rules engine re-checks. Gateway already blocks credit cards; rules engine re-checks. Two independent layers, both deterministic.

## Run

```bash
node "business rules ver 1.0/test/businessRules.test.js"
node "business rules ver 1.0/scripts/writeSideBySideResults.js"
```

## Roadmap

- v1.1: customer-history flags (returning vs first-time), public holiday awareness.
- v1.2: per-business owner-overridable JSON rules (`overridePolicies`, `overrideAutoSendIntents`) loaded from DB.
- v1.3: FAQ-gap counters fed back to the boss dashboard.
- v2.0: multi-brand routing — `getConfig({ tenantId, brandId })`.
