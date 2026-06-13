# IRD s.51C Books-of-Record Engine ver 1.0  (稅務存檔投影)

A **pure projector** that folds the existing ledgers into canonical, hash-verified line items + a daily-takings roll-up, and exports a CSV + bilingual signed statement for an accountant or the Small Claims Tribunal (now ≤ HK$75k).

## Honest positioning (read this first)

The research was emphatic: **this is evidentiary, not a compliance funnel.**

- It records **only what the bot handled** — verified deposits + package purchases/redemptions. Cash/card walk-ins, rent, payroll never enter. It is **NOT the shop's full statutory books.**
- IRO **s.51C** compels keeping business records 7 years *somewhere*; Xero/QuickBooks/a shoebox all satisfy it, and this CSV export *is* the easy exit. So the real value is **tamper-evident dispute/audit defence on the bot-mediated slice of revenue** — not lock-in by mandate.
- Counterparties are **pseudonymised** (`senderRef`); a revenue authority may want identifiable parties, a join that lives outside this de-identified projection.

The statement text states this scope to the owner in both languages — we never overclaim "your statutory books".

## What it does (pure, no pipeline hot-path)

`project({ businessId, fromDate, toDate })` →

- **Cash-in line items** drive daily takings: `deposit_verified` (amount), `package_purchase` (`totalSessions × unitPrice`). `deposit_waived` is recorded at $0; `package_redemption` / `package_adjustment` are **non-cash service-delivery detail** (cash was recognised at purchase).
- Missing per-session price → the purchase amount is flagged `amountKnown: false` and **not counted** (never fabricated).
- `dailyTakings` keyed by the **HK UTC+8 date boundary** (`hkDateKey`).
- `chainVerified` — the redemption chains (+ optional action journal) are hash-verified; deposit records are history-backed state machines.

`exportCsv(...)` → accountant-ready CSV. `statement({ language })` → bilingual extract with the honest scope note, totals, and a tamper-evidence report (chain status + a `sha256` digest of the line items).

## Tests

```bash
node "ird ledger ver 1.0/test/irdLedger.test.js"
```

Covers cash-in folding (deposits + purchases) vs non-cash redemptions, HK-date daily takings, date-range filtering, pseudonymised counterparties, CSV shape, the honest bilingual statement + chain verification, and the no-price → no-fabricated-takings guard.
