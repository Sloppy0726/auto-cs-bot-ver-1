"use strict";

const fs = require("node:fs");
const path = require("node:path");
const seed = require("../seed/promoSeed");
const { createPromotionStore } = require("../src/promoSync");
const { standardCases } = require("../test/promoSync.cases");

const store = createPromotionStore({ entries: seed });

function cell(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

const lines = [
  "# Google Drive Promo Sync ver 1.0 - Side-by-side results",
  "",
  "All date checks use Hong Kong time (`Asia/Hong_Kong`, UTC+8).",
  "",
  "| Case | Expected | Actual |",
  "|---|---|---|"
];

for (const c of standardCases) {
  const result = store.lookup({
    businessId: c.businessId,
    sanitizedText: c.text,
    intent: c.intent,
    now: new Date(c.now)
  });
  lines.push(`| ${cell(c.name)} | ${cell({ match: c.expectMatch, title: c.expectTitle || "" })} | ${cell({ match: Boolean(result.bestPromotion), title: result.bestPromotion?.title || "", checkedDateHk: result.checkedDateHk, grounding: result.grounding })} |`);
}
lines.push("");

const out = path.join(__dirname, "..", "google-drive-promo-sync-side-by-side-results.md");
fs.writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${standardCases.length} rows to ${out}`);
