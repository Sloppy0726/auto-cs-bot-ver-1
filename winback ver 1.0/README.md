# Win-Back + Attribution Engine ver 1.0  (搵錢實證 + 召回引擎)

Reframes the bot from a cost into a **profit centre**: it surfaces the prepaid value and lapsed customers a shop is about to lose, hands the owner a one-tap nudge (staff approves — **nothing auto-sends**), and keeps a tamper-evident **「今個月實收返 HK$X」** ledger.

## Why this makes the bot inevitable

The research called this the "month-1 = a real dollar" hook that stops month-2 churn. Once the owner reads a recovered-HK$ line as P&L, turning the bot off deletes a line item. The differentiator over GHL/Fresha reactivation is **provenance**: the recovered-$ log is **hash-chained** (reuses the action-journal primitives), so the number is auditable, not self-asserted UI.

## What it does (deterministic, stdlib-only)

`sweep({ now, businessId })` reads the existing **redemption ledger** (the one store with the raw customer id + remaining sessions + expiry + per-session price) and emits candidates:

- **`package_expiry`** (service) — remaining sessions, expiring within the window → recoverable HK$ = `dollarRemaining`.
- **`package_lapsed`** (marketing) — remaining sessions, no real visit in `lapseDays`.
- **`waitlist_fill` / `stale_enquiry`** — injectable event seams (default empty), because the regulars ledger pseudonymises its sender ids by design and cannot supply contacts.

Candidates are sorted by recoverable value. `submitCandidates(inbox, candidates)` queues each to the staff inbox (`escalationLabel: "winback"`) for **human approval** — the bot never sends a nudge itself.

## Consent & honesty

- `canSend({ kind })` is an **injectable gate**. Default: a reminder about a customer's *own* package is `service` (allowed); a generic win-back is `marketing`, left to staff discretion (the human approval is the consent safeguard until a real consent vault is wired). A stricter gate can deny marketing outright.
- Attribution is **"candidate recovered", self-asserted within a tight window** — never "audited". `attribute(...)` hash-chains each confirmed recovery (customer id pseudonymised); `verify()` proves the chain; `digest()` folds at-risk + recovered HK$.

## Tests

```bash
node "winback ver 1.0/test/winback.test.js"
```

Covers near-expiry surfacing with recoverable value, skipping used/far/contactless packages, lapsed detection from real (non-seed) redemptions, staff-inbox submission, consent-gate suppression, hash-chained tamper-evident attribution, the at-risk/recovered digest, and injected waitlist/stale events.
