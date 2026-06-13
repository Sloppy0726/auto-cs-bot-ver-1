"use strict";

// Regulars Ledger ver 1.0  (熟客 + 照舊一鍵 rebook)
// A sender-bound, file-backed regulars profile mined deterministically from booking
// history, so a regular typing "今個禮拜得唔得?" gets "照舊星期二 3pm、4位?" as a
// confirm-don't-assume clarify.
//
// Persistent customer memory is "the single highest-leverage gap" — shipped only at
// enterprise tier (Gladly, Decagon) or as unreliable LLM-extraction frameworks
// (Mem0/Zep). 熟客 relationships are the operating core of HK SME retail/F&B/services.
// This needs NO LLM fact extraction: profiles are modal statistics over the structured
// booking records the system already writes, inheriting the codebase's sender-bound
// no-cross-customer-leakage guarantee. Derived stats only — no raw message text is
// ever stored, and a PDPO retention window + forget() bound the data.

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_THRESHOLD = 3;       // visits before we treat someone as a regular
const DEFAULT_RETENTION_DAYS = 540;
const DOMINANCE = 0.5;             // a modal value must cover ≥50% of visits to suggest it

const WEEKDAYS_ZH = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function senderRef(senderId) {
  return senderId ? crypto.createHash("sha256").update(`sender:${senderId}`).digest("hex").slice(0, 16) : null;
}

function createRegularsLedger(config = {}) {
  const nowFn = config.nowFn || (() => new Date());
  const threshold = config.regularThreshold || DEFAULT_THRESHOLD;
  const retentionDays = config.retentionDays || DEFAULT_RETENTION_DAYS;
  const filePath = config.filePath || null;
  // key = `${businessId}:${senderRef}` → { businessId, senderRef, visits: [...] }
  let profiles = new Map();

  if (filePath && fs.existsSync(filePath)) profiles = load(filePath);

  function persist() {
    if (!filePath) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, JSON.stringify({ profiles: Object.fromEntries(profiles) }, null, 2), "utf8");
    fs.renameSync(tmp, filePath);
  }

  function keyFor(businessId, senderId) {
    return `${businessId}:${senderRef(senderId)}`;
  }

  // Record a confirmed visit. Stores only derived fields — never raw text.
  function recordVisit({ businessId, senderId, booking = {}, now } = {}) {
    if (!businessId || !senderId) return null;
    const key = keyFor(businessId, senderId);
    const entry = profiles.get(key) || { businessId, senderRef: senderRef(senderId), visits: [] };
    const at = (booking.at || (now || nowFn()).toISOString());
    entry.visits.push({
      at,
      weekday: weekdayOf(booking.date),
      time: booking.time || null,
      partySize: booking.partySize != null ? Number(booking.partySize) : null,
      service: booking.service || null,
      resourceId: booking.resourceId || null
    });
    profiles.set(key, entry);
    persist();
    return entry;
  }

  function seedFromBookings(bookings = [], { businessId } = {}) {
    for (const b of bookings) {
      const senderId = b.senderId || b.customerExternalId || b.customer;
      if (!senderId) continue;
      recordVisit({ businessId: businessId || b.businessId, senderId, booking: b });
    }
    return this;
  }

  function profile({ businessId, senderId } = {}) {
    const entry = profiles.get(keyFor(businessId, senderId));
    if (!entry) return { visitCount: 0, isRegular: false, modal: null };
    const cutoff = new Date((nowFn()).getTime() - retentionDays * 86400000).toISOString();
    const visits = entry.visits.filter((v) => String(v.at) >= cutoff);
    const visitCount = visits.length;
    const modal = {
      weekday: mode(visits.map((v) => v.weekday)),
      time: mode(visits.map((v) => v.time)),
      partySize: mode(visits.map((v) => v.partySize)),
      service: mode(visits.map((v) => v.service)),
      resourceId: mode(visits.map((v) => v.resourceId))
    };
    return {
      visitCount,
      isRegular: visitCount >= threshold,
      lastVisit: visits.length ? visits[visits.length - 1].at : null,
      modal
    };
  }

  // PDPO: a customer can ask to be forgotten.
  function forget({ businessId, senderId } = {}) {
    const deleted = profiles.delete(keyFor(businessId, senderId));
    persist();
    return deleted;
  }

  return {
    filePath,
    recordVisit,
    seedFromBookings,
    profile,
    forget,
    all() { return Object.fromEntries(profiles); },
    reset() { profiles = new Map(); persist(); }
  };
}

// Most frequent non-null value, with its share of the sample. Returns null when there's
// no data or no dominant value (≥ DOMINANCE share) — so we never make a creepy guess.
function mode(values) {
  const counts = new Map();
  let total = 0;
  for (const v of values) {
    if (v == null || v === "") continue;
    counts.set(v, (counts.get(v) || 0) + 1);
    total += 1;
  }
  if (total === 0) return null;
  let best = null, bestCount = 0;
  for (const [v, c] of counts) if (c > bestCount) { best = v; bestCount = c; }
  return bestCount / total >= DOMINANCE ? { value: best, share: bestCount / total, count: bestCount } : null;
}

function weekdayOf(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ""))) return null;
  return new Date(`${dateKey}T00:00:00Z`).getUTCDay();
}

// Build the "照舊" suggestion when a regular asks to book without specifics. Returns
// null unless the customer is a regular with a dominant weekday + time pattern.
function inferRegularRebook({ profile: prof, intent, query, language } = {}) {
  if (!prof || !prof.isRegular || !prof.modal) return null;
  if (!["booking", "reschedule"].includes(intent?.primaryIntent)) return null;
  // Only suggest when the customer hasn't already pinned a concrete time.
  if (query && (query.time || query.ambiguousTime)) return null;
  const m = prof.modal;
  if (!m.weekday || !m.time) return null; // need a confident weekday + time

  const en = language === "en";
  const weekday = en ? WEEKDAYS_EN[m.weekday.value] : WEEKDAYS_ZH[m.weekday.value];
  const time = formatTime(m.time.value, en);
  const party = m.partySize && m.partySize.value ? (en ? ` for ${m.partySize.value}` : `、${m.partySize.value}位`) : "";
  const service = m.service && m.service.value ? (en ? ` (${m.service.value})` : `（${m.service.value}）`) : "";

  const text = en
    ? `Welcome back! Same as usual — ${weekday} ${time}${party}${service}? Reply "yes" and I'll book it for you.`
    : `多謝你一直支持！照舊${weekday} ${time}${party}${service}？覆「係」我即刻幫你 book。`;
  return { reason: "regular_usual_rebook", text };
}

function formatTime(hhmm, en) {
  if (!/^\d{2}:\d{2}$/.test(String(hhmm || ""))) return hhmm;
  const [h, m] = hhmm.split(":").map(Number);
  if (en) {
    const ampm = h >= 12 ? "pm" : "am";
    const h12 = h % 12 || 12;
    return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, "0")}${ampm}`;
  }
  // Natural Cantonese: 下午3點 / 晚上7點半 / 上午11點
  const period = h < 5 ? "凌晨" : h < 12 ? "上午" : h === 12 ? "中午" : h < 18 ? "下午" : "晚上";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const minutePart = m === 30 ? "半" : m === 0 ? "" : `${m}分`;
  return `${period}${h12}點${minutePart}`;
}

function load(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return new Map(Object.entries(parsed.profiles || {}));
  } catch (_e) {
    return new Map();
  }
}

module.exports = {
  DEFAULT_THRESHOLD,
  createRegularsLedger,
  inferRegularRebook,
  senderRef,
  _internal: { mode, weekdayOf, formatTime }
};
