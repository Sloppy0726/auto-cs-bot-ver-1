"use strict";

const seedCases = [
  whatsapp("beauty appointment WhatsApp from Meta shape", "beauty_demo", "wamid.beauty.001", "85261234567", "想book今晚"),
  instagram("IG shop stock question from story reply", "igshop_demo", "ig_user_stock", "ig_page_shop", "有冇現貨"),
  facebook("Facebook restaurant hours question", "restaurant_demo", "fb_user_hours", "fb_page_restaurant", "今晚幾點開門"),
  website("Website education fee question", "edu_demo", "session-edu-fee", "P3英文班幾錢？")
];

const channels = [
  {
    label: "whatsapp",
    businesses: ["beauty_demo", "restaurant_demo", "igshop_demo", "edu_demo"],
    texts: ["想book今晚", "幾點開門？", "有冇現貨", "想問收費", "我要改期", "可以搵真人嗎"],
    build: (businessId, text, index) => whatsapp(`WhatsApp ${businessId} ${intentLabel(text)} ${index}`, businessId, `wamid.matrix.${index}`, `8526${String(1000000 + index).slice(1)}`, text)
  },
  {
    label: "instagram",
    businesses: ["igshop_demo", "beauty_demo"],
    texts: ["呢件包唔包順豐？", "小顏項目幾錢", "有冇貨呀", "想睇package", "幾時開門"],
    build: (businessId, text, index) => instagram(`Instagram ${businessId} ${intentLabel(text)} ${index}`, businessId, `ig_sender_${index}`, `ig_page_${businessId}`, text)
  },
  {
    label: "facebook",
    businesses: ["restaurant_demo", "edu_demo", "beauty_demo"],
    texts: ["今晚8點有冇位？", "P3英文有咩班？", "地址喺邊", "想投訴", "星期日開唔開"],
    build: (businessId, text, index) => facebook(`Facebook ${businessId} ${intentLabel(text)} ${index}`, businessId, `fb_sender_${index}`, `fb_page_${businessId}`, text)
  },
  {
    label: "website",
    businesses: ["restaurant_demo", "edu_demo", "beauty_demo", "unknown_business"],
    texts: ["你哋有冇泊車優惠？", "hello, any trial class?", "facial price please", "想了解服務", "退錢點處理"],
    build: (businessId, text, index) => website(`Website ${businessId} ${intentLabel(text)} ${index}`, businessId, `web-session-${index}`, text)
  }
];

const edgeCases = [
  {
    name: "website missing text reports missing_text",
    input: { channel: "website", businessId: "beauty_demo", sessionId: "missing-text-session" },
    expectChannel: "website",
    expectText: "",
    expectSender: "missing-text-session",
    expectErrors: ["missing_text"]
  },
  {
    name: "generic unknown channel preserves channel name",
    input: { channel: "line", businessId: "restaurant_demo", senderId: "line-user-1", text: "幾點開門" },
    expectChannel: "line",
    expectText: "幾點開門",
    expectSender: "line-user-1"
  },
  {
    name: "generic payload missing sender reports missing_sender",
    input: { channel: "website", businessId: "edu_demo", text: "想問P3英文" },
    expectChannel: "website",
    expectText: "想問P3英文",
    expectSender: "unknown_sender",
    expectErrors: ["missing_sender"]
  }
];

const generatedCases = [];
let counter = 1;
while (generatedCases.length < 100 - seedCases.length - edgeCases.length) {
  for (const group of channels) {
    for (const businessId of group.businesses) {
      for (const text of group.texts) {
        generatedCases.push(group.build(businessId, text, counter));
        counter += 1;
        if (generatedCases.length >= 100 - seedCases.length - edgeCases.length) break;
      }
      if (generatedCases.length >= 100 - seedCases.length - edgeCases.length) break;
    }
    if (generatedCases.length >= 100 - seedCases.length - edgeCases.length) break;
  }
}

function whatsapp(name, businessId, id, from, text) {
  return {
    name,
    input: {
      channel: "whatsapp",
      businessId,
      messages: [{ id, from, timestamp: "1778284800", text: { body: text } }]
    },
    expectChannel: "whatsapp",
    expectText: text,
    expectSender: from
  };
}

function instagram(name, businessId, senderId, pageId, text) {
  return {
    name,
    input: {
      object: "instagram",
      businessId,
      entry: [{ messaging: [{ sender: { id: senderId }, recipient: { id: pageId }, timestamp: 1778284800000, message: { mid: `${senderId}.mid`, text } }] }]
    },
    expectChannel: "instagram",
    expectText: text,
    expectSender: senderId
  };
}

function facebook(name, businessId, senderId, pageId, text) {
  return {
    name,
    input: {
      object: "page",
      businessId,
      entry: [{ messaging: [{ sender: { id: senderId }, recipient: { id: pageId }, timestamp: 1778284800000, message: { mid: `${senderId}.mid`, text } }] }]
    },
    expectChannel: "facebook",
    expectText: text,
    expectSender: senderId
  };
}

function website(name, businessId, sessionId, text) {
  return {
    name,
    input: { channel: "website", businessId, sessionId, text, url: "https://example.hk/chat" },
    expectChannel: "website",
    expectText: text,
    expectSender: sessionId
  };
}

function intentLabel(text) {
  if (/book|有冇位|改期/.test(text)) return "booking";
  if (/幾點|開門|地址/.test(text)) return "hours";
  if (/現貨|順豐|貨/.test(text)) return "stock-shipping";
  if (/幾錢|收費|price|fee/.test(text)) return "pricing";
  if (/投訴|退錢/.test(text)) return "complaint";
  return "general";
}

const standardCases = [...seedCases, ...generatedCases, ...edgeCases];

module.exports = { standardCases };
