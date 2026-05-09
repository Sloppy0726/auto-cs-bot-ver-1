"use strict";

const standardCases = [
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

module.exports = { standardCases };
