"use strict";

// Hong Kong statutory + cultural festival dates, by year.
// Source: GovHK official General Holidays gazette (gov.hk/en/about/abouthk/holiday).
// Dates here are the ACTUAL festival days (not the substituted holiday observance):
// e.g. in 2026 Ching Ming falls on Sun 5 Apr and the gazetted substitute holiday is
// Mon 6 Apr — this table stores 2026-04-05.
//
// Lunar-derived festivals (Lunar New Year, Ching Ming, Buddha's Birthday, Tuen Ng,
// Mid-Autumn, Chung Yeung, Winter Solstice) move every year and cannot be computed
// with the stdlib, so they are tabulated. The government gazettes ~2 years ahead;
// extend this table each year and bump TABLE_VERIFIED_THROUGH. Years outside the
// verified range resolve as `provisional` (the bot asks staff instead of guessing).

// Last calendar year whose lunar dates are confirmed against the official gazette.
const TABLE_VERIFIED_THROUGH = 2027;

// festivalKey -> Gregorian YYYY-MM-DD (actual festival day) per year.
const FESTIVALS_BY_YEAR = Object.freeze({
  2025: {
    lunar_new_year: "2025-01-29",
    ching_ming: "2025-04-04",
    buddha_birthday: "2025-05-05",
    tuen_ng: "2025-05-31",
    mid_autumn: "2025-10-06",
    chung_yeung: "2025-10-29",
    winter_solstice: "2025-12-21"
  },
  2026: {
    lunar_new_year: "2026-02-17",
    ching_ming: "2026-04-05",
    buddha_birthday: "2026-05-24",
    tuen_ng: "2026-06-19",
    mid_autumn: "2026-09-25",
    chung_yeung: "2026-10-18",
    winter_solstice: "2026-12-22"
  },
  2027: {
    lunar_new_year: "2027-02-06",
    ching_ming: "2027-04-05",
    buddha_birthday: "2027-05-13",
    tuen_ng: "2027-06-09",
    mid_autumn: "2027-09-15",
    chung_yeung: "2027-10-08",
    winter_solstice: "2027-12-22"
  }
});

// Which festivals carry a gazetted public-holiday status (Winter Solstice is cultural,
// not a statutory holiday, but shops still close early — kept for date resolution).
const PUBLIC_HOLIDAY_FESTIVALS = Object.freeze(new Set([
  "lunar_new_year", "ching_ming", "buddha_birthday", "tuen_ng", "mid_autumn", "chung_yeung"
]));

module.exports = { TABLE_VERIFIED_THROUGH, FESTIVALS_BY_YEAR, PUBLIC_HOLIDAY_FESTIVALS };
