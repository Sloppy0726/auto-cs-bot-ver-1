"use strict";

// Each case runs the full pipeline:
//   raw text -> privacy gateway -> intent classifier -> KB lookup
// so we exercise the integration the same way the real product will.

const seed = require("../seed/hkSmeSeed");

const standardCases = [
  {
    name: "beauty: facial pricing in Cantonese",
    businessId: "beauty_demo",
    input: "做完會唔會即刻見效？幾錢？有冇副作用？",
    expectBestMatchId: "beauty_pricing_facial",
    expectGap: false,
    expectHandoff: false,
    expectBackendBound: false,
    expectLanguage: "zh-HK"
  },
  {
    name: "beauty: opening hours in mixed",
    businessId: "beauty_demo",
    input: "Causeway Bay店今晚幾點收工？",
    expectBestMatchId: "beauty_hours",
    expectGap: false,
    expectHandoff: false
  },
  {
    name: "beauty: booking is backend-bound",
    businessId: "beauty_demo",
    input: "想book今晚個facial有冇位",
    expectBestMatchId: "beauty_booking_policy",
    expectGap: false,
    expectHandoff: false,
    expectBackendBound: true
  },
  {
    name: "restaurant: tonight 8pm booking",
    businessId: "restaurant_demo",
    input: "今晚8點有冇位？",
    expectBestMatchId: "restaurant_booking",
    expectGap: false,
    expectBackendBound: true
  },
  {
    name: "ig shop: stock + shipping",
    businessId: "igshop_demo",
    input: "呢件有冇現貨？包唔包順豐？",
    expectBestMatchAnyOf: ["igshop_stock", "igshop_shipping"],
    expectGap: false
  },
  {
    name: "education: P3 English",
    businessId: "edu_demo",
    input: "我個小朋友P3，英文好差，有咩班？",
    expectBestMatchId: "edu_p3_english",
    expectGap: false
  },
  {
    name: "complaint must hand off (refund)",
    businessId: "beauty_demo",
    input: "你哋搞錯我個booking，我要退錢。",
    expectHandoff: true,
    expectGap: false,
    expectBestMatchId: null
  },
  {
    name: "sensitive health hands off (no medical claim)",
    businessId: "beauty_demo",
    input: "我懷孕緊，可唔可以做laser？",
    expectHandoff: true,
    expectBestMatchId: null
  },
  {
    name: "gap: business has no entry for parking",
    businessId: "restaurant_demo",
    input: "你哋有冇泊車優惠？",
    expectGap: true,
    expectBestMatchId: null
  },
  {
    name: "unknown business → gap with clarification",
    businessId: "unknown_business",
    input: "幾錢呀？",
    expectGap: true,
    expectClarification: true
  }
];

module.exports = { standardCases, seed };
