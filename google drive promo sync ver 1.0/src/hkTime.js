"use strict";

const HK_TIMEZONE = "Asia/Hong_Kong";
const HK_OFFSET_MINUTES = 8 * 60;

function toHongKongDateParts(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
  const hkMs = date.getTime() + HK_OFFSET_MINUTES * 60 * 1000;
  const hk = new Date(hkMs);
  return {
    year: hk.getUTCFullYear(),
    month: hk.getUTCMonth() + 1,
    day: hk.getUTCDate(),
    hour: hk.getUTCHours(),
    minute: hk.getUTCMinutes(),
    second: hk.getUTCSeconds(),
    dateKey: [
      hk.getUTCFullYear(),
      String(hk.getUTCMonth() + 1).padStart(2, "0"),
      String(hk.getUTCDate()).padStart(2, "0")
    ].join("-"),
    isoLocal: [
      [
        hk.getUTCFullYear(),
        String(hk.getUTCMonth() + 1).padStart(2, "0"),
        String(hk.getUTCDate()).padStart(2, "0")
      ].join("-"),
      [
        String(hk.getUTCHours()).padStart(2, "0"),
        String(hk.getUTCMinutes()).padStart(2, "0"),
        String(hk.getUTCSeconds()).padStart(2, "0")
      ].join(":")
    ].join("T") + "+08:00"
  };
}

function hkDateKey(value) {
  return toHongKongDateParts(value).dateKey;
}

function compareDateKey(a, b) {
  return String(a).localeCompare(String(b));
}

function isWithinHkDateRange(now, startsOn, expiresOn) {
  const today = hkDateKey(now);
  if (startsOn && compareDateKey(today, startsOn) < 0) return false;
  if (expiresOn && compareDateKey(today, expiresOn) > 0) return false;
  return true;
}

function nextDailyRunAtHongKong(now, hhmm = "04:00") {
  const parts = toHongKongDateParts(now);
  const [hour, minute] = hhmm.split(":").map((value) => Number(value));
  const todayRunUtcMs = Date.UTC(parts.year, parts.month - 1, parts.day, hour - 8, minute, 0);
  const nowMs = (now instanceof Date ? now : new Date(now)).getTime();
  const runMs = nowMs < todayRunUtcMs ? todayRunUtcMs : todayRunUtcMs + 24 * 60 * 60 * 1000;
  return {
    utc: new Date(runMs).toISOString(),
    hongKong: toHongKongDateParts(new Date(runMs)).isoLocal,
    timezone: HK_TIMEZONE
  };
}

module.exports = {
  HK_TIMEZONE,
  HK_OFFSET_MINUTES,
  toHongKongDateParts,
  hkDateKey,
  isWithinHkDateRange,
  nextDailyRunAtHongKong,
  _internal: { compareDateKey }
};
