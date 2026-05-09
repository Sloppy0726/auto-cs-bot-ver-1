"use strict";

const deterministicActions = ["auto_send", "clarify", "block"];
const simpleIntents = ["hours_location", "pricing", "service_info", "aftercare", "general"];
const complexIntents = ["complaint", "sensitive_health", "child_data", "human_request", "payment", "order_status", "reschedule"];
const risks = ["none", "low", "medium", "high", "blocked"];

const standardCases = [
  {
    name: "auto_send restaurant hours uses no LLM",
    decision: { action: "auto_send" },
    intent: { primaryIntent: "hours_location", riskLevel: "none" },
    expectModel: "no_llm",
    expectShouldCall: false
  },
  {
    name: "staff_review simple beauty pricing uses Haiku",
    decision: { action: "staff_review" },
    intent: { primaryIntent: "pricing", riskLevel: "low" },
    expectModel: "claude-haiku-4-5-20251001",
    expectShouldCall: true
  },
  {
    name: "handoff angry complaint uses Sonnet",
    decision: { action: "handoff" },
    intent: { primaryIntent: "complaint", riskLevel: "high" },
    expectModel: "claude-sonnet-4-6",
    expectShouldCall: true
  },
  {
    name: "payment staff review uses Sonnet",
    decision: { action: "staff_review" },
    intent: { primaryIntent: "payment", riskLevel: "medium" },
    expectModel: "claude-sonnet-4-6",
    expectShouldCall: true
  }
];

for (const action of deterministicActions) {
  for (const intent of [...simpleIntents, ...complexIntents]) {
    standardCases.push({
      name: `${action} ${intent} remains deterministic with no model call`,
      decision: { action },
      intent: { primaryIntent: intent, riskLevel: "low" },
      expectModel: "no_llm",
      expectShouldCall: false
    });
  }
}

for (const intent of simpleIntents) {
  for (const risk of risks) {
    const highRisk = risk === "high" || risk === "blocked";
    standardCases.push({
      name: `staff_review ${intent} with ${risk} risk routes to ${highRisk ? "Sonnet" : "Haiku"}`,
      decision: { action: "staff_review" },
      intent: { primaryIntent: intent, riskLevel: risk },
      expectModel: highRisk ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001",
      expectShouldCall: true
    });
  }
}

for (const intent of complexIntents) {
  for (const risk of ["none", "low", "medium"]) {
    standardCases.push({
      name: `staff_review complex ${intent} with ${risk} risk routes to Sonnet`,
      decision: { action: "staff_review" },
      intent: { primaryIntent: intent, riskLevel: risk },
      expectModel: "claude-sonnet-4-6",
      expectShouldCall: true
    });
  }
}

for (const intent of [...simpleIntents, ...complexIntents]) {
  standardCases.push({
    name: `handoff ${intent} always uses Sonnet staff summary path`,
    decision: { action: "handoff" },
    intent: { primaryIntent: intent, riskLevel: "low" },
    expectModel: "claude-sonnet-4-6",
    expectShouldCall: true
  });
}

for (let index = 0; standardCases.length < 100; index += 1) {
  const longText = "客人補充好多背景，想問服務詳情同安排，".repeat(80 + index);
  standardCases.push({
    name: `long sanitized context ${index + 1} upgrades staff_review general to Sonnet`,
    decision: { action: "staff_review" },
    intent: { primaryIntent: "general", riskLevel: "low" },
    gateway: { sanitizedText: longText },
    expectModel: "claude-sonnet-4-6",
    expectShouldCall: true
  });
}

module.exports = { standardCases };
