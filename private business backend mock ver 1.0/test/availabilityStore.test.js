"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  createAvailabilityStore,
  defaultDurationForService,
  defaultOpeningHours,
  _internal
} = require("../src/availabilityStore");

const { validateOpeningHours, validateClosedPeriod, validateBooking, subtractMany, toMinutes } = _internal;

let testCount = 0;
function check(label, condition, detail) {
  testCount++;
  assert.ok(condition, detail ? `${label}: ${detail}` : label);
}
function eq(label, actual, expected) {
  testCount++;
  assert.deepEqual(actual, expected, label);
}

function freshStore(prefix = "availabilityStore-test") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  const filePath = path.join(dir, "availability.json");
  return { store: createAvailabilityStore({ filePath }), filePath, dir };
}

// ---------- validateOpeningHours ----------
(function validateOpeningHoursTests() {
  check("rejects non-object", validateOpeningHours(null).error === "openingHours must be an object");
  check("rejects non-array day", validateOpeningHours({ "0": "nope" }).error?.startsWith("day 0"));
  check("rejects window without HH:MM open", validateOpeningHours({ "1": [{ open: "9am", close: "17:00" }] }).error?.includes("open must be HH:MM"));
  check("rejects window without HH:MM close", validateOpeningHours({ "1": [{ open: "09:00", close: "5pm" }] }).error?.includes("close must be HH:MM"));
  check("rejects close <= open", validateOpeningHours({ "1": [{ open: "17:00", close: "09:00" }] }).error?.includes("close must be after open"));
  check("missing day defaults to []", Array.isArray(validateOpeningHours({}).hours?.["3"]) && validateOpeningHours({}).hours["3"].length === 0);

  const sorted = validateOpeningHours({ "1": [{ open: "18:00", close: "21:00" }, { open: "11:00", close: "15:00" }] }).hours["1"];
  eq("sorts windows by open time", sorted, [{ open: "11:00", close: "15:00" }, { open: "18:00", close: "21:00" }]);

  const cleaned = validateOpeningHours({ "1": [{ open: "11:00", close: "15:00" }] }).hours;
  check("normalizes all 7 days", Object.keys(cleaned).length === 7);
  for (let d = 0; d < 7; d++) check(`day ${d} is an array`, Array.isArray(cleaned[String(d)]));
})();

// ---------- validateClosedPeriod ----------
(function validateClosedPeriodTests() {
  check("rejects missing payload", validateClosedPeriod(null).error === "period payload required");
  check("rejects bad date", validateClosedPeriod({ date: "2026/05/24", start: "13:00", end: "14:00" }).error?.includes("date must be YYYY-MM-DD"));
  check("rejects bad start", validateClosedPeriod({ date: "2026-05-24", start: "1pm", end: "14:00" }).error?.includes("start must be HH:MM"));
  check("rejects bad end", validateClosedPeriod({ date: "2026-05-24", start: "13:00", end: "noon" }).error?.includes("end must be HH:MM"));
  check("rejects end <= start", validateClosedPeriod({ date: "2026-05-24", start: "14:00", end: "13:00" }).error?.includes("end must be after start"));
  const trimmed = validateClosedPeriod({ date: "2026-05-24", start: "13:00", end: "14:00", reason: "x".repeat(500) }).period;
  check("truncates reason to 200 chars", trimmed.reason.length === 200);
  check("preserves valid payload", trimmed.date === "2026-05-24" && trimmed.start === "13:00");
})();

// ---------- validateBooking ----------
(function validateBookingTests() {
  check("rejects unknown businessId", validateBooking("nope_demo", { date: "2026-05-24", time: "13:00", service: "facial" }).error?.includes("unknown businessId"));
  check("rejects missing payload", validateBooking("beauty_demo", null).error === "booking payload required");
  check("rejects bad date", validateBooking("beauty_demo", { date: "5/24", time: "13:00", service: "facial" }).error?.includes("date must be YYYY-MM-DD"));
  check("rejects bad time", validateBooking("beauty_demo", { date: "2026-05-24", time: "1pm", service: "facial" }).error?.includes("time must be HH:MM"));

  // restaurant
  check("rejects restaurant booking without partySize", validateBooking("restaurant_demo", { date: "2026-05-24", time: "19:00" }).error?.includes("partySize"));
  check("rejects restaurant partySize 0", validateBooking("restaurant_demo", { date: "2026-05-24", time: "19:00", partySize: 0 }).error?.includes("partySize"));
  check("rejects restaurant partySize 21", validateBooking("restaurant_demo", { date: "2026-05-24", time: "19:00", partySize: 21 }).error?.includes("partySize"));
  const restoBooking = validateBooking("restaurant_demo", { date: "2026-05-24", time: "19:00", partySize: 4 }).booking;
  check("restaurant booking defaults durationMinutes to 90", restoBooking.durationMinutes === 90);
  check("restaurant booking coerces partySize to number", restoBooking.partySize === 4 && typeof restoBooking.partySize === "number");
  check("rejects restaurant duration too low", validateBooking("restaurant_demo", { date: "2026-05-24", time: "19:00", partySize: 4, durationMinutes: 4 }).error?.includes("durationMinutes"));
  check("rejects restaurant duration too high", validateBooking("restaurant_demo", { date: "2026-05-24", time: "19:00", partySize: 4, durationMinutes: 241 }).error?.includes("durationMinutes"));

  // igshop
  check("rejects igshop bookings outright", validateBooking("igshop_demo", { date: "2026-05-24", time: "13:00", service: "anything" }).error?.includes("does not support bookings"));

  // beauty / edu
  check("rejects beauty without service", validateBooking("beauty_demo", { date: "2026-05-24", time: "13:00" }).error?.includes("service is required"));
  const beautyBooking = validateBooking("beauty_demo", { date: "2026-05-24", time: "13:00", service: "facial" }).booking;
  check("beauty booking uses service-default duration", beautyBooking.durationMinutes === defaultDurationForService("facial"));
  const laserBooking = validateBooking("beauty_demo", { date: "2026-05-24", time: "13:00", service: "laser" }).booking;
  check("laser default duration is 30", laserBooking.durationMinutes === 30);
  const eduBooking = validateBooking("edu_demo", { date: "2026-05-24", time: "14:00", service: "p3_english" }).booking;
  check("edu p3_english default duration is 45", eduBooking.durationMinutes === 45);
  const truncated = validateBooking("beauty_demo", { date: "2026-05-24", time: "13:00", service: "facial", customer: "c".repeat(500), notes: "n".repeat(1000) }).booking;
  check("truncates customer to 200", truncated.customer.length === 200);
  check("truncates notes to 500", truncated.notes.length === 500);
})();

// ---------- subtractMany / time helpers ----------
(function subtractTests() {
  eq("subtractMany no blocks", subtractMany([{ start: 600, end: 1260 }], []), [{ start: 600, end: 1260 }]);
  eq(
    "subtractMany single middle block",
    subtractMany([{ start: 600, end: 1260 }], [{ start: 780, end: 840 }]),
    [{ start: 600, end: 780 }, { start: 840, end: 1260 }]
  );
  eq("subtractMany covers entire window", subtractMany([{ start: 600, end: 720 }], [{ start: 540, end: 780 }]), []);
  eq(
    "subtractMany leading block",
    subtractMany([{ start: 600, end: 1260 }], [{ start: 600, end: 660 }]),
    [{ start: 660, end: 1260 }]
  );
  eq("toMinutes basic", toMinutes("13:30"), 13 * 60 + 30);
  eq("toMinutes garbage", toMinutes("nope"), 0);
})();

// ---------- listFreeSlots ----------
(function listFreeSlotsTests() {
  const { store } = freshStore("listFreeSlots");
  store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "13:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });

  const noBusiness = store.listFreeSlots({ businessId: "", date: "2026-05-25" });
  check("listFreeSlots requires businessId", noBusiness.found === false && noBusiness.reason.includes("required"));
  const badDate = store.listFreeSlots({ businessId: "beauty_demo", date: "5/25" });
  check("listFreeSlots requires ISO date", badDate.found === false);

  // 2026-05-25 is a Monday → day-of-week 1, 11:00-13:00 open
  const monday = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser" });
  // laser duration 30, step 30 → starts 11:00, 11:30, 12:00, 12:30
  eq("4 laser starts in 2-hour window", monday.freeSlots.map((s) => s.time), ["11:00", "11:30", "12:00", "12:30"]);
  check("free slot carries duration + endTime", monday.freeSlots[0].durationMinutes === 30 && monday.freeSlots[0].endTime === "11:30");

  const facial = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "facial" });
  // facial duration 75 → starts 11:00 (ends 12:15), 11:30 (ends 12:45) only; 12:00+75=13:15 > 13:00
  eq("only 2 facial starts fit in 2-hour window", facial.freeSlots.map((s) => s.time), ["11:00", "11:30"]);

  // Tuesday → closed-day (empty windows)
  const closedDay = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-26", service: "facial" });
  check("closed day returns found=true with empty slots", closedDay.found === true && closedDay.freeSlots.length === 0);
  check("closed day reason", closedDay.reason === "closed on this date");

  // Closed-period subtraction
  store.addClosedPeriod("beauty_demo", { date: "2026-05-25", start: "11:30", end: "12:30", reason: "lunch" });
  const withClosed = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser" });
  // After subtracting 11:30-12:30: open windows become 11:00-11:30 and 12:30-13:00 → laser starts at 11:00 and 12:30
  eq("closed-period removes overlapping slots", withClosed.freeSlots.map((s) => s.time), ["11:00", "12:30"]);

  // Booking subtraction (same service so the per-service filter keeps the booking as a blocker)
  const { store: store2 } = freshStore("listFreeSlots-bookings");
  store2.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "14:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
  store2.addBooking("beauty_demo", { date: "2026-05-25", time: "11:30", service: "facial" }); // 11:30-12:45
  const withBooking = store2.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "facial", durationMinutes: 30 });
  // open after subtraction: 11:00-11:30 and 12:45-14:00 (ceilTo(12:45,30)=13:00); 30-min starts: 11:00, 13:00, 13:30
  eq("booking subtracts its duration window", withBooking.freeSlots.map((s) => s.time), ["11:00", "13:00", "13:30"]);

  // Beauty service filter: bookings for a different service should still block (current code only filters if both services present and differ)
  const { store: store3 } = freshStore("listFreeSlots-svc-filter");
  store3.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "13:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
  store3.addBooking("beauty_demo", { date: "2026-05-25", time: "11:00", service: "laser", durationMinutes: 30 });
  // Asking for facial slots: laser booking has different service → filtered out → facial sees full window
  const facialUnblocked = store3.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "facial" });
  eq("beauty: different-service booking filtered out", facialUnblocked.freeSlots.map((s) => s.time), ["11:00", "11:30"]);
  // Asking for laser slots: laser booking blocks
  const laserBlocked = store3.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser" });
  check("beauty: same-service booking blocks slot", !laserBlocked.freeSlots.some((s) => s.time === "11:00"));

  // Restaurant partySize filter
  const { store: store4 } = freshStore("listFreeSlots-resto");
  store4.setOpeningHours("restaurant_demo", { "0": [], "1": [{ open: "18:00", close: "21:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
  store4.addBooking("restaurant_demo", { date: "2026-05-25", time: "19:00", partySize: 4, durationMinutes: 90 });
  const sameSize = store4.listFreeSlots({ businessId: "restaurant_demo", date: "2026-05-25", partySize: 4, durationMinutes: 60 });
  check("restaurant: same partySize booking blocks 19:00-20:30", !sameSize.freeSlots.some((s) => s.time === "19:00" || s.time === "19:30" || s.time === "20:00"));
  const diffSize = store4.listFreeSlots({ businessId: "restaurant_demo", date: "2026-05-25", partySize: 2, durationMinutes: 60 });
  check("restaurant: different partySize booking does not block", diffSize.freeSlots.some((s) => s.time === "19:00"));

  // Duration too large for the window
  const { store: store5 } = freshStore("listFreeSlots-toolong");
  store5.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "11:30" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
  const tooLong = store5.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "facial" }); // 75min > 30min window
  check("duration longer than window yields zero slots", tooLong.freeSlots.length === 0);
})();

// ---------- findNextAvailableDates ----------
(function findNextAvailableDatesTests() {
  const { store } = freshStore("findNext");
  // Only Wednesdays open (day-of-week 3), one 30-min slot per Wed
  store.setOpeningHours("beauty_demo", { "0": [], "1": [], "2": [], "3": [{ open: "11:00", close: "11:30" }], "4": [], "5": [], "6": [] });
  // 2026-05-25 is Monday → walk forward → only 2026-05-27 (Wed) qualifies within next 7 days
  const suggestions = store.findNextAvailableDates({ businessId: "beauty_demo", fromDate: "2026-05-25", service: "laser", maxDays: 7, maxResults: 3 });
  eq("returns single Wed within next 7 days", suggestions.map((s) => s.date), ["2026-05-27"]);
  check("includes firstSlot", suggestions[0].firstSlot.time === "11:00");
  check("includes freeCount", suggestions[0].freeCount === 1);

  // Wider range: get 2 wednesdays
  const wider = store.findNextAvailableDates({ businessId: "beauty_demo", fromDate: "2026-05-25", service: "laser", maxDays: 14, maxResults: 3 });
  eq("two Wednesdays in 14 days", wider.map((s) => s.date), ["2026-05-27", "2026-06-03"]);

  // maxResults caps result list
  const { store: store2 } = freshStore("findNext-cap");
  store2.setOpeningHours("beauty_demo", { "0": [{ open: "11:00", close: "12:00" }], "1": [{ open: "11:00", close: "12:00" }], "2": [{ open: "11:00", close: "12:00" }], "3": [{ open: "11:00", close: "12:00" }], "4": [{ open: "11:00", close: "12:00" }], "5": [{ open: "11:00", close: "12:00" }], "6": [{ open: "11:00", close: "12:00" }] });
  const capped = store2.findNextAvailableDates({ businessId: "beauty_demo", fromDate: "2026-05-25", service: "laser", maxDays: 7, maxResults: 2 });
  check("maxResults respected", capped.length === 2);

  // No openings in range
  const { store: store3 } = freshStore("findNext-none");
  store3.setOpeningHours("beauty_demo", { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] });
  const none = store3.findNextAvailableDates({ businessId: "beauty_demo", fromDate: "2026-05-25", service: "laser" });
  eq("no openings → empty", none, []);

  // Bad input
  eq("missing fromDate → empty", store3.findNextAvailableDates({ businessId: "beauty_demo" }), []);
  eq("bad date format → empty", store3.findNextAvailableDates({ businessId: "beauty_demo", fromDate: "5/25" }), []);
})();

// ---------- Bookings CRUD ----------
(function bookingsCrudTests() {
  const { store } = freshStore("crud");
  const added = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial", customer: "Alice" });
  check("addBooking returns ok", added.ok === true && added.booking.id.startsWith("book_"));
  const id = added.booking.id;

  const listed = store.listBookings("beauty_demo");
  check("listBookings includes new booking", listed.some((b) => b.id === id));

  const patched = store.updateBooking("beauty_demo", id, { notes: "back door" });
  check("updateBooking applies patch", patched.ok && patched.booking.notes === "back door" && patched.booking.id === id);

  const patchInvalid = store.updateBooking("beauty_demo", id, { time: "not-a-time" });
  check("updateBooking re-validates", patchInvalid.ok === false && patchInvalid.error.includes("time must be HH:MM"));

  const patchMissing = store.updateBooking("beauty_demo", "book_does_not_exist", { notes: "x" });
  check("updateBooking missing → 404 shape", patchMissing.ok === false && patchMissing.error === "booking not found");

  const removed = store.removeBooking("beauty_demo", id);
  check("removeBooking returns ok", removed.ok === true && removed.booking.id === id);
  const removedAgain = store.removeBooking("beauty_demo", id);
  check("removeBooking idempotency returns not found", removedAgain.ok === false);

  const badAdd = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00" }); // missing service
  check("addBooking rejects invalid payload", badAdd.ok === false && badAdd.error.includes("service is required"));

  const closedAdd = store.addClosedPeriod("beauty_demo", { date: "2026-05-25", start: "13:00", end: "14:00", reason: "block" });
  check("addClosedPeriod returns ok", closedAdd.ok && closedAdd.period.id.startsWith("close_"));
  const removedClosed = store.removeClosedPeriod("beauty_demo", closedAdd.period.id);
  check("removeClosedPeriod returns ok", removedClosed.ok);
  check("removeClosedPeriod missing → not found", store.removeClosedPeriod("beauty_demo", "close_doesnotexist").ok === false);

  // Unknown businessId for setters
  check("setOpeningHours rejects unknown businessId", store.setOpeningHours("nope_demo", { "0": [] }).ok === false);
  check("addClosedPeriod rejects unknown businessId", store.addClosedPeriod("nope_demo", { date: "2026-05-25", start: "13:00", end: "14:00" }).ok === false);
})();

// ---------- Persistence round-trip ----------
(function persistenceTests() {
  const { filePath } = freshStore("persist");
  const s1 = createAvailabilityStore({ filePath });
  const hours = { "0": [], "1": [{ open: "10:00", close: "20:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] };
  s1.setOpeningHours("beauty_demo", hours);
  s1.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial" });

  check("state file exists after writes", fs.existsSync(filePath));

  const s2 = createAvailabilityStore({ filePath });
  const reloadedHours = s2.getOpeningHours("beauty_demo");
  eq("opening hours survive reload", reloadedHours["1"], [{ open: "10:00", close: "20:00" }]);
  const reloadedBookings = s2.listBookings("beauty_demo");
  check("bookings survive reload", reloadedBookings.length === 1 && reloadedBookings[0].time === "13:00");

  // reset() restores defaults
  s2.reset();
  const afterReset = s2.getOpeningHours("beauty_demo");
  eq("reset restores beauty default Monday hours", afterReset["1"], defaultOpeningHours("beauty_demo")["1"]);
  check("reset clears bookings", s2.listBookings("beauty_demo").length === 0);
})();

console.log(`availabilityStore: ${testCount} tests passed`);
