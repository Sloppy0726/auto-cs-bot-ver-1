# Owner Morning Digest ver 1.0  (每朝一覽)

A read-only aggregator that folds the ledgers + weather + calendar + inbox risk flags into **one bilingual WhatsApp message** the owner reads each morning.

## Honest role: the spine, not a system of record

The research is explicit: this **owns no data and locks in nothing by itself** — dropping it loses a convenience, not the books. It ships *last* and only over modules that already exist (A/C/D + weather/calendar/inbox). Its value is **habit formation**: by surfacing the deposit / win-back / fraud-gate numbers every morning, it makes operating through the bot a daily ritual, which is what makes A/C/D stick.

Two rules enforced here:
- **Emit only non-empty lines** — an empty digest trains owners to ignore it (the no-content case sends a single "nothing needs your attention" line, and `runOnce` skips it entirely).
- **No compliance-deadline lines** — the cooling-off / PDPO / consent clocks don't exist, and a default-silent "compliance" line is a liability (false sense of coverage → missed deadline).

## What it folds (only if non-empty)

`build({ deps, businessId, now })` → weather signal · upcoming HK public holiday (next 3 days) · deposits awaiting payment · today's confirmed deposits (HK$) · near-expiry packages (recoverable HK$) · open reputation-risk + suspicious-deposit items in the staff inbox.

```
早晨！2026-07-10 今日概況：
• ⚠️ 天氣：三號強風信號生效，留意停業安排。
• 💰 1 個訂金待過數／待確認。
• ✅ 今日已確認收訂 1 筆，共 HK$500。
• ⏳ 1 個套票快到期，HK$1440 可召回，值得 follow。
```

## Delivery

- **On-demand**: an owner texting `今日概況 / 每朝 / /digest` gets it as a pipeline owner-fast-path reply (owner-gated).
- **Scheduled**: `runOnce({ deps, businessId, outbox, journal, ownerChatKey })` enqueues it to the owner once per day (a persisted `lastSent` date-guard prevents repeats; empty digests are skipped). Wire it to a daily tick — a once-per-day guard in the WhatsApp-Web bridge's existing drain loop, or a systemd `.timer`. There is no cron primitive in the repo, so the scheduler is the operator's small glue step; the on-demand command works with zero scheduling.

## Tests

```bash
node "owner digest ver 1.0/test/ownerDigest.test.js"
```

Covers line folding, the no-spam empty state, upcoming-holiday surfacing, inbox risk lines, once-per-day `runOnce` dedupe to the owner phone, empty-skip, and command recognition.
