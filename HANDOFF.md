# Handoff - Hong Kong AI Customer Support SaaS

Last verified: 2026-05-24 HKT.

This is the project map for the next session. Read this before editing code.

---

## 1. Project Coordinates

- Local working copy: `/Users/sloppy0726/git projects/auto cs bot ver 1`
- Remote: `https://github.com/Sloppy0726/auto-cs-bot-ver-1.git`
- Current branch: `main`
- Working tree at verification start: clean. This handoff update modifies `HANDOFF.md` and `README.md` until committed.
- Runtime: Node.js `v26.0.0`
- Dependencies: none. This repo is plain Node.js stdlib; there is no `package.json`.
- Main docs: `README.md`, `CHANGELOG.md`, module-level `README.md` files, and `legal/README.md`.

Useful first command:

```bash
cd "/Users/sloppy0726/git projects/auto cs bot ver 1"
git status --short --branch
```

---

## 2. Product Intent

Privacy-first Cantonese AI receptionist for Hong Kong SMEs.

The system is meant to answer repetitive WhatsApp, Instagram, Facebook, and website enquiries while keeping customer private data away from the LLM, keeping business policy in deterministic code, and routing risky replies to staff.

Non-negotiable product principles:

1. Privacy gateway runs before any LLM call.
2. Business policy lives in typed JavaScript rules, not only prompts.
3. Auto-send can quote approved knowledge only; the LLM must not invent prices, slots, refund decisions, health claims, or legal advice.
4. Staff review is the conservative default for pricing risk, backend-bound actions, complaints, sensitive health, child data, privacy blocks, and safety violations.
5. Hong Kong time means `Asia/Hong_Kong` / UTC+8 for promotions and expiry logic.

---

## 3. Architecture

Current local v1.0 workflow skeleton:

```text
customer channel
  -> channel adapter
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
  -> outbound payload or staff inbox
```

Important source modules:

| Module | Role |
|---|---|
| `privacy filter ver 1.0` | Redacts PII and flags HK-specific privacy/payment risk. |
| `privacy gateway ver 1.0` | Decides whether sanitized text can continue, must be reviewed, or must be blocked. |
| `intent classifier ver 1.0` | Deterministic Cantonese/English/mixed intent classification with optional LLM fallback. |
| `knowledge base ver 1.0` | Approved-only business facts, scoring, grounding IDs, and gap/handoff flags. |
| `google drive promo sync ver 1.0` | Parses approved Drive promotion blocks and filters active offers by HK date. |
| `business rules ver 1.0` | Policy ladder that emits `auto_send`, `staff_review`, `clarify`, `handoff`, or `block`. |
| `private business backend mock ver 1.0` | Local booking/order/stock/payment facts with sender-bound lookups. |
| `model router ver 1.0` | Chooses `no_llm`, Haiku, or Sonnet based on action/risk. |
| `AI draft engine ver 1.0` | Deterministic replies for safe branches and injected-LLM prompts for review/handoff drafts. |
| `safety checker ver 1.0` | Final validation before customer-visible text can be sent. |
| `channel adapter ver 1.0` | Normalizes inbound channel payloads and builds outbound channel payloads. |
| `staff inbox ver 1.0` | In-memory human review/handoff queue. |
| `end-to-end pipeline ver 1.0` | Orchestrates the full local workflow and includes a Node `http` webhook server. |
| `legal/` | Draft trust, terms, privacy, and DPA documents. Not legal advice. |

---

## 4. Current Verification

All test runners passed at handoff time: **2,428 checks**.

The easiest way to run every suite is the quick all-test loop further down. Individual runners (run from the repo root):

```bash
node "AI draft engine ver 1.0/test/draftEngine.test.js"
node "business rules ver 1.0/test/businessRules.test.js"
node "channel adapter ver 1.0/test/channelAdapter.test.js"
node "conversation context ver 1.0/test/conversationContext.test.js"
node "end-to-end pipeline ver 1.0/test/admin.test.js"
node "end-to-end pipeline ver 1.0/test/claudeAdapter.test.js"
node "end-to-end pipeline ver 1.0/test/openaiAdapter.test.js"
node "end-to-end pipeline ver 1.0/test/pipeline.store.test.js"
node "end-to-end pipeline ver 1.0/test/pipeline.test.js"
node "end-to-end pipeline ver 1.0/test/server.test.js"
node "google drive promo sync ver 1.0/test/promoSync.test.js"
node "intent classifier ver 1.0/test/intentClassifier.edge.test.js"
node "intent classifier ver 1.0/test/intentClassifier.test.js"
node "knowledge base ver 1.0/test/knowledgeBase.test.js"
node "model router ver 1.0/test/modelRouter.test.js"
node "privacy filter ver 1.0/test/privacyFilter.edge.test.js"
node "privacy filter ver 1.0/test/privacyFilter.test.js"
node "privacy gateway ver 1.0/test/privacyGateway.test.js"
node "private business backend mock ver 1.0/test/availabilityStore.test.js"
node "private business backend mock ver 1.0/test/businessBackendMock.test.js"
node "safety checker ver 1.0/test/safetyChecker.test.js"
node "staff inbox ver 1.0/test/staffInbox.test.js"
node "whatsapp-web-test-bridge/test/handoffState.test.js"
node "whatsapp-web-test-bridge/test/messageHeuristics.test.js"
node "whatsapp-web-test-bridge/test/sidebarScripts.test.js"
```

Observed passing counts:

| Runner | Count |
|---|---:|
| `AI draft engine ver 1.0/test/draftEngine.test.js` | 112 |
| `business rules ver 1.0/test/businessRules.test.js` | 101 |
| `channel adapter ver 1.0/test/channelAdapter.test.js` | 105 |
| `conversation context ver 1.0/test/conversationContext.test.js` | 13 |
| `end-to-end pipeline ver 1.0/test/admin.test.js` | 37 |
| `end-to-end pipeline ver 1.0/test/claudeAdapter.test.js` | 41 |
| `end-to-end pipeline ver 1.0/test/openaiAdapter.test.js` | 15 |
| `end-to-end pipeline ver 1.0/test/pipeline.store.test.js` | 20 |
| `end-to-end pipeline ver 1.0/test/pipeline.test.js` | 134 |
| `end-to-end pipeline ver 1.0/test/server.test.js` | 31 |
| `google drive promo sync ver 1.0/test/promoSync.test.js` | 108 |
| `intent classifier ver 1.0/test/intentClassifier.edge.test.js` | 23 |
| `intent classifier ver 1.0/test/intentClassifier.test.js` | 118 |
| `knowledge base ver 1.0/test/knowledgeBase.test.js` | 105 |
| `model router ver 1.0/test/modelRouter.test.js` | 101 |
| `privacy filter ver 1.0/test/privacyFilter.edge.test.js` | 207 |
| `privacy filter ver 1.0/test/privacyFilter.test.js` | 500 |
| `privacy gateway ver 1.0/test/privacyGateway.test.js` | 207 |
| `private business backend mock ver 1.0/test/availabilityStore.test.js` | 86 |
| `private business backend mock ver 1.0/test/businessBackendMock.test.js` | 118 |
| `safety checker ver 1.0/test/safetyChecker.test.js` | 102 |
| `staff inbox ver 1.0/test/staffInbox.test.js` | 107 |
| `whatsapp-web-test-bridge/test/handoffState.test.js` | 11 |
| `whatsapp-web-test-bridge/test/messageHeuristics.test.js` | 14 |
| `whatsapp-web-test-bridge/test/sidebarScripts.test.js` | 12 |

Quick all-test loop:

```bash
rg --files | rg '/test/.*\.test\.js$' | sort | while IFS= read -r f; do
  printf '\n## %s\n' "$f"
  node "$f"
done
```

---

## 5. How To Run A Local Pipeline Demo

```bash
node - <<'NODE'
const { createPipeline } = require("./end-to-end pipeline ver 1.0/src/pipeline");

(async () => {
  const pipeline = createPipeline({
    llmAdapter: async (_prompt, context) => {
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

Expected restaurant hours path:

```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "intent": "hours_location",
  "safety": "pass",
  "replyText": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。"
}
```

---

## 6. Repo Conventions

Follow the existing shape exactly:

- Module folder names use spaces and version suffixes: `"<module> ver 1.0"`.
- Source files use camelCase under `src/`.
- Every source/test/script file starts with `"use strict";`.
- Exports use CommonJS: `module.exports = { ... }`.
- Tests use `node:assert/strict`; no test framework.
- Case data lives in `test/<name>.cases.js`; runners live in `test/<name>.test.js`.
- Report generators live in `scripts/writeSideBySideResults.js`.
- Generated side-by-side markdown reports live in module roots.
- Keep comments sparse and explain why, not what.
- Do not add npm dependencies unless the user explicitly accepts a project-level dependency change.

---

## 7. Security And Privacy State

Recent hardening already landed in `CHANGELOG.md`:

- Webhook requests verify HMAC-SHA256 signatures before JSON parsing/pipeline execution.
- Replay protection uses request timestamps.
- Tenant-bound webhook credentials can restrict signed requests to a specific `businessId`.
- Production rejects `allowUnsignedWebhooks`.
- Public auth/parser errors are masked as `unauthorized` or `bad_request`.
- Request envelopes reject unsupported content types, oversized declared bodies, and slow bodies.
- Channel adapter fallback message IDs use SHA-256-derived identifiers.
- Privacy gateway default output no longer exposes raw `originalText` or detector `value` fields.
- Staff inbox stores sanitized customer text by default.
- Backend order/payment lookups are bound to normalized channel `senderId`.
- Draft prompts wrap customer text and promotion facts in explicit untrusted-data boundaries.
- Safety checker and draft engine block redaction placeholder leakage like `[PHONE_1]`, `[EMAIL_1]`, `[HKID_1]`, and similar.

Preserve these boundaries when adding features. In particular, do not pass raw channel payloads, raw PII findings, or untrusted promotion/customer text into prompts without the existing envelopes.

---

## 8. Known Limitations

This is a complete local v1.0 skeleton, not a production SaaS deployment.

- Channel adapter creates outbound payloads but does not call WhatsApp, Instagram, Facebook, or website APIs.
- Staff inbox is in-memory only; production needs persistence, auth, audit trail, and UI.
- Business configs and demo tenants are hardcoded in `business rules ver 1.0/src/archetypes.js`.
- Google Drive promo sync uses a dependency-injected `driveClient`; there is no real Drive connector wired here yet.
- Promotion store is in memory by default; production needs per-tenant storage and a real scheduler/worker.
- Private backend mock uses seeded data only; real booking/order/stock/payment connectors are not implemented.
- AI draft engine has an Anthropic adapter file, but normal tests use injected/offline stubs. Real calls require an intentional `ANTHROPIC_API_KEY` setup.
- Legal docs are product drafts only and need Hong Kong counsel before customer use.

---

## 9. High-Value Next Work

Recommended next steps, in order:

1. Build persistent tenant config/storage so `archetypes.js`, KB entries, promo store, and staff inbox are not hardcoded/in-memory.
2. Wire a real Google Drive connector/client for promotion sync, keeping `Approved: true` mandatory for Drive-origin docs.
3. Build a minimal staff inbox UI with authenticated approve/edit/reject/take-over flows.
4. Add real channel senders for WhatsApp/Meta/website after safety checker pass, with idempotency and audit logs.
5. Decide production LLM provider/model policy and wire secrets outside tests.
6. Prepare deployment: webhook secrets, tenant binding, logging/monitoring, database, backups, retention/deletion jobs.
7. Have Hong Kong counsel review the legal drafts and PDPO role/subprocessor wording.

---

## 10. Side-By-Side Reports

Most modules include a report generator:

```bash
node "<module>/scripts/writeSideBySideResults.js"
```

Use these for human review of inputs, expected behavior, actual behavior, and policy decisions. They are useful after changing classifier rules, knowledge scoring, business policies, model routing, or safety surfaces.

---

## 11. Before You Change Code

1. Run `git status --short --branch`.
2. Read the relevant module `README.md` and neighboring tests.
3. Run the affected module test before editing if the change is subtle.
4. Preserve the privacy-before-LLM and safety-before-send ordering.
5. Add or update test cases first when behavior is policy/security-related.
6. Run the affected module test and `end-to-end pipeline ver 1.0/test/pipeline.test.js`.
7. If touching webhook/server/security behavior, also run `end-to-end pipeline ver 1.0/test/server.test.js`.

---

## 12. Good Files To Start From

- Pipeline orchestration: `end-to-end pipeline ver 1.0/src/pipeline.js`
- Webhook server: `end-to-end pipeline ver 1.0/src/server.js`
- Business policy ladder: `business rules ver 1.0/src/businessRules.js`
- Tenant archetypes/demo configs: `business rules ver 1.0/src/archetypes.js`
- Draft prompt boundaries: `AI draft engine ver 1.0/src/draftEngine.js`
- Final send safety: `safety checker ver 1.0/src/safetyChecker.js`
- Promo parsing/HK date logic: `google drive promo sync ver 1.0/src/promoSync.js` and `google drive promo sync ver 1.0/src/hkTime.js`
- Sender-bound mock backend: `private business backend mock ver 1.0/src/businessBackendMock.js`

---

## 13. Session Addendum — 2026-05-23

This section captures everything that landed in this session. None of it has been committed yet; `git status` shows uncommitted M's plus two new files plus a new `state/` directory.

### 13.1 What landed

Six feature changes, all on `main`, all uncommitted:

| # | Feature | Key files |
|---|---|---|
| 1 | LLM paraphraser for canned replies | `AI draft engine ver 1.0/src/draftEngine.js`, `end-to-end pipeline ver 1.0/src/pipeline.js`, `end-to-end pipeline ver 1.0/src/server.js`, `safety checker ver 1.0/src/safetyChecker.js` |
| 2 | Bot pathway: customer asks for available times, bot replies with slot list (clarify, ready_to_send) | `end-to-end pipeline ver 1.0/src/pipeline.js` (`inferAvailabilityResponse`, `asksForAvailableTimes`) |
| 3 | Per-slot session duration (beauty only) | `AI draft engine ver 1.0/src/draftEngine.js` (fact-preservation now catches HH:MM and HH:MM–HH:MM), `private business backend mock ver 1.0/src/businessBackendMock.js` (emits `availableSessions`) |
| 4 | Admin /admin web page with table + calendar view | `end-to-end pipeline ver 1.0/src/adminHtml.js` (NEW, ~600 lines self-contained HTML/CSS/JS) and admin HTTP endpoints in `server.js` |
| 5 | **Full refactor: per-slot availability → opening-hours + bookings + closed-periods model** | `private business backend mock ver 1.0/src/availabilityStore.js` (NEW), `private business backend mock ver 1.0/src/businessBackendMock.js` (new branch when `availabilityStore` is wired) |
| 6 | Bridge robustness fixes | `whatsapp-web-test-bridge/src/whatsappWebBridge.js`, `whatsapp-web-test-bridge/src/handoffState.js`, `whatsapp-web-test-bridge/src/messageHeuristics.js` |
| 7 | Chinese date parsing + no-greeting-spam | `end-to-end pipeline ver 1.0/src/pipeline.js` (`inferRequestedDate`, `bookingClarificationText`, `asksForAvailableTimes`) |

All 484 existing tests still pass at session end (`draftEngine 112 · pipeline 121 · server 31 · safetyChecker 102 · businessBackendMock 118`). No new test files were added — please add them when committing.

### 13.2 New runtime state

The bridge runs both server and WhatsApp bridge as detached `screen` sessions named `auto-cs-bot-server` and `auto-cs-whatsapp-web-bridge`. Stop/start with:

```bash
npm run bridge:whatsapp-web:stop
npm run bridge:whatsapp-web:start
npm run bridge:whatsapp-web:status   # also tails recent bridge log
```

Live URLs (when running):
- `http://127.0.0.1:3000/webhook` — webhook receiver
- `http://127.0.0.1:3000/` — web chat test page
- `http://127.0.0.1:3000/admin` — slot admin (table + calendar)

### 13.3 Data shape change (important)

`private business backend mock ver 1.0/state/availability.json` is now persistent on-disk state, created on first server start, with shape:

```json
{
  "businesses": {
    "beauty_demo": {
      "openingHours": {
        "0": [{"open":"11:00","close":"19:00"}],
        "1": [{"open":"11:00","close":"21:00"}],
        "...": "0=Sun through 6=Sat, each is array of windows"
      },
      "closedPeriods": [
        {"id":"close_…","date":"2026-05-25","start":"13:00","end":"14:00","reason":"lunch"}
      ],
      "bookings": [
        {"id":"book_…","date":"2026-05-25","time":"14:00","service":"facial","durationMinutes":75,"customer":"…","notes":"…"}
      ]
    },
    "restaurant_demo": { "...": "same shape, bookings use partySize instead of service" },
    "edu_demo":        { "...": "same shape" },
    "igshop_demo":     { "...": "empty openingHours, no bookings" }
  }
}
```

The legacy per-slot `availability: [...]` arrays in `private business backend mock ver 1.0/seed/mockBusinessData.js` are still there for unit tests but are **only used when no `availabilityStore` is wired**. The running server always wires the store, so the seed availability arrays are effectively dead at runtime.

`server.js` calls `createBusinessBackend({ availabilityStore })`. Tests that call `createBusinessBackend()` with no args keep the legacy in-memory path — that's why all 484 tests still pass.

### 13.4 Admin HTTP endpoints

Auth: `x-admin-token` header matching `ADMIN_TOKEN` env. In local dev (`NODE_ENV !== "production"` with no token set), endpoints are open.

| Endpoint | Methods | Notes |
|---|---|---|
| `/admin/opening-hours/:businessId` | GET, PUT | PUT body: `{"openingHours": {"0":[...], "1":[...], ...}}` |
| `/admin/closed-periods/:businessId` | GET, POST | POST body: `{"date","start","end","reason"}` |
| `/admin/closed-periods/:businessId/:id` | DELETE | |
| `/admin/bookings/:businessId` | GET, POST | POST body: `{"date","time","service"|"partySize","durationMinutes","customer","notes"}` |
| `/admin/bookings/:businessId/:id` | PATCH, DELETE | |
| `/admin/store` | GET | Debug dump of entire store |

Validation in `availabilityStore.validateOpeningHours/validateClosedPeriod/validateBooking` — rejects bad HH:MM/dates and out-of-range partySize/durationMinutes.

### 13.5 Free-slot computation (new model)

`store.listFreeSlots({businessId, date, service, durationMinutes, partySize})` returns `{found, freeSlots:[{time, durationMinutes, endTime}], reason}`. Algorithm:

1. Get opening windows for `date`'s day-of-week.
2. Subtract any `closedPeriods` whose `date` matches.
3. Subtract any `bookings` on that date (intersection counted by `[time, time+durationMinutes]`).
4. Walk remaining open windows in 30-min steps, yielding start times where `t + sessionDuration ≤ window.end`.

`sessionDuration` comes from explicit `durationMinutes`, else `defaultDurationForService(service)` (`facial:75, laser:30, assessment:20, p3_english:45, default:30`).

`createBusinessBackend` exposes this as `checkAvailability(query)` → returns `{found, available, facts:[{key,value}], reason}` so the pipeline integration is unchanged in shape.

### 13.6 Paraphraser pipeline (added end-to-end)

`AI draft engine ver 1.0/src/draftEngine.js` now accepts an optional `paraphraser` adapter. For `auto_send` and `clarify` actions, after the canned text is built, the engine calls the paraphraser, validates the output preserves all fact tokens (prices, times like `HH:MM`, dates `YYYY-MM-DD`, member IDs, bracketed placeholders, time ranges `HH:MM–HH:MM`), and falls back to the verbatim canned text on any failure (LLM unavailable, fact mismatch, forbidden surface).

`safety checker ver 1.0/src/safetyChecker.js` was updated to accept `draft.paraphrased=true` + `draft.approvedSource` and re-validate fact preservation, instead of demanding byte-equal match.

`end-to-end pipeline ver 1.0/src/server.js` wires the paraphraser using the real LLM adapter when one is present (claude/openai), not the offline demo stub. Disable with `PARAPHRASE_ENABLED=false`.

### 13.7 Bridge fixes worth knowing about

- `whatsapp-web-test-bridge/src/whatsappWebBridge.js` now tracks fingerprints of messages it sent itself (`bridgeSentFingerprints` Set, capped at 200), persists the first handoff notice's fingerprint into `handoff.json` as `botHandoffFingerprint`. `syncStaffReplyForSnapshot` checks the fingerprint set first before falling back to text heuristics.
- `whatsapp-web-test-bridge/src/messageHeuristics.js` — `looksLikeBridgeAuthored` softened: dropped `留位費` (a real Cantonese term staff would naturally type) and `真人同事`; tightened `跟進編號：staff_` to require digits.

Known **non-bug** about Safari: WhatsApp Web tab hibernation. Modern Safari aggressively discards inactive background tabs; the bridge can't reach a discarded tab via AppleScript. Workaround for the user: pin the WhatsApp Web tab in Safari, or keep the window non-minimized. The bridge does NOT need the tab to be the foreground/active tab, but it does need the JS context to be alive.

### 13.8 Customer-facing UX changes worth knowing about

- **Greeting removed from booking clarifications.** Previously every clarify-during-booking message started with `你好，呢度係 Solara Beauty。` (or English equivalent). Now the clarify text is just the question. Greeting was annoying on every back-and-forth turn.
- **Chinese date parsing** in `inferRequestedDate`:
  - `5月25號` / `5月25日` / `5月25` / `5月25号` → `2026-05-25`
  - Slash form `5/25` / `12/25` → ISO date
  - Year auto-bumps if the resulting date is before today's HK date
  - Also added `後日 / day after tomorrow` → today+2
- **`有冇位` lists slots.** `asksForAvailableTimes` regex extended to catch `有冇位 / 仲有冇位 / 有冇空 / is there a slot/time/opening` so customers asking "do you have a spot?" go straight to a slot list rather than being asked for a specific time they don't have.
- **`inferRequestedTime` tightened.** Naked digits like `4位` or `P3` no longer mis-parse as `04:00` / `03:00`. Now requires `:MM`, `am/pm`, or `點/時`. Pre-existing bug that was poisoning the backend query.

### 13.9 Known issues / TODOs at session end

1. ~~**Tests for new code haven't been written.**~~ Resolved 2026-05-24 — see §16. `availabilityStore.test.js` (86), `pipeline.store.test.js` (20), and `admin.test.js` (37) now cover the store, the no-slots fallback through the pipeline, and every admin HTTP endpoint.
2. **No conflict detection in `addBooking`.** Staff can add two bookings that overlap each other. Backend's free-slot calc handles overlap correctly (whichever booking blocks first), but UX-wise the admin should reject or warn on conflicts.
3. **Calendar overlap rendering limitation.** If two beauty bookings start at the *same* `(date, time)`, they stack in the same cell — fine. If a second booking starts *inside* a longer one's rowspan, the inner one doesn't render in the calendar (its start cell is consumed). Still listed in the bookings table. Rare for a single salon; would need lateral splitting to fix.
4. **No "no slots today, try another day?" message.** When `availableSlots` is empty (date fully booked or closed day), `inferAvailabilityResponse` returns null and the request falls through to staff_review. UX could be improved with an explicit "no openings on that date" reply.
5. **`addBooking` validates only fields, not opening-hours overlap.** Staff can book outside opening hours; the free-slot calc just won't show those bookings (they're invisible since they're outside the open window subtraction). Either reject these or document.
6. **Per-staff resource modeling.** Currently treats the salon as a single resource pool. Per-staff calendars (Amy vs Joey) is the obvious next iteration — user explicitly deferred this in scoping.
7. **`mockBusinessData.js` availability arrays still contain seeded slots from the old model.** Tests use them. Once tests are rewritten for the new model, the seed can be wiped.
8. **HANDOFF.md test counts in section 4 are stale.** They reflect a pre-session count of 2,113 across all suites. Current relevant suites total ~484 (draft+pipeline+server+safety+backend).

### 13.10 New & changed files (uncommitted)

```
M  AI draft engine ver 1.0/src/draftEngine.js
M  end-to-end pipeline ver 1.0/src/pipeline.js
M  end-to-end pipeline ver 1.0/src/server.js
M  private business backend mock ver 1.0/seed/mockBusinessData.js
M  private business backend mock ver 1.0/src/businessBackendMock.js
M  safety checker ver 1.0/src/safetyChecker.js
M  whatsapp-web-test-bridge/src/handoffState.js
M  whatsapp-web-test-bridge/src/messageHeuristics.js
M  whatsapp-web-test-bridge/src/whatsappWebBridge.js
?? end-to-end pipeline ver 1.0/src/adminHtml.js
?? private business backend mock ver 1.0/src/availabilityStore.js
?? private business backend mock ver 1.0/state/        ← runtime-generated, gitignore-worthy
```

Run `git diff` for line-level changes. The two NEW source files (`availabilityStore.js`, `adminHtml.js`) are the bulk of the new logic.

### 13.11 Suggested next moves for the next session

In rough priority order:

1. **Add `private business backend mock ver 1.0/state/` to `.gitignore`** — it's runtime-generated user state, not source.
2. **Write tests** for the new code paths:
   - `availabilityStore` unit tests (validation, free-slot math including overlap subtraction, year-bump in `normalizeMonthDay`)
   - Pipeline integration test using a store-backed backend
   - Admin endpoint integration tests
3. **Commit the session's changes.** Suggest splitting into 3-4 commits along feature boundaries (paraphraser / show-slots pathway / admin UI / bookings-model refactor / bridge fixes).
4. **Resolve issues 2, 4, 5 from §13.9** — conflict detection, no-slots fallback message, out-of-hours booking rejection.
5. **Update §4 (test counts) and §1 (last-verified date) of this handoff** once tests are added.

End of session addendum.

---

## 14. Session Addendum — 2026-05-23 (ambiguous booking time fix)

This section captures the follow-up change after testing the WhatsApp Web booking flow in Safari.

### 14.1 What changed

- Fixed `end-to-end pipeline ver 1.0/src/pipeline.js` so bare Cantonese times like `2點`, `六點`, or `11點` are treated as ambiguous unless the customer explicitly says `上午`, `下午`, `晚上`, `今晚`, `am`, or `pm`.
- The pipeline no longer sends ambiguous bare times such as `2點` to backend availability as `02:00`.
- The bot now asks a clarifying question instead:

```text
可以呀，請問你講嘅2點係上午、下午定晚上？
```

- Explicit times still resolve as before:
  - `下午2點` → `14:00`
  - `今晚六點` → `18:00`
  - `2pm` → `14:00`
  - `14:00` → `14:00`

### 14.2 Why it changed

Safari WhatsApp Web logs showed a real local test where the customer said `2點`. The bridge stitched the conversation into:

```text
想book 2點 facial 5月25號
```

The old parser treated that as `02:00`, which is unreasonable for `beauty_demo` because the salon does not open at 2am. The downstream staff draft then talked about `下午2點`, even though the parser had originally carried `02:00` into backend lookup. The safer behavior is to ask the customer whether they mean morning, afternoon, or evening.

### 14.3 Files changed

```text
M  end-to-end pipeline ver 1.0/src/pipeline.js
M  end-to-end pipeline ver 1.0/test/pipeline.test.js
```

### 14.4 Verification

Focused tests passed:

```bash
node "end-to-end pipeline ver 1.0/test/pipeline.test.js"   # pipeline: 134 tests passed
node "end-to-end pipeline ver 1.0/test/server.test.js"     # server: 31 tests passed
node --check "end-to-end pipeline ver 1.0/src/pipeline.js"
```

Manual dry run passed:

```text
Input:  想book 2點 facial 5月25號
Action: clarify
Reply:  可以呀，請問你講嘅2點係上午、下午定晚上？
Staff item: false
```

After the fix, the packaged server and WhatsApp Web bridge were restarted:

```bash
npm run bridge:whatsapp-web:stop
npm run bridge:whatsapp-web:start
```

The old local handoff pause state was cleared so the same WhatsApp chat could continue testing:

```bash
npm run bridge:whatsapp-web:handoff:clear
```

`npm run bridge:whatsapp-web:status` reported:

```text
Bot endpoint: OK http://127.0.0.1:3000/webhook
Handoff pause state: No paused chats.
```

### 14.5 Current local runtime

When running through the packaged starter:

- Bot webhook: `http://127.0.0.1:3000/webhook`
- Website chat test page: `http://127.0.0.1:3000/`
- Admin UI: `http://127.0.0.1:3000/admin`
- Screen sessions:
  - `auto-cs-bot-server`
  - `auto-cs-whatsapp-web-bridge`

End of session addendum.

---

## 15. Session Addendum — 2026-05-24 (no-slots fallback + per-credential baseUrls)

Two features landed in this session. Both customer-visible improvements.

### 15.1 What landed

| # | Feature | Commits |
|---|---|---|
| 1 | "No slots today" suggests nearby dates | `21690cc` (pushed) |
| 2 | Claude adapter per-credential baseUrl (auth_token → proxy, oauth → Anthropic fallback) | uncommitted at section-write time |

All test suites green at session end: `claudeAdapter 41 · pipeline 134 · server 31 · draftEngine 112 · safetyChecker 102 · businessBackendMock 118` = 548 total.

### 15.2 Feature 1: No-slots-today fallback

**Behavior change.** When intent=booking, customer asks "is there a slot on \<date\>?", and the backend computes zero free slots for that date (fully booked OR a closed day OR outside opening hours), the bot used to silently route to staff_review. Now it replies as a `clarify` (ready_to_send) suggesting the next 1–3 dates that DO have openings, including the earliest start time on each:

```text
唔好意思，2026-05-25 facial 暫時冇位或者已過營業時間。
最近有時段嘅日期：2026-05-26（最早 11:00）、2026-05-27（最早 11:00）、2026-05-28（最早 11:00）。
請問你想揀邊一日？
```

English variant produced when `intent.language === "en"`. Falls through to staff_review only if nothing's available in the next 7 days either.

**How it works.** New three-piece chain:

1. `private business backend mock ver 1.0/src/availabilityStore.js` → `findNextAvailableDates({businessId, fromDate, service, partySize, maxDays=7, maxResults=3})` walks forward N days from `fromDate`, calling `listFreeSlots` on each, and returns `[{date, freeCount, firstSlot}]` for the first dates with at least one free slot.
2. `private business backend mock ver 1.0/src/businessBackendMock.js` exposes `findNextAvailableDates` on the backend instance (only when an `availabilityStore` is wired).
3. `end-to-end pipeline ver 1.0/src/pipeline.js` → `inferAvailabilityResponse` now accepts `backend` as a parameter. When slots is empty, it calls `backend.findNextAvailableDates(...)` and, if there are suggestions, builds the clarify reply via the new `noSlotsResponseText` helper. The suggested dates and times still flow through the paraphraser, but the fact-preservation guard catches them (every `YYYY-MM-DD` and `HH:MM` must round-trip).

### 15.3 Feature 2: Per-credential baseUrl

**Why.** The user added a working proxy credential (`ANTHROPIC_AUTH_TOKEN` against `hk.routeai.cc`) and also has a valid `CLAUDE_CODE_OAUTH_TOKEN`. The proxy doesn't accept Anthropic's first-party OAuth flow, so when both credentials were routed through the same baseUrl, the OAuth fallback was useless — it would 401 against the proxy. The proxy ALSO frequently returns transient 502s, which would knock the bot out entirely.

**Behavior change.** Each Claude credential now carries its own baseUrl:

| Credential | Default baseUrl | Override env |
|---|---|---|
| `ANTHROPIC_AUTH_TOKEN` (`auth_token` type, 1st priority) | `config.baseUrl` / `CLAUDE_BASE_URL` / `ANTHROPIC_BASE_URL` | (same) |
| `CLAUDE_CODE_OAUTH_TOKEN` (`oauth` type, 2nd priority) | `https://api.anthropic.com/v1` (Anthropic direct) | `CLAUDE_OAUTH_BASE_URL` |
| `ANTHROPIC_API_KEY` (`api_key` type, 3rd priority) | same as auth_token (proxy) | (same) |

So when the proxy fails (502 / 429 / network / etc.) on the auth_token attempt, the fallback automatically tries the OAuth credential against Anthropic's official endpoint. Live verification at session end with both credentials present and the proxy currently 502'ing:

```text
✓ overall result text: "OK"
Retry trail:
 • https://hk.routeai.cc/v1/messages       ← auth_token, failed (proxy 502)
 • https://api.anthropic.com/v1/messages   ← oauth, succeeded
```

**Files changed.** `end-to-end pipeline ver 1.0/src/claudeAdapter.js` (added per-credential baseUrl in `claudeCredentials` + threaded into `sendClaudeMessage`), `whatsapp-web-test-bridge/.env.example` (documented `CLAUDE_OAUTH_BASE_URL` override).

### 15.4 Compatibility

- All 41 existing claudeAdapter tests still pass. The change is additive — `claudeCredentials` accepts new optional `proxyBaseUrl` / `oauthBaseUrl` params; legacy callers that omit them get a credential record with `baseUrl: undefined`, and `sendClaudeMessage` falls back to a passed-in or default URL.
- All 134 pipeline tests still pass. The legacy in-memory backend path for tests isn't affected.

### 15.5 Known proxy state (informational)

At session end, `hk.routeai.cc` was returning `502 Upstream service temporarily unavailable` consistently across all credential header forms (`x-api-key`, `authorization: Bearer`, with/without beta header). This is the proxy's upstream Anthropic relay being down, not an auth problem. The fallback chain handles it gracefully (oauth → Anthropic direct).

### 15.6 Files changed (uncommitted at section-write time)

```text
M  HANDOFF.md
M  end-to-end pipeline ver 1.0/src/claudeAdapter.js
M  whatsapp-web-test-bridge/.env.example
```

### 15.7 Suggested next moves for next session

Still on the list from §13.11 / §14:

1. Booking conflict detection + out-of-hours rejection in admin's `addBooking`.
2. Per-staff resources (Amy vs Joey calendars) — biggest single UX win for a real salon.
3. ~~Tests for the new bookings model.~~ Done — see §16.
4. The `private business backend mock ver 1.0/state/` directory is already gitignored; `mockBusinessData.js` still has legacy `availability: [...]` arrays for the legacy in-memory test path — clean up is now safer because the store path has its own coverage.

End of session addendum.

---

## 16. Session Addendum — 2026-05-24 (tests for the bookings model)

Three new test files cover the bookings-model code that had been riding on the legacy in-memory backend path.

### 16.1 Files added

| File | Tests | Covers |
|---|---:|---|
| `private business backend mock ver 1.0/test/availabilityStore.test.js` | 86 | `validateOpeningHours`, `validateClosedPeriod`, `validateBooking` (restaurant/beauty/edu/igshop), `subtractMany`/`toMinutes` helpers, `listFreeSlots` (closed-period subtraction, booking subtraction, per-service / per-partySize filters, duration-exceeds-window), `findNextAvailableDates` (maxDays/maxResults, no-openings case), bookings/closed-periods CRUD, file persistence round-trip, `reset()` |
| `end-to-end pipeline ver 1.0/test/pipeline.store.test.js` | 20 | Pipeline wired with a real store-backed backend. Verifies slot listing flows through to `backendFacts.availableSlots`, the no-slots-with-suggestions fallback fires with zh + en variants, no-suggestions case falls through to staff_review, an existing booking removes its time from the listing |
| `end-to-end pipeline ver 1.0/test/admin.test.js` | 37 | Real HTTP server with a tmp-file store; covers auth (open in dev, 401 in production without token, 401 on wrong token, 200 on correct token), `GET/PUT /admin/opening-hours`, `GET/POST/DELETE /admin/closed-periods`, `GET/POST/PATCH/DELETE /admin/bookings`, `GET /admin/store`, invalid payload → 400, missing id → 404, wrong method → 405, persistence round-trip across servers |

### 16.2 Patterns worth knowing

- All store tests isolate state with `fs.mkdtempSync` + an explicit `filePath` on `createAvailabilityStore({ filePath })`. No tests touch `private business backend mock ver 1.0/state/availability.json`.
- `admin.test.js` defines a small `sendAdmin` helper because the existing `sendJson` in `server.test.js` is hardcoded to `POST /webhook`. The helper closes the server after each request.
- The pipeline integration test pins the clock to `2026-05-24` HKT (Sunday) so the day-of-week math against `openingHours["0".."6"]` is deterministic.
- The pipeline test asserts on `result.draft.text` directly because the `llmAdapter` is stubbed; the paraphraser is off by default since `config.paraphraser` is not set.

### 16.3 Test totals

- New: 86 + 20 + 37 = 143
- §4 grand total: 2,113 (pre-session counts in §4) → 2,428.

### 16.4 What's still open

The §13.9 / §15.7 backlog after this work:

1. Booking conflict detection + out-of-hours rejection in `addBooking` (still §13.9 #2 and #5).
2. Per-staff resources (still §13.9 #6).
3. Legacy `availability: [...]` arrays in `mockBusinessData.js` can now be cleaned up because the store path has dedicated coverage (still §13.11 #4).

End of session addendum.

---

## 17. Session Addendum — 2026-05-25 (out-of-hours rejection + staff confirm flow + Google Drive)

Three customer-requested features landed in this session. All on `main`, all
covered by tests, uncommitted at section-write time.

### 17.1 Feature 1: Reject out-of-hours bookings

`addBooking` and `updateBooking` in
`private business backend mock ver 1.0/src/availabilityStore.js` now compute
the day's open windows minus closed periods and reject any booking whose
`[time, time + durationMinutes]` falls outside. Error string:
`outside opening hours: HH:MM-HH:MM not within open window(s) on YYYY-MM-DD (open: ...)`
or `outside opening hours: <businessId> is closed on YYYY-MM-DD` for closed days.

- New helper `_internal.checkBookingFitsOpeningHours(state, businessId, booking)`.
- Returned at the admin layer as a 400 (POST and PATCH).
- Existing `validateBooking` is unchanged (still field-level only).
- 15 new tests in `availabilityStore.test.js` (86 → 101) + 4 new admin tests
  (37 → 41 first, before §17.2 additions).

### 17.2 Feature 2: Staff confirm → calendar

The pipeline now captures a structured `bookingDraft` on staff-review items so
the admin Approve action can persist them to the calendar without re-parsing
the chat.

**Pipeline change** (`end-to-end pipeline ver 1.0/src/pipeline.js`):

- New `inferBookingDraft({ intent, query, normalizedMessage })` returns
  `{ businessId, date, time, service|partySize, customer, senderId, channel, notes }`
  for booking/reschedule intents that have a concrete (non-ambiguous) time +
  date + service-or-partySize. Returns `null` otherwise.
- Passed into `inbox.submit({ ..., bookingDraft })`.

**Staff inbox change** (`staff inbox ver 1.0/src/staffInbox.js`):

- Items now carry `bookingDraft` (set at submit time) and `bookingResult` (set
  after the calendar write attempt).
- New method `inbox.recordBookingResult(id, { ok, error?, bookingId?, ... })`.

**New admin endpoints** (auth same as existing admin endpoints):

| Endpoint | Method | Notes |
|---|---|---|
| `/admin/inbox/:businessId` | GET | Lists items, both open and closed. UI filters to `open`. |
| `/admin/inbox/:businessId/:id` | GET | Single item with sanitized fields. |
| `/admin/inbox/:businessId/:id/approve` | POST | Body merges into `bookingDraft` (allowed: date, time, service, partySize, durationMinutes, customer, notes). On booking-shaped items, calls `availabilityStore.addBooking`. On non-booking review items, just approves. Returns `{ item, booking }`. 400 if the addBooking validation fails (item stays open for retry); 409 if item already transitioned; 404 if id is unknown. |
| `/admin/inbox/:businessId/:id/reject` | POST | Body: `{ reason, actor }`. Transitions to `rejected`. |

Admin endpoints reject with 503 `staff_inbox_disabled` when no inbox is wired.
The startup path in `startWebhookServer` wires `pipeline.inbox` automatically.

**Admin UI change** (`end-to-end pipeline ver 1.0/src/adminHtml.js`):

- New "Pending staff reviews" card at the top of the admin page, always visible
  (not behind the list/calendar tabs).
- Each open item shows priority, action, channel, sender, customer text, bot
  draft, reasons, then for booking-shaped items: editable date / time / service
  (or partySize) / duration / customer / notes fields + Approve + Reject buttons.
- Approve POSTs the (possibly edited) fields and reloads everything on success
  so the new booking shows in the bookings table and calendar.
- Reject prompts for a reason and POSTs to `/reject`.
- Refresh button on the card calls the inbox endpoint independently.

**Tests:**

- 9 new pipeline tests in `pipeline.store.test.js` (20 → 29) covering
  bookingDraft capture vs not-captured (clarify, asking for slots).
- 27 new admin tests in `admin.test.js` (41 → 68) covering: inbox endpoint
  disabled, empty list, list+approve writes booking, approve with overrides,
  approve out-of-hours stays open with `bookingResult.ok=false`, reject,
  approve twice → 409, non-booking item approve (no calendar write), unknown
  id → 404.

**Known limitation (intentional for v1):** approving a booking does NOT send a
confirmation message back to the customer over WhatsApp/IG yet. The channel
adapter still doesn't talk to real channel APIs (per §8 of this doc). Once a
real outbound sender is wired, the approve handler should also queue an
outbound message to the captured `bookingDraft.channel + senderId`.

### 17.3 Feature 3: Google Drive promo connector

The existing `promoSync.js` already exposed a `driveClient` injection point;
this session adds a real service-account-based implementation.

**New module** (`google drive promo sync ver 1.0/src/googleDriveClient.js`):

- `createGoogleDriveClient({ credentials | serviceAccountJsonPath, folders, httpFetch?, nowFn?, scopes? })`.
- Implements `{ listFiles({ businessId, folderId }), readFile(file) }`.
- Auth: RS256 JWT signed with `node:crypto`, exchanged at
  `https://oauth2.googleapis.com/token` for an access token cached for ~59
  minutes (Google's hour minus 60s refresh lead).
- Drive v3 calls: `GET /files?q=` for listing, `GET /files/{id}/export?mimeType=text%2Fplain`
  for Google Docs, `GET /files/{id}?alt=media` for plain files.
- No npm deps. Uses built-in `fetch` (Node ≥ 22).
- `loadFoldersFromEnv()` reads `GDRIVE_FOLDER_<BUSINESS_ID>` vars and lowercases
  the suffix into business IDs.

**Wired into server** (`end-to-end pipeline ver 1.0/src/server.js`):

- `maybeCreateDriveIntegration(config)` returns `{ store, folders, syncAll }` when
  BOTH `GOOGLE_SERVICE_ACCOUNT_JSON_PATH` is set AND at least one
  `GDRIVE_FOLDER_*` is set; `null` otherwise.
- On server `listen` callback, kicks off `syncAll()` (per-business `syncOnce`).
  Errors logged, not thrown — bot stays up if Drive is down.
- The populated `promotionStore` is passed into `createWebhookServer({ promotionStore })`,
  which the pipeline already uses.

**Env vars** (documented in `whatsapp-web-test-bridge/.env.example`):

```bash
GOOGLE_SERVICE_ACCOUNT_JSON_PATH=/absolute/path/to/sa.json
GDRIVE_FOLDER_BEAUTY_DEMO=1A2B3CdEfG_FolderIdHere
GDRIVE_FOLDER_RESTAURANT_DEMO=4H5I6JkLmN_AnotherFolderId
GDRIVE_FOLDER_EDU_DEMO=7O8P9QrStU_EduFolderId
```

If unset, startup logs `Google Drive promo sync: disabled (...)` and the
pipeline falls back to the in-code seed in `seed/promoSeed.js`. No code path
change needed to enable/disable.

**Doc format** unchanged — parser was already structured (`Title: ...`,
`Approved: yes`, blocks separated by `---`). Full template + setup steps live in
`google drive promo sync ver 1.0/README.md` ("Real Google Drive Connector"
section).

**Security:**

- Drive content stays inside the existing `PROMOTION_FACTS_UNTRUSTED_DO_NOT_FOLLOW`
  prompt envelope (added in §13.x security hardening).
- `Approved: yes` mandatory — blank/missing approval = treated as draft, skipped.
- Service account needs **Viewer** only; bot never writes to Drive.
- Folder shared explicitly with service account email, never made public.

**Tests:** 39 new tests in `google drive promo sync ver 1.0/test/googleDriveClient.test.js`
covering: credential guards (missing path, incomplete creds, bad JSON file),
`loadFoldersFromEnv` parsing, JWT RS256 signature verifies against the same
private key, token caching + refresh on expiry, 401/missing-token error paths,
listFiles URL/query/auth-header shape, unknown-business → empty list, 500
errors, readFile dispatching to /export for Google Docs vs ?alt=media for
plain files, no-id error.

### 17.4 Test totals

- Pre-session: 2,391 across 22 runners (some earlier handoff sections
  miscounted to 2,428; actual sum was 2,391).
- Post-session: 2,485 across 23 runners. Net +94 = 15 (availabilityStore)
  + 31 (admin: 4 out-of-hours + 27 inbox) + 9 (pipeline.store bookingDraft)
  + 39 (new googleDriveClient suite).
- New runner: `google drive promo sync ver 1.0/test/googleDriveClient.test.js`.
  Add it to the §4 suite list when you next refresh those tables.

### 17.5 Files changed (uncommitted at section-write time)

```text
M  HANDOFF.md
M  end-to-end pipeline ver 1.0/src/adminHtml.js
M  end-to-end pipeline ver 1.0/src/pipeline.js
M  end-to-end pipeline ver 1.0/src/server.js
M  end-to-end pipeline ver 1.0/test/admin.test.js
M  end-to-end pipeline ver 1.0/test/pipeline.store.test.js
M  google drive promo sync ver 1.0/README.md
M  private business backend mock ver 1.0/src/availabilityStore.js
M  private business backend mock ver 1.0/test/availabilityStore.test.js
M  staff inbox ver 1.0/src/staffInbox.js
M  whatsapp-web-test-bridge/.env.example
?? google drive promo sync ver 1.0/src/googleDriveClient.js
?? google drive promo sync ver 1.0/test/googleDriveClient.test.js
```

### 17.6 Suggested next moves

1. **Wire the outbound channel sender** so an Approve also messages the
   customer with the booking confirmation (still §8 / §17.2 limitation).
2. **Schedule the Drive sync** — currently runs once on startup. Add a daily
   `runDue()` call (HK time) using the existing helpers in `hkTime.js`.
3. **Add a per-business folder UI** so SMEs can paste folder IDs without env
   var redeploys. Persist alongside the availability store.
4. **Booking conflict detection** in `addBooking` — still §13.9 #2.
5. **Per-staff resources** (Amy vs Joey calendars) — still §13.9 #6.

End of session addendum.

---

End of handoff.
