"use strict";

// Google Drive Promo Sync ver 1.0
// Pulls approved time-bound campaign facts from a Google Drive-like client,
// normalizes them, and exposes active promotions using HK time (UTC+8).

const { HK_TIMEZONE, hkDateKey, isWithinHkDateRange, nextDailyRunAtHongKong } = require("./hkTime");

const DEFAULT_SYNC_TIME_HK = "04:00";

function createPromotionStore(config = {}) {
  let entries = normalizeEntries(config.entries || []);
  let lastSyncedAt = config.lastSyncedAt || null;

  return {
    replace(nextEntries, meta = {}) {
      entries = normalizeEntries(nextEntries || []);
      lastSyncedAt = meta.syncedAt || null;
      return this.snapshot();
    },
    replaceForBusiness(businessId, nextEntries, meta = {}) {
      const scopedBusinessId = businessId || "default";
      entries = [
        ...entries.filter((entry) => entry.businessId !== scopedBusinessId),
        ...normalizeEntries(nextEntries || []).filter((entry) => entry.businessId === scopedBusinessId)
      ];
      lastSyncedAt = meta.syncedAt || lastSyncedAt;
      return this.snapshot();
    },
    upsert(nextEntries, meta = {}) {
      const map = new Map(entries.map((entry) => [entry.id, entry]));
      for (const entry of normalizeEntries(nextEntries || [])) map.set(entry.id, entry);
      entries = Array.from(map.values());
      lastSyncedAt = meta.syncedAt || lastSyncedAt;
      return this.snapshot();
    },
    lookup(input = {}) {
      return lookupPromotions(entries, input);
    },
    list(input = {}) {
      return entries.filter((entry) => !input.businessId || entry.businessId === input.businessId);
    },
    snapshot() {
      return {
        entries: entries.slice(),
        count: entries.length,
        lastSyncedAt,
        timezone: HK_TIMEZONE
      };
    }
  };
}

function createPromoSync(config = {}) {
  const driveClient = config.driveClient;
  const store = config.store || createPromotionStore();
  const nowFn = config.nowFn || (() => new Date());
  const syncTimeHk = config.syncTimeHk || DEFAULT_SYNC_TIME_HK;

  if (!driveClient || typeof driveClient.listFiles !== "function" || typeof driveClient.readFile !== "function") {
    throw new Error("driveClient with listFiles() and readFile() is required.");
  }

  return {
    async syncOnce(input = {}) {
      const folderId = input.folderId || config.folderId;
      const businessId = input.businessId || config.businessId || "default";
      const files = await driveClient.listFiles({ folderId, businessId });
      const entries = [];
      for (const file of files || []) {
        const content = await driveClient.readFile(file);
        entries.push(...parseDrivePromoDocument({
          businessId,
          fileId: file.id,
          title: file.name || file.title || "Untitled promotion doc",
          text: typeof content === "string" ? content : content.text,
          modifiedTime: file.modifiedTime
        }));
      }
      return store.replaceForBusiness(businessId, entries, { syncedAt: nowFn().toISOString() });
    },
    async runDue(input = {}) {
      const now = input.now || nowFn();
      const lastRunDate = input.lastRunAt ? hkDateKey(input.lastRunAt) : null;
      const today = hkDateKey(now);
      if (lastRunDate === today && input.force !== true) {
        return { ran: false, reason: "already synced today in Hong Kong time", nextRun: nextDailyRunAtHongKong(now, syncTimeHk), snapshot: store.snapshot() };
      }
      const snapshot = await this.syncOnce(input);
      return { ran: true, reason: "synced promotions from Google Drive client", nextRun: nextDailyRunAtHongKong(now, syncTimeHk), snapshot };
    },
    nextRun(now = nowFn()) {
      return nextDailyRunAtHongKong(now, syncTimeHk);
    },
    store
  };
}

function lookupPromotions(entries, input = {}) {
  const businessId = input.businessId || "default";
  const text = String(input.sanitizedText || input.text || "").toLowerCase();
  const intentName = input.intent?.primaryIntent || input.primaryIntent || "general";
  const now = input.now || new Date();
  const active = entries
    .filter((entry) => entry.businessId === businessId)
    .filter((entry) => entry.approved === true)
    .filter((entry) => isWithinHkDateRange(now, entry.startsOn, entry.expiresOn))
    .map((entry) => ({ entry, score: scorePromotion(entry, text, intentName) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry, score }) => ({ ...entry, score }));

  return {
    businessId,
    timezone: HK_TIMEZONE,
    checkedDateHk: hkDateKey(now),
    activePromotions: active,
    bestPromotion: active[0] || null,
    grounding: active.map((entry) => entry.id),
    reasons: active.length === 0
      ? ["No active approved promotion matched in Hong Kong time."]
      : active.map((entry) => `Matched promotion ${entry.id} (score ${entry.score})`)
  };
}

function normalizeEntries(rawEntries) {
  return (rawEntries || [])
    .map(normalizeEntry)
    .filter(Boolean);
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.approved === false) return null;
  const id = raw.id || stablePromoId(raw.businessId, raw.title, raw.expiresOn);
  return {
    id,
    businessId: raw.businessId || "default",
    source: raw.source || "google_drive",
    sourceFileId: raw.sourceFileId || raw.fileId || null,
    title: String(raw.title || ""),
    keywords: (raw.keywords || []).map((item) => String(item).toLowerCase()).filter(Boolean),
    intentTags: (raw.intentTags || raw.intents || []).map(String),
    summary: String(raw.summary || raw.answer || ""),
    staffInstruction: raw.staffInstruction || null,
    startsOn: raw.startsOn || null,
    expiresOn: raw.expiresOn || null,
    timezone: raw.timezone || HK_TIMEZONE,
    approved: true
  };
}

function parseDrivePromoDocument(input = {}) {
  const text = String(input.text || "");
  const blocks = text.split(/\n---+\n/).map((block) => block.trim()).filter(Boolean);
  return blocks.map((block, index) => parseBlock(block, input, index)).filter(Boolean);
}

function parseBlock(block, input, index) {
  const fields = {};
  for (const line of block.split(/\n/)) {
    const match = line.match(/^([^:：]+)[:：]\s*(.*)$/);
    if (!match) continue;
    const key = normalizeFieldKey(match[1]);
    fields[key] = match[2].trim();
  }
  if (!fields.title && !fields.summary) return null;
  return normalizeEntry({
    id: fields.id || stablePromoId(input.businessId, fields.title || input.title, fields.expiresOn),
    businessId: input.businessId,
    source: "google_drive",
    sourceFileId: input.fileId,
    title: fields.title || input.title,
    keywords: splitList(fields.keywords),
    intentTags: splitList(fields.intents),
    summary: fields.summary || "",
    staffInstruction: fields.staffInstruction || null,
    startsOn: fields.startsOn || fields.startDate || null,
    expiresOn: fields.expiresOn || fields.expiryDate || fields.expiry || null,
    timezone: HK_TIMEZONE,
    approved: parseApproved(fields.approved)
  });
}

function normalizeFieldKey(key) {
  const lower = String(key).trim().toLowerCase();
  const map = {
    "id": "id",
    "title": "title",
    "標題": "title",
    "keywords": "keywords",
    "關鍵字": "keywords",
    "intents": "intents",
    "intent": "intents",
    "意圖": "intents",
    "summary": "summary",
    "內容": "summary",
    "staffinstruction": "staffInstruction",
    "員工指示": "staffInstruction",
    "startson": "startsOn",
    "開始日期": "startsOn",
    "expireson": "expiresOn",
    "expiry": "expiry",
    "expirydate": "expiryDate",
    "到期日": "expiresOn",
    "approved": "approved",
    "已批核": "approved"
  };
  return map[lower.replace(/\s+/g, "")] || lower.replace(/\s+/g, "");
}

function scorePromotion(entry, text, intentName) {
  let score = entry.intentTags.includes(intentName) ? 0.5 : 0;
  for (const keyword of entry.keywords) {
    if (keyword && text.includes(keyword)) score += 0.4;
  }
  if (entry.title && text.includes(entry.title.toLowerCase())) score += 0.3;
  return Math.round(Math.min(score, 1.4) * 100) / 100;
}

function splitList(value) {
  if (!value) return [];
  return String(value).split(/[,，、]/).map((item) => item.trim()).filter(Boolean);
}

function parseApproved(value) {
  if (value == null || value === "") return true;
  return /^(true|yes|y|approved|1|係|是|已批核)$/i.test(String(value).trim());
}

function stablePromoId(businessId, title, expiresOn) {
  const source = `${businessId || "default"}:${title || "promo"}:${expiresOn || "open"}`;
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  }
  return `promo_${Math.abs(hash)}`;
}

module.exports = {
  DEFAULT_SYNC_TIME_HK,
  createPromotionStore,
  createPromoSync,
  lookupPromotions,
  normalizeEntry,
  parseDrivePromoDocument,
  _internal: { scorePromotion, splitList, parseApproved, stablePromoId, normalizeFieldKey }
};
