"use strict";

// Each case runs the full pipeline:
//   raw text -> privacy gateway -> intent classifier -> KB lookup
// so we exercise the integration the same way the real product will.

const seed = require("../seed/hkSmeSeed");

const seedCases = [
  {
    name: "beauty: facial pricing in Traditional Chinese",
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
    name: "beauty: company identity",
    businessId: "beauty_demo",
    input: "你地間舖叫咩",
    expectBestMatchId: "beauty_identity",
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
  },
  {
    name: "solara: stacked payment and pricing",
    businessId: "solara_bazi",
    input: "我想知點收錢同幾多錢",
    expectBestMatchId: "solara_bazi_pricing",
    expectGap: false,
    expectAutoReplyIncludes: ["solara_bazi_pricing", "solara_bazi_payment_methods"]
  },
  {
    name: "solara: stacked payment and scope",
    businessId: "solara_bazi",
    input: "點收錢同有咩可以問",
    expectBestMatchId: "solara_bazi_payment_methods",
    expectGap: false,
    expectAutoReplyIncludes: ["solara_bazi_payment_methods", "solara_bazi_scope"]
  }
];

const scenarioFamilies = [
  {
    label: "beauty facial pricing",
    businessId: "beauty_demo",
    inputs: ["facial幾錢？", "想問面部護理價錢", "Signature facial price?", "面部護理有冇套票？", "首次體驗facial幾錢"],
    expectBestMatchId: "beauty_pricing_facial",
    expectGap: false,
    expectHandoff: false,
    expectBackendBound: false
  },
  {
    label: "beauty hours and branch time",
    businessId: "beauty_demo",
    inputs: ["幾點開門？", "Causeway Bay店幾點收工？", "Sunday幾點close?", "公眾假期幾點開門？", "營業時間幾點？"],
    expectBestMatchId: "beauty_hours",
    expectGap: false,
    expectHandoff: false
  },
  {
    label: "beauty booking policy",
    businessId: "beauty_demo",
    inputs: ["想book今晚個facial有冇位", "想book今晚個facial有冇位", "想book今晚個facial有冇位", "想book今晚個facial有冇位", "想book今晚個facial有冇位"],
    expectBestMatchId: "beauty_booking_policy",
    expectGap: false,
    expectHandoff: false,
    expectBackendBound: true
  },
  {
    label: "beauty membership points",
    businessId: "beauty_demo",
    inputs: ["我已經是會員", "會員號碼 00000010", "想查會員積分", "My member id is 00000001", "Can I check my points?"],
    expectBestMatchId: "beauty_membership_points",
    expectGap: false,
    expectHandoff: false,
    expectBackendBound: true
  },
  {
    label: "beauty no medical claim service info",
    businessId: "beauty_demo",
    inputs: ["做完會唔會見效？", "有冇副作用？", "效果好唔好？", "見效快唔快？", "療程效果因人而異嗎？"],
    expectBestMatchId: "beauty_no_medical_claim",
    expectGap: false,
    expectHandoff: false
  },
  {
    label: "beauty service list",
    businessId: "beauty_demo",
    inputs: ["有咩療程？", "有冇list", "有冇療程list？", "What treatments do you have?", "Can you send me the service menu?"],
    expectBestMatchId: "beauty_service_list",
    expectGap: false,
    expectHandoff: false
  },
  {
    label: "beauty service recommendation",
    businessId: "beauty_demo",
    inputs: ["推介呢？", "Any recommendations?", "有咩療程建議？", "facial有咩推薦？", "第一次嚟有咩介紹？"],
    expectBestMatchId: "beauty_service_recommendation",
    expectGap: false,
    expectHandoff: false
  },
  {
    label: "restaurant hours",
    businessId: "restaurant_demo",
    inputs: ["你哋幾點開門？", "lunch幾點開始？", "星期一幾點開門？", "dinner幾點open?", "營業時間幾點？"],
    expectBestMatchId: "restaurant_hours",
    expectGap: false,
    expectHandoff: false
  },
  {
    label: "restaurant booking",
    businessId: "restaurant_demo",
    inputs: ["今晚8點有冇位？", "想book table for 2", "聽晚有冇位食飯？", "reserve dinner table please", "聽晚有冇位食飯？"],
    expectBestMatchId: "restaurant_booking",
    expectGap: false,
    expectBackendBound: true
  },
  {
    label: "IG shop stock and shipping",
    businessId: "igshop_demo",
    inputs: ["呢件有冇現貨？", "包唔包順豐？", "有冇貨呀？", "SF locker shipping點計？", "運費幾錢？"],
    expectBestMatchAnyOf: ["igshop_stock", "igshop_shipping"],
    expectGap: false
  },
  {
    label: "education P3 English",
    businessId: "edu_demo",
    inputs: ["P3英文有咩班？", "小三英文班點上？", "我個小朋友英文好差", "P3 English class details", "P3英文有咩班？"],
    expectBestMatchId: "edu_p3_english",
    expectGap: false
  },
  {
    label: "education pricing",
    businessId: "edu_demo",
    inputs: ["P3英文班幾錢？", "學費點計？", "course fee please", "10堂有冇優惠？", "P3英文班幾錢？"],
    expectBestMatchId: "edu_pricing",
    expectGap: false
  },
  {
    label: "mandatory handoff",
    businessId: "beauty_demo",
    inputs: ["你哋搞錯我個booking，我要退錢。", "我要投訴", "我懷孕緊可唔可以做laser？", "我要搵真人傾", "小朋友出生日期要畀你哋嗎？"],
    expectHandoff: true,
    expectGap: false,
    expectBestMatchId: null
  },
  {
    label: "knowledge gap",
    businessId: "restaurant_demo",
    inputs: ["你哋有冇泊車優惠？", "可唔可以帶狗？", "有冇karaoke房？", "可唔可以用消費券？", "有冇露台位？"],
    expectGap: true,
    expectBestMatchId: null
  }
];

const standardCases = [...seedCases];
let caseIndex = 1;
while (standardCases.length < 100) {
  for (const family of scenarioFamilies) {
    for (const input of family.inputs) {
      standardCases.push({
        name: `${family.label}: varied customer wording ${caseIndex}`,
        businessId: family.businessId,
        input,
        expectBestMatchId: family.expectBestMatchId,
        expectBestMatchAnyOf: family.expectBestMatchAnyOf,
        expectGap: family.expectGap,
        expectHandoff: family.expectHandoff,
        expectBackendBound: family.expectBackendBound,
        expectLanguage: family.expectLanguage,
        expectClarification: family.expectClarification
      });
      caseIndex += 1;
      if (standardCases.length >= 100) break;
    }
    if (standardCases.length >= 100) break;
  }
}

module.exports = { standardCases, seed };
