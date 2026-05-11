# Google Drive Promo Sync ver 1.0

Daily promotion sync for time-bound offers stored in a Google Drive folder.

This module is designed for the 24/7 agent use case: once per Hong Kong day, read approved offer docs from Google Drive, normalize them into active promotion facts, and let the reply pipeline consider those facts before drafting.

No real Google Drive API call is made in this module. It uses a dependency-injected `driveClient`, so tests stay offline and production can plug in Google Drive later.

## Timezone Rule

All promotion start / expiry checks use:

```text
Asia/Hong_Kong
UTC+8
```

Do not use server local time or another region.

## Promotion Document Format

A Google Drive doc can contain one or more blocks separated by `---`:

```text
Title: 小顏管理五月體驗優惠
Keywords: 小顏, 小顏管理, 面部輪廓, 收費, 優惠
Intents: pricing, service_info
Summary: 小顏管理五月首次體驗 HK$480，原價 HK$880。主要針對面部線條、浮腫感同輪廓保養，效果因人而異。
StaffInstruction: 可以提五月體驗價，但要提醒客人先做面部狀態評估，唔好承諾一定瘦面。
StartsOn: 2026-05-01
ExpiresOn: 2026-05-31
Approved: true
```

Drive-imported promo blocks must include an explicit approved value such as `Approved: true`, `Approved: yes`, or `已批核: 是`. Draft blocks with a missing or blank approval field are ignored. In-code seed promos remain trusted by the application code path.

## Main API

```js
const { createPromotionStore, createPromoSync } = require("./src/promoSync");

const store = createPromotionStore();
const sync = createPromoSync({
  driveClient,
  store,
  folderId: "google-drive-folder-id",
  businessId: "beauty_demo",
  syncTimeHk: "04:00"
});

await sync.syncOnce();

const promos = store.lookup({
  businessId: "beauty_demo",
  sanitizedText: "想了解小顏點收費",
  intent: { primaryIntent: "pricing" },
  now: new Date()
});
```

## Output Shape

```js
{
  businessId: "beauty_demo",
  timezone: "Asia/Hong_Kong",
  checkedDateHk: "2026-05-09",
  activePromotions: [
    {
      id: "beauty_may_small_face_trial",
      title: "小顏管理五月體驗優惠",
      summary: "小顏管理五月首次體驗 HK$480...",
      startsOn: "2026-05-01",
      expiresOn: "2026-05-31",
      score: 1.3
    }
  ],
  bestPromotion: {},
  grounding: ["beauty_may_small_face_trial"],
  reasons: []
}
```

## Run

```bash
node "google drive promo sync ver 1.0/test/promoSync.test.js"
node "google drive promo sync ver 1.0/scripts/writeSideBySideResults.js"
```

## Production Wiring Later

- Replace the mock `driveClient` with a real Google Drive connector.
- Keep Drive approval explicit: every synced promo block must say `Approved: true` (or an equivalent approved value) before it can enter the promotion store.
- Run `sync.runDue()` from a worker / cron every day.
- Persist the store in a database instead of memory.
- Keep every date in Hong Kong time when checking `StartsOn` and `ExpiresOn`.
