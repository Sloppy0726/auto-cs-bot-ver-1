# Reconciliation-of-Record ver 1.0  (假過數對數閘)

A deterministic **fraud gate** that runs *before* the bot acknowledges any deposit claim — the loss-prevention layer on top of the [deposit ledger](../deposit%20ledger%20ver%201.0/).

## Why this makes the bot inevitable

HK shops taking 訂金 over WhatsApp get **fake「過咗數」screenshots, reused old codes, and wrong amounts**. Today the bot acknowledges any claim with a matching code (a human still verifies). This gate adds a read-only risk assessment first:

> A claim's **amount AND reference** must exactly match an **open, sender-bound, unexpired** deposit hold — otherwise it is flagged, routed to staff *without* a clean acknowledgement, and logged so the owner gets a monthly **「閘咗 $X 可疑過數」** loss-prevention number.

Once a shop sees that number every month, turning the bot off means going back to eyeballing screenshots and not knowing what they're losing. The accreted, hash-chained, cross-rail deposit history lives only here — that's the switching cost.

## Risk classes (`assessClaim`, read-only — never mutates)

| risk | meaning | outcome |
|---|---|---|
| `clean` | code + amount match an open sender-bound hold | proceed to claim + staff verify (as before) |
| `no_code` | payment proof, no code | defer to sender-proof claim |
| `amount_mismatch` | stated amount ≠ expected | flag → staff_review |
| `reused_code` | code already claimed/verified/expired | flag → staff_review |
| `expired` | hold past TTL | flag → staff_review |
| `wrong_sender` | code belongs to another customer | flag → staff_review |
| `unknown_reference` | made-up / cross-business code | flag → staff_review |
| `suspicious_proxy` | counterparty on an injected blocklist | flag → staff_review |

**The bot never confirms money — suspicious or not.** A flagged claim gets a neutral, non-accusatory acknowledgement (a legit customer may have fat-fingered an amount) that still says "we're checking, not confirmed". Money is only ever confirmed by a human `deposit verify`.

## Owner-facing

- `lossPreventionSummary(depositLedger, { businessId, fromDate })` → `{ blockedCount, blockedAmount, byRisk }`; `lossPreventionText(...)` renders 「今期攔截咗 N 宗可疑過數…」. Framed as **"claims blocked at the gate"**, never "audited dollars saved" (it's counterfactual).
- `reconcileExport({ depositLedger, businessId, fromDate, toDate })` → a CSV of deposit money-events + the suspicious-claim summary, for the owner / accountant. Honest: deposits are state-machine records of what the shop verified, **not** an audited bank reconciliation.

## Injectable / offline

`suspiciousProxies` defaults to an **empty no-op array** (mirrors the weather/Drive connector pattern) — any Scameter-style screening stays advisory and offline unless a list is configured. No network in the request path. Octopus has no FPS-style reference, so it is CSV-ingested out-of-band, not a real-time gate for that rail.

## Tests

```bash
node "reconciliation-of-record ver 1.0/test/reconcile.test.js"          # all risk classes, amount parsing, loss-prevention, export
node "reconciliation-of-record ver 1.0/test/reconcilePipeline.test.js"  # clean regression + mismatch/unknown/wrong-sender flagged in-pipeline
```
