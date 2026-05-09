# Knowledge Base ver 1.0

Approved-answers store for the Hong Kong AI Customer Support SaaS.

The KB sits **after** the privacy gateway and intent classifier and **before** the AI draft engine. It guarantees that every reply candidate the AI sees is grounded in something the business owner has explicitly approved — never invented by an LLM.

## Why this matters for HK SMEs

| Competitor pattern | What goes wrong for HK SMEs | KB v1.0 answer |
|---|---|---|
| SleekFlow / Tidio raw-LLM FAQ bots | LLM invents prices, opening hours, package details | Every match carries `approved: true`; unapproved entries are refused at index time |
| Intercom Fin "AI from help center" | LLM still chooses how to phrase policy-bound info | KB returns the approved answer **verbatim** with an `id` for citation; AI is downstream |
| Gorgias macros | Order-only; no booking/treatment/clinic awareness | `requiresBackend` flag for booking/order/payment; `policyRef` for deposit/cancellation |
| Omnichat campaign automation | Campaign-led, not enquiry-led | Intent-led: matches are scored against the classifier's `primaryIntent` first |

Pillars covered: **#3 Approved knowledge retrieval**, partial **#4 (policy refs + backend flag)**, **#10 (FAQ gap detection via `gap: true`)**.

## Folder layout

```
knowledge base ver 1.0/
├── src/knowledgeBase.js             # createKnowledgeBase({ entries }) → { lookup, listEntries, has }
├── seed/hkSmeSeed.js                # Beauty / restaurant / IG shop / education sample entries
├── test/knowledgeBase.cases.js      # Standard test cases
├── test/knowledgeBase.test.js       # Runner using node:assert/strict
├── scripts/writeSideBySideResults.js
└── README.md
```

## Main API

```js
const { createKnowledgeBase } = require("./src/knowledgeBase");
const seed = require("./seed/hkSmeSeed");

const kb = createKnowledgeBase({ entries: seed });
```

### `kb.lookup(input)`

**Input shape:**
```js
{
  businessId: "beauty_demo",
  sanitizedText: "做完會唔會即刻見效？幾錢？",
  intent: { /* output of classifyIntent() */ }
}
```

**Output shape:**
```js
{
  businessId: "beauty_demo",
  primaryIntent: "pricing",
  language: "zh-HK",
  matches: [
    {
      id: "beauty_pricing_facial",
      intent: "pricing",
      question: "面部護理價錢 / facial pricing",
      answer: "基礎面部護理單次 HK$680...",
      score: 0.95,
      tone: "luxury_beauty",
      requiresBackend: false,
      policyRef: null,
      approved: true
    }
  ],
  bestMatch: { /* matches[0] */ },
  grounding: ["beauty_pricing_facial"],
  gap: false,
  handoff: false,            // true for complaint / sensitive_health / child_data / human_request
  handoffReason: null,
  backendBound: false,       // true for booking / reschedule / order_status / payment intents
  suggestedClarification: null,
  reasons: ["Matched entry beauty_pricing_facial (score 0.95)"]
}
```

### Approved-entry shape

```js
{
  id: "beauty_pricing_facial",
  businessId: "beauty_demo",
  intent: "pricing",                 // must align with the intent classifier's vocabulary
  question: "facial pricing",
  keywords: ["facial", "面部", "幾錢"],
  tone: "luxury_beauty",             // see tone profiles below
  requiresBackend: false,            // true → AI must NOT promise without backend confirm
  policyRef: "no_medical_claim",     // optional pointer the rules engine can enforce
  approved: true,                    // mandatory; falsy entries are dropped at index
  answers: { "zh-HK": "...", en: "...", mixed: "..." }
}
```

### Tone profiles (used by the AI draft engine downstream)

`polite_professional` · `friendly_local` · `luxury_beauty` · `casual_ig` · `education` · `restaurant`

## How it connects to the existing modules

```
raw customer text
   │
   ▼
privacy filter v1.0 ──► privacy gateway v1.0  (sanitizedText, route, findings)
                             │
                             ▼
                    intent classifier v1.0    (primaryIntent, confidence, language)
                             │
                             ▼
                    knowledge base v1.0       ← THIS MODULE
                             │
                             ▼
                    [AI draft engine v1.0]    (grounded reply, never invents)
```

The KB **never sees raw text** — it only consumes `sanitizedText` from the gateway plus the intent result. Defence in depth.

## Hard rules baked in

1. `complaint`, `sensitive_health`, `child_data`, `human_request` always return `handoff: true` regardless of KB content.
2. `booking`, `reschedule`, `order_status`, `payment` always return `backendBound: true` so the draft engine knows it cannot confirm anything without the private business backend.
3. Entries with `approved !== true` are silently dropped at index time. The KB cannot serve unapproved content even by accident.
4. No match → `gap: true` plus a Cantonese/English clarification question. This `gap` signal is what feeds the FAQ-gap dashboard (pillar #10).

## Run

```bash
# Tests
node "knowledge base ver 1.0/test/knowledgeBase.test.js"

# Side-by-side comparison
node "knowledge base ver 1.0/scripts/writeSideBySideResults.js"
```

## Example: the use cases from the brief

| Customer message | businessId | bestMatch.id | handoff? | backendBound? |
|---|---|---|---|---|
| "做完會唔會即刻見效？幾錢？有冇副作用？" | `beauty_demo` | `beauty_pricing_facial` | no | no |
| "今晚8點有冇位？可唔可以改期？" | `restaurant_demo` | `restaurant_booking` | no | **yes** |
| "呢件有冇現貨？包唔包順豐？" | `igshop_demo` | `igshop_stock` / `igshop_shipping` | no | no |
| "我個小朋友P3，英文好差，有咩班？" | `edu_demo` | `edu_p3_english` | no | no |
| "我想claim錢，要畀咩資料？" | any | (none) | **yes** | — |
| "你哋搞錯我個booking，我要退錢。" | any | (none) | **yes** | — |

## Roadmap (future versions)

- v1.1: per-entry analytics (hit count, last used) for boss dashboard.
- v1.2: vector / embedding fallback for fuzzy intent edges (`general` bucket).
- v1.3: HK opening-hours / public-holiday awareness inside the answer.
- v2.0: multi-brand support — `businessId` becomes `{ tenantId, brandId }` so one owner can run several IG / FB pages.
