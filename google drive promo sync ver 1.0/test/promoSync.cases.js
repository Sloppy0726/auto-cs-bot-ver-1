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

const multiPromoDriveDocument = [
  driveDocument,
  "---",
  "Title: 五月順豐智能櫃免運",
  "Keywords: 順豐, 包郵, 免運, 運費, sf",
  "Intents: service_info, pricing",
  "Summary: 五月期間滿 HK$300 免順豐智能櫃運費，工商/住宅地址另計。",
  "StaffInstruction: 只可講智能櫃免運；住宅或工商地址要由同事再報價。",
  "StartsOn: 2026-05-01",
  "ExpiresOn: 2026-05-31",
  "Approved: true"
].join("\n");

const standardCases = [
  promo("active small-face promotion matches in HK time", "beauty_demo", "想了解小顏項目同點收費", "pricing", "2026-05-09T03:00:00.000Z", true, "小顏管理五月體驗優惠"),
  promo("expired promotion does not match after HK expiry", "beauty_demo", "想了解小顏項目同點收費", "pricing", "2026-06-01T00:30:00.000Z", false),
  promo("wrong business does not match beauty promotion", "restaurant_demo", "想了解小顏項目同點收費", "pricing", "2026-05-09T03:00:00.000Z", false),
  promo("IG shop SF locker promotion matches shipping words", "igshop_demo", "包唔包順豐智能櫃？", "service_info", "2026-05-09T03:00:00.000Z", true, "五月順豐智能櫃免運")
];

const beautyTexts = [
  "小顏項目有冇優惠？",
  "面部輪廓收費點計？",
  "五月小顏管理幾錢？",
  "浮腫護理有trial嗎？",
  "想問小顏優惠詳情"
];
const igTexts = [
  "順豐包郵嗎？",
  "運費點計？",
  "sf locker free shipping?",
  "五月免運有冇？",
  "買滿幾多包順豐？"
];
const dates = [
  ["2026-04-30T15:30:00.000Z", false, "before HK May promo start"],
  ["2026-04-30T16:00:00.000Z", true, "exact HK May start boundary"],
  ["2026-05-15T04:00:00.000Z", true, "mid campaign"],
  ["2026-05-31T15:59:59.000Z", true, "last HK campaign second"],
  ["2026-05-31T16:00:00.000Z", false, "after HK campaign expiry"]
];

for (const text of beautyTexts) {
  for (const [now, expectMatch, label] of dates) {
    standardCases.push(promo(`beauty promo ${label}: ${text}`, "beauty_demo", text, text.includes("收費") || text.includes("幾錢") ? "pricing" : "service_info", now, expectMatch, expectMatch ? "小顏管理五月體驗優惠" : undefined));
  }
}

for (const text of igTexts) {
  for (const [now, expectMatch, label] of dates) {
    standardCases.push(promo(`igshop promo ${label}: ${text}`, "igshop_demo", text, text.includes("幾多") ? "pricing" : "service_info", now, expectMatch, expectMatch ? "五月順豐智能櫃免運" : undefined));
  }
}

const noiseTexts = [
  ["beauty_demo", "幾點開門？", "hours_location"],
  ["beauty_demo", "我要投訴", "complaint"],
  ["igshop_demo", "訂單IG9999去到邊？", "order_status"],
  ["restaurant_demo", "順豐包郵嗎？", "service_info"],
  ["edu_demo", "小顏優惠", "pricing"]
];
for (const [businessId, text, intent] of noiseTexts) {
  for (const [now] of dates) {
    standardCases.push(promo(`non-matching promo context ${businessId}: ${text} at ${now}`, businessId, text, intent, now, false));
  }
}

let index = 1;
while (standardCases.length < 100) {
  const beauty = index % 2 === 0;
  const text = beauty ? beautyTexts[index % beautyTexts.length] : igTexts[index % igTexts.length];
  standardCases.push(promo(
    `matrix active ${beauty ? "beauty" : "igshop"} promo keyword coverage ${index}`,
    beauty ? "beauty_demo" : "igshop_demo",
    text,
    index % 3 === 0 ? "pricing" : "service_info",
    "2026-05-20T08:00:00.000Z",
    true,
    beauty ? "小顏管理五月體驗優惠" : "五月順豐智能櫃免運"
  ));
  index += 1;
}

function promo(name, businessId, text, primaryIntent, now, expectMatch, expectTitle) {
  return {
    name,
    businessId,
    text,
    intent: { primaryIntent },
    now,
    expectMatch,
    expectTitle
  };
}

module.exports = { driveDocument, multiPromoDriveDocument, standardCases };
