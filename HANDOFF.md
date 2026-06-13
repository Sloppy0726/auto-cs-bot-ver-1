# Handoff - Hong Kong AI Customer Support SaaS

Last verified: 2026-06-03 HKT (per-resource model done through §23; OSS readiness package logged in §24; live-smoke of both LLM adapters logged in §25).

This is the project map for the next session. Read this before editing code.

> **Tone note for readers landing here from the OSS docs.** The
> customer-facing positioning was rebranded to "Privacy-first Traditional
> Chinese / English AI customer-support safety framework" in §24 (OSS PR #3).
> This internal handoff log intentionally keeps the original "Hong Kong /
> Cantonese" framing because the project history, decisions, and live tenant
> (`prince-snooker` / 王子桌球) are HK-specific and the framing is load-bearing
> context. For public positioning, see [README.md](README.md). For internal
> session history, this file.

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

All 38 test runners passed at last refresh (2026-06-01, after §22):
**3,003 checks**.

The easiest way to run every suite is the quick all-test loop further down. Individual runners (run from the repo root):

```bash
node "AI draft engine ver 1.0/test/draftEngine.test.js"
node "business rules ver 1.0/test/businessRules.test.js"
node "channel adapter ver 1.0/test/channelAdapter.test.js"
node "channel adapter ver 1.0/test/outboxStore.test.js"
node "conversation context ver 1.0/test/conversationContext.persistence.test.js"
node "conversation context ver 1.0/test/conversationContext.test.js"
node "end-to-end pipeline ver 1.0/test/admin.test.js"
node "end-to-end pipeline ver 1.0/test/claudeAdapter.test.js"
node "end-to-end pipeline ver 1.0/test/httpLogSink.test.js"
node "end-to-end pipeline ver 1.0/test/observability.test.js"
node "end-to-end pipeline ver 1.0/test/openaiAdapter.test.js"
node "end-to-end pipeline ver 1.0/test/pipeline.store.test.js"
node "end-to-end pipeline ver 1.0/test/pipeline.test.js"
node "end-to-end pipeline ver 1.0/test/rateLimiter.test.js"
node "end-to-end pipeline ver 1.0/test/server.integrations.test.js"
node "end-to-end pipeline ver 1.0/test/server.test.js"
node "end-to-end pipeline ver 1.0/test/usageReporter.test.js"
node "google drive promo sync ver 1.0/test/googleDriveClient.test.js"
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
node "staff inbox ver 1.0/test/staffInbox.persistence.test.js"
node "staff inbox ver 1.0/test/staffInbox.test.js"
node "whatsapp-web-test-bridge/test/handoffState.test.js"
node "whatsapp-web-test-bridge/test/messageHeuristics.test.js"
node "whatsapp-web-test-bridge/test/outboxProcessor.test.js"
node "whatsapp-web-test-bridge/test/sidebarScripts.test.js"
node "whatsapp-web-test-bridge/test/staffReplyAutoResolver.integration.test.js"
node "whatsapp-web-test-bridge/test/staffReplyAutoResolver.test.js"
node "whatsapp-web-test-bridge/test/staffReplyClassifier.test.js"
```

Observed passing counts (2026-06-01):

| Runner | Count |
|---|---:|
| `AI draft engine ver 1.0/test/draftEngine.test.js` | 112 |
| `business rules ver 1.0/test/businessRules.test.js` | 101 |
| `channel adapter ver 1.0/test/channelAdapter.test.js` | 105 |
| `channel adapter ver 1.0/test/outboxStore.test.js` | 24 |
| `conversation context ver 1.0/test/conversationContext.persistence.test.js` | 8 |
| `conversation context ver 1.0/test/conversationContext.test.js` | 13 |
| `end-to-end pipeline ver 1.0/test/admin.test.js` | 120 |
| `end-to-end pipeline ver 1.0/test/claudeAdapter.test.js` | 41 |
| `end-to-end pipeline ver 1.0/test/httpLogSink.test.js` | 12 |
| `end-to-end pipeline ver 1.0/test/observability.test.js` | 13 |
| `end-to-end pipeline ver 1.0/test/openaiAdapter.test.js` | 15 |
| `end-to-end pipeline ver 1.0/test/pipeline.store.test.js` | 79 |
| `end-to-end pipeline ver 1.0/test/pipeline.test.js` | 134 |
| `end-to-end pipeline ver 1.0/test/rateLimiter.test.js` | 8 |
| `end-to-end pipeline ver 1.0/test/server.integrations.test.js` | 8 |
| `end-to-end pipeline ver 1.0/test/server.test.js` | 31 |
| `end-to-end pipeline ver 1.0/test/usageReporter.test.js` | 17 |
| `google drive promo sync ver 1.0/test/googleDriveClient.test.js` | 39 |
| `google drive promo sync ver 1.0/test/promoSync.test.js` | 108 |
| `intent classifier ver 1.0/test/intentClassifier.edge.test.js` | 23 |
| `intent classifier ver 1.0/test/intentClassifier.test.js` | 118 |
| `knowledge base ver 1.0/test/knowledgeBase.test.js` | 105 |
| `model router ver 1.0/test/modelRouter.test.js` | 101 |
| `privacy filter ver 1.0/test/privacyFilter.edge.test.js` | 207 |
| `privacy filter ver 1.0/test/privacyFilter.test.js` | 500 |
| `privacy gateway ver 1.0/test/privacyGateway.test.js` | 207 |
| `private business backend mock ver 1.0/test/availabilityStore.test.js` | 248 |
| `private business backend mock ver 1.0/test/businessBackendMock.test.js` | 118 |
| `safety checker ver 1.0/test/safetyChecker.test.js` | 102 |
| `staff inbox ver 1.0/test/staffInbox.persistence.test.js` | 8 |
| `staff inbox ver 1.0/test/staffInbox.test.js` | 107 |
| `whatsapp-web-test-bridge/test/handoffState.test.js` | 11 |
| `whatsapp-web-test-bridge/test/messageHeuristics.test.js` | 14 |
| `whatsapp-web-test-bridge/test/outboxProcessor.test.js` | 20 |
| `whatsapp-web-test-bridge/test/sidebarScripts.test.js` | 16 |
| `whatsapp-web-test-bridge/test/staffReplyAutoResolver.integration.test.js` | 16 |
| `whatsapp-web-test-bridge/test/staffReplyAutoResolver.test.js` | 33 |
| `whatsapp-web-test-bridge/test/staffReplyClassifier.test.js` | 61 |

Most runners report their tally as "<suite>: N tests passed". One — the
intent classifier edge file — uses "N checks passed" instead. Both
forms are counted as passing.

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

## 18. Session Addendum — 2026-05-25 → 2026-05-27 (outbound channel sender, production readiness, deploy pipeline)

This section folds in everything that landed between §17 and the merge of PR #2
(`ddefddf`). All committed to `main`. Working tree is clean except for one
untracked helper script (§18.9).

Per-commit test counts (from each commit message): `5895e4e` → 2715,
`9472680` → 2732, `656ac0c` → 2744. Net suites have grown by 12 new runners
(§18.7). The §4 table is now stale; refresh when next running the full loop.

### 18.1 Bare-hour AM/PM auto-resolution (commit `58d6535`)

Tightens the §14 ambiguity guard. A bare Cantonese time like `2點` or `六點`
no longer always triggers an AM/PM clarify. The pipeline now checks the
requested date's opening hours and, if exactly one of `(AM hour, PM hour)`
falls inside an open window, resolves to that. It only asks when both fit
(e.g. `8點` at a place open 08:00–22:00) or when no opening-hours context
is known.

Files: `end-to-end pipeline ver 1.0/src/pipeline.js` (rewrites
`inferRequestedTime` / `inferAmPmFromContext`), `private business backend mock
ver 1.0/src/businessBackendMock.js` (exposes a helper), 73 new tests appended
to `end-to-end pipeline ver 1.0/test/pipeline.store.test.js`.

### 18.2 Staff in-chat reply auto-resolves the pending booking (commit `cf70929`)

Closes the "staff types a confirm directly into WhatsApp instead of clicking
Approve in the dashboard" gap. While a chat is paused for handoff, the bridge
classifies the staff's manual reply:

| Phrasing | Action |
|---|---|
| Confirm (e.g. `已預約`, `Booking confirmed`, `搞掂`) | `POST /admin/inbox/.../approve` → writes the booking to the calendar |
| Deny (e.g. `對唔住，冇位`, `fully booked`) | `POST /admin/inbox/.../reject` |
| Anything unclear | Leaves the item open for the admin dashboard |

The bot sends no extra customer message — staff's own reply IS the
notification. Auth-aware: forwards `ADMIN_TOKEN` as `x-admin-token`.

New files (all in `whatsapp-web-test-bridge/`):

- `src/staffReplyClassifier.js` — heuristic classifier with an optional LLM
  fallback hook for ambiguous text.
- `src/staffReplyAutoResolver.js` — wires classifier → admin endpoints,
  handles inbox lookup + idempotency.
- `test/staffReplyClassifier.test.js`, `test/staffReplyAutoResolver.test.js`,
  `test/staffReplyAutoResolver.integration.test.js`.

Plus changes to `src/whatsappWebBridge.js` to invoke the resolver during the
handoff-staff-reply path.

### 18.3 Outbound channel sender for admin-approved bookings (commit `78e8cca`)

Closes the §17.2 "approve does not message the customer" limitation. Now when
staff approves a booking-shaped item in the admin dashboard, the server
enqueues a customer confirmation message into a file-backed outbox shared
with the WhatsApp Web bridge. On its next tick the bridge opens the target
chat (via a new sidebar script that matches by chat name) and sends the
confirmation, marking the record as `sent`. Failed sends retry up to 3
attempts per record. Non-`whatsapp` channels decline with `channel_unsupported`.

The in-chat staff-reply path (§18.2) intentionally skips this — staff's own
reply already serves as the notification.

New files:

- `channel adapter ver 1.0/src/outboxStore.js` + `test/outboxStore.test.js`
  (file-backed outbox, atomic tmp+rename writes).
- `whatsapp-web-test-bridge/src/outboxProcessor.js` + `test/outboxProcessor.test.js`
  (bridge-side tick worker).

Modified: `end-to-end pipeline ver 1.0/src/server.js` (admin approve handler
enqueues), `whatsapp-web-test-bridge/src/whatsappWebBridge.js` +
`src/sidebarScripts.js` (chat-by-name open + send), plus admin / sidebar tests
extended. `.gitignore` now excludes the runtime outbox state file.

### 18.4 Persistence, rate limiting, observability (commit `5895e4e`, PR #2)

Three production-readiness additions. All zero-dep (Node stdlib) and
backwards compatible (off by default).

**Persistence**

- `staff inbox ver 1.0/src/staffInbox.js` — accepts optional `filePath`,
  hydrates from disk on init, re-persists after each mutation. Atomic write
  pattern matches `outboxStore`.
- `conversation context ver 1.0/src/conversationContext.js` — accepts
  optional `filePath`; persists per-conversation history map across restarts.

**Rate limiting**

- New `end-to-end pipeline ver 1.0/src/rateLimiter.js` — in-memory token
  bucket keyed by remote address (X-Forwarded-For aware). Defaults 20
  req/min burst, refilling at 20/min. Tunable via `RATE_LIMIT_CAPACITY`,
  `RATE_LIMIT_REFILL_PER_SEC`, `RATE_LIMIT_IDLE_TTL_MS`.
- Wired into `POST /webhook` before body read. Denied requests return 429 +
  `Retry-After`.

**Observability**

- New `end-to-end pipeline ver 1.0/src/observability.js` — structured JSON
  logger (silent under `NODE_ENV=test` or `LOG_LEVEL=silent`) and a
  counter/histogram registry exposed as Prometheus text at `GET /metrics`.
- Webhook handler emits `webhook_handled` / `webhook_failed` /
  `webhook_rate_limited` events and increments `webhook_requests_total` +
  `webhook_latency_ms` per request.

Tests: `rateLimiter.test.js` (37), `observability.test.js` (56),
`server.integrations.test.js` (90), `staffInbox.persistence.test.js` (45),
`conversationContext.persistence.test.js` (49).

### 18.5 LLM token usage telemetry (commit `9472680`)

Per-request visibility into Claude / OpenAI cost.

- `claudeAdapter.js` and `openaiAdapter.js` HTTP clients now return
  `{ text, usage }` and extract `input_tokens` / `output_tokens` (+
  Claude cache hit/creation, OpenAI `prompt_tokens_details.cached_tokens`).
- Both factories accept an `onUsage` callback that fires after every
  successful draft/intent call. Errors thrown inside `onUsage` are swallowed
  so telemetry can never break inference.
- `startWebhookServer` wires a default reporter that emits one `llm_call`
  JSON log per prompt (`provider, model, kind=draft|intent, token counts`)
  and increments `llm_calls_total{provider,model,kind}` +
  `llm_tokens_total{provider,model,kind,direction}` for `/metrics`. Labels
  are sorted for stable Prometheus output.

New file: `end-to-end pipeline ver 1.0/test/usageReporter.test.js` (17 tests).

### 18.6 Ship logs off-box + systemd deploy (commit `656ac0c`)

So a solo operator can monitor token usage and fix bugs across multiple
customer shops without physically visiting them.

**Log shipper**

- New `createHttpSink` in `observability.js` — batches log lines and POSTs as
  a JSON array to `LOG_INGEST_URL` with optional bearer (`LOG_INGEST_TOKEN`).
  Failures swallowed; the bot never blocks on telemetry. Tunable batch size +
  flush interval. Auto-enables when `LOG_INGEST_URL` is set.
- Compatible with hosted services (Better Stack, Axiom, …) or a self-hosted
  receiver on a $5 VPS.

**Systemd unit**

- `deploy/cs-bot.service` — auto-restart, hardening (`NoNewPrivileges`,
  `ProtectSystem`, `ReadWritePaths`), journald output.
- `deploy/deploy.sh` — idempotent updater: fetches origin, exits early if
  already up to date, runs smoke tests
  (`pipeline.test.js` + `server.test.js`), restarts the service via
  passwordless `sudo systemctl restart`. Safe for cron / unattended use.

New file: `end-to-end pipeline ver 1.0/test/httpLogSink.test.js` (12 tests).

### 18.7 GitHub Actions auto-deploy to shops (commit `8c43eed` → PR #2 merge `ddefddf`)

Push to `main` → runs full test suite → SSHes into every shop in
`deploy/shops.json` over Tailscale → runs `/opt/cs-bot/deploy/deploy.sh` on
each.

- `.github/workflows/deploy.yml` — `test` job runs every `*.test.js` (skips
  `sidebarScripts.test.js` since jsdom isn't installed at repo root),
  `inventory` job emits the shop matrix, `deploy` job runs Tailscale OAuth +
  matrix-SSH per shop. `workflow_dispatch` accepts a single hostname for
  one-shop manual deploys. Markdown / `HANDOFF.md` / `CHANGELOG.md` /
  `legal/**` changes are excluded from the trigger.
- `deploy/shops.json` — current shop list (one entry: `prince-snooker` /
  `prince_snooker` / 王子桌球). Add new shops by editing this file and
  pushing to main; the next deploy includes them.
- `deploy/cs-bot.sudoers` — sudoers fragment granting passwordless
  `systemctl restart cs-bot` / `systemctl status cs-bot` to the `cs-bot` user.

Required GitHub secrets: `TAILSCALE_OAUTH_CLIENT_ID`, `TAILSCALE_OAUTH_SECRET`,
`DEPLOY_SSH_KEY` (the matching public key goes in `~cs-bot/.ssh/authorized_keys`
on every shop).

### 18.8 New test runners since §17

Add these to §4 when next running the full loop:

```bash
node "channel adapter ver 1.0/test/outboxStore.test.js"
node "conversation context ver 1.0/test/conversationContext.persistence.test.js"
node "end-to-end pipeline ver 1.0/test/httpLogSink.test.js"
node "end-to-end pipeline ver 1.0/test/observability.test.js"
node "end-to-end pipeline ver 1.0/test/rateLimiter.test.js"
node "end-to-end pipeline ver 1.0/test/server.integrations.test.js"
node "end-to-end pipeline ver 1.0/test/usageReporter.test.js"
node "google drive promo sync ver 1.0/test/googleDriveClient.test.js"   # was missed in §17.4
node "staff inbox ver 1.0/test/staffInbox.persistence.test.js"
node "whatsapp-web-test-bridge/test/outboxProcessor.test.js"
node "whatsapp-web-test-bridge/test/staffReplyAutoResolver.integration.test.js"
node "whatsapp-web-test-bridge/test/staffReplyAutoResolver.test.js"
node "whatsapp-web-test-bridge/test/staffReplyClassifier.test.js"
```

Pre-existing skip in CI: `whatsapp-web-test-bridge/test/sidebarScripts.test.js`
needs jsdom and is skipped in `.github/workflows/deploy.yml`. Locally it still
runs.

### 18.9 Untracked file at section-write time

```text
?? scripts/testAuthToken.js
```

A small diagnostic that pings `ANTHROPIC_AUTH_TOKEN` against the proxy
(`hk.routeai.cc` per §15.5) and exits with a verdict code:
`0=OK, 3=RATE_LIMIT, 4=AUTH_ERROR, 5=UPSTREAM_DOWN, 6=OTHER, 2=CONFIG`. Loads
env from `whatsapp-web-test-bridge/.env` (overriding shell env so Claude
Desktop's `ANTHROPIC_BASE_URL` injection doesn't mask the proxy). Useful for
separating "proxy is down" from "token is rate-limited / revoked" when the
fallback chain (§15.3) is misbehaving. Decide whether to commit under
`scripts/` or delete.

### 18.10 New module-level surface worth knowing about

| Surface | Where | Notes |
|---|---|---|
| Outbox (server → bridge) | `channel adapter ver 1.0/src/outboxStore.js` | File-backed, atomic writes. Bridge polls. |
| Outbox tick worker | `whatsapp-web-test-bridge/src/outboxProcessor.js` | Opens chat by name + sends; retries ≤3. |
| Staff reply classifier | `whatsapp-web-test-bridge/src/staffReplyClassifier.js` | Heuristics first; optional LLM fallback. |
| Staff reply resolver | `whatsapp-web-test-bridge/src/staffReplyAutoResolver.js` | Wires classifier → admin approve/reject. |
| Rate limiter | `end-to-end pipeline ver 1.0/src/rateLimiter.js` | Token bucket per remote addr. |
| Observability | `end-to-end pipeline ver 1.0/src/observability.js` | JSON logs + Prometheus `/metrics` + HTTP log sink. |
| Persistence (inbox) | `staff inbox ver 1.0/src/staffInbox.js` | Optional `filePath`. |
| Persistence (context) | `conversation context ver 1.0/src/conversationContext.js` | Optional `filePath`. |
| Token usage telemetry | `claudeAdapter.js` / `openaiAdapter.js` `onUsage` | Surfaced through default reporter in server. |
| Systemd unit | `deploy/cs-bot.service` | Restart-on-fail + filesystem hardening. |
| One-shot deploy | `deploy/deploy.sh` | Idempotent; smoke-tests before restart. |
| CI deploy | `.github/workflows/deploy.yml` | Push to main → tests → SSH each shop. |
| Shop registry | `deploy/shops.json` | Edit + push to onboard a new shop. |

### 18.11 New env vars

| Var | Purpose |
|---|---|
| `RATE_LIMIT_CAPACITY` | Token bucket burst capacity (default 20). |
| `RATE_LIMIT_REFILL_PER_SEC` | Refill rate (default 20/60). |
| `RATE_LIMIT_IDLE_TTL_MS` | Per-IP bucket GC TTL. |
| `LOG_LEVEL` | `silent` disables logs. Default emits JSON to stdout. |
| `LOG_INGEST_URL` | Enables HTTP log sink. POSTs JSON-array batches. |
| `LOG_INGEST_TOKEN` | Bearer token for the log sink. Optional. |
| `CS_BOT_DIR`, `CS_BOT_SERVICE`, `CS_BOT_BRANCH` | Overrides for `deploy/deploy.sh`. Defaults: `/opt/cs-bot`, `cs-bot`, `main`. |

Plus the §17 set still applies (`GOOGLE_SERVICE_ACCOUNT_JSON_PATH`,
`GDRIVE_FOLDER_*`, `ADMIN_TOKEN`, `PARAPHRASE_ENABLED`, `CLAUDE_OAUTH_BASE_URL`).

### 18.12 Open backlog after this work

From §17.6 / §13.9, still outstanding:

1. Booking conflict detection in `addBooking` (out-of-hours rejection landed
   in §17.1; overlap-with-existing-booking detection did not).
2. Per-staff resources (Amy vs Joey calendars) — the single biggest UX gap.
3. Schedule the Drive sync (currently once at startup) using `hkTime.js`
   helpers.
4. Per-business folder UI for Drive (so SMEs don't need env var redeploys).
5. Refresh §4 test runner table + total counts.
6. Decide on committing `scripts/testAuthToken.js` (§18.9).
7. The promo store still has no real per-tenant persistence — only the
   in-memory store hydrated from Drive at boot. Survives only as long as
   the process.

New items observed this session:

8. Outbox uses file-backed state but isn't wired into the persistence-survival
   smoke check. If `state/outbox.json` is corrupted, the bridge silently
   drops un-sent confirmations. Add startup validation + a `/admin/outbox`
   inspection endpoint.
9. Rate limiter is per-process and in-memory — a multi-shop or multi-instance
   deploy would not share buckets. Acceptable for the current single-process
   per-shop deploy, but flag before scaling out.

End of session addendum.

---

## 19. Session Addendum — 2026-06-01 (per-resource model: Phase 1 of 6)

This section is the design record. **Phase 1 is committed at `f7d262d`** (pushed
during the 2026-06-01 follow-up session). **Phases 2–6 landed in the same
follow-up session — see §20 for what shipped.** §19.2 captures the settled
design decisions; do not re-litigate them.

### 19.1 Why "resource" not "staff"

The live shop (`deploy/shops.json`) is `prince-snooker` / 王子桌球 — a snooker
hall whose bookable unit is a **table**, not a stylist. So the model is
generic "resources" (`bookings.resourceId`), which covers snooker tables,
beauty stylists (Amy/Joey), and classrooms with one schema. The handoff's
older "per-staff" framing is the beauty-demo lens on the same feature.

### 19.2 Settled design decisions (do not re-litigate)

User chose all four "recommended" options when scoping:

1. **Generic resources**, not beauty-only staff. One model, `resourceId` on
   bookings, each business defines its own resource list.
2. **Per-resource opening hours** — a resource may carry its own
   `openingHours`; if absent it inherits the business's hours. Phase 2's
   free-slot calc must intersect business-hours ∩ resource-hours.
3. **Any-available by default** — customer asking "3點有冇位?" sees slots from
   ANY resource; they may optionally pin one ("我想揀Amy" / "想book 1號枱").
   Never force a resource pick.
4. **Resource filter on the existing calendar** (a dropdown), NOT a rewritten
   side-by-side per-resource grid.

### 19.3 Phase plan + status

| Phase | Scope | Status |
|---|---|---|
| 1 | `availabilityStore`: resource schema + CRUD + validation + tests | **DONE** `f7d262d` (pushed) |
| 2 | Per-resource free-slot calc; `resourceId` on bookings; `addBooking`/`updateBooking` require `resourceId` when the business has ≥1 resource; intersect business ∩ resource hours | **DONE** (see §20) |
| 3 | Pipeline detects resource mentions (Amy/Joey, 1號枱, Table 3); `inferBookingDraft` captures `resourceId`; `businessBackendMock.checkAvailability` passes it through; any-available stays default | **DONE** (see §20) |
| 4 | Admin endpoints: `GET/POST /admin/resources/:businessId`, `GET/PATCH/DELETE /admin/resources/:businessId/:id`; bookings endpoints accept `resourceId`; tests | **DONE** (see §20) |
| 5 | Admin UI (`adminHtml.js`): resource management card + resource filter dropdown on bookings table & calendar; booking forms gain a resource select | **DONE** (see §20) |
| 6 | Seed Prince Snooker tables (12 uniform tables); demo businesses keep **zero** resources for back-compat | **DONE** (see §20) |

Dependency order: 1→2; 2→3; 2→4; 4→5; (3,4)→6.

### 19.4 What Phase 1 actually changed (`f7d262d`)

`private business backend mock ver 1.0/src/availabilityStore.js`:

- Resource shape: `{ id, name, openingHours?, active }`. `name` ≤ 80 chars;
  `openingHours` optional (same window shape as business hours); `active`
  defaults true.
- New methods on the store: `listResources(businessId, {includeInactive=true})`,
  `getResource`, `addResource`, `updateResource`, `removeResource`.
- **Soft delete:** `removeResource` sets `active=false` (does not splice) so
  existing bookings that reference the `resourceId` still resolve.
- `validateResource` + `normalizeResource` added; both exported on `_internal`.
- Back-compat: `normalizeState` defaults missing `resources` to `[]`;
  `buildInitialState` and `reset()` seed `resources: []`; `ensureBusiness`
  backfills the array. A legacy `availability.json` with no `resources` key
  loads cleanly (covered by a test).

`private business backend mock ver 1.0/test/availabilityStore.test.js`:
**+43 tests → 144 total** (was 101). Covers validation, CRUD, soft
delete/reactivation, legacy-state-file load, persistence round-trip.

**Crucially, Phase 1 changed NO runtime behavior.** `listFreeSlots`,
`addBooking`, the pipeline, and the admin UI are untouched. A business with
zero resources behaves exactly as before. Verified: `businessBackendMock 118`,
`pipeline.store 41`, `admin 85`, `pipeline 134` all still green.

### 19.5 Phase 2 design notes (for whoever picks this up)

The hard part. Sketch settled this session but unimplemented:

- `bookings` gain an optional `resourceId`. `validateBooking` should accept it
  (string, must reference an existing active resource when the business has
  resources). When the business has **zero** resources, `resourceId` stays
  absent and everything behaves as today.
- `listFreeSlots` gains an optional `resourceId` param:
  - With `resourceId` → compute against that one resource's effective hours
    (resource.openingHours ∩ business.openingHours, or business hours if the
    resource has none) minus that resource's bookings + closed periods.
  - Without `resourceId`, business has resources → a slot is free if **≥1**
    resource is free at that time. Surface which: each free slot should carry
    `availableResources: [resourceId,…]` so the pipeline/admin can show "any"
    and the booking write can pick one.
  - Without `resourceId`, business has zero resources → unchanged single-pool
    path.
- `findNextAvailableDates` threads `resourceId` the same way.
- `checkBookingFitsOpeningHours` must use the resource's effective hours when
  a `resourceId` is present.
- `addBooking`/`updateBooking`: when the business has ≥1 active resource,
  require a valid `resourceId`; reject if the chosen resource is already booked
  for an overlapping window (this is also where §13.9 #2 conflict detection
  naturally lands — per-resource overlap is a real conflict).

Watch the existing per-service (beauty) and per-partySize (restaurant) booking
filters in `listFreeSlots` — they must continue to work *within* a resource's
bookings, not be replaced by the resource filter.

### 19.6 Open question blocking Phase 6

How many tables does 王子桌球 (Prince Snooker) have, and are they uniform
(pure any-available) or do some have different hours / VIP status? Needed
before seeding. Until then, `prince_snooker` is not even in
`VALID_BUSINESS_IDS` in `availabilityStore.js` (still the 4 demo IDs) — Phase 6
must add it, OR the team decides resources should work for arbitrary business
IDs (cleaner, but changes the "unknown businessId" rejection that current
tests assert on).

### 19.7 Files touched this session

```text
M  HANDOFF.md
M  private business backend mock ver 1.0/src/availabilityStore.js        (committed f7d262d)
M  private business backend mock ver 1.0/test/availabilityStore.test.js  (committed f7d262d)
?? scripts/testAuthToken.js   (still untracked, unrelated — see §18.9)
```

`f7d262d` is **local only**. Decide whether to push before continuing.
Because it's a `.js`-only commit, pushing it WILL trigger the
`.github/workflows/deploy.yml` deploy to every shop in `deploy/shops.json`
(currently just `prince-snooker`) — but since Phase 1 is behavior-neutral,
that deploy is safe.

End of session addendum.

---

## 20. Session Addendum — 2026-06-01 (per-resource model: Phases 2–6 of 6)

Follow-up session to §19. All five remaining phases of the per-resource
model landed in one pass. User decision at scope time: **12 uniform tables
for Prince Snooker** (any-available default, all share the venue's hours),
and push Phase 1 first so the deploy pipeline runs against a behavior-neutral
change before stacking more on top.

### 20.1 What landed (in dependency order)

| Phase | Key files | What the change does |
|---|---|---|
| 2 | `private business backend mock ver 1.0/src/availabilityStore.js` | `listFreeSlots` gains three paths: specific resource (intersect business ∩ resource hours, subtract that resource's bookings + pool bookings + closed periods), any-available (union of per-resource free starts, each slot carries `availableResources: [resourceId,…]`), and the legacy single-pool path (unchanged). `addBooking`/`updateBooking` enforce `resourceId` when the business has ≥1 active resource and reject same-resource overlaps. `validateBooking` accepts and coerces `resourceId`. `checkBookingFitsOpeningHours` uses resource-effective hours when a `resourceId` is present. |
| 3 | `end-to-end pipeline ver 1.0/src/pipeline.js`, `private business backend mock ver 1.0/src/businessBackendMock.js` | `inferBackendQuery` calls a new `inferResourceId(text, backend, businessId)` that matches active resource names against the text (longest-first; numeric-prefix names like `11號枱` enforce a non-digit boundary so they don't fire inside `1號枱`). `inferBookingDraft` captures `resourceId` and supports resource-pinned businesses (no `service`/`partySize` required). `backend.listResources` is a new pass-through, and `checkAvailability` threads `resourceId` into the store. Any-available stays the default whenever the customer doesn't name one. |
| 4 | `end-to-end pipeline ver 1.0/src/server.js` | New routes: `GET/POST /admin/resources/:businessId`, `GET/PATCH/DELETE /admin/resources/:businessId/:id`. The bookings endpoints already passed payloads through verbatim so `resourceId` flows in. The inbox approve handler's `mergeBookingOverrides` now allows `resourceId` so staff can pin a resource when approving. `GET /admin/resources/:businessId?activeOnly=true` filters out soft-deleted. |
| 5 | `end-to-end pipeline ver 1.0/src/adminHtml.js` | New "Resources" card at the top of the list pane (add / rename / deactivate / re-activate, soft-delete preserves existing bookings). New resource filter dropdown in the toolbar — filters bookings table and calendar. Quick-add booking form and popover edit form both gain a resource `<select>` (with an "(any)" sentinel that clears the pin). Inbox approve form gains the same picker. Booking pills in the calendar show the resource name. The dropdowns hide automatically when the active business has zero active resources. |
| 6 | `private business backend mock ver 1.0/src/availabilityStore.js`, `knowledge base ver 1.0/seed/hkSmeSeed.js`, `end-to-end pipeline ver 1.0/src/adminHtml.js` | `VALID_BUSINESS_IDS` adds `prince_snooker`. Default opening hours: every day 11:00–23:30. `defaultResourcesFor("prince_snooker")` returns 12 tables (`res_prince_table_1`…`res_prince_table_12`, names `1號枱`…`12號枱`). `validateBooking("prince_snooker", …)` accepts no `service`/`partySize` and defaults `durationMinutes` to 60. KB seed adds 3 entries (`prince_hours`, `prince_identity`, `prince_booking`) so the booking flow doesn't trip the `kb.gap=true` clarify rule. Admin dropdown adds `prince_snooker (王子桌球)`. |

### 20.2 Resource detection rules (Phase 3 detail)

`inferResourceId` is order-sensitive. Resources are sorted by `name.length`
descending so longer prefixes win. For each candidate:

1. Case-insensitive `indexOf` substring match in the customer text.
2. If the resource name starts with a digit, the character immediately
   before the match must NOT be a digit. So `11號枱` does not match inside
   `1號枱`, and `1號枱` does not match inside `11號枱`. (Both names are eligible
   on their own.)

This is the only safety check; everything else is plain substring. Customer
text like `"想book 3號枱 5月25號 下午2點"` resolves to `res_prince_table_3`.
Text without a recognizable resource name leaves `query.resourceId` absent
and the pipeline falls back to any-available behavior.

### 20.3 Upgrade path for existing shops

The state file `private business backend mock ver 1.0/state/availability.json`
is runtime-generated and won't have a `prince_snooker` key on shops that
were running pre-§20 code. `normalizeState` now uses `hasOwnProperty` to
distinguish "business absent from file" (→ seed defaults) from "business
present but resources field empty" (→ keep empty). Result: on first load of
new code, a shop that never had `prince_snooker` in its state file gets the
12-table seed and persists it on next write. Shops that explicitly cleared
the table list keep their empty state.

A dedicated test (`princeSnookerUpgradeTests` in `availabilityStore.test.js`)
covers this: a state file pre-populated only with the 4 demos seeds 12 tables
when `prince_snooker` is loaded; a state file explicitly declaring
`prince_snooker` with `resources: []` stays empty.

### 20.4 Bookings model summary after §20

A booking record now has these optional fields on top of the §13.3 shape:

```text
{
  "id": "book_...",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "durationMinutes": 60,                // default per business
  "resourceId": "res_prince_table_3",   // required when business has ≥1 active resource
  "service": "facial",                  // beauty/edu only
  "partySize": 4,                       // restaurant only
  "customer": "...",
  "notes": "..."
}
```

Pool bookings (no `resourceId`) still exist in the wild for the legacy
single-pool path. In a business that has resources, pool bookings act as
**global blockers**: they remove their time window from every resource's
free-slot list. New writes into a business-with-resources cannot create pool
bookings — they must pin.

### 20.5 Test deltas

| Suite | Before §20 | After §20 | New |
|---|---:|---:|---:|
| `availabilityStore.test.js` | 144 | 248 | +104 (Phase 2 free-slot + Phase 6 snooker + upgrade path) |
| `pipeline.store.test.js` | 41 | 68 | +27 (Phase 3 resource detection + Phase 6 end-to-end) |
| `admin.test.js` | 85 | 110 | +25 (Phase 4 resource endpoints + bookings/approve with resourceId) |
| Other 35 suites | unchanged | unchanged | 0 |

**Grand total: 2,978 across 38 runners** (was 2,829 before §20 — that's +149).
Every single runner is green.

### 20.6 Files changed in §20

```text
M  HANDOFF.md
M  end-to-end pipeline ver 1.0/src/adminHtml.js
M  end-to-end pipeline ver 1.0/src/pipeline.js
M  end-to-end pipeline ver 1.0/src/server.js
M  end-to-end pipeline ver 1.0/test/admin.test.js
M  end-to-end pipeline ver 1.0/test/pipeline.store.test.js
M  knowledge base ver 1.0/seed/hkSmeSeed.js
M  private business backend mock ver 1.0/src/availabilityStore.js
M  private business backend mock ver 1.0/src/businessBackendMock.js
M  private business backend mock ver 1.0/test/availabilityStore.test.js
```

Plus the pre-existing untracked `scripts/testAuthToken.js` (§18.9) is still
not committed — same decision pending.

### 20.7 Known gaps / suggested next moves

1. **Refresh §4 test count tables.** The §4 totals are stale by ~600 tests
   now. Suggest re-running the all-test loop and refreshing on the next
   passing edit.
2. **Per-resource opening hours UI.** Phase 5 added the resource card but
   not a per-resource hours editor — only business-wide hours. The store
   supports `resource.openingHours`; the API accepts it via PATCH; only the
   UI is missing. Phase 7 candidate.
3. **No customer-facing reply that lists which resources are free.** When
   the bot lists slots, it surfaces `availableSlots` and (now)
   `availableSessions[i].availableResources`, but the draft text still says
   "available times: …" without naming who/what is free. Could opt to add a
   "Amy is free at 11:00; both at 14:00" mode for beauty.
4. **Prince Snooker production deploy.** Pushing this work triggers the
   GitHub Actions deploy to `prince-snooker`. The §20.3 upgrade path means
   first load will seed 12 tables; verify on the shop after deploy.
5. **`scripts/testAuthToken.js` (§18.9) decision still pending.**
6. **Per-resource conflict error UX.** `addBooking` rejects same-resource
   overlap with a 400 + error message. The admin UI surfaces it via
   `setStatus("Add failed: …")` but doesn't highlight the offending field.
   Cosmetic.

End of session addendum.

---

## 21. Session Addendum — 2026-06-01 (Phase 7: per-resource opening-hours editor)

Follow-up to §20.7 item 2. Store + API already supported
`resource.openingHours`; only the admin UI was missing. This session adds
the editor and a couple of API tests that codify the round-trip.

### 21.1 What landed

| File | Change |
|---|---|
| `end-to-end pipeline ver 1.0/src/adminHtml.js` | New `buildResourceHoursEditor(r)` helper. Each resource row gains a `Hours` button (label flips to `Hours ✎` when the resource has a custom override). Clicking opens a collapsible editor with a "Use business default hours" checkbox; unchecking exposes the same 7-day window grid the business-wide editor uses, pre-filled from business hours. Save sends `PATCH /admin/resources/:businessId/:id` with either `{ openingHours: {…} }` or `{ openingHours: null }` (clears the override). |
| `end-to-end pipeline ver 1.0/src/adminHtml.js` | Resource rows now wrap in a `.resource-entry` container so the editor can hang below each row without breaking the `:last-child` border rule. CSS reuses `.day-row` / `.window-pill` from the business-wide editor. |
| `end-to-end pipeline ver 1.0/test/admin.test.js` | +10 checks across 3 blocks: PATCH with valid `openingHours`, PATCH with `openingHours: null` (clears persisted override), PATCH with invalid window shape (400). |

No server-side change — `updateResource` already merge-validates the
payload via `validateResource`, and `validateResource` skips
`openingHours` when the field is null on the merged record (which is how
"clear" works: the resource record ends with no `openingHours` key →
`effectiveWindowsForResource` falls back to the business windows).

### 21.2 UI behaviour summary

- **First open on a resource with no override** — checkbox checked, no
  grid shown, hint reads "Inherits business-wide hours."
- **Uncheck** — `hours` is snapshot from the current
  business-wide `openingHours` so the user has a starting point, the
  7-day grid renders.
- **Re-check after editing** — the in-progress edits are discarded
  intentionally (clicking Save sends `openingHours: null`).
- **Save** — `loadAll()` re-fetches; the resource row's button label
  flips to `Hours ✎` if an override is now persisted.
- **Close** — does not save; just hides the editor for that resource.

### 21.3 Manual verification (Claude_Preview)

Booted the server on `:4198`, switched to `prince_snooker`:

1. 12 resource entries rendered, each with a Hours button.
2. Opened editor on `10號枱` → checkbox checked, no grid → matched
   "no override" state.
3. Unchecked → 7-day grid rendered, each day pre-filled with the
   business default `11:00–23:30`.
4. Changed Monday's close to `20:00`, clicked Save → status read
   `Resource hours saved.`, server GET returned
   `openingHours["1"] = [{open:"11:00", close:"20:00"}]` and
   `openingHours["0"] = [{open:"11:00", close:"23:30"}]` (Sunday kept
   default).
5. Re-opened — button label was now `Hours ✎`, checkbox started
   unchecked (override present), Monday window showed `11:00-20:00`.
6. Re-checked the box, clicked Save → server GET returned the resource
   with no `openingHours` field (override cleared, falls back to
   business hours).

### 21.4 Test deltas

| Suite | Before §21 | After §21 | New |
|---|---:|---:|---:|
| `admin.test.js` | 110 (per §20.5; 120 actual; see §21.5) | 120 | +10 |
| Other 37 suites | unchanged | unchanged | 0 |

### 21.5 Known counts drift (carrying over from §20.7 item 1)

`admin.test.js` started this session at **110 checks** (§20.5 number)
but the runner reported **120** before any §21 edits. Most likely the
§20.5 table dropped a block by accident. The §21 edits add a clean +10,
bringing the post-§21 total to **130**. §4's table still says 37 — it
was stale before §20 and is still stale; suggest a full refresh on a
quiet next session.

### 21.6 Files changed in §21

```text
M  HANDOFF.md
M  end-to-end pipeline ver 1.0/src/adminHtml.js
M  end-to-end pipeline ver 1.0/test/admin.test.js
A  .claude/launch.json    (preview-only; gitignore? not currently — see below)
```

The new `.claude/launch.json` was added to drive `Claude_Preview` for
the verification step. It's a one-config file pointing at
`end-to-end pipeline ver 1.0/src/server.js` on port 4198. Leave or
delete depending on whether the team wants a checked-in launch profile.

### 21.7 Still open after §21

The other items from §20.7 are untouched:

- Customer-facing reply that names which resources are free.
- Refresh §4 test count tables.
- `scripts/testAuthToken.js` (§18.9) commit decision.
- Per-resource conflict error UX (cosmetic field highlight).

End of session addendum.

---

## 22. Session Addendum — 2026-06-01 (customer-facing resource naming)

Follow-up to §21.7 item 1. The bot's slot list (`availabilityResponseText`
in `pipeline.js`) now annotates each free start time with the resource
names that are free at that slot — but **only when the free set is a
proper subset of active resources.** When everyone is free, the slot is
left clean. Convention: no parens = anyone free; `(...)` = constraint.

### 22.1 Example output

3-stylist beauty shop (Amy, Joey, Alice). Amy booked 11:00, Joey + Alice
both booked at 13:00, otherwise free. Customer asks for laser slots:

```
我幫你睇咗，2026-05-25 脫毛 暫時見到以下時段：
11:00–11:30（Joey、Alice）、11:30–12:00、12:00–12:30、12:30–13:00、
13:00–13:30（Amy）、13:30–14:00、14:00–14:30、14:30–15:00、15:00–15:30、
15:30–16:00。請問你想揀邊個時間？…
```

Only the two constrained slots carry name annotations.

### 22.2 Policy decisions

| Business | Names in reply? | Reason |
|---|---|---|
| `beauty_demo` | yes | stylists are customer-relevant; naming helps the customer match a preference |
| `edu_demo` | yes | named instructors; same reasoning |
| `restaurant_demo` | n/a | no per-resource model in this codebase |
| `prince_snooker` | **no** | 12 near-identical tables; "any table" is the default expectation and naming would be noisy |
| `igshop_demo` | n/a | no bookings |
| unknown / future | no (default) | safer default; opt-in per business in `shouldNameResources` |

When the customer pinned a specific resource in their message
(`query.resourceId` set), naming is also skipped — they already chose,
so restating the name in every slot would be redundant.

### 22.3 What landed

| File | Change |
|---|---|
| `end-to-end pipeline ver 1.0/src/pipeline.js` | New `shouldNameResources(businessId, query)` and `buildResourceNameMap(backend, businessId)` helpers. `inferAvailabilityResponse` resolves the name map when policy allows and passes it through to `availabilityResponseText`. `formatSlotsForDisplay` gained an `opts = { resourceNamesById, english }` parameter and appends `(...)` annotations only when `session.availableResources.length < totalActive`. English uses ASCII `( )` + `, ` separator; Chinese uses full-width `（）` + `、` separator. |
| `end-to-end pipeline ver 1.0/test/pipeline.store.test.js` | +11 checks across 5 cases (Case 10a–10e): zh subset-naming, en subset-naming, customer-pinned skip, snooker opt-out, legacy single-pool skip. |

No store or admin changes needed — this is pure draft-text formatting.

### 22.4 Test deltas

| Suite | Before §22 | After §22 | New |
|---|---:|---:|---:|
| `pipeline.store.test.js` | 68 | 79 | +11 |
| Other 37 suites | unchanged | unchanged | 0 |

### 22.5 Known follow-ups

- **Per-business opt-in is hardcoded.** `shouldNameResources` lists the
  IDs directly. If the SaaS grows to multi-tenant config, this should
  move into the business config object.
- **No "all free" hint copy.** If a shop has many slots that are all-free,
  the customer just sees a long string of times with no annotations —
  which is the same as today's behavior, just longer when there are
  partial slots. Acceptable for v1; revisit if usability data says
  otherwise.
- **Threshold for very large resource lists.** With 5+ active stylists,
  even the subset annotation can get long: `(Amy、Joey、Alice、Bob)`.
  Consider a count fallback (e.g., `(4 stylists free)`) if any tenant
  hits that scale.

End of session addendum.

---

## 23. Session Addendum — 2026-06-01 (per-resource conflict UX)

Closes the last open §21.7 item. When adding or editing a booking
fails because the resource is already taken on that date/time, the
admin UI now surfaces the error on the resource field (red outline +
inline message) instead of leaving it as a status-bar string only.

### 23.1 What landed

| File | Change |
|---|---|
| `end-to-end pipeline ver 1.0/src/adminHtml.js` | New `.field-error` + `.input-error` CSS rules. Top add-form gains a `<div id="book-resource-error" class="field-error" hidden>` slot under the resource select. Popover edit form gains a `<div id="pop-resourceId-error">` slot inside its resource label. New helpers in the script: `parseBookingError(message)` (regex-parses the server's `resource conflict: <id> already booked HH:MM-HH:MM on YYYY-MM-DD` string), `showBookingResourceConflict({ selectEl, errorEl, parsed })`, `clearBookingResourceConflict(...)`. Both forms' catch blocks now call the parser; on a match they decorate the field and still call `setStatus` so the status bar keeps the full server message. The top form clears the error on `change`/`input` of resource/date/time and on business switch (inside `loadAll`). The popover wires the same clear-on-edit listeners after rendering. |

No store / server / pipeline changes — pure admin-page presentation.

### 23.2 Gotcha worth knowing about

`adminHtml.js` builds the entire admin page as a template literal,
which means **any regex you put inside the embedded `<script>` needs
doubled backslashes**. A `/\s/` literal becomes `/s/` by the time it
reaches the browser because the template-literal evaluator treats `\s`
as an unrecognized escape and drops the backslash. The regex in this
section uses `\\s`, `\\S`, `\\d` so the served HTML contains `\s`,
`\S`, `\d`. Caught this only by inspecting the served HTML with
`curl /admin` after `parseBookingError.toString()` showed the escapes
stripped at runtime.

Pre-existing regexes in this file all happened to use literals that
don't need escaping (`/&/`, `/</`, `/>/`, `/"/`), so this is the first
case where the gotcha surfaced. Future regex additions in this file
should follow the same rule.

### 23.3 Manual verification (Claude_Preview)

Booted preview on `:4198`, beauty_demo with Amy + Joey, added Amy at
14:00–14:30 then tried Amy at 14:15–14:45. Captured:

- `field_error_visible: true`
- `field_error_text: "Amy is already booked 14:00-14:30 on 2026-05-25. Pick a different resource or change the time."`
- `select_has_input_error_class: true`
- `status_text: "Add failed: resource conflict: res_e007282adfd5 already booked 14:00-14:30 on 2026-05-25 (id book_…)"`

Changing the date triggered `clear-on-edit`:
- `field_error_cleared: true`
- `select_class_cleared: true`

### 23.4 Test deltas

Same string-parsing logic doesn't have unit-test coverage; behavior is
verified via `Claude_Preview` end-to-end. The existing admin tests
already cover the server-side conflict path (`POST booking conflict:
400` + `error message`); the new UI code only consumes that error string.

All four affected suites stayed green: admin 120, pipeline.store 79,
server 31, availabilityStore 248.

### 23.5 What's still open

The §21.7 backlog is now empty. The §22.5 items remain wait-and-see
(multi-tenant config, large-shop thresholds, copy tweaks); revisit
when usability data or scale demands.

End of session addendum.

---

## 24. Session Addendum — 2026-06-02 (OSS readiness package + late commits)

Backfills the 2026-06-02 OSS-prep work plus two 2026-06-01 commits that landed
after §23 and were never logged. Nothing in this block changes runtime behaviour
of the per-resource model; it's positioning, packaging, and new LLM adapters.

### 24.1 Commits covered

| Commit | Date | What |
|---|---|---|
| `3c5d6a1` | 2026-06-01 | `scripts/testAuthToken.js` — pings `ANTHROPIC_AUTH_TOKEN` through the configured proxy with distinct exit codes (OK / RATE_LIMIT / AUTH_ERROR / UPSTREAM_DOWN / OTHER / CONFIG). Reads creds from `whatsapp-web-test-bridge/.env`. **Closes the §18.9 / §20.7 backlog item.** |
| `192af01` | 2026-06-01 | `.claude/launch.json` — Claude_Preview MCP launch profile for the admin/webhook server on `:4198`. |
| `bb590a2` | 2026-06-02 | OSS prep pass on `docs/oss-ready-chinese-positioning`. See §24.2 — mis-labelled `docs:` but ships substantial code. |
| `9b18468` | 2026-06-02 | Merge `origin/main` into the OSS branch (conflict-resolution merge). |
| `4a10fad` | 2026-06-02 | Restore CI workflow + resolve branch conflicts. Notably adds `solara_bazi` KB entries (see §24.3). |
| `c2e1fb6` | 2026-06-02 | Merge PR #3. OSS branch lands on `main`. |

### 24.2 OSS readiness package (`bb590a2`)

**Positioning rebrand.** Repo headline shifts from *Hong Kong AI Customer
Support SaaS for Cantonese SMEs* to *Privacy-first Traditional Chinese / English
AI customer-support safety framework*. Module READMEs (`AI draft engine`,
`knowledge base`, `intent classifier`, `model router`, legal drafts) all
rewritten in the same commit. **HANDOFF.md was rebranded on the OSS branch but
the merge resolved in favour of main's version — see §24.5 #4.**

**Top-level OSS files (new).**

| File | Purpose |
|---|---|
| [`README.md`](README.md) | OSS landing page. |
| [`LICENSE`](LICENSE) | MIT. |
| [`SECURITY.md`](SECURITY.md) | Vulnerability reporting + sensitive-data rules. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Dev setup, contribution areas, PR checklist. |
| `.env.example` | Sample env scaffolding. |
| `.gitignore` | Expanded ignore set. |
| `.github/workflows/ci.yml` | Push + PR runs `npm test` on Node 20. |
| [`package.json`](package.json) | `license: MIT`, `private: false`, keywords, `engines.node: >=20`, `npm test` → `node scripts/run-tests.js`. **Adds `jsdom` as devDependency.** |
| [`scripts/run-tests.js`](scripts/run-tests.js) | Recursive `*.test.js` discovery (skips `.git`, `node_modules`, `deliverables`, `.local`, `.cache`). One `npm test` runs the whole suite. |

**New LLM adapters in `AI draft engine ver 1.0/src/`.**

- `claudeOAuthAdapter.js` — Claude OAuth (Pro/Max subscription tokens) adapter. 17 unit tests.
- `codexCliAdapter.js` — Codex CLI bridge for the OpenAI-OAuth fallback path. 29 unit tests.
- `anthropicAdapter.js` — touched (surface preserved).
- `draftEngine.js` — `TONE_PROFILES` rewritten ("Hong Kong Cantonese" → "Traditional Chinese"). `normalizeTokenUsage` now preserves `totalTokens` when the provider returns it (previously inferred or dropped).

**New smoke scripts in `AI draft engine ver 1.0/scripts/`.** `loginCodexFromEnv.js`,
`runClaudeOAuthSmoke.js`, `runCodexLlmSmoke.js`. Live-call only — **not part of
`npm test`, no logged live run yet.**

### 24.3 KB seed expansion (`4a10fad`)

`knowledge base ver 1.0/seed/hkSmeSeed.js` adds 7 entries under `solara_bazi`
(a BaZi-consultation archetype already declared in the README demo table):

- `solara_bazi_hours` (24-hour enquiry)
- `solara_bazi_pricing` (NT$400 / NT$1,200 / NT$2,000 / NT$4,000 — note **TWD, not HKD**)
- `solara_bazi_intake` (birth date / time / place)
- `solara_bazi_payment_methods` (`safeAutoSend: true`)
- `solara_bazi_delivery_format` (same-day text / voice / call)
- `solara_bazi_scope` (relationships / career / wealth / luck cycles; explicit disclaimer)
- `solara_bazi_restricted_topics` (no legal cases)

Same commit also touched `business rules`, `intent classifier`,
`safety checker`, `pipeline.js`, `pipeline.cases.js` — all small alignment fixes
around `solara_bazi` and the rebrand.

### 24.4 Test totals after the merge

`npm test` (via the new runner) now reports **3,077 tests across 43 runners**,
up from §13's baseline of 3,003 / 38. The +2 new runners are
`claudeOAuthAdapter` and `codexCliAdapter`; the rest of the delta is from
expanded suites picked up by recursive discovery.

### 24.5 Inconsistencies introduced (read before touching these)

1. **README test counts are stale.** [README.md:29](README.md:29) says "2,121 passing across 16 plain Node.js test runners". Actual: 3,077 / 43.
2. **README claims "No npm dependencies are required. Everything is plain Node.js stdlib."** ([README.md:31](README.md:31)) — but [package.json](package.json) ships `jsdom: ^29.1.1` and CI runs `npm install`. Pick one: drop the claim, or drop `jsdom` (find what test pulls it).
3. **Module table missing three folders.** README's table has 14 entries but `package ops ver 1.0`, `usage tracker ver 0.1`, and `whatsapp web automation prototype ver 0.1` aren't listed (the first appears in the pipeline diagram, the other two are present and tested).
4. **HANDOFF.md was NOT rebranded.** The OSS branch had an HK→Traditional-Chinese rename of HANDOFF.md, but the merge resolved by keeping main's per-resource-rich version, which still uses "Hong Kong AI Customer Support SaaS" / "Cantonese" throughout. The repo is now bilingual in tone: OSS-facing docs say "Traditional Chinese", this internal log keeps the HK framing.
5. **`bb590a2` is mis-labelled `docs:`** despite shipping ~1,500 lines of adapter code, tests, and a test runner. Worth knowing when reading `git log --grep=docs`.
6. **No live-smoke trace for the new adapters.** `runClaudeOAuthSmoke.js` and `runCodexLlmSmoke.js` have unit coverage but the live-call paths haven't been verified against real tokens in any logged session.

### 24.6 Suggested next moves

In rough priority:

1. **Fix README counts and dependency claim** ([README.md:29-31](README.md:29)) — replace the stale numbers; reconcile the "no npm dependencies" line with the actual `jsdom` devDependency.
2. **Add the three missing modules to README's module table.**
3. **Live-smoke the new adapters.** Run `runClaudeOAuthSmoke.js` and `runCodexLlmSmoke.js` against real creds; log §25 with the outcome. Don't ship to tenants until there's a real round-trip.
4. **Decide HANDOFF rebranding policy.** If HANDOFF stays HK-internal, add a one-line note at the top so future readers aren't confused by the tone mismatch with the OSS docs.
5. **§22.5 wait-and-see items still wait** — no new signal, no action unless a user reports the failure modes.

End of session addendum.

---

## 25. Session Addendum — 2026-06-03 (live-smoke of the OSS adapters)

Picks up §24.6 item 3. Goal: verify that the two new LLM adapters added in
`bb590a2` actually round-trip against real creds, not just pass unit tests.

### 25.1 Results

| Adapter | Smoke script | Outcome |
|---|---|---|
| Codex CLI | `AI draft engine ver 1.0/scripts/runCodexLlmSmoke.js` | ✅ **Live round-trip verified.** See §25.2. |
| Claude OAuth (Hermes) | `AI draft engine ver 1.0/scripts/runClaudeOAuthSmoke.js` | ❌ **Blocked** — needs a Hermes-format `~/.hermes/auth.json`. See §25.3. |

### 25.2 Codex CLI smoke (successful)

Default prompt `"facial幾錢？"` against `beauty_demo` hit `auto_send` (KB-grounded
reply, no LLM call) and tripped the script's `"did not enter the LLM path"`
guard. Re-ran with a complaint prompt that forces the staff-review path:

```bash
LLM_SMOKE_TEXT="我上次做完facial之後皮膚紅咗成個禮拜，想problem要點處理？" \
  node "AI draft engine ver 1.0/scripts/runCodexLlmSmoke.js"
```

Result:

```json
{
  "businessId": "beauty_demo",
  "inputText": "我上次做完facial之後皮膚紅咗成個禮拜，想problem要點處理？",
  "finalStatus": "staff_review",
  "action": "staff_review",
  "intent": "aftercare",
  "llmUsed": true,
  "model": "gpt-5.5",
  "safety": "revise",
  "safeToSend": false,
  "tokenUsage": {
    "inputTokens": 0,
    "outputTokens": 0,
    "totalTokens": 9643,
    "source": "codex_cli"
  },
  "draftText": "多謝你告知我哋情況。想先了解多一點：紅的範圍、程度，以及有沒有痕癢、刺痛或其他不適？我哋會交由店內同事跟進並給你合適安排。",
  "staffNote": "Draft candidate for staff review only."
}
```

Notes:

- Codex CLI returns only `totalTokens`, not separate input/output. The
  `normalizeTokenUsage` change in §24.2 (`bb590a2`) is what preserves that
  field; verified live here.
- Safety checker correctly flagged the medical-aftercare draft as `revise`
  (`safeToSend: false`), routing to staff. Draft text itself is appropriately
  cautious Traditional Chinese.
- Pre-req for anyone repeating this: Codex.app installed at
  `/Applications/Codex.app/` (binary at `Contents/Resources/codex`) and
  `~/.codex/auth.json` populated by a prior `codex login`. The smoke script
  spawns the binary directly, no PATH lookup.

### 25.3 Claude OAuth smoke — env-var fallback implemented

The adapter as originally shipped only read a **Hermes credential-pool file**
at `~/.hermes/auth.json` — an internal Anthropic format that doesn't match
anything a fresh-clone user could produce. This blocked the live smoke on a
machine without that file.

**Fix landed in this session** ([claudeOAuthAdapter.js](AI draft engine ver 1.0/src/claudeOAuthAdapter.js)):
the adapter now supports a `CLAUDE_CODE_OAUTH_TOKEN` env-var fallback that
pairs with `claude setup-token` (the standard Claude Pro/Max subscription
flow). New `resolveCredential` helper with explicit precedence:

1. Caller-supplied `config.authPath` or `config.staticToken` (used by tests and internal callers).
2. `CLAUDE_CODE_OAUTH_TOKEN` env var → direct bearer auth to `api.anthropic.com` (or `ANTHROPIC_BASE_URL` if set).
3. `CLAUDE_OAUTH_AUTH_PATH` env var → Hermes credential-pool file (refresh-capable).
4. Default `~/.hermes/auth.json` → Hermes path.
5. Otherwise throw a message naming both modes and the resolved path.

Error surfacing also improved: failed requests now include the HTTP status
and response body (first 240 chars), so future debugging doesn't need a
manual curl.

**Live smoke against the env-var fallback** (with `CLAUDE_CODE_OAUTH_TOKEN`
exported from `whatsapp-web-test-bridge/.env`, no `ANTHROPIC_BASE_URL`):

```json
{
  "businessId": "beauty_demo",
  "inputText": "我上次做完facial之後皮膚紅咗成個禮拜，想problem要點處理？",
  "finalStatus": "staff_review",
  "action": "staff_review",
  "intent": "aftercare",
  "llmUsed": true,
  "model": "claude-opus-4-6",
  "safety": "revise",
  "safeToSend": false,
  "tokenUsage": { "inputTokens": 920, "outputTokens": 415, "source": "claude_oauth" }
}
```

Two drafts came back in clean Traditional Chinese, both routed to staff
review (correct for a medical-aftercare topic).

**Gotcha worth knowing about**: the proxy at `ANTHROPIC_BASE_URL` (in the
bridge `.env`) rejects `CLAUDE_CODE_OAUTH_TOKEN` with `401 INVALID_API_KEY`
— it expects an `ANTHROPIC_AUTH_TOKEN` instead. The OAuth bearer path goes
direct to `api.anthropic.com`. The README now calls this out at
[README.md:84](README.md:84).

**Tests:** `claudeOAuthAdapter` runner went from 17 → 28 cases. New cases
cover env-var bearer mode, the precedence-config-wins rule, `ANTHROPIC_BASE_URL`
override in env mode, and the helpful "no creds available" error.

### 25.4 What's still open

- **Both adapters are now OSS-ready.** Codex needs Codex.app + a logged-in
  CLI; Claude OAuth needs either `claude setup-token` or the internal
  Hermes file.
- §24.6 status after this session: items 1, 2, 3, and 4 are done (1 + 2 in
  commit `1bcc8f9`, 3 in commit `59c5ff9`, 4 via the tone note at the top of
  this file). Only §22.5 wait-and-see items remain — no signal yet, do not
  pull unless usability data shows up.

End of session addendum.

---

## 26. Session Addendum — 2026-06-04 (OSS rebrand follow-up: live prompts)

Cleans up three live LLM system prompts that the §24 OSS rebrand
(`bb590a2`) missed. These reach real Claude/OpenAI calls in production, so
the customer-facing "Hong Kong SME" framing was leaking into prompts that
the README claims are positioned around "Traditional Chinese / English SMEs".

### 26.1 What changed

| File | Line | Was | Now |
|---|---|---|---|
| [AI draft engine ver 1.0/src/draftEngine.js](AI draft engine ver 1.0/src/draftEngine.js) | 345 | `"You are a paraphraser for a Hong Kong SME customer-support bot."` | `"You are a paraphraser for an SME customer-support bot."` |
| [end-to-end pipeline ver 1.0/src/claudeAdapter.js](end-to-end pipeline ver 1.0/src/claudeAdapter.js) | 63 | `"You are an intent and confidence analyzer for a Hong Kong SME customer-support bot."` | `"…for an SME customer-support bot."` |
| [end-to-end pipeline ver 1.0/src/openaiAdapter.js](end-to-end pipeline ver 1.0/src/openaiAdapter.js) | 91 | (same) | (same) |

Pattern matches `bb590a2`'s `TONE_PROFILES` rewrite — drop "Hong Kong"
entirely rather than substituting "Traditional Chinese". The README uses
"for SMEs" without a regional qualifier, so this aligns.

### 26.2 What was deliberately NOT changed

- `whatsapp-web-test-bridge/src/staffReplyClassifier.js:11,26` — comments
  `// Cantonese / Chinese` label regex blocks containing genuinely
  Cantonese-specific phrases (`嗰日`, `唔好意思`, `已book`, `冇位`). A Mandarin
  Traditional-Chinese speaker would write `不好意思`, not `唔好意思`. The label is
  descriptively accurate; relabeling would actually be less precise.
- `end-to-end pipeline ver 1.0/test/pipeline.test.js:54` — assertion message
  `"tonight should resolve using Hong Kong date from injected clock"`. The
  test verifies HKT-timezone behavior (the live tenant's timezone). The
  phrasing is accurate, not stale positioning.

### 26.3 Verification

- No test asserts against the literal prompt strings — confirmed via
  `grep -rn "Hong Kong SME\|paraphraser for" --include="*.test.js"`.
- Full suite still green: 3,088 tests across 43 runners.
- Live behavior unchanged: the prompts now drop one qualifier; rules,
  citations, and outputs are unaffected.

End of session addendum.

---

## 27. Session Addendum — 2026-06-13 (four deterministic differentiators)

Added four new `* ver 1.0` modules that give the bot capabilities no English-first /
prompt-first competitor ships. All deterministic, stdlib-only, **default-safe**
(off / no-op until configured) so the existing suite stays byte-for-byte green.

New modules + tests (89 new tests, suite now 56 test files, all green):

- `action journal ver 1.0` — SHA-256 hash-chained, append-only JSONL flight recorder.
  `verifyChain()` detects edit/delete/reorder; `replay(evaluate, getConfig)` re-runs the
  business-rules gate over journaled sanitized inputs and proves each deterministic
  decision reproduces. PII-minimised: `senderRef` is a hash; customer text retained only
  when `finalStatus === "ready_to_send"`, else hashed. `buildEvidenceBundle()` exports a
  scoped, chain-verified record set.
- `hk calendar ver 1.0` — `resolveCulturalDate(text, now)` resolves 年初一/二/三, 除夕,
  清明, 佛誕, 端午, 中秋(翌日), 重陽, 冬至, 平安夜, 聖誕, 母親節 etc. Lunar dates from
  `seed/hkHolidays.js`, verified against the GovHK gazette **through 2027**; out-of-table
  years return `provisional` (ask staff, never guess); spans like 過年 return `ambiguous`.
- `canto sentiment ver 1.0` — `scoreAnger(text, history)` tiered Cantonese profanity/anger
  lexicon + HK review-pile-on threat detection (target + action co-occurrence) + velocity.
- `weather policy ver 1.0` — 打風自動制. `createWeatherStore().setSignal(level)` +
  per-level policy (T8+/black-rain → closed + depositWaiver). `fetchHkoSignal()` reads the
  HKO open-data warnsum but is NOT in the request path (wire to a poller). No network by default.

Pipeline wiring (all in `end-to-end pipeline ver 1.0/src/pipeline.js`):

- `createPipeline` gained `journal` (opt-in via `config.actionJournal` or
  `ACTION_JOURNAL_PATH`) and `weatherStore` (default no-op signal "none"), both exposed on
  the returned pipeline object. Every `runMessage` return path goes through `journaled()`.
- `inferRequestedDate` calls `resolveCulturalDate` first; concrete dates flow into the
  existing availability machinery, ambiguous/provisional fall through to "ask for the date".
- `scoreAnger` runs on `gateway.sanitizedText`; its result is passed to `evaluate()` and
  promotions are dropped from the customer draft when `suppressPromo`.
- `inferWeatherResponse` is prepended to the `requiredClarification` chain, so a live
  signal pre-empts hours/booking replies with a closure/caution banner.

Core-module change: `business rules ver 1.0/src/businessRules.js` `evaluate()` now accepts an
optional `sentiment` input and its Tier-2 handoff block escalates on `sentiment.escalate`
(label `angry_customer`) or `sentiment.reputationThreat` (label `reputation_risk`).
With no `sentiment` passed, behaviour is identical — confirmed by the unchanged suite.

Deliberately NOT built (scope discipline, documented for the next session): owner-console
`打風`/`核銷` chat-commands, atomic slot holds, FPS/PayMe deposit ledger, capability-contract
action layer, 熟客 regulars ledger. See the research transcript for full designs.

End of session addendum.

---

## 28. Session Addendum — 2026-06-13 (three SME 剛需 operations features)

After feedback that the trust/audit angle was too abstract, added three deterministic,
money/operations features owners feel immediately. All stdlib-only, opt-in/default-safe,
each its own `* ver 1.0` module + unit tests + pipeline integration tests.

- `deposit ledger ver 1.0` — FPS/PayMe anti-no-show. `evaluateDepositPolicy` (party
  size / peak window / service, from `businessConfig.depositPolicy`) → issue a DEP code
  + held booking; `claimByReference`/`claimBySenderProof` reconcile `過咗數 DEP-XXXX`;
  `verify` is the ONLY money-confirming path (human-gated). Pipeline: a deposit-request
  hook in the requiredClarification chain + a claim short-circuit after gateway/intent.
  Weather synergy: typhoon closure pre-empts the request; `waiveAllActive` for waivers.
- `package redemption ledger ver 1.0` — 套票核銷. Append-only hash-chained log (reuses
  action journal `sha256`/`canonicalize`); balance is folded, never a counter; 改正 =
  compensating entry. `redeemAndReceipt` redeems + enqueues a WhatsApp receipt via the
  outbox. Pipeline: owner fast-path for `核銷 <customer> <service>` (gated on
  `ownerConsole.isOwner` + a configured ledger).
- `regulars ledger ver 1.0` — 熟客 modal-pattern memory (derived stats only, senderRef
  hashed, ≥3 visits + ≥50% dominance, PDPO retention + `forget()`). Pipeline:
  `inferRegularRebook` in the requiredClarification chain offers `照舊…？` as a clarify
  (never auto-books); explicit time requests are respected.

createPipeline now accepts `depositLedger`, `redemptionLedger`, `outboxStore`,
`regularsLedger` (all default null/off) and exposes them. `restaurant_demo` /
`beauty_demo` gained a demo `depositPolicy` (inert without a depositLedger).

Suite: 62 test files, all green (was 56). Per owner feedback, the action journal is
kept default-off and de-emphasised as a standalone pitch; its hash-chain tech now has a
concrete use powering the 套票 redemption receipts/statements.

Still deferred (designs in the research transcript): atomic slot holds inside the
availability store; capability-contract action layer; owner-console-native `核銷`/`打風`
commands (currently a pipeline fast-path + the weatherStore API).

End of session addendum.

---

End of handoff.
