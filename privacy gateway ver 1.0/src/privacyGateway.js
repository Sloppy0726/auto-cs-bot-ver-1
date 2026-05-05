"use strict";

const { filterForLLM } = require("../../privacy filter ver 1.0/src/privacyFilter");

const ROUTES = Object.freeze({
  SEND_TO_LLM: "send_to_llm",
  REVIEW_BEFORE_LLM: "review_before_llm",
  BLOCK_AND_HANDOFF: "block_and_handoff"
});

function routeMessage(input, options = {}) {
  const filterResult = filterForLLM(input, options.filterOptions);
  const policy = buildPolicy(filterResult, options);

  return {
    route: policy.route,
    reason: policy.reason,
    originalText: filterResult.originalText,
    sanitizedText: filterResult.sanitizedText,
    shouldCallLLM: policy.route !== ROUTES.BLOCK_AND_HANDOFF,
    requiresHumanReview: policy.route !== ROUTES.SEND_TO_LLM,
    filter: {
      findings: filterResult.findings,
      hints: filterResult.hints,
      highestRisk: filterResult.highestRisk,
      shouldSendToLLM: filterResult.shouldSendToLLM,
      needsHumanReview: filterResult.needsHumanReview
    }
  };
}

function buildPolicy(filterResult, options) {
  if (!filterResult.shouldSendToLLM) {
    return {
      route: ROUTES.BLOCK_AND_HANDOFF,
      reason: "Blocked sensitive data was detected. Do not send this message to the LLM."
    };
  }

  if (hasFinding(filterResult, "credit_card")) {
    return {
      route: ROUTES.BLOCK_AND_HANDOFF,
      reason: "Credit-card-like data was detected."
    };
  }

  if (hasFinding(filterResult, "hkid")) {
    return {
      route: ROUTES.REVIEW_BEFORE_LLM,
      reason: "HKID-like data was detected and redacted. Staff review is required."
    };
  }

  if (hasHighRiskHint(filterResult)) {
    return {
      route: ROUTES.REVIEW_BEFORE_LLM,
      reason: "High-risk context was detected. Staff review is required before any AI reply."
    };
  }

  if (filterResult.needsHumanReview) {
    return {
      route: ROUTES.REVIEW_BEFORE_LLM,
      reason: "The privacy filter marked this message for human review."
    };
  }

  if (options.requireReviewForMediumRisk && filterResult.highestRisk === "medium") {
    return {
      route: ROUTES.REVIEW_BEFORE_LLM,
      reason: "Medium-risk data was detected and this gateway is configured for review."
    };
  }

  return {
    route: ROUTES.SEND_TO_LLM,
    reason: "Message was sanitized and can be sent to the LLM."
  };
}

function hasFinding(filterResult, type) {
  return filterResult.findings.some((finding) => finding.type === type);
}

function hasHighRiskHint(filterResult) {
  return filterResult.hints.some((hint) => hint.risk === "high");
}

module.exports = {
  ROUTES,
  routeMessage
};
