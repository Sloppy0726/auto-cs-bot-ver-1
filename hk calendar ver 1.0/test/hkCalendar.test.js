"use strict";

const assert = require("node:assert/strict");
const { resolveCulturalDate, isHkPublicHoliday } = require("../src/hkCalendar");
const { NOW, cases } = require("./hkCalendar.cases");

let passed = 0;

for (const c of cases) {
  const now = new Date(c.now || NOW);
  const result = resolveCulturalDate(c.text, now);

  if (c.expect === null) {
    assert.equal(result, null, `${c.name}: expected null (fall through to existing parser)`);
    passed += 1;
    continue;
  }

  assert.ok(result && result.matched, `${c.name}: expected a match`);
  assert.equal(result.dateKey, c.expect.dateKey, `${c.name}: dateKey`);
  if ("kind" in c.expect) assert.equal(result.kind, c.expect.kind, `${c.name}: kind`);
  if ("ambiguous" in c.expect) assert.equal(result.ambiguous, c.expect.ambiguous, `${c.name}: ambiguous`);
  if ("provisional" in c.expect) assert.equal(result.provisional, c.expect.provisional, `${c.name}: provisional`);
  if ("isPublicHoliday" in c.expect) assert.equal(result.isPublicHoliday, c.expect.isPublicHoliday, `${c.name}: isPublicHoliday`);
  passed += 1;
}

// isHkPublicHoliday lookups
const holidayChecks = [
  ["2026-02-17", true, "LNY day 1"],
  ["2026-02-18", true, "LNY day 2"],
  ["2026-02-19", true, "LNY day 3"],
  ["2026-12-25", true, "Christmas"],
  ["2026-12-26", true, "Boxing Day"],
  ["2026-12-24", false, "Christmas Eve is not statutory"],
  ["2026-06-19", true, "Tuen Ng"],
  ["2026-12-22", false, "Winter solstice is cultural not statutory"],
  ["2026-07-15", false, "ordinary day"],
  ["not-a-date", false, "garbage input"]
];
for (const [dateKey, expected, label] of holidayChecks) {
  assert.equal(isHkPublicHoliday(dateKey), expected, `isHkPublicHoliday ${label}`);
  passed += 1;
}

// Determinism: same input twice gives identical output.
const a = resolveCulturalDate("中秋訂位", new Date(NOW));
const b = resolveCulturalDate("中秋訂位", new Date(NOW));
assert.deepEqual(a, b, "resolver must be deterministic");
passed += 1;

console.log(`hkCalendar: ${passed} tests passed`);
