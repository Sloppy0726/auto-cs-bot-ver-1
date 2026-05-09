"use strict";

const driveDocument = [
  "Title: 小顏管理五月體驗優惠",
  "Keywords: 小顏, 小顏管理, 面部輪廓, 收費, 優惠",
  "Intents: pricing, service_info",
  "Summary: 小顏管理五月首次體驗 HK$480，原價 HK$880。主要針對面部線條、浮腫感同輪廓保養，效果因人而異。",
  "StaffInstruction: 可以提五月體驗價，但要提醒客人先做面部狀態評估，唔好承諾一定瘦面。",
  "StartsOn: 2026-05-01",
  "ExpiresOn: 2026-05-31",
  "Approved: true"
].join("\n");

const standardCases = [
  {
    name: "active small-face promotion matches in HK time",
    businessId: "beauty_demo",
    text: "想了解小顏項目同點收費",
    intent: { primaryIntent: "pricing" },
    now: "2026-05-09T03:00:00.000Z",
    expectMatch: true,
    expectTitle: "小顏管理五月體驗優惠"
  },
  {
    name: "expired promotion does not match after HK expiry",
    businessId: "beauty_demo",
    text: "想了解小顏項目同點收費",
    intent: { primaryIntent: "pricing" },
    now: "2026-06-01T00:30:00.000Z",
    expectMatch: false
  },
  {
    name: "wrong business does not match",
    businessId: "restaurant_demo",
    text: "想了解小顏項目同點收費",
    intent: { primaryIntent: "pricing" },
    now: "2026-05-09T03:00:00.000Z",
    expectMatch: false
  }
];

module.exports = { driveDocument, standardCases };
