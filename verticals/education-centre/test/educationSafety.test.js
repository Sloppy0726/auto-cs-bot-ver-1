"use strict";

// End-to-end safety wiring for the education-centre vertical.
//
// Proves the real modules compose into the expected safe outcomes for the
// brightpath-demo tenant:
//   vertical product intent  --educationIntentAdapter-->  core intent
//                            --knowledgeBase (brightpath seed)-->  grounding
//                            --businessRules (education archetype)-->  action
//
// Required coverage: trial lead, pricing staff review, complaint handoff,
// child-data handoff, exact-availability / no-slot-confirmation, and
// no-academic-outcome-guarantee.

const assert = require("node:assert/strict");

const { mapEducationIntent } = require("../src/educationIntentAdapter");
const brightpathSeed = require("../knowledge-base/brightpath-kb-seed");
const { createKnowledgeBase } = require("../../../knowledge base ver 1.0/src/knowledgeBase");
const businessRules = require("../../../business rules ver 1.0/src/businessRules");
const { getConfig } = require("../../../business rules ver 1.0/src/archetypes");

const BUSINESS_ID = "brightpath-demo";
const kb = createKnowledgeBase({ entries: brightpathSeed });
const config = getConfig(BUSINESS_ID);

let passed = 0;

// Run the slice of the pipeline that matters for safety: map the vertical
// product intent to a core intent, retrieve approved knowledge, then evaluate
// the deterministic business rules. Returns { coreIntent, knowledge, decision }.
function decide(verticalIntentId, text, opts = {}) {
  const coreIntent = mapEducationIntent(verticalIntentId, { strict: true });
  const intent = {
    primaryIntent: coreIntent,
    secondaryIntents: [],
    confidence: typeof opts.confidence === "number" ? opts.confidence : 0.9,
    riskLevel: opts.riskLevel || "low",
    sanitizedText: text,
    customerGoal: ""
  };
  const knowledge = kb.lookup({ businessId: BUSINESS_ID, sanitizedText: text, intent });
  const decision = businessRules.evaluate({
    gateway: { sanitizedText: text, businessId: BUSINESS_ID },
    intent,
    knowledge,
    businessConfig: config
  });
  return { coreIntent, knowledge, decision };
}

// 0. The seed is loadable and indexed under the registered tenant.
assert.ok(kb.has(BUSINESS_ID), "brightpath seed must be loaded for brightpath-demo");
assert.ok(brightpathSeed.length >= 8, "expected the full approved FAQ to be seeded");
passed += 1;

// 1. Trial lead: vertical trial enquiry maps to booking, KB entry is backend-bound,
//    so the bot collects the lead but routes to staff — it never confirms a slot.
{
  const { coreIntent, knowledge, decision } = decide("trial_lesson_enquiry", "想幫小朋友 K3 預約試堂");
  assert.equal(coreIntent, "booking", "trial enquiry maps to booking");
  assert.equal(knowledge.backendBound, true, "trial lesson is backend-bound (staff confirm)");
  assert.equal(decision.action, "staff_review", "trial lead routes to staff review");
  assert.ok(decision.grounding.includes("brightpath_trial"), "decision cites the trial KB entry");
  assert.ok(decision.forbiddenCapabilities.includes("confirm_booking"), "must not confirm a booking");
  assert.ok(decision.forbiddenCapabilities.includes("promise_slot_availability"), "must not promise a slot");
  passed += 1;
}

// 2. Pricing → staff review (education archetype lists pricing as a review intent),
//    and inventing prices is always forbidden.
{
  const { coreIntent, decision } = decide("price_enquiry", "P3 英文班幾錢？package price?");
  assert.equal(coreIntent, "pricing", "price enquiry maps to pricing");
  assert.equal(decision.action, "staff_review", "pricing must go to staff review");
  assert.ok(decision.forbiddenCapabilities.includes("invent_prices"), "must never invent prices");
  passed += 1;
}

// 3. Complaint / refund → handoff, refund decisions forbidden, staff-only output.
{
  const { coreIntent, decision } = decide("refund_or_complaint", "我要投訴，要求退錢");
  assert.equal(coreIntent, "complaint", "refund/complaint maps to complaint");
  assert.equal(decision.action, "handoff", "complaint must hand off to staff");
  assert.equal(decision.escalationLabel, "complaint", "escalation labelled complaint");
  assert.deepEqual(
    decision.allowedCapabilities,
    ["write_handoff_summary_for_staff"],
    "handoff may only write a staff summary"
  );
  assert.ok(decision.forbiddenCapabilities.includes("decide_refund"), "must not decide refunds");
  passed += 1;
}

// 4. Child data → handoff. This is the core child-data/privacy guard: any message
//    carrying a child's identifying details is staff-only, regardless of KB content.
{
  const { coreIntent, knowledge, decision } = decide(
    "child_data",
    "小朋友全名係陳大文，佢讀緊邊間幼稚園？出生日期係..."
  );
  assert.equal(coreIntent, "child_data", "child_data maps to child_data");
  assert.equal(knowledge.handoff, true, "KB hard-handoffs child_data even before rules");
  assert.equal(decision.action, "handoff", "child data must hand off to staff");
  assert.equal(decision.escalationLabel, "child_data", "escalation labelled child_data");
  assert.ok(
    !["auto_send", "clarify"].includes(decision.action),
    "child data is never customer-visible"
  );
  passed += 1;
}

// 5. Exact availability → no slot confirmation. A schedule/availability question is a
//    booking intent and must route to staff without confirming or promising a slot.
{
  const { coreIntent, decision } = decide(
    "class_schedule_enquiry",
    "星期六 09:30 嗰堂仲有冇位？可以幫我confirm住個位嗎？"
  );
  assert.equal(coreIntent, "booking", "schedule/availability maps to booking");
  assert.notEqual(decision.action, "auto_send", "exact availability must not auto-send");
  assert.equal(decision.action, "staff_review", "availability routes to staff review");
  assert.ok(decision.forbiddenCapabilities.includes("promise_slot_availability"), "no slot promises");
  assert.ok(decision.forbiddenCapabilities.includes("confirm_booking"), "no slot confirmation");
  passed += 1;
}

// 6. No academic outcome guarantee. A "do you guarantee results" question must route
//    to staff and the draft engine is forbidden from promising any academic outcome.
{
  const { decision } = decide("age_group_match", "你哋包唔包小朋友考到好成績？升小面試一定過到嗎？");
  assert.equal(decision.action, "staff_review", "guarantee question routes to staff review");
  assert.ok(decision.forbiddenCapabilities.includes("guarantee_exam_result"), "must not guarantee exam results");
  assert.ok(decision.forbiddenCapabilities.includes("promise_academic_outcome"), "must not promise academic outcomes");
  assert.ok(decision.forbiddenCapabilities.includes("promise_grade_improvement"), "must not promise grade gains");
  passed += 1;
}

console.log(`educationSafety: ${passed} tests passed`);
