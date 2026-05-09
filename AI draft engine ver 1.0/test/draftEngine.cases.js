"use strict";

const standardCases = [
  {
    name: "restaurant hours auto_send returns approved KB answer",
    businessId: "restaurant_demo",
    input: "你哋幾點開門？",
    expectAction: "auto_send",
    expectTone: "friendly_local",
    expectLlmUsed: false,
    expectCitation: "restaurant_hours"
  },
  {
    name: "beauty pricing staff_review calls injected LLM with KB-only source",
    businessId: "beauty_demo",
    input: "facial幾錢？",
    expectAction: "staff_review",
    expectTone: "luxury_beauty",
    expectLlmUsed: true,
    llmText: "草稿一：多謝你查詢，基礎面部護理單次 HK$680，首次體驗價 HK$380。詳情建議由同事覆核後再回覆你。",
    expectPromptContains: ["Only approved factual source", "Signature facial單次$680", "give_medical_advice"]
  },
  {
    name: "restaurant parking clarify returns deterministic clarification",
    businessId: "restaurant_demo",
    input: "你哋有冇泊車優惠？",
    expectAction: "clarify",
    expectTone: "friendly_local",
    expectLlmUsed: false
  },
  {
    name: "education child data handoff produces staff-facing summary",
    businessId: "edu_demo",
    input: "我個小朋友幼稚園叫XXX，出生日期係...",
    expectAction: "handoff",
    expectTone: "education",
    expectLlmUsed: true,
    llmText: "【員工交接】\n意圖：child_data\n客人想要：涉及小朋友資料，需要真人跟進。\n升級原因：child_data\n建議下一步：由同事喺受控系統查看紀錄後回覆。",
    expectPromptContains: ["員工專用交接摘要", "唔可以寫客人回覆"]
  },
  {
    name: "privacy block returns null draft and quarantine note",
    businessId: "beauty_demo",
    input: "信用卡 4111 1111 1111 1111 預留位",
    expectAction: "block",
    expectTone: "luxury_beauty",
    expectLlmUsed: false
  }
];

module.exports = { standardCases };
