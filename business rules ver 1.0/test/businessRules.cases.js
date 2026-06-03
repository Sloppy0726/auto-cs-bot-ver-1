"use strict";

// End-to-end cases. Each runs: text → gateway → intent → KB → rules.

const seedCases = [
  {
    name: "beauty hours: archetype allows hours_location auto_send",
    businessId: "beauty_demo",
    input: "Causeway Bay店今晚幾點收工？",
    expectAction: "auto_send",
    expectMustForbid: ["invent_prices", "give_medical_advice", "promise_treatment_result"],
    expectMustAllow: ["quote_kb_verbatim"]
  },
  {
    name: "restaurant hours: archetype allows + no digit-trip mode → auto_send",
    businessId: "restaurant_demo",
    input: "你哋幾點開門？",
    expectAction: "auto_send",
    expectMustForbid: ["invent_prices"],
    expectMustAllow: ["quote_kb_verbatim"]
  },
  {
    name: "beauty pricing: autoSendIntents → auto_send with KB-grounded forbid",
    businessId: "beauty_demo",
    input: "facial幾錢？",
    expectAction: "auto_send",
    expectMustForbid: ["give_medical_advice", "invent_prices"]
  },
  {
    name: "beauty booking: backendBound → staff_review with confirm_booking forbidden",
    businessId: "beauty_demo",
    input: "想book今晚個facial有冇位",
    expectAction: "staff_review",
    expectMustForbid: ["confirm_booking", "give_medical_advice"],
    expectMustAllow: ["propose_options_for_staff_to_confirm"]
  },
  {
    name: "restaurant booking: backendBound → staff_review",
    businessId: "restaurant_demo",
    input: "今晚8點有冇位？",
    expectAction: "staff_review",
    expectMustForbid: ["confirm_booking"]
  },
  {
    name: "complaint: angry refund → handoff with escalation",
    businessId: "beauty_demo",
    input: "你哋搞錯我個booking，我要退錢。",
    expectAction: "handoff",
    expectEscalation: ["complaint", "angry_customer"]
  },
  {
    name: "sensitive health: pregnancy + laser → handoff",
    businessId: "beauty_demo",
    input: "我懷孕緊，可唔可以做laser？",
    expectAction: "handoff",
    expectEscalation: ["sensitive_health"]
  },
  {
    name: "child data: school + birth date → handoff",
    businessId: "edu_demo",
    input: "我個小朋友幼稚園叫XXX，出生日期係...",
    expectAction: "handoff",
    expectEscalation: ["child_data"]
  },
  {
    name: "human request → handoff",
    businessId: "beauty_demo",
    input: "我要搵真人傾",
    expectAction: "handoff",
    expectEscalation: ["human_request"]
  },
  {
    name: "ig shop stock query: non-backend, score-driven, ask_clarification path or auto_send",
    businessId: "igshop_demo",
    input: "呢件有冇現貨？包唔包順豐？",
    expectActionOneOf: ["auto_send", "staff_review", "clarify"],
    expectMustForbid: ["invent_prices"]
  },
  {
    name: "ig shop unknown: parking has no KB entry → clarify",
    businessId: "restaurant_demo",
    input: "你哋有冇泊車優惠？",
    expectActionOneOf: ["clarify", "staff_review"]
  },
  {
    name: "credit-card-like number → block",
    businessId: "beauty_demo",
    input: "信用卡 4111 1111 1111 1111 預留位",
    expectAction: "block",
    expectEscalation: ["privacy_block"]
  }
];

const scenarioFamilies = [
  {
    label: "restaurant hours auto-send",
    businessId: "restaurant_demo",
    inputs: ["你哋幾點開門？", "你哋幾點開門？", "你哋幾點開門？", "你哋幾點開門？"],
    expectAction: "auto_send",
    expectMustForbid: ["invent_prices"],
    expectMustAllow: ["quote_kb_verbatim"]
  },
  {
    label: "beauty pricing auto-send",
    businessId: "beauty_demo",
    inputs: ["facial幾錢？", "想問面部護理價錢", "Signature facial price?", "首次體驗facial幾錢"],
    expectAction: "auto_send",
    expectMustForbid: ["give_medical_advice", "invent_prices"]
  },
  {
    label: "beauty booking backend staff review",
    businessId: "beauty_demo",
    inputs: ["想book今晚個facial有冇位", "想book今晚個facial有冇位", "想book今晚個facial有冇位", "想book今晚個facial有冇位"],
    expectAction: "staff_review",
    expectMustForbid: ["confirm_booking", "give_medical_advice"],
    expectMustAllow: ["propose_options_for_staff_to_confirm"]
  },
  {
    label: "restaurant booking staff review",
    businessId: "restaurant_demo",
    inputs: ["今晚8點有冇位？", "想book table for 2", "今晚8點有冇位？", "reserve dinner table please"],
    expectAction: "staff_review",
    expectMustForbid: ["confirm_booking"]
  },
  {
    label: "complaint handoff",
    businessId: "beauty_demo",
    inputs: ["你哋搞錯我個booking，我要退錢。", "我要投訴", "好嬲，點解收多咗錢？", "refund please, I am angry"],
    expectAction: "handoff",
    expectEscalation: ["complaint", "angry_customer"]
  },
  {
    label: "sensitive health handoff",
    businessId: "beauty_demo",
    inputs: ["我懷孕緊，可唔可以做laser？", "皮膚敏感發炎可以做嗎？", "食緊藥可唔可以做療程？"],
    expectAction: "handoff",
    expectEscalation: ["sensitive_health"]
  },
  {
    label: "human request handoff",
    businessId: "beauty_demo",
    inputs: ["我要搵真人傾", "can I talk to staff?", "請同事覆我", "我要搵真人傾"],
    expectAction: "handoff",
    expectEscalation: ["human_request"]
  },
  {
    label: "education pricing review",
    businessId: "edu_demo",
    inputs: ["P3英文班幾錢？", "P3英文班幾錢？", "P3英文班幾錢？"],
    expectAction: "staff_review",
    expectMustForbid: ["invent_prices"]
  },
  {
    label: "IG shop service info conservative paths",
    businessId: "igshop_demo",
    inputs: ["呢件有冇現貨？", "包唔包順豐？", "有冇貨呀？", "運費點計？"],
    expectActionOneOf: ["auto_send", "staff_review", "clarify"],
    expectMustForbid: ["invent_prices"]
  },
  {
    label: "restaurant unknown clarification",
    businessId: "restaurant_demo",
    inputs: ["你哋有冇泊車優惠？", "可唔可以帶狗？", "有冇karaoke房？"],
    expectActionOneOf: ["clarify", "staff_review"]
  }
];

const standardCases = [...seedCases];
let caseIndex = 1;
while (standardCases.length < 100) {
  for (const family of scenarioFamilies) {
    for (const input of family.inputs) {
      standardCases.push({
        name: `${family.label}: varied wording ${caseIndex}`,
        businessId: family.businessId,
        input,
        expectAction: family.expectAction,
        expectActionOneOf: family.expectActionOneOf,
        expectEscalation: family.expectEscalation,
        expectMustForbid: family.expectMustForbid,
        expectMustAllow: family.expectMustAllow
      });
      caseIndex += 1;
      if (standardCases.length >= 100) break;
    }
    if (standardCases.length >= 100) break;
  }
}

module.exports = { standardCases };
