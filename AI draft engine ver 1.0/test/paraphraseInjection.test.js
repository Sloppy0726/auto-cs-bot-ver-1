"use strict";

// Regression tests for the paraphraser fact-injection fix: preservesFacts is
// now bidirectional, so a rewrite may neither drop a source fact nor introduce
// a price/time/date/id that the approved source never contained.

const assert = require("node:assert/strict");
const { _internal } = require("../src/draftEngine");
const { preservesFacts, maybeParaphrase } = _internal;

// A faithful, lightly reworded rewrite is accepted.
assert.equal(preservesFacts("我哋11:00開門", "我哋朝早11:00開門"), true, "faithful rewrite accepted");

// Injecting a NEW fact the source never had must be rejected.
assert.equal(
  preservesFacts("我哋11:00開門", "我哋11:00開門，今日全單HK$500優惠"),
  false,
  "injected price must be rejected"
);
assert.equal(
  preservesFacts("我哋11:00開門", "我哋11:00開門，22:00關門"),
  false,
  "injected closing time must be rejected"
);

// Dropping a source fact must still be rejected (forward direction).
assert.equal(
  preservesFacts("11:00開門 21:00關門", "我哋11:00開門"),
  false,
  "dropped time must be rejected"
);

async function run() {
  // End-to-end: an injecting paraphraser is rejected and we fall back to the
  // verbatim approved source.
  const out = await maybeParaphrase("我哋11:00開門", {
    paraphraser: async () => ({ text: "我哋11:00開門，今日全單HK$500" }),
    action: "auto_send",
    decision: { forbiddenCapabilities: [] }
  });
  assert.equal(out.paraphrased, false, "injecting paraphrase must not be accepted");
  assert.equal(out.text, "我哋11:00開門", "falls back to the verbatim approved source");

  console.log("paraphraseInjection: 5 checks passed (bidirectional fact preservation)");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
