# Owner Reads ver 1.0  (一句搞掂 — 跨帳簿即時查詢)

The **read half** of the one-message command console. An owner texts one line and gets a deterministic, cross-ledger answer — no dashboard, no LLM.

## Why this makes the bot inevitable

The write side (`核銷`, `照舊`, deposit issuance) already runs through the bot as pipeline fast-paths. This module adds the **reads** that make the owner *operate the shop through WhatsApp every morning* — the daily habit the research identified as the glue that makes A/C/D stick.

| Owner texts | Answer (deterministic) |
|---|---|
| 「今日收咗幾多訂」 | today's verified deposits (count + HK$) + pending count |
| 「邊個套票就到期」 | near-expiry packages with remaining sessions + recoverable HK$ |
| 「今個月流失幾多 / 召回」 | win-back digest: at-risk + recovered HK$ |
| 「閘咗幾多假過數」 | fraud-gate loss-prevention number |

## Behaviour

`answerOwnerQuery({ text, deps, businessId, now })` → `{ handled, text }`. It folds the existing ledgers (deposit, redemption, and an ephemeral win-back over the redemption ledger) and the fraud gate. It is **owner-gated** in the pipeline (`ownerConsole.isOwner`) and runs **before** the SMB-toolkit router, so a customer's identical text is never treated as an owner read, and "今日生意" still routes to the toolkit. Degrades gracefully — an unconfigured ledger simply isn't answerable.

## Tests

```bash
node "owner reads ver 1.0/test/ownerReads.test.js"
```

Covers intent classification (and not hijacking SMB queries), each read's figures, graceful degradation, and the owner-gated pipeline path (owner answered, non-owner excluded).
