"use strict";

const standardCases = [
  {
    name: "WhatsApp payload normalizes text",
    input: {
      channel: "whatsapp",
      businessId: "beauty_demo",
      messages: [{ id: "wamid.1", from: "85261234567", timestamp: "1778284800", text: { body: "想book今晚" } }]
    },
    expectChannel: "whatsapp",
    expectText: "想book今晚",
    expectSender: "85261234567"
  },
  {
    name: "Instagram payload normalizes text",
    input: {
      object: "instagram",
      businessId: "igshop_demo",
      entry: [{ messaging: [{ sender: { id: "ig_user" }, recipient: { id: "ig_page" }, timestamp: 1778284800000, message: { mid: "m1", text: "有冇現貨" } }] }]
    },
    expectChannel: "instagram",
    expectText: "有冇現貨",
    expectSender: "ig_user"
  },
  {
    name: "Website payload normalizes text",
    input: { channel: "website", businessId: "restaurant_demo", sessionId: "s1", text: "幾點開門" },
    expectChannel: "website",
    expectText: "幾點開門",
    expectSender: "s1"
  }
];

module.exports = { standardCases };
