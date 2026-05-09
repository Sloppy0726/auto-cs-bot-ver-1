"use strict";

const businesses = ["beauty_demo", "restaurant_demo", "igshop_demo", "edu_demo"];
const channels = ["whatsapp", "instagram", "facebook", "website"];
const reviewTexts = [
  "想book今晚",
  "facial幾錢？",
  "P3英文班點報名？",
  "呢件有冇現貨？",
  "想改期到星期日",
  "付款後幾時出貨？"
];
const escalationTexts = [
  "你哋搞錯我個booking，我要退錢。",
  "我要搵真人傾",
  "我懷孕緊可唔可以做療程？",
  "小朋友資料要點交？"
];

const standardCases = [
  item("staff review booking becomes medium priority", "staff_review", "beauty_demo", "whatsapp", "u-booking", "想book", "medium", { staffPacket: { primaryIntent: "booking" } }),
  item("complaint handoff becomes high priority", "handoff", "beauty_demo", "website", "s-complaint", "投訴", "high", { escalationLabel: "complaint" }),
  item("privacy block becomes critical priority", "block", "beauty_demo", "website", "s-card", "card", "critical", { safetyVerdict: "block" }),
  item("safe clarify held item stays low priority if submitted", "clarify", "restaurant_demo", "website", "s-clarify", "有冇泊車", "low")
];

let index = 1;
while (standardCases.length < 100) {
  const businessId = businesses[index % businesses.length];
  const channel = channels[index % channels.length];
  if (index % 5 === 0) {
    standardCases.push(item(
      `critical safety block for ${businessId} ${channel} payment-like payload ${index}`,
      "block",
      businessId,
      channel,
      `sender-critical-${index}`,
      "信用卡資料",
      "critical",
      { safetyVerdict: "block", reasons: ["privacy_block"] }
    ));
  } else if (index % 5 === 1) {
    standardCases.push(item(
      `high priority handoff for ${businessId} ${channel} escalation ${index}`,
      "handoff",
      businessId,
      channel,
      `sender-handoff-${index}`,
      escalationTexts[index % escalationTexts.length],
      "high",
      { escalationLabel: index % 2 === 0 ? "complaint" : "human_request" }
    ));
  } else if (index % 5 === 2) {
    standardCases.push(item(
      `medium staff review for ${businessId} ${channel} policy check ${index}`,
      "staff_review",
      businessId,
      channel,
      `sender-review-${index}`,
      reviewTexts[index % reviewTexts.length],
      "medium",
      { staffPacket: { primaryIntent: index % 2 === 0 ? "pricing" : "booking" } }
    ));
  } else if (index % 5 === 3) {
    standardCases.push(item(
      `high priority escalated staff review for ${businessId} ${channel} ${index}`,
      "staff_review",
      businessId,
      channel,
      `sender-escalated-${index}`,
      "退款同投訴要一齊處理",
      "high",
      { escalationLabel: "angry_customer", staffPacket: { primaryIntent: "complaint" } }
    ));
  } else {
    standardCases.push(item(
      `low priority submitted clarification audit for ${businessId} ${channel} ${index}`,
      "clarify",
      businessId,
      channel,
      `sender-clarify-${index}`,
      "請問你想了解邊方面？",
      "low"
    ));
  }
  index += 1;
}

function item(name, action, businessId, channel, senderId, rawText, expectPriority, options = {}) {
  const safetyVerdict = options.safetyVerdict || (action === "block" ? "block" : "revise");
  return {
    name,
    decision: {
      action,
      businessId,
      escalationLabel: options.escalationLabel || null,
      reasons: options.reasons || [`action=${action}`],
      staffPacket: options.staffPacket || null
    },
    draft: { action, text: action === "block" ? null : options.draftText || "草稿" },
    safety: { verdict: safetyVerdict, safeToSend: false, reasons: [`safety=${safetyVerdict}`] },
    normalizedMessage: { channel, senderId, rawText, businessId },
    backendFacts: options.backendFacts || null,
    promotions: options.promotions || null,
    expectPriority
  };
}

module.exports = { standardCases };
