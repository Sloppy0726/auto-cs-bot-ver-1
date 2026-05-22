# Codex Handoff - Hong Kong AI Customer Support SaaS

Last verified: 2026-05-13 HKT by Codex.

This is the project map for the next Codex session. Read this before editing code.

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

All test runners passed at handoff time: **2,113 checks**.

Run everything from the repo root:

```bash
node "AI draft engine ver 1.0/test/draftEngine.test.js"
node "business rules ver 1.0/test/businessRules.test.js"
node "channel adapter ver 1.0/test/channelAdapter.test.js"
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
node "private business backend mock ver 1.0/test/businessBackendMock.test.js"
node "safety checker ver 1.0/test/safetyChecker.test.js"
node "staff inbox ver 1.0/test/staffInbox.test.js"
```

Observed passing counts:

| Runner | Count |
|---|---:|
| `AI draft engine ver 1.0/test/draftEngine.test.js` | 112 |
| `business rules ver 1.0/test/businessRules.test.js` | 101 |
| `channel adapter ver 1.0/test/channelAdapter.test.js` | 105 |
| `end-to-end pipeline ver 1.0/test/pipeline.test.js` | 103 |
| `end-to-end pipeline ver 1.0/test/server.test.js` | 28 |
| `google drive promo sync ver 1.0/test/promoSync.test.js` | 108 |
| `intent classifier ver 1.0/test/intentClassifier.edge.test.js` | 23 |
| `intent classifier ver 1.0/test/intentClassifier.test.js` | 103 |
| `knowledge base ver 1.0/test/knowledgeBase.test.js` | 103 |
| `model router ver 1.0/test/modelRouter.test.js` | 101 |
| `privacy filter ver 1.0/test/privacyFilter.edge.test.js` | 207 |
| `privacy filter ver 1.0/test/privacyFilter.test.js` | 500 |
| `privacy gateway ver 1.0/test/privacyGateway.test.js` | 207 |
| `private business backend mock ver 1.0/test/businessBackendMock.test.js` | 103 |
| `safety checker ver 1.0/test/safetyChecker.test.js` | 102 |
| `staff inbox ver 1.0/test/staffInbox.test.js` | 107 |

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

## 13. Session Addendum — 2026-05-23 (Claude session, switching to Codex)

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

1. **Tests for new code haven't been written.** The store, the paraphraser pipeline, the free-slot computation, and the admin endpoints all lack dedicated test files. Recommend adding before commit. The existing 484 tests still pass because they cover the legacy in-memory path.
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

End of handoff.
