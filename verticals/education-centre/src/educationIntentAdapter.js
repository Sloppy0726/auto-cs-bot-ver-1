"use strict";

// Education-centre intent adapter.
//
// The vertical keeps its own product-facing intent taxonomy in
// ../intents/education-intents.json (trial_lesson_enquiry, price_enquiry, ...).
// Those product ids are good for sales/demo language and lead-capture routing,
// but the rest of the pipeline (intent classifier, business rules, draft engine,
// safety checker) only understands the core VALID_INTENTS taxonomy.
//
// This module is the single conversion point between the two. It maps each
// vertical product intent id onto a core intent id and refuses to emit anything
// that is not in the core taxonomy, so the vertical can evolve its product
// wording without ever silently producing an intent the core does not know.

const fs = require("node:fs");
const path = require("node:path");

const {
  VALID_INTENTS
} = require("../../../intent classifier ver 1.0/src/intentClassifier");

const CORE_INTENTS = new Set(VALID_INTENTS);

// Core intent the adapter falls back to when a product id is unknown.
// "general" routes the message through normal classification / staff review
// rather than guessing, which is the safe default for this vertical.
const FALLBACK_INTENT = "general";

// Vertical product intent id -> core taxonomy intent.
//
// Rationale per mapping:
//   trial_lesson_enquiry  -> booking      (parent wants to reserve a trial slot)
//   price_enquiry         -> pricing      (course / package fees)
//   class_schedule_enquiry-> booking      (asking what slots exist == booking flow)
//   age_group_match       -> service_info (which class suits the child)
//   makeup_class_policy   -> service_info (it is a policy question, not a slot
//                                          confirmation; staff confirm any reschedule)
//   refund_or_complaint   -> complaint    (safety-routed, never auto-sent)
//   teacher_qualification -> service_info (info about the service / teachers)
//   enrollment_followup   -> booking      (intent to join / hold a place)
//   child_data            -> child_data   (privacy-sensitive, staff review)
const EDUCATION_INTENT_MAP = Object.freeze({
  trial_lesson_enquiry: "booking",
  price_enquiry: "pricing",
  class_schedule_enquiry: "booking",
  age_group_match: "service_info",
  makeup_class_policy: "service_info",
  refund_or_complaint: "complaint",
  teacher_qualification: "service_info",
  enrollment_followup: "booking",
  child_data: "child_data"
});

// Fail fast at load time: every target must be a real core intent. This turns a
// typo in the map above into an immediate crash instead of a runtime "general"
// fallback that silently swallows the bug.
for (const [verticalId, coreIntent] of Object.entries(EDUCATION_INTENT_MAP)) {
  if (!CORE_INTENTS.has(coreIntent)) {
    throw new Error(
      `educationIntentAdapter: vertical intent "${verticalId}" maps to "${coreIntent}", which is not a core VALID_INTENTS member`
    );
  }
}

const INTENTS_FILE = path.resolve(__dirname, "../intents/education-intents.json");

// Lazily load + cache the product taxonomy ids declared in the JSON file so the
// consistency check (every declared product intent has a mapping) can run.
let cachedProductIntentIds = null;
function getEducationProductIntentIds() {
  if (cachedProductIntentIds) return cachedProductIntentIds;
  const raw = fs.readFileSync(INTENTS_FILE, "utf8");
  const parsed = JSON.parse(raw);
  const intents = Array.isArray(parsed.intents) ? parsed.intents : [];
  cachedProductIntentIds = intents
    .map((intent) => intent && intent.id)
    .filter((id) => typeof id === "string" && id.length > 0);
  return cachedProductIntentIds;
}

function isEducationProductIntent(verticalIntentId) {
  return Object.prototype.hasOwnProperty.call(EDUCATION_INTENT_MAP, verticalIntentId);
}

// Map a single vertical product intent id onto a core intent.
// Returns FALLBACK_INTENT for unknown / empty ids unless options.strict is set,
// in which case an unknown id throws (useful in tests / config validation).
function mapEducationIntent(verticalIntentId, options = {}) {
  const id = typeof verticalIntentId === "string" ? verticalIntentId.trim() : "";
  if (isEducationProductIntent(id)) {
    return EDUCATION_INTENT_MAP[id];
  }
  if (options.strict) {
    throw new Error(`educationIntentAdapter: unknown vertical intent "${verticalIntentId}"`);
  }
  return FALLBACK_INTENT;
}

// Convenience adapter over a classifier-style result whose primaryIntent is a
// vertical product id. Returns a shallow copy with primaryIntent rewritten to
// the core intent and the original product id preserved under verticalIntent.
// Secondary intents that are vertical ids are mapped too (unknowns dropped).
function adaptEducationClassification(result, options = {}) {
  if (!result || typeof result !== "object") {
    return result;
  }
  const verticalIntent = result.primaryIntent;
  const primaryIntent = mapEducationIntent(verticalIntent, options);

  const secondaryIntents = Array.isArray(result.secondaryIntents)
    ? result.secondaryIntents
        .map((id) => (isEducationProductIntent(id) ? EDUCATION_INTENT_MAP[id] : null))
        .filter((id) => id && id !== primaryIntent)
    : [];

  return {
    ...result,
    primaryIntent,
    secondaryIntents: [...new Set(secondaryIntents)],
    verticalIntent
  };
}

module.exports = {
  EDUCATION_INTENT_MAP,
  FALLBACK_INTENT,
  CORE_INTENTS: Array.from(CORE_INTENTS),
  mapEducationIntent,
  adaptEducationClassification,
  isEducationProductIntent,
  getEducationProductIntentIds
};
