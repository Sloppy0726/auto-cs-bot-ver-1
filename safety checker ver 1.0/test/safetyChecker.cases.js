"use strict";

const standardCases = [
  {
    name: "auto_send approved answer passes",
    action: "auto_send",
    text: "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
    answer: "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
    citations: ["restaurant_hours"],
    grounding: ["restaurant_hours"],
    expectVerdict: "pass",
    expectSafe: true
  },
  {
    name: "auto_send edited answer blocks",
    action: "auto_send",
    text: "我哋每日開門，歡迎嚟。",
    answer: "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
    citations: ["restaurant_hours"],
    grounding: ["restaurant_hours"],
    expectVerdict: "block",
    expectViolation: "auto_send_not_verbatim"
  },
  {
    name: "booking confirmation surface blocks",
    action: "staff_review",
    text: "已確認預約今晚8點。",
    forbidden: ["confirm_booking"],
    expectVerdict: "block",
    expectViolation: "forbidden_capability_surface"
  },
  {
    name: "clarify exact text passes",
    action: "clarify",
    text: "請問你想預約邊個日期同時間？",
    clarificationText: "請問你想預約邊個日期同時間？",
    expectVerdict: "pass",
    expectSafe: true
  },
  {
    name: "handoff staff summary is revise not send",
    action: "handoff",
    text: "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
    expectVerdict: "revise",
    expectSafe: false
  },
  {
    name: "privacy block with no text blocks safely",
    action: "block",
    text: null,
    gatewayRoute: "block_and_handoff",
    expectVerdict: "block",
    expectSafe: false
  }
];

module.exports = { standardCases };
