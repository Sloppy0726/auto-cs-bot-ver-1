"use strict";

// Regression tests for the owner-impersonation fix:
//  1. isOwner must not match a short, attacker-chosen id against a real number.
//  2. The pipeline must only run the owner fast-path on operator-verified
//     channels (default: whatsapp), never on the website channel where the
//     senderId is a client-chosen sessionId.

const assert = require("node:assert/strict");
const { isOwner } = require("../src/ownerRegistry");
const { createPipeline } = require("../../end-to-end pipeline ver 1.0/src/pipeline");

const owners = ["85261112222"];

assert.equal(isOwner("85261112222", owners), true, "exact full number matches");
assert.equal(isOwner("61112222", owners), true, "local 8-digit number matches");
assert.equal(isOwner("+852 6111 2222", owners), true, "formatted number matches");
assert.equal(isOwner("2222", owners), false, "short suffix must NOT match an owner number");
assert.equal(isOwner("111", owners), false, "tiny id must NOT match");
assert.equal(isOwner("", owners), false, "empty sender must NOT match");
assert.equal(isOwner("85261119999", owners), false, "different number must NOT match");

async function run() {
  const calls = [];
  const ownerConsole = {
    handle: async ({ senderId }) => {
      calls.push(senderId);
      return { handled: true, text: "owner-reply" };
    },
    isOwner: () => true
  };
  const pipeline = createPipeline({ ownerConsole });

  // WhatsApp: sender number is operator-verified -> owner fast-path runs.
  const wa = await pipeline.runMessage({ channel: "whatsapp", businessId: "demo", from: "85261112222", text: "追數" });
  assert.equal(wa.draft?.text, "owner-reply", "owner console runs on the whatsapp channel");
  assert.equal(calls.length, 1, "owner console invoked once on whatsapp");

  // Website: senderId is a client-chosen sessionId -> fast-path must NOT run,
  // even if the visitor types the owner's number.
  calls.length = 0;
  const web = await pipeline.runMessage({ channel: "website", businessId: "demo", sessionId: "85261112222", text: "追數" });
  assert.equal(calls.length, 0, "owner console must not run on the website channel");
  assert.notEqual(web.draft?.text, "owner-reply", "a website visitor cannot trigger owner commands");

  console.log("ownerSecurity: 9 checks passed (isOwner tightening + channel gating)");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
