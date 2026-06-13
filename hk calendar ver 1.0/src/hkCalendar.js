"use strict";

// HK Calendar ver 1.0
// Deterministic resolver for the way Hong Kong customers actually name dates:
// 年初二, 平安夜, 冬至嗰日, 中秋翌日. No competitor parses these — they hand dates
// to an LLM, which routinely fumbles lunar conversions. A static, gazette-sourced
// table makes this 100% reliable for the verified years, and returns `provisional`
// (ask staff, never guess) outside them.
//
// Pure function, stdlib only. Resolves the NEXT upcoming occurrence relative to now.

const { hkDateKey } = require("../../google drive promo sync ver 1.0/src/hkTime");
const { TABLE_VERIFIED_THROUGH, FESTIVALS_BY_YEAR, PUBLIC_HOLIDAY_FESTIVALS } = require("../seed/hkHolidays");

// term -> resolution rule. Order matters only for matching: we always match the
// LONGEST term present in the text, so 聖誕翌日 wins over 聖誕, 年初二 over 年初.
const TERMS = [
  // Lunar New Year cluster (offset days from 年初一)
  { aliases: ["農曆年初一", "大年初一", "年初一", "年初1"], kind: "lunar", festivalKey: "lunar_new_year", offset: 0 },
  { aliases: ["年初二", "年初2", "大年初二"], kind: "lunar", festivalKey: "lunar_new_year", offset: 1 },
  { aliases: ["年初三", "年初3"], kind: "lunar", festivalKey: "lunar_new_year", offset: 2 },
  { aliases: ["年初四", "年初4"], kind: "lunar", festivalKey: "lunar_new_year", offset: 3 },
  { aliases: ["農曆除夕", "大除夕", "除夕", "年三十晚", "年三十", "年卅晚", "團年飯", "團年"], kind: "lunar", festivalKey: "lunar_new_year", offset: -1 },
  // Other lunar festivals
  { aliases: ["清明節", "清明"], kind: "lunar", festivalKey: "ching_ming", offset: 0 },
  { aliases: ["佛誕節", "佛誕"], kind: "lunar", festivalKey: "buddha_birthday", offset: 0 },
  { aliases: ["端午節", "端午", "糭節", "扒龍舟"], kind: "lunar", festivalKey: "tuen_ng", offset: 0 },
  { aliases: ["中秋節翌日", "中秋翌日"], kind: "lunar", festivalKey: "mid_autumn", offset: 1 },
  { aliases: ["中秋節", "中秋"], kind: "lunar", festivalKey: "mid_autumn", offset: 0 },
  { aliases: ["重陽節", "重陽"], kind: "lunar", festivalKey: "chung_yeung", offset: 0 },
  { aliases: ["冬至"], kind: "lunar", festivalKey: "winter_solstice", offset: 0 },
  // Fixed-Gregorian festivals (100% reliable every year, no table needed)
  { aliases: ["聖誕節翌日", "聖誕翌日", "拆禮物日", "boxing day"], kind: "fixed", month: 12, day: 26 },
  { aliases: ["平安夜"], kind: "fixed", month: 12, day: 24 },
  { aliases: ["聖誕節", "聖誕日", "聖誕", "xmas", "christmas"], kind: "fixed", month: 12, day: 25 },
  { aliases: ["元旦"], kind: "fixed", month: 1, day: 1 },
  { aliases: ["情人節"], kind: "fixed", month: 2, day: 14 },
  { aliases: ["勞動節", "勞工假期", "勞工假"], kind: "fixed", month: 5, day: 1 },
  { aliases: ["香港回歸", "回歸紀念日", "回歸日"], kind: "fixed", month: 7, day: 1 },
  { aliases: ["國慶日", "國慶"], kind: "fixed", month: 10, day: 1 },
  // Computed (nth weekday) — booking-relevant for restaurants
  { aliases: ["母親節"], kind: "computed", compute: (year) => nthWeekdayOfMonth(year, 5, 0, 2) },
  { aliases: ["父親節"], kind: "computed", compute: (year) => nthWeekdayOfMonth(year, 6, 0, 3) },
  // Multi-day spans — never guess a single date, ask instead
  { aliases: ["農曆新年", "新年假", "過年", "賀年", "年假"], kind: "ambiguous", festivalKey: "lunar_new_year" }
];

function resolveCulturalDate(text, now = new Date(), options = {}) {
  const haystack = String(text || "").toLowerCase();
  if (!haystack) return null;

  const match = longestMatchingTerm(haystack);
  if (!match) return null;

  const today = hkDateKey(now);
  const thisYear = Number(today.slice(0, 4));

  if (match.term.kind === "ambiguous") {
    return {
      matched: true,
      term: match.alias,
      festivalKey: match.term.festivalKey || null,
      dateKey: null,
      kind: "ambiguous",
      ambiguous: true,
      provisional: false,
      isPublicHoliday: null,
      reason: "spans multiple days; ask the customer which day"
    };
  }

  if (match.term.kind === "fixed") {
    const dateKey = nextFixedOccurrence(match.term.month, match.term.day, thisYear, today);
    return baseResult(match, { dateKey, kind: "fixed", isPublicHoliday: isGazettedFixedHoliday(match.term) });
  }

  if (match.term.kind === "computed") {
    let dateKey = match.term.compute(thisYear);
    if (dateKey < today) dateKey = match.term.compute(thisYear + 1);
    return baseResult(match, { dateKey, kind: "computed", isPublicHoliday: false });
  }

  // lunar: look up the tabulated festival day, apply the offset, roll to next year
  // if already past. Outside the verified table -> provisional (ask staff).
  const resolved = nextLunarOccurrence(match.term, thisYear, today, options);
  return baseResult(match, resolved);
}

function baseResult(match, resolved) {
  return {
    matched: true,
    term: match.alias,
    festivalKey: match.term.festivalKey || null,
    dateKey: resolved.dateKey || null,
    kind: resolved.kind,
    ambiguous: false,
    provisional: Boolean(resolved.provisional),
    isPublicHoliday: resolved.isPublicHoliday ?? null,
    reason: resolved.reason || null
  };
}

function longestMatchingTerm(haystack) {
  let best = null;
  for (const term of TERMS) {
    for (const alias of term.aliases) {
      if (haystack.includes(alias) && (!best || alias.length > best.alias.length)) {
        best = { term, alias };
      }
    }
  }
  return best;
}

function nextLunarOccurrence(term, thisYear, today, options) {
  for (const year of [thisYear, thisYear + 1]) {
    const table = FESTIVALS_BY_YEAR[year];
    if (!table || !table[term.festivalKey]) continue;
    const dateKey = shiftDateKey(table[term.festivalKey], term.offset || 0);
    if (dateKey >= today) {
      return {
        dateKey,
        kind: "lunar",
        provisional: false,
        isPublicHoliday: PUBLIC_HOLIDAY_FESTIVALS.has(term.festivalKey) && (term.offset || 0) === 0
      };
    }
  }
  // No tabulated date >= today: either both candidate years are missing, or this
  // year's already passed and next year isn't gazetted yet.
  const verifiedThrough = options.verifiedThrough || TABLE_VERIFIED_THROUGH;
  return {
    dateKey: null,
    kind: "lunar",
    provisional: true,
    isPublicHoliday: PUBLIC_HOLIDAY_FESTIVALS.has(term.festivalKey),
    reason: `lunar date not in verified table (through ${verifiedThrough}); staff should confirm`
  };
}

function nextFixedOccurrence(month, day, thisYear, today) {
  const candidate = isoFromYmd(thisYear, month, day);
  return candidate >= today ? candidate : isoFromYmd(thisYear + 1, month, day);
}

function isGazettedFixedHoliday(term) {
  // Christmas (25), Boxing Day (26), New Year (1/1), Labour (1/5), Establishment
  // (1/7), National (1/10) are statutory; Valentine's is not.
  const holidayDates = new Set(["12-25", "12-26", "1-1", "5-1", "7-1", "10-1"]);
  return holidayDates.has(`${term.month}-${term.day}`);
}

// --- pure calendar helpers (no timezone: these operate on plain YYYY-MM-DD) ---

function shiftDateKey(dateKey, offsetDays) {
  if (!offsetDays) return dateKey;
  const [y, m, d] = dateKey.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d) + offsetDays * 24 * 60 * 60 * 1000;
  const shifted = new Date(ms);
  return isoFromYmd(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

function nthWeekdayOfMonth(year, month, weekday, n) {
  // month: 1-12, weekday: 0=Sun..6=Sat, n: 1-based occurrence
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const day = 1 + ((7 + weekday - firstDow) % 7) + (n - 1) * 7;
  return isoFromYmd(year, month, day);
}

function isoFromYmd(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Is a resolved Gregorian dateKey a HK statutory holiday (for holiday-hours replies)?
function isHkPublicHoliday(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ""))) return false;
  const year = Number(dateKey.slice(0, 4));
  const md = dateKey.slice(5);
  if (["01-01", "05-01", "07-01", "10-01", "12-25", "12-26"].includes(md)) return true;
  const table = FESTIVALS_BY_YEAR[year];
  if (!table) return false;
  for (const key of PUBLIC_HOLIDAY_FESTIVALS) {
    if (!table[key]) continue;
    if (key === "lunar_new_year") {
      // LNY day 1-3 are all holidays
      if (dateKey === table[key] || dateKey === shiftDateKey(table[key], 1) || dateKey === shiftDateKey(table[key], 2)) return true;
    } else if (dateKey === table[key]) {
      return true;
    }
  }
  return false;
}

module.exports = {
  TABLE_VERIFIED_THROUGH,
  resolveCulturalDate,
  isHkPublicHoliday,
  _internal: { shiftDateKey, nthWeekdayOfMonth, isoFromYmd, longestMatchingTerm }
};
