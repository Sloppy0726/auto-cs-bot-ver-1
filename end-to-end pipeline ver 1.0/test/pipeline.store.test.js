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

function freshStorePipeline({ openingHours, bookings = [] } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pipeline-store-"));
  const filePath = path.join(dir, "availability.json");
  const store = createAvailabilityStore({ filePath });
  if (openingHours) store.setOpeningHours("beauty_demo", openingHours);
  for (const b of bookings) store.addBooking("beauty_demo", b);
  const backend = createBusinessBackend({ availabilityStore: store });
  const pipeline = createPipeline({
    nowFn: () => new Date("2026-05-24T00:00:00.000Z"),  // HK 2026-05-24 (Sunday)
    backend,
    llmAdapter: async () => ({ text: "fallback canned reply" })
  });
  return { pipeline, store, backend };
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

  // ---- Case 7: bookingDraft NOT captured for clarify (asking for slots) ----
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

  console.log(`pipeline.store: ${testCount} tests passed`);
}

runAll().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
