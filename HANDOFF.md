# HANDOFF — Traditional Chinese AI Customer Support Safety Framework

**For the next agent (Codex / Claude / human reviewer).** Read this top-to-bottom before touching code. Self-contained: assume you have no memory of the previous session.

---

## 0. Where everything lives

- **Local working copy:** `/Users/book/Documents/SME/auto-cs-bot-ver-1/`
- **Remote:** https://github.com/Sloppy0726/auto-cs-bot-ver-1
- **Runtime:** Node.js v26 installed via Homebrew (`/opt/homebrew/bin/node`). Zero npm deps — pure stdlib.
- **Local copy is NOT yet pushed.** Two new module folders exist locally only: `knowledge base ver 1.0/` and `business rules ver 1.0/`. Review before pushing.

```bash
cd "/Users/book/Documents/SME/auto-cs-bot-ver-1"
git status   # will show the two new folders as untracked
```

---

## 1. Product positioning (don't lose this)

Privacy-first **Traditional Chinese AI receptionist** for locale SMEs (beauty / clinic / restaurant / IG shop / education). Differentiated from SleekFlow / Omnichat / Gorgias / Intercom Fin / Tidio by:

1. Privacy gateway runs **before** any LLM call — raw PII never reaches the model.
2. Policy lives in **typed JS rules**, not in the prompt — LLM can't override it.
3. Approved-only knowledge — LLM cannot invent prices, slots, or claims.
4. Conservative-by-default — `auto_send` requires every guard to pass; default is `staff_review`.

---

## 2. Architecture (current state)

```
customer message
   │
   ▼
[privacy filter v1.0]      ✅ existing  — regex PII redaction, Luhn-checked CC, HKID, locale phone, etc.
   │
   ▼
[privacy gateway v1.0]     ✅ existing  — emits send_to_llm | review_before_llm | block_and_handoff
   │
   ▼
[intent classifier v1.0]   ✅ existing  — 13 intents, deterministic regex + optional LLM fallback
   │
   ▼
[knowledge base v1.0]      ✅ NEW (this session)  — approved-answers store + intent-led scoring
   │
   ▼
[business rules v1.0]      ✅ NEW (this session)  — 6-tier policy gate + capability contract
   │
   ▼
[AI draft engine v1.0]     ❌ NEXT — consumes the rules decision, produces Traditional Chinese reply / handoff summary
   │
   ▼
[safety checker v1.0]      ❌ pending — re-validates draft against forbiddenCapabilities
   │
   ▼
[staff inbox / handoff]    ❌ pending
[channel adapter]          ❌ pending — WhatsApp / IG / FB / website webhooks
[model router]             ❌ pending — Anthropic primary, fallback / cost optimisation
[private business backend mock] ❌ pending — booking / order / stock lookups
[end-to-end pipeline]      ❌ pending — orchestrates all of the above
```

---

## 3. Test status — all green as of session end

```
privacy filter      : 500 tests passed
privacy gateway     : 205 tests passed
intent classifier   : 103 tests passed
knowledge base      :  12 tests passed   ← NEW
business rules      :  13 tests passed   ← NEW
────────────────────────────────────────
total               : 833 tests passed
```

Run them all:

```bash
cd "/Users/book/Documents/SME/auto-cs-bot-ver-1"
node "privacy filter ver 1.0/test/privacyFilter.test.js"
node "privacy gateway ver 1.0/test/privacyGateway.test.js"
node "intent classifier ver 1.0/test/intentClassifier.test.js"
node "knowledge base ver 1.0/test/knowledgeBase.test.js"
node "business rules ver 1.0/test/businessRules.test.js"
```

Side-by-side reports (auto-generated markdown tables for human review):

```bash
node "knowledge base ver 1.0/scripts/writeSideBySideResults.js"
node "business rules ver 1.0/scripts/writeSideBySideResults.js"
```

---

## 4. What this session built (full inventory)

### Knowledge Base v1.0

- `knowledge base ver 1.0/src/knowledgeBase.js` — `createKnowledgeBase({entries})` → `{lookup, listEntries, has}`. Drops unapproved entries at index time. Intent boost (0.6 if intent matches) + keyword scoring (`hits * 0.4`, capped 0.6). Substring sweep against lowercased original text for CJK keywords like 現貨/順豐. Returns `{matches, bestMatch, grounding, gap, handoff, backendBound, suggestedClarification, reasons}`.
- `knowledge base ver 1.0/seed/hkSmeSeed.js` — 10 approved entries across `beauty_demo`, `restaurant_demo`, `igshop_demo`, `edu_demo`. Each entry has zh-locale / en / mixed answers and tone metadata.
- `knowledge base ver 1.0/test/{knowledgeBase.cases.js,knowledgeBase.test.js}` — 10 standard cases + 2 invariant checks. Covers all brief examples.
- `knowledge base ver 1.0/scripts/writeSideBySideResults.js` — pipeline-wide markdown report writer.
- `knowledge base ver 1.0/README.md` — full API spec + integration diagram.
- **Hard rules baked in:** `complaint`, `sensitive_health`, `child_data`, `human_request` always force `handoff: true`; `booking`, `reschedule`, `order_status`, `payment` always force `backendBound: true`.

### Business Rules v1.0

- `business rules ver 1.0/src/businessRules.js` — `evaluate({gateway, intent, knowledge, businessConfig})`. Six-tier ladder:
  1. **Hard block** — gateway `block_and_handoff` or `shouldCallLLM=false`.
  2. **Mandatory handoff** — KB handoff, intent ∈ {complaint, sensitive_health, child_data, human_request}, angry/refund pattern in text, or gateway high-risk.
  3. **Clarify** — KB gap on non-`general` intent, or intent confidence < 0.5.
  4. **Forced review** — `backendBound`, sensitive `policyRef` matched on archetype, gateway `review_before_llm`, archetype `reviewIntents` includes intent.
  5. **Auto-send** — score ≥ 0.7, confidence ≥ 0.7, low risk, intent in `autoSendIntents`, AND if `askStaffBeforePromise` is on, no `$`/digit in answer.
  6. **Default** — `staff_review`.
- `business rules ver 1.0/src/archetypes.js` — 5 archetypes (`beauty_clinic`, `restaurant`, `ig_shop`, `education`, `general_sme`) + 4 demo `businessId` mappings + `getConfig(businessId, overrides)`.
- `business rules ver 1.0/test/{businessRules.cases.js,businessRules.test.js}` — 12 end-to-end cases (text→gateway→intent→KB→rules) + 1 synthetic + invariant checks.
- `business rules ver 1.0/scripts/writeSideBySideResults.js` + `README.md`.
- **Output shape (the contract everything downstream consumes):**

```js
{
  action: "auto_send" | "staff_review" | "clarify" | "handoff" | "block",
  reason: "...",
  escalationLabel: "complaint" | "angry_customer" | "sensitive_health" | "privacy_block" | null,
  suggestedTone: "luxury_beauty" | "friendly_local" | "casual_ig" | "education" | "polite_professional",
  businessId: "beauty_demo",
  archetype: "beauty_clinic",
  allowedCapabilities: ["quote_kb_verbatim", "cite_entry:beauty_pricing_facial", "ask_one_clarifying_question", "use_tone:luxury_beauty"],
  forbiddenCapabilities: ["invent_prices", "give_medical_advice", "promise_treatment_result",
                          "decide_refund", "confirm_booking", "leak_pii", "give_legal_advice", ...],
  grounding: ["beauty_pricing_facial"],
  clarificationText: null,            // populated only when action="clarify"
  staffPacket: { ... } | null,        // null only when action="auto_send"
  reasons: ["knowledge.backendBound=true", "policyRef=deposit_required"]
}
```

---

## 5. Repo conventions (FOLLOW EXACTLY)

These are not negotiable — every module follows this pattern:

- Folder name has spaces and version: `"<module> ver 1.0"`.
- Filename inside `src/` is camelCase: `knowledgeBase.js`, `businessRules.js`.
- Plain Node.js. **Zero npm deps.** No `package.json` at module level.
- `"use strict";` at top of every file.
- `module.exports = { mainFn, ... }`. Internal helpers under `_internal` if exposed for tests only.
- Tests use `node:assert/strict`, never a framework.
- `test/<name>.cases.js` holds case data, `test/<name>.test.js` holds the runner.
- `scripts/writeSideBySideResults.js` writes a markdown table to the module folder root.
- Per-module `README.md` with: positioning, folder layout, API shape, integration, locale-specific guards, run commands, roadmap.
- Comments: minimal. Only when the *why* is non-obvious.

---

## 6. Known quirks (NOT bugs — read before "fixing")

1. **Beauty hours → `staff_review` not `auto_send`.** The answer contains "11:00" and `beauty_clinic` has `askStaffBeforePromise: true`. By design — clinics shouldn't auto-quote anything with digits. Override per business if you really want it.
2. **IG shop 現貨/順豐 → `clarify` (not `auto_send`).** Intent classifier returns `general` with confidence 0.42 — it has no Traditional Chinese keywords for stock/shipping. The right fix is to *expand the intent classifier's `service_info` regex* with locale retail terms (現貨, 順豐, 包郵, 運費, 有冇貨). Don't fix it in the rules engine.
3. **Traditional Chinese tokenisation is naive.** KB substring-matches multi-char keywords against lowercased original text. Good enough for v1. Replace with a proper tokenizer (or embeddings) only when keyword recall actually fails in practice.
4. **`general` intent does NOT trigger `clarify` on KB gap** — by design (tier 3 only fires when intent is non-general). Otherwise greetings would always clarify.
5. **The angry-tone pattern in `businessRules.js` (`/搞錯|嬲|...|refund|complaint/i`) overlaps with the intent classifier's `complaint` regex.** This is intentional defence in depth — even if the classifier misfires, the rule catches it.

---

## 7. Next module — AI Draft Engine v1.0 (start here)

This is the next thing to build. Spec:

- **Folder:** `AI draft engine ver 1.0/`  (yes, with spaces and lowercase; match convention)
- **Main file:** `src/draftEngine.js`, exports `generateDraft({decision, knowledge, intent, gateway}, options)` returning `{text, action, citations, tone, llmUsed, reasons}`.
- **Five branches based on `decision.action`:**
  - `auto_send` → return `knowledge.bestMatch.answer` verbatim (no LLM call) plus optional tone-polish stub. Cite `grounding`.
  - `staff_review` → call LLM with a sandwich prompt: system message containing `allowedCapabilities` + `forbiddenCapabilities` + `bestMatch.answer` (as the only allowed source of facts) + tone profile. Generate 1–2 Traditional Chinese drafts.
  - `clarify` → return `decision.clarificationText` verbatim (no LLM).
  - `handoff` → produce a Traditional Chinese **staff-facing** summary (NOT customer-facing): intent, customer goal, escalation reason, what the customer is asking for, suggested next step. Can use LLM with a strict system prompt.
  - `block` → no LLM. Return `null` text plus a quarantine note for staff.
- **LLM adapter:** dependency-injected. Default is a stub `async (prompt) => ({ text: "[stub] " + prompt.slice(0,80) })` so tests stay offline. Real adapter goes in `src/anthropicAdapter.js` and reads `ANTHROPIC_API_KEY` from env. Use `claude-haiku-4-5-20251001` for cost (cheap intents) and `claude-sonnet-4-6` for complex intents — that's the seed of the model router.
- **Prompt caching:** when you wire the real adapter, set `cache_control` on the system message (it'll repeat across thousands of messages per tenant). Saves 90%+ on input tokens. See https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching.
- **Hard rule:** the draft must NEVER contain any string in `decision.forbiddenCapabilities`'s implied surface — the Safety Checker (next-next module) will re-validate, but the draft engine should already refuse to output `confirm_booking`-style language.
- **Tests:** at minimum cover all 5 action branches × multiple archetypes, plus a stub-LLM injection test.

---

## 8. Roadmap remaining (in build order)

| # | Module | Why next |
|---|---|---|
| 6 | AI Draft Engine v1.0 | Closes the loop — pipeline can produce a reply candidate |
| 7 | Safety Checker v1.0 | Re-validates LLM output against forbiddenCapabilities; catches hallucinated prices, leaked placeholders, medical/legal claims |
| 8 | Channel Adapter v1.0 | WhatsApp / IG / FB / website webhook ingress + outgress. Needed for first deployable build |
| 9 | Model Router v1.0 | Cost-aware routing: haiku for hours/info, sonnet for complaints / handoff summaries |
| 10 | Private Business Backend Mock v1.0 | Stub `checkAvailability()`, `lookupOrder()`, `getStock()`. Real backends plug in later |
| 11 | Staff Inbox / Human Handoff v1.0 | Renders the `staffPacket`. Approve / edit / reject / take over |
| 12 | End-to-end pipeline v1.0 | `runMessage(rawText, businessId, channel)` orchestrating all modules. Includes Express server + webhook routes |

---

## 9. Review checklist (please run before continuing)

- [ ] `git status` — confirm the two new folders are present and uncommitted.
- [ ] Run all 5 test commands listed in §3. All should pass (833 total).
- [ ] Open the two side-by-side `*.md` files and eyeball each row — especially escalation labels and forbidden capabilities for the beauty / clinic cases.
- [ ] Read [knowledge base ver 1.0/README.md](knowledge%20base%20ver%201.0/README.md) and [business rules ver 1.0/README.md](business%20rules%20ver%201.0/README.md) front-to-back.
- [ ] Sanity-check `src/archetypes.js` — does the boss agree with the per-archetype `autoSendIntents` / `reviewIntents` / `policies` defaults? These are conservative guesses based on the brief, not from real customer interviews.
- [ ] Decide: do you want the Anthropic API key wired in now (means real LLM calls in tests + cost), or stay offline with a stub LLM until the channel adapter is ready?

---

## 10. Questions for the boss / next reviewer

1. **API provider for the Draft Engine.** Anthropic recommended (Traditional Chinese fluency + prompt caching is best). Alternative is GPT-4 / Gemini. Need a key.
2. **Multi-tenant storage.** Right now `archetypes.js` has hardcoded `DEMO_BUSINESS_CONFIGS`. Production will need a tenants table — Postgres? SQLite for v1? File-based JSON for the very first deploy?
3. **Default tone fallbacks.** If the KB entry has no tone field, we default to `polite_professional`. The boss may want `friendly_local` instead for locale market feel — easy 1-line change in `businessRules.js → deriveCapabilities`.
4. **"Ask staff before promise" trip is currently triggered by ANY digit in the answer.** That correctly catches "$680" and "11:00–21:00", but also catches "P3" or "5G". Consider tightening to `/(\$|HK\$|%|\d{2,})/` if false-positive rate matters.
5. **Push to remote?** Local commits not yet made. Suggest one commit per module with messages `feat: knowledge base v1.0` and `feat: business rules v1.0`.

---

## 11. How to continue this work as another agent

If you are Codex / GPT-4 / Claude picking this up:

1. Read this entire file. Then read the two new READMEs and the two new `src/*.js` files.
2. Re-run all tests (§3). If anything fails, **stop** and surface the failure — do not "fix" without confirming the diagnosis with the boss first.
3. Only then start on AI Draft Engine v1.0 per §7 spec.
4. Match the conventions in §5 *exactly*. Mirroring the existing pattern is more valuable than improving it.
5. Keep this file updated — append a "Session N notes" section at the bottom with what you did, what tests you added, and any new known quirks.

---

*End of handoff. Last updated by Claude Opus 4.7, session 1.*

---

## Session 2 notes — AI Draft Engine v1.0

Built `AI draft engine ver 1.0/` as module #6 in the pipeline.

### What changed

- Added `AI draft engine ver 1.0/src/draftEngine.js`.
  - Exports `generateDraft({ decision, knowledge, intent, gateway }, options)`.
  - Handles all five `decision.action` branches:
    - `auto_send` returns the approved KB answer verbatim and never calls an LLM.
    - `staff_review` calls an injected LLM adapter with a sandwich prompt containing allowed capabilities, forbidden capabilities, the approved KB answer as the only factual source, tone profile, and a final self-check.
    - `clarify` returns `decision.clarificationText` verbatim and never calls an LLM.
    - `handoff` calls the injected LLM adapter with a strict staff-only Traditional Chinese summary prompt.
    - `block` returns `text: null` plus a quarantine note and never calls an LLM.
  - Adds a lightweight capability-surface guard that withholds generated text if it appears to violate forbidden capabilities like `confirm_booking`, `decide_refund`, `give_medical_advice`, `promise_treatment_result`, `confirm_shipment`, `confirm_payment_received`, or `leak_pii`.
- Added `AI draft engine ver 1.0/src/anthropicAdapter.js`.
  - Reads `ANTHROPIC_API_KEY` from env only when the real adapter is explicitly used.
  - Uses `claude-haiku-4-5-20251001` for simple draft work.
  - Uses `claude-sonnet-4-6` for handoff, high-risk, complaint, sensitive, child, payment/order/reschedule cases.
  - Sets `cache_control` on the system message for prompt caching.
- Added `AI draft engine ver 1.0/test/draftEngine.cases.js` and `AI draft engine ver 1.0/test/draftEngine.test.js`.
  - Covers all five action branches across restaurant, beauty, education, and privacy-block examples.
  - Covers injected stub LLM calls, default offline stub behavior, forbidden-surface withholding, and model choice.
- Added `AI draft engine ver 1.0/scripts/writeSideBySideResults.js`.
- Added `AI draft engine ver 1.0/ai-draft-engine-side-by-side-results.md`.
- Added `AI draft engine ver 1.0/README.md`.

### Test status after Session 2

All previous 833 tests still pass, plus 10 new Draft Engine tests:

```bash
node "privacy filter ver 1.0/test/privacyFilter.test.js"      # 500 passed
node "privacy gateway ver 1.0/test/privacyGateway.test.js"    # 205 passed
node "intent classifier ver 1.0/test/intentClassifier.test.js" # 103 passed
node "knowledge base ver 1.0/test/knowledgeBase.test.js"      # 12 passed
node "business rules ver 1.0/test/businessRules.test.js"      # 13 passed
node "AI draft engine ver 1.0/test/draftEngine.test.js"       # 10 passed
```

Total after Session 2: **843 tests passing**.

Side-by-side reports regenerated:

```bash
node "knowledge base ver 1.0/scripts/writeSideBySideResults.js"
node "business rules ver 1.0/scripts/writeSideBySideResults.js"
node "AI draft engine ver 1.0/scripts/writeSideBySideResults.js"
```

### Known quirks after Session 2

1. The default LLM adapter is intentionally an offline stub. It is not a quality test for Traditional Chinese copy; it exists so tests stay deterministic and free.
2. The capability-surface guard is deliberately conservative but not a full safety checker. It catches obvious forbidden language before the next module, but `Safety Checker v1.0` should still re-validate every generated draft.
3. `clarify` returns `decision.clarificationText` exactly. If upstream rules create a `clarify` decision without clarification text, this module returns `null` rather than inventing a question.
4. The report writer uses a deterministic fake adapter for staff-review/handoff rows. Real model quality should be reviewed only after `ANTHROPIC_API_KEY` is intentionally wired for a manual run.

### Next module

Build **Safety Checker v1.0** next. It should consume `{ draft, decision, knowledge, intent, gateway }`, re-check `draft.text` against `decision.forbiddenCapabilities`, verify citations/grounding, refuse leaked PII/placeholders, and emit a typed verdict such as:

```js
{
  verdict: "pass" | "revise" | "block",
  safeToSend: true,
  violations: [],
  repairedText: null,
  reasons: []
}
```

Do not wire auto-send directly to channels until Safety Checker exists.

---

## Session 3 notes — completed workflow skeleton modules 7-12

User asked to keep building the remaining boxes from the architecture diagram, step by step, instead of stopping at the AI Draft Engine. Built the remaining runnable v1.0 modules locally:

```
channel adapter
  -> privacy gateway
  -> intent classifier
  -> knowledge base
  -> business rules
  -> private backend mock
  -> model router
  -> AI draft engine
  -> safety checker
  -> outbound payload or staff inbox
```

### What changed

- Added `safety checker ver 1.0/`.
  - `src/safetyChecker.js` exports `checkDraft({ draft, decision, knowledge, intent, gateway })`.
  - Emits `{ verdict: "pass" | "revise" | "block", safeToSend, violations, repairedText, reasons }`.
  - Checks forbidden capability surfaces, exact `auto_send` KB quoting, exact `clarify` text, PII/payment-like leakage, placeholder/stub leakage, and staff-only handoff behavior.
- Added `channel adapter ver 1.0/`.
  - `src/channelAdapter.js` exports `normalizeInbound()` and `buildOutboundMessage()`.
  - Supports WhatsApp, Instagram, Facebook, and website payload shapes.
  - Builds outbound payloads only for `auto_send` / `clarify` when Safety Checker returns `safeToSend: true`.
- Added `model router ver 1.0/`.
  - `src/modelRouter.js` exports `routeModel({ decision, intent, gateway })`.
  - Returns `no_llm` for deterministic actions.
  - Routes simple staff drafts to `claude-haiku-4-5-20251001`.
  - Routes handoff/high-risk/complaint/sensitive/child/payment/order/reschedule to `claude-sonnet-4-6`.
- Added `private business backend mock ver 1.0/`.
  - `src/businessBackendMock.js` exports `createBusinessBackend()`.
  - Mock functions: `checkAvailability()`, `lookupOrder()`, `getStock()`, `lookupPayment()`, `getMinimalFacts()`.
  - Seed data lives in `seed/mockBusinessData.js`.
  - Returns minimal sanitized facts only; no raw customer record exposure.
- Added `staff inbox ver 1.0/`.
  - `src/staffInbox.js` exports `createStaffInbox()`.
  - In-memory review queue with `submit`, `list`, `get`, `approve`, `edit`, `reject`, `takeOver`.
  - Priorities: privacy/safety block = critical, handoff/escalation = high, staff review = medium.
- Added `end-to-end pipeline ver 1.0/`.
  - `src/pipeline.js` exports `createPipeline()` and `runMessage()`.
  - `src/server.js` exports a zero-dependency Node `http` webhook server for `POST /webhook`.
  - Pipeline result includes each stage: normalized message, gateway, intent, knowledge, decision, backend facts, model route, draft, safety, staff item, outbound, final status.

Each new module has:

- `README.md`
- `src/*.js`
- `test/*.cases.js`
- `test/*.test.js`
- `scripts/writeSideBySideResults.js`
- root-level side-by-side markdown report

### Test status after Session 3

All tests pass:

```bash
node "privacy filter ver 1.0/test/privacyFilter.test.js"                 # 500 passed
node "privacy gateway ver 1.0/test/privacyGateway.test.js"               # 205 passed
node "intent classifier ver 1.0/test/intentClassifier.test.js"            # 103 passed
node "knowledge base ver 1.0/test/knowledgeBase.test.js"                 # 12 passed
node "business rules ver 1.0/test/businessRules.test.js"                 # 13 passed
node "AI draft engine ver 1.0/test/draftEngine.test.js"                  # 10 passed
node "safety checker ver 1.0/test/safetyChecker.test.js"                 # 7 passed
node "channel adapter ver 1.0/test/channelAdapter.test.js"               # 5 passed
node "model router ver 1.0/test/modelRouter.test.js"                     # 5 passed
node "private business backend mock ver 1.0/test/businessBackendMock.test.js" # 5 passed
node "staff inbox ver 1.0/test/staffInbox.test.js"                       # 7 passed
node "end-to-end pipeline ver 1.0/test/pipeline.test.js"                 # 5 passed
```

Total after Session 3: **877 tests passing**.

Side-by-side reports generated for the new modules:

```bash
node "safety checker ver 1.0/scripts/writeSideBySideResults.js"
node "channel adapter ver 1.0/scripts/writeSideBySideResults.js"
node "model router ver 1.0/scripts/writeSideBySideResults.js"
node "private business backend mock ver 1.0/scripts/writeSideBySideResults.js"
node "staff inbox ver 1.0/scripts/writeSideBySideResults.js"
node "end-to-end pipeline ver 1.0/scripts/writeSideBySideResults.js"
```

### Known limitations after Session 3

1. This is a complete local v1.0 skeleton, not a production deploy.
2. Channel Adapter builds outbound payloads but does not call WhatsApp / Meta / website APIs.
3. Staff Inbox is in-memory only. Production needs persistent storage, auth, audit log, and UI.
4. Backend Mock uses seeded local data only. Real booking/order/stock/payment connectors are still needed.
5. Model Router chooses model names but does not execute requests; Draft Engine still owns the adapter call.
6. End-to-end server is a minimal Node `http` webhook server, not an authenticated production API.
7. No commits or push have been made. Everything from Sessions 1-3 is still local/untracked.

### Next practical steps

1. Review all local untracked modules.
2. Decide whether to commit as one large checkpoint or split by module:
   - `feat: knowledge base v1.0`
   - `feat: business rules v1.0`
   - `feat: AI draft engine v1.0`
   - `feat: complete support workflow skeleton`
3. After review, wire real environment concerns: tenant storage, real channel credentials, Anthropic key, staff inbox UI, webhook auth, deployment.

---

## Session 4 notes — Google Drive promotion sync + UTC+8 locale time expiry

User asked for a 24/7-style agent behavior: every day, read a Google Drive folder containing current offers / Instagram promotions, understand expiry dates, and use those facts before answering. All dates must follow UTC+8 locale time, UTC+8, not server locale or another region.

### What changed

- Added `google drive promo sync ver 1.0/`.
  - `src/hkTime.js` provides HK-time helpers:
    - `hkDateKey()`
    - `isWithinHkDateRange()`
    - `nextDailyRunAtTaipei()`
  - `src/promoSync.js` provides:
    - `createPromotionStore()`
    - `createPromoSync({ driveClient, store, folderId, businessId, syncTimeHk })`
    - `parseDrivePromoDocument()`
    - `lookupPromotions()`
  - `seed/promoSeed.js` includes demo active promotions:
    - `beauty_may_small_face_trial`
    - `igshop_sf_locker_may`
  - Tests use a mock `driveClient`; no real Google Drive network/API call yet.
- Updated `AI draft engine ver 1.0`.
  - Staff-review and handoff prompts now include active time-bound promotions when the pipeline passes `promotions`.
  - Promotion context includes title, summary, locale expiry date, and staff instruction.
- Updated `end-to-end pipeline ver 1.0`.
  - Pipeline creates a promotion store by default using promo seed data.
  - Each message now looks up active promotions using `Asia/Taipei` / UTC+8 before draft generation.
  - Pipeline result now includes `promotions`.
- Updated `staff inbox ver 1.0`.
  - Staff items now keep `backendFacts` and `promotions` so staff can see which offer context influenced the draft.
- Updated root `README.md`, AI draft README, and pipeline README.

### Google Drive promo document format

Google Drive docs can use blocks like:

```text
Title: 小顏管理五月體驗優惠
Keywords: 小顏, 小顏管理, 面部輪廓, 收費, 優惠
Intents: pricing, service_info
Summary: 小顏管理五月首次體驗 HK$480，原價 HK$880。主要針對面部線條、浮腫感同輪廓保養，效果因人而異。
StaffInstruction: 可以提五月體驗價，但要提醒客人先做面部狀態評估，唔好承諾一定瘦面。
StartsOn: 2026-05-01
ExpiresOn: 2026-05-31
Approved: true
```

Multiple promo blocks can be separated by `---`.

### Test status after Session 4

All tests pass:

```bash
node "privacy filter ver 1.0/test/privacyFilter.test.js"                 # 500 passed
node "privacy gateway ver 1.0/test/privacyGateway.test.js"               # 205 passed
node "intent classifier ver 1.0/test/intentClassifier.test.js"            # 103 passed
node "knowledge base ver 1.0/test/knowledgeBase.test.js"                 # 12 passed
node "business rules ver 1.0/test/businessRules.test.js"                 # 13 passed
node "google drive promo sync ver 1.0/test/promoSync.test.js"            # 8 passed
node "AI draft engine ver 1.0/test/draftEngine.test.js"                  # 13 passed
node "safety checker ver 1.0/test/safetyChecker.test.js"                 # 7 passed
node "channel adapter ver 1.0/test/channelAdapter.test.js"               # 5 passed
node "model router ver 1.0/test/modelRouter.test.js"                     # 5 passed
node "private business backend mock ver 1.0/test/businessBackendMock.test.js" # 5 passed
node "staff inbox ver 1.0/test/staffInbox.test.js"                       # 7 passed
node "end-to-end pipeline ver 1.0/test/pipeline.test.js"                 # 6 passed
```

Total after Session 4: **889 tests passing**.

### Known limitations after Session 4

1. `google drive promo sync ver 1.0` has a dependency-injected `driveClient` and offline tests. Production still needs a real Google Drive connector/client.
2. Daily sync scheduling is expressed in code via `runDue()` / `nextDailyRunAtTaipei()`. Production still needs a worker/cron runner to call it daily.
3. Promotion store is in memory by default. Production should persist synced promotions per tenant.
4. The pipeline reads active promotions before drafting, but conservative business rules still prevent automatic sending for beauty pricing/treatment claims. This is intentional.

---

## Session 5 notes — Legal and trust draft documents

Added product-specific legal/trust working drafts under `legal/`:

- `legal/README.md`
- `legal/draft-trust-and-safety-overview.md`
- `legal/draft-pilot-terms-of-service.md`
- `legal/draft-privacy-policy.md`
- `legal/draft-data-processing-addendum.md`

Updated the root `README.md` to link these documents from a new "Legal and Trust Drafts" section.

### Important caveat

These are product and pilot drafts, not legal advice. Before using them with paying customers, confirm:

- Final legal entity name and contact emails.
- Whether the provider is a processor, data user, or both for each data flow.
- Production hosting region and subprocessor list.
- Final retention/deletion periods.
- Payment, refund, support, liability, governing law, and dispute terms with the target locale counsel.
