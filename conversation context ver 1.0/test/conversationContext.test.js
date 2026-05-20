"use strict";

const assert = require("node:assert/strict");
const { createConversationContextStore, stitchText, _internal } = require("../src/conversationContext");

const bookingHistory = [
  { incoming: true, text: "想book位" },
  { incoming: false, text: "可以呀，麻煩補充日期、時間、療程項目。" }
];

assert.deepEqual(
  stitchText({ text: "今晚四點", history: bookingHistory }),
  { text: "想book 今晚四點", changed: true, reason: "booking_followup_context" },
  "time-only booking follow-up should get booking prefix"
);

assert.deepEqual(
  stitchText({
    text: "做脫毛",
    history: [
      { incoming: true, text: "預約首次 你聽日有咩時間？" },
      { incoming: false, text: "2026-05-21 面部護理有 13:00、18:30。" }
    ]
  }),
  { text: "想book 聽日 laser 做脫毛", changed: true, reason: "booking_followup_context" },
  "service-only booking follow-up should carry previous date"
);

assert.equal(
  stitchText({ text: "有咩plan", history: bookingHistory }).changed,
  false,
  "pricing-like questions should not be booking-stitched"
);

assert.equal(
  stitchText({
    text: "I would like to do some facial",
    history: [
      { incoming: true, text: "想book位" },
      { incoming: true, text: "hi" }
    ]
  }).changed,
  false,
  "greeting should break stale booking carry-over for service-only messages"
);

assert.deepEqual(
  stitchText({
    text: "00000010",
    history: [
      { incoming: true, text: "我已經是會員" },
      { incoming: false, text: "請提供8位數字會員編號，我可以幫你查會員積分。" }
    ]
  }),
  { text: "會員號碼 00000010", changed: true, reason: "membership_followup_context" },
  "bare member ID after membership prompt should get membership context"
);

assert.equal(
  stitchText({
    text: "00000010",
    history: [{ incoming: true, text: "想book位" }]
  }).changed,
  false,
  "bare 8-digit numbers should not be stitched without membership context"
);

assert.equal(_internal.inferServiceFromText("腋下脫毛"), "laser", "underarm/laser service should infer laser");

const store = createConversationContextStore();
const first = store.enrichPayload({
  channel: "whatsapp",
  businessId: "beauty_demo",
  from: "api_user_1",
  text: "想book位"
});
assert.equal(first.changed, false, "first booking message should not be changed");
first.commit();

const second = store.enrichPayload({
  channel: "whatsapp",
  businessId: "beauty_demo",
  from: "api_user_1",
  text: "今晚四點"
});
assert.equal(second.changed, true, "API context store should stitch second message");
assert.equal(second.payload.text, "想book 今晚四點", "top-level API text should be stitched");
second.commit();

const third = store.enrichPayload({
  channel: "whatsapp",
  businessId: "beauty_demo",
  from: "api_user_1",
  text: "做脫毛"
});
assert.equal(third.changed, true, "API context store should stitch service-only booking follow-up");
assert.equal(third.payload.text, "想book 今晚 四點 laser 做脫毛", "service-only follow-up should carry recent date and time");

const memberStore = createConversationContextStore();
memberStore.enrichPayload({
  channel: "whatsapp",
  businessId: "beauty_demo",
  from: "api_member_1",
  text: "我已經是會員"
}).commit();
const memberSecond = memberStore.enrichPayload({
  channel: "whatsapp",
  businessId: "beauty_demo",
  from: "api_member_1",
  text: "00000001"
});
assert.equal(memberSecond.changed, true, "API context store should stitch member ID follow-up");
assert.equal(memberSecond.payload.text, "會員號碼 00000001", "member ID follow-up should be queryable by backend");

const nestedStore = createConversationContextStore();
nestedStore.enrichPayload({
  channel: "whatsapp",
  businessId: "beauty_demo",
  messages: [{ id: "m1", from: "phone_1", text: { body: "想book位" } }]
}).commit();
const nested = nestedStore.enrichPayload({
  channel: "whatsapp",
  businessId: "beauty_demo",
  messages: [{ id: "m2", from: "phone_1", text: { body: "今晚四點" } }]
});
assert.equal(nested.payload.messages[0].text.body, "想book 今晚四點", "WhatsApp API nested text body should be stitched");

console.log("conversationContext: 13 tests passed");
