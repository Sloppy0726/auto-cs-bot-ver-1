# Regulars Ledger ver 1.0  (熟客 + 照舊一鍵 rebook)

A sender-bound regulars profile mined deterministically from booking history, so a regular typing `想book返個位` / `今個禮拜得唔得？` gets `照舊星期二 下午3點、4位？覆「係」即幫你 book` — a confirm-don't-assume nudge.

## Why this is unique

Persistent customer memory is "the single highest-leverage gap" in support automation — but it ships only at enterprise tier (Gladly, Decagon) or as unreliable LLM-extraction frameworks (Mem0/Zep, whose own reports admit production gaps). 熟客 relationships are the operating core of HK SME retail / F&B / services, and the pain is real: after staff turnover, nobody remembers a regular's usual slot.

This version needs **no LLM fact extraction**: profiles are **modal statistics** over the structured booking records the system already writes. It inherits the codebase's sender-bound, no-cross-customer-leakage guarantee — privacy-safe memory that prompt-stuffed chat history structurally can't match.

## Behaviour & safety

- `recordVisit({ businessId, senderId, booking })` stores **only derived fields** (weekday, time, party size, service, resource) — never raw message text. Sender ids are pseudonymised (`senderRef` hash).
- `profile(...)` returns `{ visitCount, isRegular, modal: { weekday, time, partySize, service } }`. A modal value is only surfaced when it covers **≥50%** of recent visits, and `isRegular` requires **≥3** visits — so the bot never makes a creepy or wrong "照舊" guess.
- `inferRegularRebook(...)` offers the usual slot **only** when a regular asks to book without pinning a time; it returns a `clarify` ("覆「係」"), so confirmation flows through the existing conversation-context stitch and **never auto-books on assumption**. An explicit request ("聽日晚上8點 2位") is respected, not overridden.
- **PDPO**: a retention window drops stale visits, and `forget({ businessId, senderId })` erases a customer on request.

## Pipeline wiring (opt-in)

Off unless a `regularsLedger` is passed to `createPipeline`. When on, a regular's vague booking request is answered with their usual slot instead of a generic "please give me a date/time". `seedFromBookings(availabilityStore.listBookings(...))` backfills profiles; in production `recordVisit` is called at booking-approve time.

## Tests

```bash
node "regulars ledger ver 1.0/test/regularsLedger.test.js"    # modal stats, threshold, dominance, retention, forget, suggestion text
node "regulars ledger ver 1.0/test/regularsPipeline.test.js"  # 照舊 for a regular, normal flow for one-offs, explicit-request respect, default-safe
```
