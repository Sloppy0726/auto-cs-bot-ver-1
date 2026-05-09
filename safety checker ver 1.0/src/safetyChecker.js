"use strict";

// Safety Checker ver 1.0
// Final deterministic gate after the draft engine. No LLM. No I/O.

const { _internal: draftInternal } = require("../../AI draft engine ver 1.0/src/draftEngine");

const VERDICTS = Object.freeze({
  PASS: "pass",
  REVISE: "revise",
  BLOCK: "block"
});

const CUSTOMER_VISIBLE_ACTIONS = Object.freeze(["auto_send", "clarify"]);
const STAFF_ONLY_ACTIONS = Object.freeze(["staff_review", "handoff"]);
const BLOCKING_ACTIONS = Object.freeze(["block"]);

const PLACEHOLDER_PATTERN = /<HKID>|<CREDIT_CARD>|<PHONE>|<EMAIL>|\[stub\]|\{\{[^}]+\}\}|TODO|FIXME/i;
const PII_PATTERN = /[A-Z]\d{6}\([0-9A]\)|\b(?:\d[ -]?){13,19}\b|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\b(?:\+?852[-\s]?)?[569]\d{3}[-\s]?\d{4}\b/i;

function checkDraft(input = {}) {
  const { draft = {}, decision = {}, knowledge = {}, intent = {}, gateway = {} } = input;
  const violations = [];
  const reasons = [];
  const action = draft.action || decision.action || "unknown";
  const text = draft.text == null ? null : String(draft.text);

  if (BLOCKING_ACTIONS.includes(action)) {
    if (text) violations.push(violation("block_has_text", "Blocked messages must not produce customer or staff draft text.", "critical"));
    return {
      verdict: VERDICTS.BLOCK,
      safeToSend: false,
      violations,
      repairedText: null,
      reasons: [...reasons, "block action never safe to send"]
    };
  }

  if (!text || text.trim().length === 0) {
    violations.push(violation("empty_draft", "Draft text is empty.", CUSTOMER_VISIBLE_ACTIONS.includes(action) ? "high" : "medium"));
  }

  const forbiddenCheck = draftInternal.validateAgainstForbidden(text, decision.forbiddenCapabilities || []);
  if (!forbiddenCheck.ok) {
    violations.push(violation(
      "forbidden_capability_surface",
      `Draft appears to violate ${forbiddenCheck.capability}.`,
      "critical",
      { capability: forbiddenCheck.capability, pattern: forbiddenCheck.pattern }
    ));
  }

  if (text && PLACEHOLDER_PATTERN.test(text)) {
    violations.push(violation("placeholder_leak", "Draft contains a placeholder or stub marker.", "high"));
  }

  if (text && PII_PATTERN.test(text)) {
    violations.push(violation("pii_leak", "Draft appears to contain PII or payment-like data.", "critical"));
  }

  if (action === "auto_send") {
    const approvedAnswer = knowledge.bestMatch?.answer || "";
    if (text !== approvedAnswer) {
      violations.push(violation("auto_send_not_verbatim", "Auto-send text must match the approved KB answer exactly.", "critical"));
    }
    if (!hasRequiredCitation(draft, knowledge, decision)) {
      violations.push(violation("missing_grounding", "Auto-send must cite the KB grounding entry.", "high"));
    }
  }

  if (action === "clarify" && decision.clarificationText && text !== decision.clarificationText) {
    violations.push(violation("clarify_not_verbatim", "Clarify text must match the rules-engine clarification exactly.", "high"));
  }

  if (action === "handoff" && looksCustomerFacing(text)) {
    violations.push(violation("handoff_customer_facing", "Handoff summary appears to address the customer directly.", "high"));
  }

  if (gateway.route === "block_and_handoff" && text) {
    violations.push(violation("gateway_block_has_text", "Privacy-blocked messages must not produce draft text.", "critical"));
  }

  if (intent.riskLevel === "blocked" && CUSTOMER_VISIBLE_ACTIONS.includes(action)) {
    violations.push(violation("blocked_risk_customer_visible", "Blocked-risk messages cannot be customer-visible.", "critical"));
  }

  return verdict({
    action,
    violations,
    repairedText: canRepair(action, violations) ? repairText(text) : null,
    reasons: [
      ...reasons,
      `checked action=${action}`,
      `violations=${violations.length}`
    ]
  });
}

function verdict({ action, violations, repairedText, reasons }) {
  const hasCritical = violations.some((item) => item.severity === "critical");
  const hasHigh = violations.some((item) => item.severity === "high");
  const customerVisible = CUSTOMER_VISIBLE_ACTIONS.includes(action);

  if (hasCritical || (customerVisible && hasHigh)) {
    return {
      verdict: VERDICTS.BLOCK,
      safeToSend: false,
      violations,
      repairedText: null,
      reasons
    };
  }

  if (violations.length > 0) {
    return {
      verdict: VERDICTS.REVISE,
      safeToSend: false,
      violations,
      repairedText,
      reasons
    };
  }

  return {
    verdict: STAFF_ONLY_ACTIONS.includes(action) ? VERDICTS.REVISE : VERDICTS.PASS,
    safeToSend: CUSTOMER_VISIBLE_ACTIONS.includes(action),
    violations: [],
    repairedText: null,
    reasons
  };
}

function hasRequiredCitation(draft, knowledge, decision) {
  const required = new Set([...(knowledge.grounding || []), ...(decision.grounding || [])].filter(Boolean));
  if (required.size === 0) return false;
  const actual = new Set(draft.citations || []);
  for (const id of required) {
    if (actual.has(id)) return true;
  }
  return false;
}

function looksCustomerFacing(text) {
  if (!text) return false;
  return /多謝你|你好|請你|麻煩你|thank you|hi\b|hello\b/i.test(text) && !/員工交接|內部|staff/i.test(text);
}

function canRepair(action, violations) {
  if (!["staff_review", "handoff"].includes(action)) return false;
  return violations.every((item) => ["placeholder_leak", "empty_draft"].includes(item.code));
}

function repairText(text) {
  if (!text) return null;
  return text.replace(PLACEHOLDER_PATTERN, "").trim() || null;
}

function violation(code, message, severity, meta) {
  return {
    code,
    message,
    severity,
    meta: meta || null
  };
}

module.exports = {
  VERDICTS,
  checkDraft,
  _internal: {
    hasRequiredCitation,
    looksCustomerFacing,
    PLACEHOLDER_PATTERN,
    PII_PATTERN
  }
};
