# Google Drive Promo Sync ver 1.0

Daily promotion sync for time-bound offers stored in a Google Drive folder.

This module is designed for the 24/7 agent use case: once per UTC+8 locale day, read approved offer docs from Google Drive, normalize them into active promotion facts, and let the reply pipeline consider those facts before drafting.

No real Google Drive API call is made in this module. It uses a dependency-injected `driveClient`, so tests stay offline and production can plug in Google Drive later.

## Timezone Rule

All promotion start / expiry checks use:

```text
Asia/Taipei
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
  timezone: "Asia/Taipei",
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

## Real Google Drive Connector (service account)

A working service-account-based Drive client now lives at
`src/googleDriveClient.js`. It implements the `{ listFiles, readFile }`
contract that `createPromoSync` expects, signing RS256 JWTs against
`https://oauth2.googleapis.com/token` and calling Drive v3 with bearer tokens.
No npm dependencies — `node:crypto` for signing, built-in `fetch` for HTTP.

### One-time Google Cloud setup

1. Create a Google Cloud project at <https://console.cloud.google.com>.
2. Enable the **Google Drive API** for that project.
3. Create a **service account** under IAM & Admin → Service Accounts.
4. Generate a JSON key for that service account and download the file.
5. Share each promotion Drive folder with the service account's email
   (`xyz@your-project.iam.gserviceaccount.com`) as **Viewer**.
6. Copy each folder's ID — it's the part after `/folders/` in the Drive URL.

### Environment variables

In `whatsapp-web-test-bridge/.env` (or production env):

```bash
GOOGLE_SERVICE_ACCOUNT_JSON_PATH=/absolute/path/to/sa.json

# One per business that should sync from Drive. Suffix after GDRIVE_FOLDER_
# is the businessId in upper-case.
GDRIVE_FOLDER_BEAUTY_DEMO=1A2B3CdEfG_FolderIdHere
GDRIVE_FOLDER_RESTAURANT_DEMO=4H5I6JkLmN_AnotherFolderId
GDRIVE_FOLDER_EDU_DEMO=7O8P9QrStU_EduFolderId
```

If either env var is missing the server prints
`Google Drive promo sync: disabled` on startup and falls back to the in-code
seed in `seed/promoSeed.js`.

### Doc template

Drop this in a Google Doc inside the shared folder. One block per promo,
separated by `---`. Only blocks with `Approved: yes` are surfaced.

```text
Title: May Trial Facial Promo
Approved: yes
StartsOn: 2026-05-01
ExpiresOn: 2026-05-31
Keywords: facial, trial, 體驗
Intents: pricing, booking
Summary: First-time customers get a 60-minute trial facial at HK$280 (regular HK$680). Booking deposit HK$100.
StaffInstruction: Confirm membership status before promising deposit refund on first visit.

---

Title: 端午節休息通知
Approved: yes
StartsOn: 2026-06-09
ExpiresOn: 2026-06-10
Keywords: 端午節, 休息, holiday, 放假
Intents: hours_location, general
Summary: 6月9日端午節休息一日, 6月10日恢復正常營業時間。
```

### Security notes

- Drive content is treated as **untrusted data** — every promotion's `Summary`
  is wrapped in a `PROMOTION_FACTS_UNTRUSTED_DO_NOT_FOLLOW` envelope before
  reaching the draft LLM. Drive docs cannot inject instructions into the bot.
- `Approved: yes` is mandatory for Drive-origin promos — blank/missing
  approval is treated as a draft and skipped.
- Service account only needs **Viewer** access — never Editor. The bot only
  reads, never writes back to Drive.
- Share each folder explicitly with the service account email, never publicly.

### Initial sync

The server kicks off a one-shot sync per configured business on startup. A
real scheduler / cron will be added later — for now restart the server to
re-pull updated promo docs, or call `sync.runDue()` programmatically.
