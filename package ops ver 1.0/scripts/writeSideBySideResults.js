"use strict";

const path = require("node:path");
const { createPackageStore } = require("../src/packageOps");
const { packageEntries, standardCases } = require("../test/packageOps.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

const store = createPackageStore({ entries: packageEntries });

const rows = standardCases.map((c) => {
  const actual = store.lookup(c.input);
  const expected = {
    found: c.expectFound,
    autoSendEligible: c.expectAutoSendEligible,
    bestPackage: c.expectBestPackage || null,
    remainingSessions: c.expectRemainingSessions ?? null,
    riskFlag: c.expectRiskFlag || null
  };
  const problems = [];
  if (actual.found !== expected.found) problems.push(`found expected ${expected.found}, got ${actual.found}`);
  if (actual.autoSendEligible !== expected.autoSendEligible) problems.push(`autoSendEligible expected ${expected.autoSendEligible}, got ${actual.autoSendEligible}`);
  if (expected.bestPackage && actual.bestPackage?.packageName !== expected.bestPackage) problems.push(`bestPackage expected ${expected.bestPackage}, got ${actual.bestPackage?.packageName}`);
  if (expected.remainingSessions !== null && actual.bestPackage?.remainingSessions !== expected.remainingSessions) problems.push(`remainingSessions expected ${expected.remainingSessions}, got ${actual.bestPackage?.remainingSessions}`);
  if (expected.riskFlag && !actual.riskFlags.includes(expected.riskFlag)) problems.push(`missing risk flag ${expected.riskFlag}`);
  return {
    name: c.name,
    status: problems.length ? "FAIL" : "PASS",
    keyResult: actual.bestPackage ? `${actual.bestPackage.packageName} / ${actual.autoSendEligible ? "auto" : "review"}` : "no verified package",
    context: c.input,
    expected,
    actual: {
      found: actual.found,
      verifiedSender: actual.verifiedSender,
      autoSendEligible: actual.autoSendEligible,
      bestPackage: actual.bestPackage,
      approvedReplyText: actual.approvedReplyText,
      riskFlags: actual.riskFlags,
      reasons: actual.reasons
    },
    problems
  };
});

const out = path.join(__dirname, "..", "package-ops-side-by-side-results.md");
writeReadableReport(out, {
  title: "Package Ops ver 1.0 - Readable Side-by-side Results",
  description: "Each case compares a WhatsApp package-status inquiry with the deterministic entitlement facts and staff-review gating.",
  rows
});
console.log(`Wrote ${rows.length} readable rows to ${out}`);
if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
