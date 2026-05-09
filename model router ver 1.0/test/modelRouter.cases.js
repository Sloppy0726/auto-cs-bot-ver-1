"use strict";

const standardCases = [
  {
    name: "auto_send uses no LLM",
    decision: { action: "auto_send" },
    intent: { primaryIntent: "hours_location", riskLevel: "none" },
    expectModel: "no_llm",
    expectShouldCall: false
  },
  {
    name: "staff_review simple uses Haiku",
    decision: { action: "staff_review" },
    intent: { primaryIntent: "pricing", riskLevel: "low" },
    expectModel: "claude-haiku-4-5-20251001",
    expectShouldCall: true
  },
  {
    name: "handoff uses Sonnet",
    decision: { action: "handoff" },
    intent: { primaryIntent: "complaint", riskLevel: "high" },
    expectModel: "claude-sonnet-4-6",
    expectShouldCall: true
  },
  {
    name: "payment review uses Sonnet",
    decision: { action: "staff_review" },
    intent: { primaryIntent: "payment", riskLevel: "medium" },
    expectModel: "claude-sonnet-4-6",
    expectShouldCall: true
  }
];

module.exports = { standardCases };
