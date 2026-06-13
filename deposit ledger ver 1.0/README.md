# Deposit Ledger ver 1.0  (留位收訂 + 入數確認)

A deterministic FPS / PayMe deposit state machine that kills no-shows — the single most expensive problem for HK restaurants and salons.

## Why this is unique

Bistrochat, inline, Fresha all take deposits, but on **card rails**. Hong Kong deposits actually happen as **FPS / PayMe transfers and 入數截圖 inside the WhatsApp thread**, and the research sweep found **no product reconciles "a customer sent an FPS screenshot at 11pm" against a booking**. This module:

- Issues a unique short code (`DEP-7K3Q`) with the shop's **own approved** payment rail when a booking matches the deposit policy.
- Matches the customer's `過咗數 DEP-7K3Q` (or a lone payment-proof message) back to the held booking — **deterministically, by code**, never by an LLM reading a screenshot.
- Hands staff a **one-tap verify**; the bot acknowledges receipt but **never confirms money** — `verified` is reachable only by an explicit human action. This is a hard, non-configurable safety rule (a wrong "payment received" is a Moffatt-style liability).

## State machine

```
pending ──reference/proof──▶ claimed ──staff verify──▶ verified
   │                                          ▲
   ├── TTL expiry ─▶ expired                  └── waive
   └── typhoon ─▶ waived (weather synergy)
```

## Deterministic policy

`businessConfig.depositPolicy` (owner-set, so quoting the rail is grounded, not invented):

```js
depositPolicy: {
  ttlMinutes: 120,
  rails: { payme: "https://payme.hsbc/sunriserestaurant", fps: "163829005", payee: "Sunrise Restaurant Ltd" },
  rules: [{ minPartySize: 6, days: [5, 6], fromHour: 19, toHour: 22, amount: 500 }]  // first match wins; perHead optional
}
```

`evaluateDepositPolicy(bookingDraft, businessConfig, now)` → `{ required, amount, rails, ttlMinutes }`.

## Pipeline behaviour (opt-in)

Off unless a `depositLedger` is passed to `createPipeline` **and** the business has a `depositPolicy` — so existing flows are byte-for-byte unchanged. When on:

1. A **complete** booking matching the policy → the slot is held in the ledger and the reply quotes FPS/PayMe + the `DEP` code (a `clarify`, idempotent on retries).
2. A later `過咗數 DEP-XXXX` → the deposit flips to `claimed`, the customer gets a *checking, not confirmed* acknowledgement, and a `deposit_claim` staff item is queued for one-tap verify.
3. A live **typhoon closure pre-empts** the deposit request, and `waiveAllActive(businessId)` waives held deposits when the shop closes (weather synergy).

A lazy `sweep({ now })` (no timers) sends one reminder before expiry, then releases the slot.

### Safety & privacy
- The bot never emits "已收到付款 / payment received" — wording stays in the "核實緊 / pending verification" register the safety checker allows; the deposit instruction and the claim acknowledgement are tested to pass `checkDraft`.
- Sender ids are pseudonymised (`senderRef` hash); raw payment references aren't stored against the customer.
- Phone-number FPS rails would trip the safety checker's PII guard — use a PayMe link or a merchant FPS ID (the demo uses both).

## Tests

```bash
node "deposit ledger ver 1.0/test/depositLedger.test.js"     # state machine, policy, sweep, safety, persistence
node "deposit ledger ver 1.0/test/depositPipeline.test.js"   # end-to-end wiring incl. weather synergy + default-safe
```
