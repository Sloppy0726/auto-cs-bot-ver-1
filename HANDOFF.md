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

End of handoff.
