"use strict";

const path = require("node:path");
const { createStaffInbox } = require("../src/staffInbox");
const { standardCases } = require("../test/staffInbox.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

const inbox = createStaffInbox();

const rows = standardCases.map((c) => {
  const item = inbox.submit(c);
  const expected = { priority: c.expectPriority, status: "open", businessId: c.normalizedMessage.businessId };
  const actual = {
    id: item.id,
    priority: item.priority,
    status: item.status,
    action: item.action,
    businessId: item.businessId,
    channel: item.channel,
    escalationLabel: item.escalationLabel
  };
  const problems = [];
  if (actual.priority !== expected.priority) problems.push(`priority expected ${expected.priority}, got ${actual.priority}`);
  if (actual.status !== expected.status) problems.push(`status expected ${expected.status}, got ${actual.status}`);
  if (actual.businessId !== expected.businessId) problems.push(`businessId expected ${expected.businessId}, got ${actual.businessId}`);
  return {
    name: c.name,
    status: problems.length ? "FAIL" : "PASS",
    keyResult: `${actual.priority} / ${actual.action}`,
    context: {
      decision: c.decision,
      safety: c.safety,
      normalizedMessage: c.normalizedMessage
    },
    expected,
    actual,
    problems
  };
});

const out = path.join(__dirname, "..", "staff-inbox-side-by-side-results.md");
writeReadableReport(out, {
  title: "Staff Inbox ver 1.0 - Readable Side-by-side Results",
  description: "Each case compares a held workflow item with the priority and queue state staff should see.",
  rows
});
console.log(`Wrote ${rows.length} readable rows to ${out}`);
if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
