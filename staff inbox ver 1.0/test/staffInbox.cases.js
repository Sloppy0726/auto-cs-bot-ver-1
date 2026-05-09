"use strict";

const standardCases = [
  {
    name: "staff review becomes medium priority open item",
    decision: { action: "staff_review", businessId: "beauty_demo", reasons: ["policyRef=deposit_required"], staffPacket: { primaryIntent: "booking" } },
    draft: { action: "staff_review", text: "草稿" },
    safety: { verdict: "revise", safeToSend: false, reasons: ["staff only"] },
    normalizedMessage: { channel: "whatsapp", senderId: "u1", rawText: "想book", businessId: "beauty_demo" },
    expectPriority: "medium"
  },
  {
    name: "handoff becomes high priority",
    decision: { action: "handoff", businessId: "beauty_demo", escalationLabel: "complaint", reasons: [] },
    draft: { action: "handoff", text: "【員工交接】" },
    safety: { verdict: "revise", safeToSend: false, reasons: [] },
    normalizedMessage: { channel: "website", senderId: "s1", rawText: "投訴", businessId: "beauty_demo" },
    expectPriority: "high"
  },
  {
    name: "block becomes critical priority",
    decision: { action: "block", businessId: "beauty_demo", reasons: [] },
    draft: { action: "block", text: null },
    safety: { verdict: "block", safeToSend: false, reasons: [] },
    normalizedMessage: { channel: "website", senderId: "s2", rawText: "card", businessId: "beauty_demo" },
    expectPriority: "critical"
  }
];

module.exports = { standardCases };
