"use strict";

const seedCases = [
  {
    name: "restaurant hours goes ready_to_send",
    input: { channel: "website", businessId: "restaurant_demo", sessionId: "s1", text: "你哋幾點開門？" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send"
  },
  {
    name: "beauty pricing auto-sends KB answer with promo suffix",
    input: { channel: "website", businessId: "beauty_demo", sessionId: "s2", text: "facial幾錢？" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send"
  },
  {
    name: "beauty small-face promo: weak KB match falls back to staff_review",
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
  },
  {
    name: "verified beauty package status can auto send",
    input: { channel: "whatsapp", businessId: "beauty_demo", from: "85261112222", text: "我想問個package仲有幾多次" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send",
    expectPackage: "pkg_may_hydrafacial_active"
  },
  {
    name: "unverified package sender goes staff review",
    input: { channel: "whatsapp", businessId: "beauty_demo", from: "85269990000", text: "我想問個package仲有幾多次" },
    expectStatus: "staff_review",
    expectAction: "staff_review"
  },
  {
    name: "expired package goes staff review",
    input: { channel: "whatsapp", businessId: "beauty_demo", from: "85263334444", text: "我個HIFU package仲有幾多次" },
    expectStatus: "staff_review",
    expectAction: "staff_review",
    expectPackage: "pkg_carmen_expired"
  },
  {
    name: "package extension request never auto sends",
    input: { channel: "whatsapp", businessId: "beauty_demo", from: "85261112222", text: "個package可唔可以延期？你之前話可以" },
    expectStatus: "staff_review",
    expectAction: "handoff"
  },
  {
    name: "solara bazi pricing can auto send",
    input: { channel: "whatsapp", businessId: "solara_bazi", from: "bazi-price", text: "詳細批同流年幾錢？" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send"
  },
  {
    name: "solara bazi intake can auto send",
    input: { channel: "whatsapp", businessId: "solara_bazi", from: "bazi-intake", text: "批八字需要咩資料？" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send"
  },
  {
    name: "solara bazi health topic goes staff review",
    input: { channel: "whatsapp", businessId: "solara_bazi", from: "bazi-health", text: "可以睇健康病痛同壽命嗎？" },
    expectStatus: "staff_review",
    expectAction: "handoff"
  },
  {
    name: "solara bazi payment methods can auto send",
    input: { channel: "whatsapp", businessId: "solara_bazi", from: "bazi-payment", text: "可以用FPS PayMe Alipay付款嗎？" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send"
  },
  {
    name: "solara bazi delivery format can auto send",
    input: { channel: "whatsapp", businessId: "solara_bazi", from: "bazi-delivery", text: "詳細批付款後幾時有？可唔可以語音或通話？" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send"
  },
  {
    name: "solara bazi legal topic can auto deny",
    input: { channel: "whatsapp", businessId: "solara_bazi", from: "bazi-legal", text: "可唔可以問法律官司？" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send"
  },
  {
    name: "solara bazi payment proof stays staff review",
    input: { channel: "whatsapp", businessId: "solara_bazi", from: "bazi-paid", text: "我已經PayMe咗，收唔收到？" },
    expectStatus: "staff_review",
    expectAction: "staff_review"
  },
  {
    name: "solara bazi stacked payment and pricing can auto send both",
    input: { channel: "whatsapp", businessId: "solara_bazi", from: "bazi-stacked-price-pay", text: "我想知點收錢同幾多錢" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send",
    expectReplyIncludes: ["Solara Bazi 價目", "轉帳、行動支付或信用卡"]
  },
  {
    name: "solara bazi stacked payment and scope can auto send both",
    input: { channel: "whatsapp", businessId: "solara_bazi", from: "bazi-stacked-pay-scope", text: "點收錢同有咩可以問" },
    expectStatus: "ready_to_send",
    expectAction: "auto_send",
    expectReplyIncludes: ["轉帳、行動支付或信用卡", "可以問感情、事業、財運"]
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
    label: "beauty pricing auto-send",
    inputs: [
      { channel: "website", businessId: "beauty_demo", sessionId: "beauty-price-web", text: "facial幾錢？" },
      { channel: "whatsapp", businessId: "beauty_demo", from: "beauty-price-wa", text: "想問面部護理價錢" },
      { channel: "instagram", businessId: "beauty_demo", senderId: "beauty-price-ig", text: "Signature facial price?" }
    ],
    expectStatus: "ready_to_send",
    expectAction: "auto_send"
  },
  {
    label: "beauty active promo weak KB match held for staff review",
    inputs: [
      { channel: "whatsapp", businessId: "beauty_demo", from: "promo-small-face-wa", text: "想了解小顏項目同點收費" }
    ],
    expectStatus: "staff_review",
    expectAction: "staff_review",
    expectPromotion: "beauty_may_small_face_trial"
  },
  {
    label: "beauty active promo strong KB match auto-sends with suffix",
    inputs: [
      { channel: "website", businessId: "beauty_demo", sessionId: "promo-small-face-web", text: "小顏管理五月優惠幾錢？" },
      { channel: "instagram", businessId: "beauty_demo", senderId: "promo-small-face-ig", text: "面部輪廓優惠詳情" }
    ],
    expectStatus: "ready_to_send",
    expectAction: "auto_send",
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
