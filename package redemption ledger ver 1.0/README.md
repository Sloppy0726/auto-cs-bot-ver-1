# Package Redemption Ledger ver 1.0  (套票核銷數簿)

Turns HK's biggest consumer-dispute category — prepaid package balances — into an auditable, customer-visible ledger.

## Why this is unique

Prepaid packages (facial 10 次, 堂費, laser 套票) are the operating core of beauty / fitness / tutoring shops, and **"我仲有幾多次 / 幾時到期" is the #1 Consumer Council dispute** (~7,700 complaints, ~HK$200M). Fresha doesn't surface package balances; Storellet does points in its own app. **No product gives a per-customer session ledger pushed to the customer in WhatsApp after every visit.**

What makes it *dispute-proof* rather than just convenient: balance is **derived by folding an append-only, hash-chained event log** (purchase / redemption / adjustment) — never a mutable counter. The chain reuses the [action journal](../action%20journal%20ver%201.0/) primitives, so a redemption history can be verified and exported as a statement either side can take to the Small Claims Tribunal. Mistakes are corrected with a compensating **改正** entry, never by editing history.

## Flow

```
staff: 「核銷 85261112222 facial」
  → ledger appends a redemption (−1), folds the new balance
  → WhatsApp receipt pushed to the customer:
      「✅ 已為你核銷 1 次保濕 facial。今次係第 4 次，仲剩返 2 次，套票到期日 2026-07-31。」
  → owner gets: 「✅ 已核銷 1 次（facial），客人仲剩 2 次，已 WhatsApp 通知客人。」
```

## API

```js
const { createRedemptionLedger, redeemAndReceipt, parseRedeemCommand } = require("./src/redemptionLedger");

const ledger = createRedemptionLedger({ filePath });
ledger.seedFromPackages(packages);          // bootstrap from existing package records
ledger.balance(packageId);                  // { total, used, remaining, expiryDate, ... } (folded)
ledger.redeem({ packageId, idempotencyKey });// −1 session; double-tap safe
ledger.adjust({ packageId, sessions: 1, reason });  // compensating 改正 entry
ledger.verify(packageId);                   // hash-chain integrity
ledger.statement(packageId, { language });  // exportable, chain-verified statement
```

## Pipeline wiring (opt-in)

When a `redemptionLedger` (and `outboxStore`) are passed to `createPipeline`, an **owner fast-path** handles `核銷 <customer> <service>` from a registered owner phone: it redeems, pushes the receipt to the customer's chat via the outbox, and replies to the owner. A non-owner's identical text is **not** treated as a redemption, and with no ledger the command is inert — so existing behaviour is unchanged.

Idempotency keys make a double-tap safe (never burns two sessions). The customer's own `package_status` balance question continues to be answered by the existing package store; the ledger is the tamper-evident write + receipt + statement authority.

## Tests

```bash
node "package redemption ledger ver 1.0/test/redemptionLedger.test.js"    # fold, redeem, adjust, verify, statement, persistence, receipt enqueue
node "package redemption ledger ver 1.0/test/redemptionPipeline.test.js"  # owner 核銷 → receipt, non-owner guard, default-safe
```
