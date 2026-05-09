"use strict";

// End-to-end cases. Each runs: text → gateway → intent → KB → rules.

const standardCases = [
  {
    name: "beauty hours: archetype allows hours_location auto_send (no $/digits in answer? — has 11:00, so trips ask-staff-before-promise → review)",
    businessId: "beauty_demo",
    input: "Causeway Bay店今晚幾點收工？",
    expectAction: "staff_review",
    expectMustForbid: ["invent_prices", "give_medical_advice", "promise_treatment_result"]
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
    name: "beauty pricing: askStaffBeforePromise + reviewIntents → staff_review",
    businessId: "beauty_demo",
    input: "facial幾錢？",
    expectAction: "staff_review",
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

module.exports = { standardCases };
