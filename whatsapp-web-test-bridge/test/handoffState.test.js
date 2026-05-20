"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHandoffState, normalizeChatKey } = require("../src/handoffState");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wa-handoff-state-"));
const filePath = path.join(tmpDir, "handoff.json");
let now = new Date("2026-05-20T12:00:00.000Z");

const state = createHandoffState({
  filePath,
  ttlMs: 60 * 1000,
  nowFn: () => now
});

assert.equal(normalizeChatKey(" Matthew   Lai 0726 "), "matthew lai 0726");
assert.equal(state.active("Matthew Lai 0726"), null);

const paused = state.pause("Matthew Lai 0726", {
  intent: "booking",
  staffItemId: "staff_123",
  lastCustomerText: "想book",
  botHandoffText: "交俾同事跟進"
});
assert.equal(paused.chatKey, "matthew lai 0726");
assert.equal(paused.intent, "booking");
assert.equal(state.active("matthew lai 0726").staffItemId, "staff_123");
assert.equal(state.active("matthew lai 0726").stage, "waiting_for_staff");

const staffReply = state.markStaffReply("Matthew Lai 0726", {
  text: "已幫你confirm聽日3點",
  fingerprint: "staff-reply-1"
});
assert.equal(staffReply.stage, "staff_replied");
assert.equal(staffReply.staffReplyText, "已幫你confirm聽日3點");
assert.equal(state.active("Matthew Lai 0726").staffReplyFingerprint, "staff-reply-1");

now = new Date("2026-05-20T12:00:30.000Z");
assert.ok(state.active("Matthew Lai 0726"), "pause should remain active before ttl");

now = new Date("2026-05-20T12:01:01.000Z");
assert.equal(state.active("Matthew Lai 0726"), null, "pause should expire after ttl");

state.pause("Matthew Lai 0726", { intent: "booking" });
assert.equal(state.release("Matthew Lai 0726"), true);
assert.equal(state.active("Matthew Lai 0726"), null);

state.pause("Matthew Lai 0726", { intent: "booking" });
state.clear();
assert.equal(state.active("Matthew Lai 0726"), null);

console.log("handoffState: 11 tests passed");
