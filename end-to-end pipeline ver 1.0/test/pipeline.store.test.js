"use strict";

// Pipeline integration tests against a store-backed backend.
// The standard pipeline.test.js runs through the legacy in-memory backend; this
// file exercises createBusinessBackend({ availabilityStore }) end-to-end so the
// store-driven branches (no-slots-with-suggestions, slot listing from store) are
// covered.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createPipeline } = require("../src/pipeline");
const { createBusinessBackend } = require("../../private business backend mock ver 1.0/src/businessBackendMock");
const { createAvailabilityStore } = require("../../private business backend mock ver 1.0/src/availabilityStore");

let testCount = 0;
function check(label, condition, detail) {
  testCount++;
  assert.ok(condition, detail ? `${label}: ${detail}` : label);
}
function eq(label, actual, expected) {
  testCount++;
  assert.deepEqual(actual, expected, label);
}

function freshStorePipeline({ openingHours, bookings = [], resources = [] } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pipeline-store-"));
  const filePath = path.join(dir, "availability.json");
  const store = createAvailabilityStore({ filePath });
  if (openingHours) store.setOpeningHours("beauty_demo", openingHours);
  const createdResources = [];
  for (const r of resources) {
    const added = store.addResource("beauty_demo", r);
    if (added.ok) createdResources.push(added.resource);
  }
  for (const b of bookings) store.addBooking("beauty_demo", b);
  const backend = createBusinessBackend({ availabilityStore: store });
  const pipeline = createPipeline({
    nowFn: () => new Date("2026-05-24T00:00:00.000Z"),  // HK 2026-05-24 (Sunday)
    backend,
    llmAdapter: async () => ({ text: "fallback canned reply" })
  });
  return { pipeline, store, backend, resources: createdResources };
}

async function runAll() {
  // ---- Case 1: store-backed slot list works through the full pipeline ----
  // Monday 2026-05-25, 11:00-12:30 opening window → laser (30min) starts at 11:00, 11:30, 12:00.
  {
    const { pipeline } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "12:30" }], "2": [], "3": [], "4": [], "5": [], "6": [] }
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "store-slots-test",
      text: "5月25號 laser 有咩時間"
    });
    check("store-backed: booking intent", result.intent.primaryIntent === "booking");
    check("store-backed: facts.found = true", result.backendFacts.found === true);
    const slots = result.backendFacts.facts.find((f) => f.key === "availableSlots")?.value;
    eq("store-backed: 3 laser starts from store", slots, ["11:00", "11:30", "12:00"]);
    check("store-backed: ready_to_send", result.finalStatus === "ready_to_send");
    check("store-backed: no staff item", result.staffItem === null);
  }

  // ---- Case 2: no-slots-with-suggestions fallback ----
  // Tuesday 2026-05-26 closed; ask for that date → fallback should suggest the next 1-3 open dates.
  // Wed 2026-05-27 open 11:00-13:00, Thu 2026-05-28 open 14:00-16:00, Fri 2026-05-29 open 18:00-20:00.
  {
    const { pipeline } = freshStorePipeline({
      openingHours: {
        "0": [], "1": [], "2": [],
        "3": [{ open: "11:00", close: "13:00" }],
        "4": [{ open: "14:00", close: "16:00" }],
        "5": [{ open: "18:00", close: "20:00" }],
        "6": []
      }
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "no-slots-test",
      text: "5月26號 laser 有冇位"
    });
    check("no-slots: ready_to_send (clarify)", result.finalStatus === "ready_to_send");
    check("no-slots: clarify action", result.decision.action === "clarify");
    check("no-slots: reply mentions 暫時冇位", result.draft.text.includes("暫時冇位"));
    check("no-slots: reply suggests Wed", result.draft.text.includes("2026-05-27"));
    check("no-slots: reply suggests Thu", result.draft.text.includes("2026-05-28"));
    check("no-slots: reply suggests Fri", result.draft.text.includes("2026-05-29"));
    check("no-slots: reply quotes first slot time", result.draft.text.includes("11:00") && result.draft.text.includes("14:00") && result.draft.text.includes("18:00"));
    check("no-slots: no staff item created", result.staffItem === null);
  }

  // ---- Case 3: no-slots AND no suggestions in 7-day window → falls through to staff_review ----
  {
    const { pipeline } = freshStorePipeline({
      openingHours: { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] }
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "no-suggestions-test",
      text: "5月26號 laser 有冇位"
    });
    check("no suggestions: falls through to staff_review", result.finalStatus === "staff_review");
    check("no suggestions: staff item created", result.staffItem !== null);
  }

  // ---- Case 4: English no-slots fallback ----
  {
    const { pipeline } = freshStorePipeline({
      openingHours: {
        "0": [], "1": [], "2": [],
        "3": [{ open: "11:00", close: "13:00" }],
        "4": [{ open: "14:00", close: "16:00" }],
        "5": [], "6": []
      }
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "en-no-slots-test",
      text: "Any laser slots on 2026-05-26?"
    });
    check("en no-slots: clarify ready_to_send", result.finalStatus === "ready_to_send" && result.decision.action === "clarify");
    check("en no-slots: english 'Sorry' phrasing", /Sorry/i.test(result.draft.text));
    check("en no-slots: mentions Wed", result.draft.text.includes("2026-05-27"));
    check("en no-slots: mentions Thu", result.draft.text.includes("2026-05-28"));
  }

  // ---- Case 5: existing booking removes a slot from the listing ----
  {
    const { pipeline } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "12:30" }], "2": [], "3": [], "4": [], "5": [], "6": [] },
      bookings: [{ date: "2026-05-25", time: "11:00", service: "laser", durationMinutes: 30 }]
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "booking-blocks-test",
      text: "5月25號 laser 有咩時間"
    });
    const slots = result.backendFacts.facts.find((f) => f.key === "availableSlots")?.value;
    eq("booked 11:00 removed from listing", slots, ["11:30", "12:00"]);
  }

  // ---- Case 6: bookingDraft captured on staff_review items ----
  // When customer picks a specific time and service, the staff_review path should
  // carry a bookingDraft so the admin Approve flow can write it to the calendar.
  {
    const { pipeline } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "21:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] }
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "booking-draft-test",
      senderId: "amy_001",
      text: "想book 5月25號 下午1點 facial"
    });
    check("bookingDraft: routed to staff_review", result.finalStatus === "staff_review");
    check("bookingDraft: staff item exists", result.staffItem !== null);
    const bd = result.staffItem.bookingDraft;
    check("bookingDraft: present on inbox item", bd !== null && bd !== undefined);
    eq("bookingDraft: date captured", bd.date, "2026-05-25");
    eq("bookingDraft: time captured", bd.time, "13:00");
    eq("bookingDraft: service captured", bd.service, "facial");
    eq("bookingDraft: businessId captured", bd.businessId, "beauty_demo");
  }

  // ---- Case 7a: bare hour auto-resolves to PM when AM is outside opening hours ----
  // beauty_demo opens 11:00 on Monday 2026-05-25. "2點" is ambiguous from text alone,
  // but 02:00 falls outside opening hours and 14:00 fits, so the bot should resolve
  // it to 14:00 instead of asking the customer for AM/PM.
  {
    const { pipeline } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "21:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] }
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "bare-hour-pm-auto",
      text: "想book facial 5月25號 2點"
    });
    check("bare-hour pm-only: routed to staff_review (complete booking)", result.finalStatus === "staff_review");
    const bd = result.staffItem?.bookingDraft;
    check("bare-hour pm-only: bookingDraft captured", bd !== null && bd !== undefined);
    eq("bare-hour pm-only: time resolved to 14:00", bd?.time, "14:00");
    eq("bare-hour pm-only: date carried through", bd?.date, "2026-05-25");
  }

  // ---- Case 7b: bare hour auto-resolves to AM when PM is outside opening hours ----
  // Open 06:00-11:00 only. "9點" -> 09:00 fits, 21:00 doesn't -> resolve to 09:00.
  {
    const { pipeline } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "06:00", close: "11:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] }
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "bare-hour-am-auto",
      text: "想book facial 5月25號 9點"
    });
    check("bare-hour am-only: routed to staff_review", result.finalStatus === "staff_review");
    eq("bare-hour am-only: time resolved to 09:00", result.staffItem?.bookingDraft?.time, "09:00");
  }

  // ---- Case 7c: bare hour stays ambiguous when both AM and PM fit ----
  // Open 08:00-22:00. "8點" -> 08:00 fits AND 20:00 fits -> ask for AM/PM.
  {
    const { pipeline } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "08:00", close: "22:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] }
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "bare-hour-ambiguous",
      text: "想book facial 5月25號 8點"
    });
    check("bare-hour ambiguous: clarify ready_to_send", result.finalStatus === "ready_to_send" && result.decision.action === "clarify");
    check("bare-hour ambiguous: clarify mentions 上午", result.draft.text.includes("上午"));
    check("bare-hour ambiguous: clarify mentions 下午", result.draft.text.includes("下午"));
    check("bare-hour ambiguous: no staff item", result.staffItem === null);
  }

  // ---- Case 7d: Chinese-number bare hour auto-resolves using opening hours ----
  // 六點 (six o'clock) at a place open 11:00-21:00 -> 18:00 fits, 06:00 doesn't.
  {
    const { pipeline } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "21:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] }
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "chinese-bare-hour-pm-auto",
      text: "想book facial 5月25號 六點"
    });
    check("chinese bare-hour pm-only: routed to staff_review", result.finalStatus === "staff_review");
    eq("chinese bare-hour pm-only: time resolved to 18:00", result.staffItem?.bookingDraft?.time, "18:00");
  }

  // ---- Case 7e: bookingDraft NOT captured for clarify (asking for slots) ----
  {
    const { pipeline } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "12:30" }], "2": [], "3": [], "4": [], "5": [], "6": [] }
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "no-time-test",
      text: "5月25號 laser 有咩時間"
    });
    check("no-time: ready_to_send (clarify, no staff item)", result.finalStatus === "ready_to_send");
    check("no-time: no staff item to attach bookingDraft to", result.staffItem === null);
  }

  // ---- Case 8a: customer mentions a stylist by name → resourceId captured in query ----
  {
    const { pipeline, resources } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "21:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] },
      resources: [{ name: "Amy" }, { name: "Joey" }]
    });
    const amy = resources.find((r) => r.name === "Amy");
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "stylist-pick-test",
      text: "想book Amy 5月25號 facial 下午1點"
    });
    check("stylist mention: routed to staff_review", result.finalStatus === "staff_review");
    const bd = result.staffItem?.bookingDraft;
    check("stylist mention: bookingDraft present", bd !== null && bd !== undefined);
    eq("stylist mention: resourceId pinned to Amy", bd?.resourceId, amy.id);
    eq("stylist mention: time/date intact", { date: bd?.date, time: bd?.time, service: bd?.service }, { date: "2026-05-25", time: "13:00", service: "facial" });
  }

  // ---- Case 8b: no stylist name → resourceId stays absent (any-available) ----
  {
    const { pipeline } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "21:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] },
      resources: [{ name: "Amy" }, { name: "Joey" }]
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "any-available-test",
      text: "想book 5月25號 facial 下午1點"
    });
    check("no stylist: routed to staff_review", result.finalStatus === "staff_review");
    const bd = result.staffItem?.bookingDraft;
    check("no stylist: bookingDraft present", bd !== null && bd !== undefined);
    check("no stylist: resourceId absent", bd?.resourceId === undefined);
  }

  // ---- Case 8c: any-available slot listing surfaces availableResources per slot ----
  {
    const { pipeline, resources } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "12:30" }], "2": [], "3": [], "4": [], "5": [], "6": [] },
      resources: [{ name: "Amy" }, { name: "Joey" }]
    });
    const amy = resources.find((r) => r.name === "Amy");
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "any-available-list-test",
      text: "5月25號 laser 有咩時間"
    });
    const slots = result.backendFacts.facts.find((f) => f.key === "availableSlots")?.value;
    eq("any-available list: 3 starts", slots, ["11:00", "11:30", "12:00"]);
    const sessions = result.backendFacts.facts.find((f) => f.key === "availableSessions")?.value;
    check("any-available list: each session has availableResources", sessions.every((s) => Array.isArray(s.availableResources) && s.availableResources.length === 2));
    check("any-available list: 11:00 lists Amy among free resources", sessions[0].availableResources.includes(amy.id));
  }

  // ---- Case 8d: customer pins a stylist who's booked → slot list narrows ----
  // Amy booked 11:00-11:30, customer asks "Amy 有咩時間" → only 11:30, 12:00 visible.
  {
    const { pipeline, resources, store } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "12:30" }], "2": [], "3": [], "4": [], "5": [], "6": [] },
      resources: [{ name: "Amy" }, { name: "Joey" }]
    });
    const amy = resources.find((r) => r.name === "Amy");
    store.addBooking("beauty_demo", { date: "2026-05-25", time: "11:00", service: "laser", durationMinutes: 30, resourceId: amy.id });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "stylist-narrowed-test",
      text: "Amy 5月25號 laser 有咩時間"
    });
    const slots = result.backendFacts.facts.find((f) => f.key === "availableSlots")?.value;
    eq("Amy-narrowed: 11:00 removed (Amy booked)", slots, ["11:30", "12:00"]);
    const factResourceId = result.backendFacts.facts.find((f) => f.key === "resourceId")?.value;
    eq("Amy-narrowed: backend facts carry resourceId", factResourceId, amy.id);
  }

  // ---- Case 8e: numeric resource name like "1號枱" does not false-match on "11號枱" ----
  {
    const { pipeline, resources } = freshStorePipeline({
      openingHours: { "0": [], "1": [{ open: "11:00", close: "12:30" }], "2": [], "3": [], "4": [], "5": [], "6": [] },
      resources: [{ name: "1號枱" }, { name: "11號枱" }]
    });
    const table11 = resources.find((r) => r.name === "11號枱");
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "beauty_demo",
      from: "numeric-name-boundary-test",
      text: "想book 11號枱 5月25號 11:00"
    });
    // beauty_demo path requires service so bookingDraft will be null, but query.resourceId should still resolve to 11號枱.
    // Probe via internal: rerun inferBackendQuery directly via _internal.
    const { _internal } = require("../src/pipeline");
    const query = _internal.inferBackendQuery({
      normalizedMessage: { rawText: "想book 11號枱 5月25號 11:00", businessId: "beauty_demo", senderId: "x" },
      intent: { primaryIntent: "booking", language: "zh-HK" },
      now: new Date("2026-05-24T00:00:00.000Z"),
      backend: result.normalizedMessage ? require("../../private business backend mock ver 1.0/src/businessBackendMock").createBusinessBackend({ availabilityStore: { listResources: () => [{ id: table11.id, name: "11號枱" }, { id: "res_1", name: "1號枱" }] } }) : null
    });
    eq("11號枱 matches the longer-prefix resource (boundary safety)", query.resourceId, table11.id);
  }

  // ---- Case 8f: inferResourceId returns null when no backend wired ----
  {
    const { _internal } = require("../src/pipeline");
    const id = _internal.inferResourceId("想book Amy", null, "beauty_demo");
    check("no backend → null", id === null);
    const id2 = _internal.inferResourceId("想book Amy", { listResources: () => [] }, "beauty_demo");
    check("empty resources → null", id2 === null);
  }

  // ---- Case 8g: inferBookingDraft drops resourceId when no resourceId in query ----
  {
    const { _internal } = require("../src/pipeline");
    const draft = _internal.inferBookingDraft({
      intent: { primaryIntent: "booking" },
      query: { date: "2026-05-25", time: "13:00", service: "facial" },
      normalizedMessage: { businessId: "beauty_demo", senderId: "x" }
    });
    check("no resourceId in query → not in draft", draft !== null && draft.resourceId === undefined);
  }

  // ---- Case 9: prince_snooker end-to-end through the pipeline ----
  // Customer says "想book 3號枱 5月25號 下午2點" → bookingDraft pinned to 3號枱.
  {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "snooker-pipeline-"));
    const filePath = path.join(dir, "availability.json");
    const store = createAvailabilityStore({ filePath }); // auto-seeds 12 tables
    const backend = createBusinessBackend({ availabilityStore: store });
    const pipeline = createPipeline({
      nowFn: () => new Date("2026-05-24T00:00:00.000Z"),
      backend,
      llmAdapter: async () => ({ text: "snooker reply" })
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "prince_snooker",
      from: "snooker-customer-test",
      text: "想book 3號枱 5月25號 下午2點"
    });
    check("snooker pipeline: routed to staff_review", result.finalStatus === "staff_review");
    const bd = result.staffItem?.bookingDraft;
    check("snooker pipeline: bookingDraft created", bd !== null && bd !== undefined);
    eq("snooker pipeline: date captured", bd?.date, "2026-05-25");
    eq("snooker pipeline: time captured", bd?.time, "14:00");
    eq("snooker pipeline: resourceId pinned to table 3", bd?.resourceId, "res_prince_table_3");
    check("snooker pipeline: no service field", bd?.service === undefined);
    check("snooker pipeline: no partySize field", bd?.partySize === undefined);
    eq("snooker pipeline: businessId carried through", bd?.businessId, "prince_snooker");
  }

  // ---- Case 9b: snooker "any-available" customer — no table mentioned ----
  {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "snooker-any-"));
    const filePath = path.join(dir, "availability.json");
    const store = createAvailabilityStore({ filePath });
    const backend = createBusinessBackend({ availabilityStore: store });
    const pipeline = createPipeline({
      nowFn: () => new Date("2026-05-24T00:00:00.000Z"),
      backend,
      llmAdapter: async () => ({ text: "snooker reply" })
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "prince_snooker",
      from: "snooker-any-test",
      text: "5月25號 下午2點 想book枱"
    });
    const bd = result.staffItem?.bookingDraft;
    check("snooker any-available: bookingDraft present", bd !== null && bd !== undefined);
    check("snooker any-available: resourceId absent (staff picks)", bd?.resourceId === undefined);
  }

  // ---- Case 9c: snooker numeric-name boundary — 11號枱 must not match as "1號枱" ----
  {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "snooker-boundary-"));
    const filePath = path.join(dir, "availability.json");
    const store = createAvailabilityStore({ filePath });
    const backend = createBusinessBackend({ availabilityStore: store });
    const pipeline = createPipeline({
      nowFn: () => new Date("2026-05-24T00:00:00.000Z"),
      backend,
      llmAdapter: async () => ({ text: "snooker reply" })
    });
    const result = await pipeline.runMessage({
      channel: "whatsapp",
      businessId: "prince_snooker",
      from: "snooker-boundary-test",
      text: "想book 11號枱 5月25號 下午2點"
    });
    const bd = result.staffItem?.bookingDraft;
    eq("snooker boundary: 11號枱 picks table 11, not table 1", bd?.resourceId, "res_prince_table_11");
  }

  console.log(`pipeline.store: ${testCount} tests passed`);
}

runAll().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
