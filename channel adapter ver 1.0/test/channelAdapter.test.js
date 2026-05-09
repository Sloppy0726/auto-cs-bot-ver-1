"use strict";

const assert = require("node:assert/strict");
const { normalizeInbound, buildOutboundMessage, _internal } = require("../src/channelAdapter");
const { standardCases } = require("./channelAdapter.cases");

for (const c of standardCases) {
  const result = normalizeInbound(c.input);
  assert.equal(result.channel, c.expectChannel, `${c.name}: channel mismatch`);
  assert.equal(result.rawText, c.expectText, `${c.name}: text mismatch`);
  assert.equal(result.senderId, c.expectSender, `${c.name}: sender mismatch`);
  assert.deepEqual(result.errors, c.expectErrors || [], `${c.name}: errors mismatch`);
}

const normalized = normalizeInbound({ channel: "website", sessionId: "s1", text: "hello" });
const ready = buildOutboundMessage({
  normalizedMessage: normalized,
  draft: { action: "auto_send", text: "hi" },
  safety: { safeToSend: true }
});
assert.equal(ready.status, "ready_to_send", "safe auto_send should become ready_to_send");
assert.deepEqual(ready.payload, { sessionId: "s1", text: "hi" });

const held = buildOutboundMessage({
  normalizedMessage: normalized,
  draft: { action: "staff_review", text: "draft" },
  safety: { safeToSend: false }
});
assert.equal(held.status, "held", "staff_review must be held");
assert.equal(held.payload, null);

const idA = _internal.stableId("website", "s1", "hello");
const idB = _internal.stableId("website", "s1", "hello");
const idC = _internal.stableId("website", "s1", "hello!");
assert.match(idA, /^website_[a-f0-9]{24}$/, "stableId should use a fixed-length SHA-256-derived hex suffix");
assert.equal(idA, idB, "stableId should remain deterministic for the same input");
assert.notEqual(idA, idC, "stableId should change when source content changes");

console.log(`channelAdapter: ${standardCases.length + 5} tests passed`);
