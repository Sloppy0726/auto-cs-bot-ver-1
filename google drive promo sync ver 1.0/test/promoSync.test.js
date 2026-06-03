"use strict";

const assert = require("node:assert/strict");
const seed = require("../seed/promoSeed");
const { createPromotionStore, createPromoSync, parseDrivePromoDocument } = require("../src/promoSync");
const { hkDateKey, nextDailyRunAtTaipei } = require("../src/hkTime");
const { driveDocument, standardCases } = require("./promoSync.cases");

const store = createPromotionStore({ entries: seed });

for (const c of standardCases) {
  const result = store.lookup({
    businessId: c.businessId,
    sanitizedText: c.text,
    intent: c.intent,
    now: new Date(c.now)
  });
  assert.equal(Boolean(result.bestPromotion), c.expectMatch, `${c.name}: match mismatch`);
  if (c.expectTitle) assert.equal(result.bestPromotion.title, c.expectTitle, `${c.name}: title mismatch`);
  assert.equal(result.timezone, "Asia/Taipei", `${c.name}: timezone mismatch`);
}

const parsed = parseDrivePromoDocument({
  businessId: "beauty_demo",
  fileId: "file1",
  title: "Promo doc",
  text: driveDocument
});
assert.equal(parsed.length, 1, "drive document should parse one promo");
assert.equal(parsed[0].expiresOn, "2026-05-31", "expiry should parse");

const unapprovedParsed = parseDrivePromoDocument({
  businessId: "beauty_demo",
  fileId: "draft-file",
  title: "Draft promo doc",
  text: driveDocument.replace("\nApproved: true", "")
});
assert.equal(unapprovedParsed.length, 0, "drive documents must include explicit approval before syncing");

const driveClient = {
  async listFiles() {
    return [{ id: "file1", name: "May promo" }];
  },
  async readFile() {
    return driveDocument;
  }
};

async function run() {
  const syncStore = createPromotionStore();
  const sync = createPromoSync({
    driveClient,
    store: syncStore,
    businessId: "beauty_demo",
    folderId: "folder1",
    nowFn: () => new Date("2026-05-09T00:00:00.000Z")
  });
  const snapshot = await sync.syncOnce();
  assert.equal(snapshot.count, 1, "syncOnce should load parsed promotions");
  const lookup = syncStore.lookup({
    businessId: "beauty_demo",
    sanitizedText: "小顏點收費",
    intent: { primaryIntent: "pricing" },
    now: new Date("2026-05-09T00:00:00.000Z")
  });
  assert.ok(lookup.bestPromotion, "synced promotion should match");
  assert.equal(hkDateKey("2026-05-08T16:30:00.000Z"), "2026-05-09", "locale date should use UTC+8");
  assert.equal(nextDailyRunAtTaipei(new Date("2026-05-09T00:00:00.000Z"), "04:00").hongKong, "2026-05-10T04:00:00+08:00");

  const multiBusinessStore = createPromotionStore({
    entries: [{
      id: "igshop_existing",
      businessId: "igshop_demo",
      title: "IG shop existing promo",
      keywords: ["順豐"],
      intentTags: ["service_info"],
      summary: "Existing IG promo should survive beauty sync.",
      startsOn: "2026-05-01",
      expiresOn: "2026-05-31",
      approved: true
    }]
  });
  const scopedSync = createPromoSync({
    driveClient,
    store: multiBusinessStore,
    businessId: "beauty_demo",
    folderId: "folder1",
    nowFn: () => new Date("2026-05-09T00:00:00.000Z")
  });
  await scopedSync.syncOnce();
  assert.equal(multiBusinessStore.list({ businessId: "igshop_demo" }).length, 1, "syncOnce must preserve other businesses' promotions");
  assert.equal(multiBusinessStore.list({ businessId: "beauty_demo" }).length, 1, "syncOnce should replace only the scoped business promotions");

  console.log(`promoSync: ${standardCases.length + 8} tests passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
