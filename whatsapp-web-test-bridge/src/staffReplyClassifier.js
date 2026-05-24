"use strict";

// Classifies a staff member's manual WhatsApp reply as confirm / deny / unclear
// for an open booking-shaped inbox item. Heuristics first; if they don't catch
// it, optionally delegate to an LLM classifier passed in by the caller.
//
// Conservative by design: when in doubt, returns "unclear" so the inbox item
// stays open and a human can resolve it in the admin dashboard.

const CONFIRM_PATTERNS = [
  // Cantonese / Chinese
  /已預約|已book|已幫你book|預約成功|預約確認|確認預約|預約已確認/,
  /幫你book咗|幫你預約咗|幫你book左|幫你預約左/,
  /book咗喇|book左喇|預約咗喇/,
  /已為你預約|已替你預約|已確認/,
  // English
  /\b(?:booking|appointment|slot|reservation)\s+(?:is\s+)?confirmed\b/i,
  /\b(?:you'?re|you are)\s+(?:all\s+)?(?:booked|confirmed)\b/i,
  /\b(?:i'?ve|we'?ve)\s+(?:booked|confirmed)\b/i,
  /\bbooked you in\b/i,
  /\ball set\b/i,
  /\bconfirmed[!.]/i
];

const DENY_PATTERNS = [
  // Cantonese / Chinese
  /對唔住[\s\S]{0,40}?(?:冇位|無位|滿晒|滿曬|book唔到|訂唔到|冇得book|未能|唔可以)/,
  /唔好意思[\s\S]{0,40}?(?:冇位|無位|滿晒|滿曬|book唔到|訂唔到|冇得book|未能|唔可以)/,
  /(?:嗰日|嗰時|嗰個時段|嗰時段|當日)[\s\S]{0,20}?(?:冇位|無位|滿晒|滿曬|book唔到|訂唔到)/,
  /(?:冇位|無位|滿晒|滿曬|book唔到|訂唔到|冇得book)$/,
  /^(?:冇位|無位|滿晒|滿曬|book唔到|訂唔到|冇得book)/,
  /已取消|預約取消|取消預約/,
  // English
  /\b(?:sorry|unfortunately|apologies)[\s\S]{0,60}?(?:fully\s+booked|no\s+(?:availability|slots?|openings?|space)|cannot|can'?t|unable)/i,
  /\bfully\s+booked\b/i,
  /\bno\s+(?:availability|slots?|openings?|space)\b/i,
  /\bunable\s+to\s+(?:book|accommodate|fit)\b/i,
  /\bcancell?ed\b/i
];

function classifyByHeuristic(text) {
  const value = String(text || "").trim();
  if (!value) return { decision: "unclear", reason: "empty" };

  for (const pattern of DENY_PATTERNS) {
    if (pattern.test(value)) return { decision: "deny", reason: `deny:${pattern}` };
  }
  for (const pattern of CONFIRM_PATTERNS) {
    if (pattern.test(value)) return { decision: "confirm", reason: `confirm:${pattern}` };
  }
  return { decision: "unclear", reason: "no_clear_signal" };
}

async function classifyStaffReply(text, options = {}) {
  const heuristic = classifyByHeuristic(text);
  if (heuristic.decision !== "unclear") {
    return { ...heuristic, source: "heuristic" };
  }

  const llmClassifier = options.llmClassifier;
  if (typeof llmClassifier !== "function") {
    return { ...heuristic, source: "heuristic" };
  }

  try {
    const llm = await llmClassifier({ text, bookingDraft: options.bookingDraft || null });
    if (llm && (llm.decision === "confirm" || llm.decision === "deny")) {
      return { decision: llm.decision, reason: llm.reason || "llm", source: "llm" };
    }
    return { decision: "unclear", reason: llm?.reason || "llm_unclear", source: "llm" };
  } catch (error) {
    return { decision: "unclear", reason: `llm_error:${error.message}`, source: "llm_error" };
  }
}

module.exports = {
  classifyStaffReply,
  classifyByHeuristic
};
