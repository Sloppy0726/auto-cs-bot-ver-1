"use strict";

// Business Rules ver 1.0
// Deterministic policy gate between knowledge retrieval and the AI draft engine.
// No LLM here. No I/O. Given (gateway, intent, KB, businessConfig) it returns:
//   - the action verb the pipeline must take
//   - the capability contract the draft engine must obey
//   - the escalation/handoff metadata the staff inbox needs

const { getConfig } = require("./archetypes");

const ACTIONS = Object.freeze({
  AUTO_SEND: "auto_send",
  STAFF_REVIEW: "staff_review",
  CLARIFY: "clarify",
  HANDOFF: "handoff",
  BLOCK: "block"
});

const ANGRY_PATTERN = /搞錯|嬲|憤怒|不滿|唔滿意|投訴|退錢|退款|chargeback|refund|complaint|angry|furious|terrible|worst/i;

const POLICY_TO_FORBIDDEN = Object.freeze({
  no_medical_claim: ["give_medical_advice", "promise_treatment_result", "diagnose"],
  no_refund_decision: ["decide_refund", "approve_chargeback"],
  deposit_required: ["waive_deposit", "promise_no_deposit"]
});

const INTENT_TO_FORBIDDEN = Object.freeze({
  booking: ["confirm_booking", "promise_slot_availability"],
  reschedule: ["confirm_new_slot"],
  order_status: ["state_delivery_eta", "confirm_shipment"],
  payment: ["confirm_payment_received", "decide_refund"],
  complaint: ["decide_refund", "admit_liability"]
});

// Always-forbidden, regardless of intent or policy. Defence in depth.
const ALWAYS_FORBIDDEN = Object.freeze([
  "invent_prices",
  "invent_business_facts",
  "give_legal_advice",
  "give_financial_advice",
  "leak_pii"
]);

const NUMBER_LIKE_PATTERN = /\$|HK\$|\d/;

function evaluate(input) {
  const {
    gateway = {},
    intent = {},
    knowledge = {},
    businessConfig
  } = input || {};

  const config = businessConfig || getConfig(knowledge.businessId || gateway.businessId);
  const reasons = [];
  const sanitizedText = gateway.sanitizedText || intent.sanitizedText || "";

  // --- Tier 1: hard block from privacy gateway ---
  if (gateway.route === "block_and_handoff" || gateway.shouldCallLLM === false) {
    return decision({
      action: ACTIONS.BLOCK,
      reason: gateway.reason || "Privacy gateway blocked the message before any LLM call.",
      escalationLabel: "privacy_block",
      config,
      intent,
      knowledge,
      reasons: [...reasons, "gateway.route=block_and_handoff"]
    });
  }

  // --- Tier 2: mandatory handoff ---
  const angryHit = ANGRY_PATTERN.test(sanitizedText);
  const mandatoryHandoffIntents = ["complaint", "sensitive_health", "child_data", "human_request"];
  const intentForcesHandoff = mandatoryHandoffIntents.includes(intent.primaryIntent);
  const kbForcesHandoff = knowledge.handoff === true;
  const gatewayHighRisk = gateway.requiresHumanReview && (intent.riskLevel === "high" || gateway?.filter?.highestRisk === "high");

  if (kbForcesHandoff || intentForcesHandoff || angryHit || gatewayHighRisk) {
    const escalationLabel = intentForcesHandoff
      ? intent.primaryIntent
      : angryHit
        ? "angry_customer"
        : kbForcesHandoff
          ? (knowledge.handoffReason || "kb_handoff")
          : "high_risk";
    return decision({
      action: ACTIONS.HANDOFF,
      reason: angryHit
        ? "Customer message shows anger or refund/complaint signal — staff must take over."
        : kbForcesHandoff
          ? (knowledge.handoffReason || "Knowledge base forced handoff for this intent.")
          : intentForcesHandoff
            ? `Intent "${intent.primaryIntent}" requires human handling.`
            : "Gateway flagged high risk requiring human handling.",
      escalationLabel,
      config,
      intent,
      knowledge,
      reasons: [
        ...reasons,
        kbForcesHandoff && "kb.handoff=true",
        intentForcesHandoff && `intent=${intent.primaryIntent}`,
        angryHit && "angry/refund signal in text",
        gatewayHighRisk && "gateway high risk"
      ].filter(Boolean)
    });
  }

  // --- Tier 3: clarify ---
  const intentConfidence = typeof intent.confidence === "number" ? intent.confidence : 0;
  const lowConfidence = intentConfidence < 0.5;
  const kbGap = knowledge.gap === true;

  if ((kbGap && intent.primaryIntent && intent.primaryIntent !== "general") || lowConfidence) {
    return decision({
      action: ACTIONS.CLARIFY,
      reason: kbGap
        ? "No approved knowledge entry matched — ask the customer one clarifying question."
        : "Intent confidence too low to proceed safely — ask a clarifying question.",
      escalationLabel: null,
      config,
      intent,
      knowledge,
      reasons: [
        ...reasons,
        kbGap && "kb.gap=true",
        lowConfidence && `intent.confidence<${0.5}`
      ].filter(Boolean),
      clarificationText: knowledge.suggestedClarification || null
    });
  }

  // --- Tier 4: forced review ---
  const forcedReviewReasons = [];
  if (knowledge.backendBound) forcedReviewReasons.push("knowledge.backendBound=true");
  const bestPolicyRef = knowledge.bestMatch?.policyRef;
  if (bestPolicyRef && config.policies?.includes(bestPolicyRef)) {
    forcedReviewReasons.push(`policyRef=${bestPolicyRef}`);
  }
  if (gateway.route === "review_before_llm") forcedReviewReasons.push("gateway.route=review_before_llm");
  if (config.reviewIntents?.includes(intent.primaryIntent)) forcedReviewReasons.push(`config.reviewIntents includes ${intent.primaryIntent}`);
  if (intent.needsHumanReview) forcedReviewReasons.push("intent.needsHumanReview=true");

  if (forcedReviewReasons.length > 0) {
    return decision({
      action: ACTIONS.STAFF_REVIEW,
      reason: "Policy or backend dependency requires staff review before sending.",
      escalationLabel: null,
      config,
      intent,
      knowledge,
      reasons: [...reasons, ...forcedReviewReasons]
    });
  }

  // --- Tier 5: auto-send (only if every guard agrees) ---
  const bestScore = knowledge.bestMatch?.score || 0;
  const intentInAutoList = config.autoSendIntents?.includes(intent.primaryIntent);
  const passScore = bestScore >= 0.7;
  const passConfidence = intentConfidence >= 0.7;
  const noRiskHints = (intent.riskLevel === "none" || intent.riskLevel === "low");
  const askStaffTrip = config.askStaffBeforePromise
    && knowledge.bestMatch
    && NUMBER_LIKE_PATTERN.test(knowledge.bestMatch.answer || "");

  if (intentInAutoList && passScore && passConfidence && noRiskHints && !askStaffTrip && knowledge.bestMatch) {
    return decision({
      action: ACTIONS.AUTO_SEND,
      reason: "All auto-send guards passed: intent allowed, score & confidence high, no risk, no number-promise trip.",
      escalationLabel: null,
      config,
      intent,
      knowledge,
      reasons: [
        ...reasons,
        `bestScore=${bestScore}`,
        `intentConfidence=${intentConfidence}`,
        `autoSendIntents allows ${intent.primaryIntent}`
      ]
    });
  }

  // --- Tier 6: default — staff review ---
  return decision({
    action: ACTIONS.STAFF_REVIEW,
    reason: "Default safe action: route to staff review.",
    escalationLabel: null,
    config,
    intent,
    knowledge,
    reasons: [
      ...reasons,
      !intentInAutoList && `intent ${intent.primaryIntent} not in autoSendIntents`,
      !passScore && `bestScore<${0.7}`,
      !passConfidence && `intentConfidence<${0.7}`,
      !noRiskHints && `riskLevel=${intent.riskLevel}`,
      askStaffTrip && "askStaffBeforePromise tripped on number/$ in answer",
      !knowledge.bestMatch && "no bestMatch"
    ].filter(Boolean)
  });
}

function decision({ action, reason, escalationLabel, config, intent, knowledge, reasons, clarificationText }) {
  const { allowedCapabilities, forbiddenCapabilities } = deriveCapabilities({ action, intent, knowledge, config });

  return {
    action,
    reason,
    escalationLabel: escalationLabel || null,
    suggestedTone: config.tone || "polite_professional",
    businessId: config.businessId,
    archetype: config.archetype || null,
    allowedCapabilities,
    forbiddenCapabilities,
    grounding: knowledge.grounding || [],
    clarificationText: clarificationText || null,
    staffPacket: action === "auto_send" ? null : buildStaffPacket({ intent, knowledge, action, escalationLabel, reason }),
    reasons: reasons.filter(Boolean)
  };
}

function deriveCapabilities({ action, intent, knowledge, config }) {
  const allowed = new Set();
  const forbidden = new Set(ALWAYS_FORBIDDEN);

  // Tone is always allowed.
  allowed.add(`use_tone:${config.tone || "polite_professional"}`);

  if (action === "block" || action === "handoff") {
    return {
      allowedCapabilities: ["write_handoff_summary_for_staff"],
      forbiddenCapabilities: [
        ...forbidden,
        "send_to_customer",
        "promise_anything",
        "confirm_booking",
        "decide_refund",
        "give_medical_advice"
      ]
    };
  }

  if (action === "clarify") {
    allowed.add("ask_one_clarifying_question");
    forbidden.add("provide_specific_facts");
    forbidden.add("quote_prices");
    forbidden.add("confirm_booking");
    return finalize(allowed, forbidden);
  }

  // staff_review and auto_send: KB-grounded.
  allowed.add("quote_kb_verbatim");
  if (knowledge.bestMatch) allowed.add(`cite_entry:${knowledge.bestMatch.id}`);
  allowed.add("ask_one_clarifying_question");

  // Intent-based forbidden.
  for (const cap of INTENT_TO_FORBIDDEN[intent.primaryIntent] || []) forbidden.add(cap);

  // Policy-based forbidden — both policies on the entry AND policies on the business config.
  const policyRefs = new Set();
  if (knowledge.bestMatch?.policyRef) policyRefs.add(knowledge.bestMatch.policyRef);
  for (const p of config.policies || []) policyRefs.add(p);
  for (const policy of policyRefs) {
    for (const cap of POLICY_TO_FORBIDDEN[policy] || []) forbidden.add(cap);
  }

  // Backend-bound: even in staff_review, the AI cannot author a confirmation.
  if (knowledge.backendBound) {
    forbidden.add("confirm_booking");
    forbidden.add("confirm_shipment");
    forbidden.add("confirm_payment_received");
    allowed.add("propose_options_for_staff_to_confirm");
  }

  return finalize(allowed, forbidden);
}

function finalize(allowed, forbidden) {
  // Forbidden wins over allowed if there's any clash.
  for (const cap of forbidden) allowed.delete(cap);
  return {
    allowedCapabilities: Array.from(allowed),
    forbiddenCapabilities: Array.from(forbidden)
  };
}

function buildStaffPacket({ intent, knowledge, action, escalationLabel, reason }) {
  return {
    action,
    escalationLabel: escalationLabel || null,
    reason,
    primaryIntent: intent.primaryIntent || "general",
    customerGoal: intent.customerGoal || "",
    confidence: typeof intent.confidence === "number" ? intent.confidence : null,
    bestMatchId: knowledge.bestMatch?.id || null,
    bestMatchAnswer: knowledge.bestMatch?.answer || null,
    grounding: knowledge.grounding || [],
    backendBound: Boolean(knowledge.backendBound)
  };
}

module.exports = {
  ACTIONS,
  evaluate,
  // exposed for tests / advanced wiring
  _internal: { deriveCapabilities, ANGRY_PATTERN, ALWAYS_FORBIDDEN, POLICY_TO_FORBIDDEN, INTENT_TO_FORBIDDEN }
};
