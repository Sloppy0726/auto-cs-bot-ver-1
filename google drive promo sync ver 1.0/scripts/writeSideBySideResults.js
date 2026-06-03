"use strict";

const path = require("node:path");
const seed = require("../seed/promoSeed");
const { createPromotionStore } = require("../src/promoSync");
const { standardCases } = require("../test/promoSync.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

const store = createPromotionStore({ entries: seed });

const rows = standardCases.map((c) => {
  const result = store.lookup({
    businessId: c.businessId,
    sanitizedText: c.text,
    intent: c.intent,
    now: new Date(c.now)
  });
  const expected = { match: c.expectMatch, title: c.expectTitle || "" };
  const actual = {
    match: Boolean(result.bestPromotion),
    title: result.bestPromotion?.title || "",
    checkedDateHk: result.checkedDateHk,
    grounding: result.grounding,
    reasons: result.reasons
  };
  const problems = [];
  if (actual.match !== expected.match) problems.push(`match expected ${expected.match}, got ${actual.match}`);
  if (expected.title && actual.title !== expected.title) problems.push(`title expected ${expected.title}, got ${actual.title}`);
  return {
    name: c.name,
    status: problems.length ? "FAIL" : "PASS",
    keyResult: `${actual.match ? actual.title : "no match"} @ ${actual.checkedDateHk}`,
    context: { businessId: c.businessId, text: c.text, intent: c.intent, now: c.now },
    expected,
    actual,
    problems
  };
});

const out = path.join(__dirname, "..", "google-drive-promo-sync-side-by-side-results.md");
writeReadableReport(out, {
  title: "Google Drive Promo Sync ver 1.0 - Readable Side-by-side Results",
  description: "Each case compares promotion lookup expectations with active offers after UTC+8 locale time expiry checks.",
  rows
});
console.log(`Wrote ${rows.length} readable rows to ${out}`);
if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
