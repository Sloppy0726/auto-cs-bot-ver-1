"use strict";

// Verifies the "block until logged in" gate: with a clean env, every
// provider-backed tool returns auth_required and never touches the network.
// Meta tools (no provider) still run.

const assert = require("node:assert/strict");
const { REGISTRY } = require("../src/registry");

const PROVIDER_ENV = [
  "STRIPE_API_KEY", "QUICKBOOKS_ACCESS_TOKEN", "QUICKBOOKS_REALM_ID", "SQUARE_ACCESS_TOKEN",
  "PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "GOOGLE_ACCESS_TOKEN", "CANVA_ACCESS_TOKEN",
  "DOCUSIGN_ACCESS_TOKEN", "DOCUSIGN_ACCOUNT_ID"
];

async function run() {
  // Ensure a clean credential env regardless of host machine.
  for (const key of PROVIDER_ENV) delete process.env[key];

  // Make any accidental network call fail loudly so the test proves no I/O happens.
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error("network call should not happen when provider is not configured");
  };

  const { dispatch } = require("../src/dispatch");

  try {
    let blocked = 0;
    let meta = 0;
    for (const t of REGISTRY) {
      // Provide minimal valid input so we test the auth gate, not validation.
      const input = sampleInput(t);
      const result = await dispatch(t.name, input);
      if (t.provider === null) {
        assert.equal(result.ok, true, `${t.name}: meta tool should run, got ${JSON.stringify(result)}`);
        meta += 1;
      } else {
        assert.equal(result.ok, false, `${t.name}: should be blocked`);
        assert.equal(result.code, "auth_required", `${t.name}: expected auth_required, got ${result.code}`);
        assert.equal(result.provider, t.provider, `${t.name}: wrong provider in block`);
        blocked += 1;
      }
    }
    console.log(`auth: ${blocked} provider tools blocked (auth_required), ${meta} meta tools ran`);
  } finally {
    global.fetch = originalFetch;
  }
}

function sampleInput(t) {
  const input = {};
  for (const key of t.inputSchema.required || []) input[key] = "x";
  return input;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
