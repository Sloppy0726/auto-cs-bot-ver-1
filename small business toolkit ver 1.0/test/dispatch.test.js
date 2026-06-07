"use strict";

const assert = require("node:assert/strict");
const { dispatch, validateInput } = require("../src/dispatch");

async function run() {
  // Unknown tool.
  const unknown = await dispatch("does-not-exist", {});
  assert.equal(unknown.ok, false);
  assert.equal(unknown.code, "unknown_tool");

  // Invalid input: smb-router requires `request`.
  const badInput = await dispatch("smb-router", {});
  assert.equal(badInput.ok, false);
  assert.equal(badInput.code, "invalid_input");
  assert.ok(badInput.errors.some((e) => e.includes("request")), "should flag missing request");

  // Type mismatch flagged by the schema validator.
  const typeErrors = validateInput(
    { type: "object", properties: { limit: { type: "number" } } },
    { limit: "not-a-number" }
  );
  assert.ok(typeErrors.some((e) => e.includes("limit")), "should flag wrong type");

  // Valid meta call works without any provider.
  const ok = await dispatch("smb-router", { request: "I need to chase an unpaid invoice" });
  assert.equal(ok.ok, true);
  assert.ok(ok.data.suggestions.length > 0, "router should suggest something");
  assert.equal(ok.data.suggestions[0].name, "invoice-chase", "should rank invoice-chase first");

  console.log("dispatch: unknown-tool, invalid-input, type-check, and router happy-path all passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
