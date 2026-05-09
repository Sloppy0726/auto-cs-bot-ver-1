"use strict";

const assert = require("node:assert/strict");
const { createStaffInbox, STATUSES } = require("../src/staffInbox");
const { standardCases } = require("./staffInbox.cases");

const inbox = createStaffInbox({ nowFn: () => new Date("2026-05-09T12:00:00.000Z") });
const ids = [];

for (const c of standardCases) {
  const item = inbox.submit(c);
  ids.push(item.id);
  assert.equal(item.status, STATUSES.OPEN, `${c.name}: status mismatch`);
  assert.equal(item.priority, c.expectPriority, `${c.name}: priority mismatch`);
  assert.equal(item.businessId, c.normalizedMessage.businessId, `${c.name}: businessId mismatch`);
}

assert.equal(inbox.list().length, standardCases.length, "list should include submitted items");
assert.equal(
  inbox.list({ priority: "high" }).length,
  standardCases.filter((item) => item.expectPriority === "high").length,
  "priority filter should work"
);

const approved = inbox.approve(ids[0], "alice");
assert.equal(approved.status, STATUSES.APPROVED, "approve should transition status");
assert.equal(approved.history.at(-1).actor, "alice", "approve should record actor");
assert.equal(approved.updatedAt, "2026-05-09T12:00:00.000Z", "injected clock should drive transition timestamp");

const edited = inbox.edit(ids[1], "updated draft", "bob");
assert.equal(edited.status, STATUSES.EDITED, "edit should transition status");
assert.equal(edited.draftText, "updated draft", "edit should update draft text");

assert.equal(inbox.get("missing"), null, "missing item should return null");

const liveInbox = createStaffInbox();
const liveItem = liveInbox.submit(standardCases[0]);
assert.notEqual(liveItem.createdAt, "1970-01-01T00:00:00.000Z", "default clock should not use Unix epoch");

console.log(`staffInbox: ${standardCases.length + 6} tests passed`);
