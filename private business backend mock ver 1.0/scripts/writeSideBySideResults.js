"use strict";

const path = require("node:path");
const { createBusinessBackend } = require("../src/businessBackendMock");
const { standardCases } = require("../test/businessBackendMock.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

const backend = createBusinessBackend();

const rows = standardCases.map((c) => {
  const result = backend[c.fn](c.query);
  const expected = { found: c.expectFound, available: c.expectAvailable };
  const actual = {
    found: result.found,
    available: result.available,
    facts: result.facts,
    reason: result.reason
  };
  const problems = [];
  if (actual.found !== expected.found) problems.push(`found expected ${expected.found}, got ${actual.found}`);
  if (expected.available !== undefined && actual.available !== expected.available) problems.push(`available expected ${expected.available}, got ${actual.available}`);
  return {
    name: c.name,
    status: problems.length ? "FAIL" : "PASS",
    keyResult: `${c.fn}: found=${actual.found}${actual.available === undefined ? "" : ` available=${actual.available}`}`,
    context: { fn: c.fn, query: c.query },
    expected,
    actual,
    problems
  };
});

const out = path.join(__dirname, "..", "private-business-backend-mock-side-by-side-results.md");
writeReadableReport(out, {
  title: "Private Business Backend Mock ver 1.0 - Readable Side-by-side Results",
  description: "Each case compares a controlled backend lookup with the minimal sanitized facts exposed to the AI workflow.",
  rows
});
console.log(`Wrote ${rows.length} readable rows to ${out}`);
if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
