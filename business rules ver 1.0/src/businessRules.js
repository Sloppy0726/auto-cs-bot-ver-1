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

const ANGRY_PATTERN = /搞錯|嬲|憤怒|不滿|唔滿意|投訴|退錢|退款|屌|廢|垃圾|咁廢|chargeback|refund|complaint|angry|furious|terrible|worst|bad bot|useless bot/i;
const PAYMENT_STATUS_PATTERN = /已(?:經)?(?:付款|付咗款|入數|轉帳|轉賬|pay(?:咗|左)?|paid)|(?:付款|入數|轉帳|轉賬|payme|fps|alipay).*(?:截圖|收唔收到|收到未)|(?:收唔收到|收到未|未收到).*(?:款|付款|錢|payment)|payment sent|paid already|receipt|screenshot/i;

const POLICY_TO_FORBIDDEN = Object.freeze({
  no_medical_claim: ["give_medical_advice", "promise_treatment_result", "diagnose"],
  no_refund_decision: ["decide_refund", "approve_chargeback"],
  deposit_required: ["waive_deposit", "promise_no_deposit"],
  no_academic_guarantee: ["guarantee_exam_result", "promise_academic_outcome", "promise_grade_improvement"]
});

const PACKAGE_FORBIDDEN = Object.freeze([
  "extend_package",
  "promise_refund",
  "transfer_package",
  "alter_remaining_sessions",
  "promise_treatment_result"
]);

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
    packageFacts = null,
    businessConfig,
    requiredClarification = null,
    sentiment = null
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
      packageFacts,
      reasons: [...reasons, "gateway.route=block_and_handoff"]
    });
  }

  // --- Tier 2: mandatory handoff ---
  const angryHit = ANGRY_PATTERN.test(sanitizedText);
  const mandatoryHandoffIntents = ["complaint", "sensitive_health", "child_data", "human_request"];
  const intentForcesHandoff = mandatoryHandoffIntents.includes(intent.primaryIntent);
  const kbForcesHandoff = knowledge.handoff === true;
  const gatewayHighRisk = gateway.requiresHumanReview && (intent.riskLevel === "high" || gateway?.filter?.highestRisk === "high");
  // Cantonese anger ladder / review-threat detection (deterministic, opt-in input).
  const reputationThreat = Boolean(sentiment && sentiment.reputationThreat);
  const sentimentEscalates = Boolean(sentiment && sentiment.escalate);

  if (kbForcesHandoff || intentForcesHandoff || angryHit || gatewayHighRisk || sentimentEscalates) {
    const escalationLabel = reputationThreat
      ? "reputation_risk"
      : intentForcesHandoff
        ? intent.primaryIntent
        : (angryHit || sentimentEscalates)
          ? "angry_customer"
          : kbForcesHandoff
            ? (knowledge.handoffReason || "kb_handoff")
            : "high_risk";
    return decision({
      action: ACTIONS.HANDOFF,
      reason: reputationThreat
        ? "Customer is threatening a public review / complaint — staff must take over to protect the relationship and reputation."
        : (angryHit || sentimentEscalates)
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
      packageFacts,
      reasons: [
        ...reasons,
        kbForcesHandoff && "kb.handoff=true",
        intentForcesHandoff && `intent=${intent.primaryIntent}`,
        angryHit && "angry/refund signal in text",
        gatewayHighRisk && "gateway high risk",
        sentimentEscalates && `canto sentiment severity ${sentiment.severity}`,
        reputationThreat && "review/reputation threat detected"
      ].filter(Boolean)
    });
  }

  if (intent.primaryIntent === "payment" && PAYMENT_STATUS_PATTERN.test(sanitizedText)) {
    return decision({
      action: ACTIONS.STAFF_REVIEW,
      reason: "Payment status or proof needs staff verification before replying.",
      escalationLabel: null,
      config,
      intent,
      knowledge,
      packageFacts,
      reasons: [...reasons, "payment status/proof signal in text"]
    });
  }

  if (intent.primaryIntent === "package_status") {
    if (packageFacts?.autoSendEligible && packageFacts?.approvedReplyText) {
      return decision({
        action: ACTIONS.AUTO_SEND,
        reason: "Verified active package facts can be sent deterministically.",
        escalationLabel: null,
        config,
        intent,
        knowledge,
        packageFacts,
        reasons: [...reasons, "packageFacts.autoSendEligible=true"]
      });
    }

    return decision({
      action: ACTIONS.STAFF_REVIEW,
      reason: "Package status cannot be answered automatically without verified active package facts.",
      escalationLabel: null,
      config,
      intent,
      knowledge,
      packageFacts,
      reasons: [
        ...reasons,
        packageFacts?.found === false && "packageFacts.found=false",
        packageFacts?.verifiedSender === false && "packageFacts.verifiedSender=false",
        packageFacts?.riskFlags?.length > 0 && `packageFacts.riskFlags=${packageFacts.riskFlags.join(",")}`,
        !packageFacts?.approvedReplyText && "packageFacts.approvedReplyText missing"
      ].filter(Boolean)
    });
  }

  // --- Tier 3: clarify ---
  const intentConfidence = typeof intent.confidence === "number" ? intent.confidence : 0;
  const lowConfidence = intentConfidence < 0.5;
  const kbGap = knowledge.gap === true;

  if (requiredClarification?.text) {
    return decision({
      action: ACTIONS.CLARIFY,
      reason: requiredClarification.reason || "Missing required details — ask one clarifying question before backend review.",
      escalationLabel: null,
      config,
      intent,
      knowledge,
      reasons: [...reasons, requiredClarification.reason || "required clarification"],
      clarificationText: requiredClarification.text
    });
  }

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
      packageFacts,
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
  // If the owner has opted intent into auto_send, the policy still applies as a
  // content constraint via forbidden capabilities (no medical claim, etc.),
  // but does not by itself force staff review.
  const intentOptedIntoAutoSend = (config.autoSendIntents || []).includes(intent.primaryIntent);
  if (bestPolicyRef && config.policies?.includes(bestPolicyRef) && !intentOptedIntoAutoSend) {
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
      packageFacts,
      reasons: [...reasons, ...forcedReviewReasons]
    });
  }

  // --- Tier 5: auto-send (only if every guard agrees) ---
  const bestScore = knowledge.bestMatch?.score || 0;
  const intentInAutoList = config.autoSendIntents?.includes(intent.primaryIntent);
  const passScore = bestScore >= 0.7;
  const passConfidence = intentConfidence >= 0.7;
  const noRiskHints = (intent.riskLevel === "none" || intent.riskLevel === "low");
  // Intents the owner explicitly opted into auto-send have KB answers whose numbers
  // are pre-approved (e.g. published prices, hours). Don't trip askStaffBeforePromise
  // on numbers in those answers. For everything else (booking slot counts, payment
  // amounts, etc.) the staff review still happens.
  const intentApprovedForNumbers = (config.autoSendIntents || []).includes(intent.primaryIntent);
  const numberNeedsReview = !intentApprovedForNumbers;
  const askStaffTrip = config.askStaffBeforePromise
    && numberNeedsReview
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
      packageFacts,
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
    packageFacts,
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

function decision({ action, reason, escalationLabel, config, intent, knowledge, packageFacts, reasons, clarificationText }) {
  const { allowedCapabilities, forbiddenCapabilities } = deriveCapabilities({ action, intent, knowledge, packageFacts, config });
  const grounding = groundingFor({ knowledge, packageFacts });

  return {
    action,
    reason,
    escalationLabel: escalationLabel || null,
    suggestedTone: config.tone || "polite_professional",
    businessId: config.businessId,
    archetype: config.archetype || null,
    allowedCapabilities,
    forbiddenCapabilities,
    grounding,
    clarificationText: clarificationText || null,
    staffPacket: action === "auto_send" ? null : buildStaffPacket({ intent, knowledge, packageFacts, action, escalationLabel, reason }),
    reasons: reasons.filter(Boolean)
  };
}

function deriveCapabilities({ action, intent, knowledge, packageFacts, config }) {
  const allowed = new Set();
  const forbidden = new Set(ALWAYS_FORBIDDEN);

  // Tone is always allowed.
  allowed.add(`use_tone:${config.tone || "polite_professional"}`);

  if (action === "block" || action === "handoff") {
    return {
      allowedCapabilities: ["write_handoff_summary_for_staff"],
      forbiddenCapabilities: [
        ...forbidden,
        ...PACKAGE_FORBIDDEN,
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
    for (const cap of PACKAGE_FORBIDDEN) forbidden.add(cap);
    return finalize(allowed, forbidden);
  }

  // staff_review and auto_send: KB-grounded.
  allowed.add("quote_kb_verbatim");
  if (knowledge.bestMatch) allowed.add(`cite_entry:${knowledge.bestMatch.id}`);
  if (packageFacts?.bestPackage) {
    allowed.add("quote_package_facts");
    allowed.add(`cite_package:${packageFacts.bestPackage.id}`);
  }
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

  if (intent.primaryIntent === "package_status" || packageFacts) {
    for (const cap of PACKAGE_FORBIDDEN) forbidden.add(cap);
  }

  return finalize(allowed, forbidden);
}

function groundingFor({ knowledge, packageFacts }) {
  if (packageFacts?.grounding?.length > 0) return packageFacts.grounding;
  return knowledge.grounding || [];
}

function finalize(allowed, forbidden) {
  // Forbidden wins over allowed if there's any clash.
  for (const cap of forbidden) allowed.delete(cap);
  return {
    allowedCapabilities: Array.from(allowed),
    forbiddenCapabilities: Array.from(forbidden)
  };
}

function buildStaffPacket({ intent, knowledge, packageFacts, action, escalationLabel, reason }) {
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
    backendBound: Boolean(knowledge.backendBound),
    packageFacts: packageFacts || null
  };
}

module.exports = {
  ACTIONS,
  evaluate,
  // exposed for tests / advanced wiring
  _internal: { deriveCapabilities, ANGRY_PATTERN, PAYMENT_STATUS_PATTERN, ALWAYS_FORBIDDEN, POLICY_TO_FORBIDDEN, INTENT_TO_FORBIDDEN }
};
