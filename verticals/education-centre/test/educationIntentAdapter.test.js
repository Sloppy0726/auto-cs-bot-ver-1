"use strict";

// Unit tests for the education-centre intent adapter.
// Proves every vertical product intent id converts to a valid core intent,
// the JSON taxonomy and the code map stay in sync, and the safety-sensitive
// intents (complaint, child_data) map to their protected core intents.

const assert = require("node:assert/strict");

const {
  EDUCATION_INTENT_MAP,
  FALLBACK_INTENT,
  mapEducationIntent,
  adaptEducationClassification,
  isEducationProductIntent,
  getEducationProductIntentIds
} = require("../src/educationIntentAdapter");

const { VALID_INTENTS } = require("../../../intent classifier ver 1.0/src/intentClassifier");

const coreIntents = new Set(VALID_INTENTS);
let passed = 0;

// 1. Every explicit mapping required by the spec.
const expectedMappings = {
  trial_lesson_enquiry: "booking",
  price_enquiry: "pricing",
  class_schedule_enquiry: "booking",
  age_group_match: "service_info",
  makeup_class_policy: "service_info",
  refund_or_complaint: "complaint",
  teacher_qualification: "service_info",
  enrollment_followup: "booking",
  child_data: "child_data"
};
for (const [verticalId, coreIntent] of Object.entries(expectedMappings)) {
  assert.equal(
    mapEducationIntent(verticalId),
    coreIntent,
    `${verticalId} must map to ${coreIntent}`
  );
  passed += 1;
}

// 2. Every mapping target is a real core intent.
for (const [verticalId, coreIntent] of Object.entries(EDUCATION_INTENT_MAP)) {
  assert.ok(coreIntents.has(coreIntent), `${verticalId} target ${coreIntent} must be a core intent`);
}
passed += 1;

// 3. JSON taxonomy <-> code map are in sync: every product id declared in
//    education-intents.json has a mapping (no silent fallbacks for known ids).
const productIds = getEducationProductIntentIds();
assert.ok(productIds.length >= 9, "expected at least 9 product intents in the JSON taxonomy");
for (const id of productIds) {
  assert.ok(isEducationProductIntent(id), `JSON product intent "${id}" must have a mapping`);
}
// ...and no mapping refers to a product id that no longer exists in the JSON.
for (const id of Object.keys(EDUCATION_INTENT_MAP)) {
  assert.ok(productIds.includes(id), `mapped id "${id}" must exist in education-intents.json`);
}
passed += 1;

// 4. Unknown / empty ids fall back to "general" by default.
assert.equal(mapEducationIntent("does_not_exist"), FALLBACK_INTENT, "unknown id falls back to general");
assert.equal(mapEducationIntent(""), FALLBACK_INTENT, "empty id falls back to general");
assert.equal(mapEducationIntent(null), FALLBACK_INTENT, "null id falls back to general");
assert.equal(mapEducationIntent("  price_enquiry  "), "pricing", "ids are trimmed before lookup");
passed += 1;

// 5. Strict mode throws on unknown ids.
assert.throws(
  () => mapEducationIntent("nope", { strict: true }),
  /unknown vertical intent/,
  "strict mode must throw on unknown ids"
);
passed += 1;

// 6. Safety-sensitive intents map to protected core intents.
assert.equal(mapEducationIntent("refund_or_complaint"), "complaint", "complaints must route to complaint");
assert.equal(mapEducationIntent("child_data"), "child_data", "child data must route to child_data");
passed += 1;

// 7. adaptEducationClassification rewrites a classifier-style result.
const adapted = adaptEducationClassification({
  primaryIntent: "trial_lesson_enquiry",
  secondaryIntents: ["price_enquiry", "unknown_thing", "trial_lesson_enquiry"],
  confidence: 0.8
});
assert.equal(adapted.primaryIntent, "booking", "primaryIntent rewritten to core intent");
assert.equal(adapted.verticalIntent, "trial_lesson_enquiry", "original vertical id preserved");
assert.deepEqual(adapted.secondaryIntents, ["pricing"], "secondaries mapped, unknown dropped, primary de-duped");
assert.equal(adapted.confidence, 0.8, "other fields are preserved");
passed += 1;

// 8. adaptEducationClassification is a no-op on non-objects.
assert.equal(adaptEducationClassification(null), null, "null passes through");
assert.equal(adaptEducationClassification("x"), "x", "non-object passes through");
passed += 1;

console.log(`educationIntentAdapter: ${passed} tests passed`);
