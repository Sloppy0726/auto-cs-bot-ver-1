"use strict";

const seedCases = [
  {
    name: "restaurant hours goes ready_to_send",
    input: { channel: "website", businessId: "restaurant_demo", sessionId: "s1", text: "你哋幾點開門？" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send"
  },
  {
    name: "beauty pricing goes staff review",
    input: { channel: "website", businessId: "beauty_demo", sessionId: "s2", text: "facial幾錢？" },
    expectStatus: "staff_review",
    expectAction: "staff_review"
  },
  {
    name: "beauty small-face promo is read before staff draft",
    input: { channel: "whatsapp", businessId: "beauty_demo", from: "u-small-face", text: "想了解小顏項目同點收費" },
    expectStatus: "staff_review",
    expectAction: "staff_review",
    expectPromotion: "beauty_may_small_face_trial"
  },
  {
    name: "restaurant parking clarify can send",
    input: { channel: "website", businessId: "restaurant_demo", sessionId: "s3", text: "你哋有冇泊車優惠？" },
    expectStatus: "ready_to_send",
    expectAction: "clarify"
  },
  {
    name: "complaint goes staff review handoff",
    input: { channel: "website", businessId: "beauty_demo", sessionId: "s4", text: "你哋搞錯我個booking，我要退錢。" },
    expectStatus: "staff_review",
    expectAction: "handoff"
  }
];

const scenarioFamilies = [
  {
    label: "restaurant hours ready to send",
    inputs: [
      { channel: "website", businessId: "restaurant_demo", sessionId: "restaurant-hours-web", text: "你哋幾點開門？" },
      { channel: "facebook", businessId: "restaurant_demo", senderId: "fb-hours", text: "你哋幾點開門？" },
      { channel: "website", businessId: "restaurant_demo", sessionId: "restaurant-monday", text: "你哋幾點開門？" }
    ],
    expectStatus: "ready_to_send",
    expectAction: "auto_send"
  },
  {
    label: "beauty pricing held for staff",
    inputs: [
      { channel: "website", businessId: "beauty_demo", sessionId: "beauty-price-web", text: "facial幾錢？" },
      { channel: "whatsapp", businessId: "beauty_demo", from: "beauty-price-wa", text: "想問面部護理價錢" },
      { channel: "instagram", businessId: "beauty_demo", senderId: "beauty-price-ig", text: "Signature facial price?" }
    ],
    expectStatus: "staff_review",
    expectAction: "staff_review"
  },
  {
    label: "beauty active promo held for staff review",
    inputs: [
      { channel: "whatsapp", businessId: "beauty_demo", from: "promo-small-face-wa", text: "想了解小顏項目同點收費" },
      { channel: "website", businessId: "beauty_demo", sessionId: "promo-small-face-web", text: "小顏管理五月優惠幾錢？" },
      { channel: "instagram", businessId: "beauty_demo", senderId: "promo-small-face-ig", text: "面部輪廓優惠詳情" }
    ],
    expectStatus: "staff_review",
    expectAction: "staff_review",
    expectPromotion: "beauty_may_small_face_trial"
  },
  {
    label: "restaurant unknown info sends deterministic clarification",
    inputs: [
      { channel: "website", businessId: "restaurant_demo", sessionId: "restaurant-parking", text: "你哋有冇泊車優惠？" },
      { channel: "website", businessId: "restaurant_demo", sessionId: "restaurant-dog", text: "可唔可以帶狗？" },
      { channel: "facebook", businessId: "restaurant_demo", senderId: "restaurant-karaoke", text: "有冇karaoke房？" }
    ],
    expectStatus: "ready_to_send",
    expectAction: "clarify"
  },
  {
    label: "complaint and escalation held for handoff",
    inputs: [
      { channel: "website", businessId: "beauty_demo", sessionId: "complaint-refund", text: "你哋搞錯我個booking，我要退錢。" },
      { channel: "whatsapp", businessId: "beauty_demo", from: "complaint-angry", text: "好嬲，點解收多咗錢？" },
      { channel: "website", businessId: "beauty_demo", sessionId: "human-request", text: "我要搵真人傾" }
    ],
    expectStatus: "staff_review",
    expectAction: "handoff"
  }
];

const standardCases = [...seedCases];
let caseIndex = 1;
while (standardCases.length < 100) {
  for (const family of scenarioFamilies) {
    for (const input of family.inputs) {
      standardCases.push({
        name: `${family.label}: full pipeline scenario ${caseIndex}`,
        input: withUniqueSender(input, caseIndex),
        expectStatus: family.expectStatus,
        expectAction: family.expectAction,
        expectPromotion: family.expectPromotion
      });
      caseIndex += 1;
      if (standardCases.length >= 100) break;
    }
    if (standardCases.length >= 100) break;
  }
}

function withUniqueSender(input, index) {
  const next = { ...input };
  if (next.sessionId) next.sessionId = `${next.sessionId}-${index}`;
  if (next.from) next.from = `${next.from}-${index}`;
  if (next.senderId) next.senderId = `${next.senderId}-${index}`;
  return next;
}

module.exports = { standardCases };
