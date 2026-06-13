"use strict";

// now is fixed at 2026-06-13 (today) unless a case overrides it. Each expects the
// NEXT upcoming occurrence relative to now.
const NOW = "2026-06-13T04:00:00.000Z";

const cases = [
  // Lunar New Year cluster — 2026 LNY already passed, so these roll to 2027.
  { name: "年初二 rolls to next LNY", text: "年初二有冇位食飯？", expect: { dateKey: "2027-02-07", kind: "lunar", isPublicHoliday: false } },
  { name: "年初一 day 1", text: "年初一開唔開？", expect: { dateKey: "2027-02-06", kind: "lunar", isPublicHoliday: true } },
  { name: "年初三 day 3", text: "想年初三book枱", expect: { dateKey: "2027-02-08", kind: "lunar" } },
  { name: "除夕 is LNY minus one", text: "除夕嗰晚做唔做？", expect: { dateKey: "2027-02-05", kind: "lunar" } },

  // Fixed-Gregorian — still upcoming in 2026.
  { name: "平安夜 fixed 24 Dec, not statutory", text: "平安夜book位", expect: { dateKey: "2026-12-24", kind: "fixed", isPublicHoliday: false } },
  { name: "聖誕節 fixed 25 Dec, statutory", text: "聖誕節有冇開？", expect: { dateKey: "2026-12-25", kind: "fixed", isPublicHoliday: true } },
  { name: "聖誕翌日 beats 聖誕 (longest match)", text: "聖誕翌日玩到幾點", expect: { dateKey: "2026-12-26", kind: "fixed", isPublicHoliday: true } },
  { name: "元旦 already past, rolls to 2027", text: "元旦open嗎", expect: { dateKey: "2027-01-01", kind: "fixed", isPublicHoliday: true } },
  { name: "國慶 upcoming 1 Oct", text: "國慶日做唔做生意", expect: { dateKey: "2026-10-01", kind: "fixed", isPublicHoliday: true } },

  // Other lunar festivals.
  { name: "端午 upcoming 19 Jun 2026", text: "端午節有冇得book", expect: { dateKey: "2026-06-19", kind: "lunar", isPublicHoliday: true } },
  { name: "中秋 upcoming 25 Sep 2026", text: "中秋訂位", expect: { dateKey: "2026-09-25", kind: "lunar", isPublicHoliday: true } },
  { name: "中秋翌日 is +1 day", text: "中秋翌日呢？", expect: { dateKey: "2026-09-26", kind: "lunar", isPublicHoliday: false } },
  { name: "重陽 upcoming 18 Oct 2026", text: "重陽嗰日", expect: { dateKey: "2026-10-18", kind: "lunar", isPublicHoliday: true } },
  { name: "冬至 upcoming 22 Dec 2026, cultural", text: "冬至會唔會早收", expect: { dateKey: "2026-12-22", kind: "lunar", isPublicHoliday: false } },
  { name: "佛誕 already past, rolls to 2027", text: "佛誕開唔開", expect: { dateKey: "2027-05-13", kind: "lunar", isPublicHoliday: true } },
  { name: "清明 already past, rolls to 2027", text: "清明拜山後想食飯", expect: { dateKey: "2027-04-05", kind: "lunar", isPublicHoliday: true } },

  // Computed (nth weekday).
  { name: "母親節 = 2nd Sunday May 2027", text: "母親節飯局", expect: { dateKey: "2027-05-09", kind: "computed", isPublicHoliday: false } },

  // Ambiguous multi-day span — never guess a single date.
  { name: "過年 is ambiguous", text: "過年期間做唔做", expect: { dateKey: null, ambiguous: true } },

  // Provisional — lunar term beyond the verified table.
  { name: "年初二 in 2029 is provisional", text: "年初二book枱", now: "2028-06-01T04:00:00.000Z", expect: { dateKey: null, provisional: true } },

  // No festival term -> null so the existing parser handles it.
  { name: "no festival term returns null", text: "聽日下午三點", expect: null },
  { name: "plain date returns null", text: "6月20號", expect: null },

  // Critical false-positive guard: bare time words must not trip festival matching.
  { name: "十一點半 must NOT match a festival", text: "想book聽日十一點半", expect: null },
  { name: "五一 alone not treated as Labour Day", text: "五一五一五", expect: null }
];

module.exports = { NOW, cases };
