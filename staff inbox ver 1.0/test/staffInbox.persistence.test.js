"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createStaffInbox, STATUSES } = require("../src/staffInbox");
const { standardCases } = require("./staffInbox.cases");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "staffinbox-persist-"));
const filePath = path.join(tmpDir, "inbox.json");

const inbox = createStaffInbox({
  filePath,
  nowFn: () => new Date("2026-05-25T00:00:00.000Z")
});
const submitted = inbox.submit(standardCases[0]);
inbox.approve(submitted.id, "carol");

assert.ok(fs.existsSync(filePath), "submit/approve should persist file to disk");
const onDisk = JSON.parse(fs.readFileSync(filePath, "utf8"));
assert.equal(onDisk.items.length, 1, "file should contain one item");
assert.equal(onDisk.items[0].status, STATUSES.APPROVED, "persisted status should reflect approve");
assert.equal(onDisk.items[0].history.at(-1).actor, "carol", "history entry should be persisted");

const reloaded = createStaffInbox({ filePath, nowFn: () => new Date("2026-05-25T00:00:00.000Z") });
const recovered = reloaded.get(submitted.id);
assert.ok(recovered, "reloaded inbox should hydrate from disk");
assert.equal(recovered.status, STATUSES.APPROVED, "hydrated status should match persisted state");
assert.equal(reloaded.list().length, 1, "list should reflect hydrated items");

const rejected = reloaded.reject(submitted.id, "duplicate", "dave");
assert.equal(rejected.status, STATUSES.REJECTED, "reject should transition after reload");
const afterReject = JSON.parse(fs.readFileSync(filePath, "utf8"));
assert.equal(afterReject.items[0].status, STATUSES.REJECTED, "reject should re-persist");

fs.rmSync(tmpDir, { recursive: true, force: true });

const noFile = path.join(tmpDir, "does-not-exist.json");
const freshInbox = createStaffInbox({ filePath: noFile });
assert.equal(freshInbox.list().length, 0, "missing file should hydrate to empty inbox");

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log("staffInbox.persistence: 8 tests passed");
