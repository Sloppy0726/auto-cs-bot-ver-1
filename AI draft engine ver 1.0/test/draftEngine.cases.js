"use strict";

const seedCases = [
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

const staffDraft = "草稿一：多謝你查詢，呢個回覆會按已核准資料整理，並由同事覆核後再發出。";
const handoffDraft = "【員工交接】\n意圖：complaint\n客人想要：需要真人跟進。\n升級原因：complaint\n建議下一步：由同事喺受控系統查看紀錄後回覆。";

const scenarioFamilies = [
  {
    label: "restaurant hours deterministic auto-send",
    businessId: "restaurant_demo",
    inputs: ["你哋幾點開門？", "你哋幾點開門？", "你哋幾點開門？", "你哋幾點開門？"],
    expectAction: "auto_send",
    expectTone: "friendly_local",
    expectLlmUsed: false,
    expectCitation: "restaurant_hours"
  },
  {
    label: "beauty pricing staff review draft",
    businessId: "beauty_demo",
    inputs: ["facial幾錢？", "想問面部護理價錢", "Signature facial price?", "首次體驗facial幾錢"],
    expectAction: "staff_review",
    expectTone: "luxury_beauty",
    expectLlmUsed: true,
    llmText: staffDraft,
    expectPromptContains: ["Only approved factual source", "Forbidden capabilities"]
  },
  {
    label: "beauty booking staff review draft",
    businessId: "beauty_demo",
    inputs: ["想book今晚個facial有冇位", "想book今晚個facial有冇位", "想book今晚個facial有冇位", "想book今晚個facial有冇位"],
    expectAction: "staff_review",
    expectTone: "luxury_beauty",
    expectLlmUsed: true,
    llmText: staffDraft,
    expectPromptContains: ["confirm_booking", "Only approved factual source"]
  },
  {
    label: "restaurant clarification deterministic",
    businessId: "restaurant_demo",
    inputs: ["你哋有冇泊車優惠？", "可唔可以帶狗？", "有冇karaoke房？", "有冇露台位？"],
    expectAction: "clarify",
    expectTone: "friendly_local",
    expectLlmUsed: false
  },
  {
    label: "complaint staff-only handoff",
    businessId: "beauty_demo",
    inputs: ["你哋搞錯我個booking，我要退錢。", "我要投訴", "refund please, I am angry", "好嬲，點解收多咗錢？"],
    expectAction: "handoff",
    expectTone: "luxury_beauty",
    expectLlmUsed: true,
    llmText: handoffDraft,
    expectPromptContains: ["員工專用交接摘要", "唔可以寫客人回覆"]
  },
  {
    label: "privacy block quarantine",
    businessId: "beauty_demo",
    inputs: ["信用卡 4111 1111 1111 1111 預留位", "信用卡 4111 1111 1111 1111 預留位", "信用卡 4111 1111 1111 1111 預留位"],
    expectAction: "block",
    expectTone: "luxury_beauty",
    expectLlmUsed: false
  }
];

const standardCases = [...seedCases];
let caseIndex = 1;
while (standardCases.length < 100) {
  for (const family of scenarioFamilies) {
    for (const input of family.inputs) {
      standardCases.push({
        name: `${family.label}: draft branch coverage ${caseIndex}`,
        businessId: family.businessId,
        input,
        expectAction: family.expectAction,
        expectTone: family.expectTone,
        expectLlmUsed: family.expectLlmUsed,
        llmText: family.llmText,
        expectPromptContains: family.expectPromptContains,
        expectCitation: family.expectCitation
      });
      caseIndex += 1;
      if (standardCases.length >= 100) break;
    }
    if (standardCases.length >= 100) break;
  }
}

module.exports = { standardCases };
