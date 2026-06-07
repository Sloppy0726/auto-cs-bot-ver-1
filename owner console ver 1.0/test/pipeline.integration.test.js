"use strict";

const assert = require("node:assert/strict");
const { createPipeline } = require("../../end-to-end pipeline ver 1.0/src/pipeline");
const { createOwnerConsole } = require("../src/ownerConsole");

async function fakeDispatch(tool) {
  return { ok: true, tool, summary: `${tool} ok`, data: { total: 2 } };
}

async function run() {
  const ownerConsole = createOwnerConsole({ ownerPhones: ["85261112222"], dispatch: fakeDispatch });
  const pipeline = createPipeline({ ownerConsole });

  // Owner -> toolkit fast-path, customer flow skipped.
  const owner = await pipeline.runMessage({ channel: "whatsapp", businessId: "demo", from: "85261112222", text: "追數" });
  assert.equal(owner.finalStatus, "ready_to_send", "owner command should be ready_to_send");
  assert.equal(owner.draft.action, "auto_send");
  assert.ok(JSON.stringify(owner.outbound.payload).includes("追未付數"), "reply should be the owner-facing tool result");
  assert.equal(owner.intent, null, "owner fast-path skips intent classification");

  // Non-owner -> normal customer-support flow (no owner reply).
  const guest = await pipeline.runMessage({ channel: "whatsapp", businessId: "demo", from: "85299998888", text: "你好" });
  assert.ok(JSON.stringify(guest.outbound?.payload || {}).indexOf("追未付數") === -1, "guest must not get owner reply");
  assert.ok(guest.intent !== null, "guest goes through normal classification");

  console.log("ownerConsole pipeline integration: owner fast-path + guest passthrough passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
