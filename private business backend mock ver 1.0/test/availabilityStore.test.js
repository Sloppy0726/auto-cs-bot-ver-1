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

const { validateOpeningHours, validateClosedPeriod, validateBooking, validateResource, normalizeResource, subtractMany, toMinutes, checkBookingFitsOpeningHours, intersectWindows, effectiveWindowsForResource, activeResources, checkBookingResourceRequirement, checkBookingResourceOverlap } = _internal;

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

// ---------- Out-of-hours rejection ----------
(function outOfHoursTests() {
  const { store } = freshStore("out-of-hours");
  store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });

  // 2026-05-25 is Monday. Window 11:00-19:00.
  const beforeOpen = store.addBooking("beauty_demo", { date: "2026-05-25", time: "10:00", service: "laser" });
  check("rejects booking before opening", beforeOpen.ok === false && beforeOpen.error.includes("outside opening hours"));

  const afterClose = store.addBooking("beauty_demo", { date: "2026-05-25", time: "18:45", service: "laser" }); // 18:45+30=19:15 > 19:00
  check("rejects booking that ends after close", afterClose.ok === false && afterClose.error.includes("outside opening hours"));

  const closedDay = store.addBooking("beauty_demo", { date: "2026-05-26", time: "13:00", service: "facial" }); // Tue is closed
  check("rejects booking on closed day", closedDay.ok === false && closedDay.error.includes("closed on"));

  const inside = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial" }); // 13:00+75=14:15 inside
  check("accepts booking fully inside opening window", inside.ok === true);

  const edgeStart = store.addBooking("beauty_demo", { date: "2026-05-25", time: "11:00", service: "laser" }); // exactly at open
  check("accepts booking starting at open time", edgeStart.ok === true);

  const edgeEnd = store.addBooking("beauty_demo", { date: "2026-05-25", time: "18:30", service: "laser" }); // 18:30+30=19:00 exactly at close
  check("accepts booking ending exactly at close", edgeEnd.ok === true);

  // Closed-period blocks an otherwise-valid time
  const { store: store2 } = freshStore("out-of-hours-closed");
  store2.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
  store2.addClosedPeriod("beauty_demo", { date: "2026-05-25", start: "13:00", end: "14:00", reason: "lunch" });
  const insideClosed = store2.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "laser" });
  check("rejects booking inside closed period", insideClosed.ok === false && insideClosed.error.includes("outside opening hours"));
  const straddleClosed = store2.addBooking("beauty_demo", { date: "2026-05-25", time: "12:45", service: "laser" }); // 12:45-13:15 straddles closed start
  check("rejects booking that straddles closed-period start", straddleClosed.ok === false);
  const afterClosed = store2.addBooking("beauty_demo", { date: "2026-05-25", time: "14:00", service: "laser" });
  check("accepts booking starting right after closed period ends", afterClosed.ok === true);

  // updateBooking re-checks
  const { store: store3 } = freshStore("out-of-hours-update");
  store3.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
  const seed = store3.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "laser" });
  const moveBad = store3.updateBooking("beauty_demo", seed.booking.id, { time: "21:00" });
  check("updateBooking rejects move outside opening hours", moveBad.ok === false && moveBad.error.includes("outside opening hours"));
  const moveOk = store3.updateBooking("beauty_demo", seed.booking.id, { time: "14:00" });
  check("updateBooking accepts move inside opening hours", moveOk.ok === true && moveOk.booking.time === "14:00");

  // Restaurant: 19:00 partySize 4 90min → 19:00-20:30; window 11:30-22:30 ok
  const { store: store4 } = freshStore("out-of-hours-resto");
  const restoOk = store4.addBooking("restaurant_demo", { date: "2026-05-25", time: "19:00", partySize: 4 });
  check("restaurant inside default Mon hours: ok", restoOk.ok === true);
  const restoLate = store4.addBooking("restaurant_demo", { date: "2026-05-25", time: "22:00", partySize: 4 }); // 22:00+90=23:30 > 22:30
  check("restaurant booking past close: rejected", restoLate.ok === false);

  // Direct helper unit test
  const state = { businesses: { beauty_demo: {
    openingHours: { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] },
    closedPeriods: [],
    bookings: []
  } } };
  check("helper fits inside", checkBookingFitsOpeningHours(state, "beauty_demo", { date: "2026-05-25", time: "12:00", durationMinutes: 30 }).ok === true);
  check("helper rejects outside", checkBookingFitsOpeningHours(state, "beauty_demo", { date: "2026-05-25", time: "20:00", durationMinutes: 30 }).ok === false);
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

// ---------- validateResource ----------
(function validateResourceTests() {
  check("rejects missing payload", validateResource(null).error === "resource payload required");
  check("rejects non-object", validateResource("Amy").error === "resource payload required");
  check("rejects missing name", validateResource({ openingHours: { "0": [] } }).error === "name is required");
  check("rejects whitespace-only name", validateResource({ name: "   " }).error === "name is required");
  check("rejects oversize name", validateResource({ name: "x".repeat(200) }).error?.includes("≤ 80 chars"));

  const minimal = validateResource({ name: "Amy" }).resource;
  check("minimal resource has trimmed name", minimal.name === "Amy");
  check("minimal resource defaults active=true", minimal.active === true);
  check("minimal resource has no openingHours field", minimal.openingHours === undefined);

  const trimmed = validateResource({ name: "  Joey  " }).resource;
  check("trims whitespace from name", trimmed.name === "Joey");

  const inactive = validateResource({ name: "Old Stylist", active: false }).resource;
  check("respects active=false", inactive.active === false);

  const withHours = validateResource({ name: "Amy", openingHours: { "1": [{ open: "10:00", close: "18:00" }] } }).resource;
  eq("preserves openingHours when valid", withHours.openingHours["1"], [{ open: "10:00", close: "18:00" }]);

  const badHours = validateResource({ name: "Amy", openingHours: { "1": [{ open: "9am", close: "5pm" }] } });
  check("rejects invalid openingHours via wrapper", badHours.error?.startsWith("openingHours:"));
})();

// ---------- normalizeResource ----------
(function normalizeResourceTests() {
  check("normalizeResource drops null", normalizeResource(null) === null);
  check("normalizeResource drops nameless", normalizeResource({ id: "res_x" }) === null);
  const norm = normalizeResource({ name: "Table 1" });
  check("normalizeResource auto-generates id", norm.id.startsWith("res_"));
  check("normalizeResource defaults active=true", norm.active === true);
  const preserved = normalizeResource({ id: "res_keep", name: "Amy", active: false });
  check("normalizeResource preserves id", preserved.id === "res_keep");
  check("normalizeResource preserves active=false", preserved.active === false);
})();

// ---------- Resources CRUD ----------
(function resourcesCrudTests() {
  const { store } = freshStore("resources-crud");

  // Empty by default
  eq("listResources empty on fresh business", store.listResources("beauty_demo"), []);
  check("getResource on missing returns null", store.getResource("beauty_demo", "res_nope") === null);

  // Add
  const amy = store.addResource("beauty_demo", { name: "Amy" });
  check("addResource returns ok", amy.ok === true && amy.resource.id.startsWith("res_"));
  check("addResource defaults active=true", amy.resource.active === true);

  const joey = store.addResource("beauty_demo", { name: "Joey", openingHours: { "0": [], "1": [], "2": [{ open: "14:00", close: "20:00" }], "3": [], "4": [], "5": [], "6": [] } });
  check("addResource accepts openingHours", joey.ok === true && joey.resource.openingHours["2"][0].open === "14:00");

  // Validation errors at the CRUD layer
  const noName = store.addResource("beauty_demo", { name: "" });
  check("addResource rejects empty name", noName.ok === false && noName.error.includes("name is required"));

  const badBiz = store.addResource("nope_demo", { name: "Whoever" });
  check("addResource rejects unknown businessId", badBiz.ok === false && badBiz.error.includes("unknown businessId"));

  // List
  const all = store.listResources("beauty_demo");
  check("listResources returns 2", all.length === 2);
  check("listResources returns array of resource records", all.every((r) => r.id && r.name));

  // Get
  const fetched = store.getResource("beauty_demo", amy.resource.id);
  check("getResource finds by id", fetched && fetched.name === "Amy");

  // Update
  const renamed = store.updateResource("beauty_demo", amy.resource.id, { name: "Amy Chan" });
  check("updateResource applies patch", renamed.ok === true && renamed.resource.name === "Amy Chan");
  check("updateResource preserves id", renamed.resource.id === amy.resource.id);

  const badPatch = store.updateResource("beauty_demo", amy.resource.id, { name: "" });
  check("updateResource re-validates", badPatch.ok === false && badPatch.error.includes("name is required"));

  const missing = store.updateResource("beauty_demo", "res_nope", { name: "x" });
  check("updateResource missing → not found", missing.ok === false && missing.error === "resource not found");

  // Remove (soft delete)
  const removed = store.removeResource("beauty_demo", amy.resource.id);
  check("removeResource returns ok", removed.ok === true);
  check("removed resource is marked inactive", removed.resource.active === false);

  const stillThere = store.getResource("beauty_demo", amy.resource.id);
  check("soft-deleted resource still findable by id", stillThere && stillThere.active === false);

  const activeOnly = store.listResources("beauty_demo", { includeInactive: false });
  check("listResources excludeInactive filters out soft-deleted", activeOnly.length === 1 && activeOnly[0].id === joey.resource.id);
  const withInactive = store.listResources("beauty_demo");
  check("listResources default includes inactive", withInactive.length === 2);

  // Re-activation
  const reactivated = store.updateResource("beauty_demo", amy.resource.id, { active: true });
  check("updateResource can re-activate", reactivated.ok === true && reactivated.resource.active === true);
})();

// ---------- Resources persistence + back-compat ----------
(function resourcesPersistenceTests() {
  // Resources survive reload
  const { filePath } = freshStore("resources-persist");
  const s1 = createAvailabilityStore({ filePath });
  s1.addResource("beauty_demo", { name: "Amy" });
  s1.addResource("beauty_demo", { name: "Joey", openingHours: { "0": [], "1": [{ open: "11:00", close: "20:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] } });

  const s2 = createAvailabilityStore({ filePath });
  const reloaded = s2.listResources("beauty_demo");
  check("resources survive reload", reloaded.length === 2);
  check("reloaded resource openingHours intact", reloaded.find((r) => r.name === "Joey").openingHours["1"][0].open === "11:00");

  // Loading a legacy state file (no `resources` key) does not throw
  const legacyDir = fs.mkdtempSync(path.join(os.tmpdir(), "resources-legacy-"));
  const legacyFile = path.join(legacyDir, "availability.json");
  fs.writeFileSync(legacyFile, JSON.stringify({
    businesses: {
      beauty_demo: {
        openingHours: { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] },
        closedPeriods: [],
        bookings: [{ id: "book_legacy", date: "2026-05-25", time: "13:00", service: "facial", durationMinutes: 75 }]
        // no resources key — pre-Phase-1 state
      }
    }
  }, null, 2));
  const legacyStore = createAvailabilityStore({ filePath: legacyFile });
  eq("legacy state file → empty resources", legacyStore.listResources("beauty_demo"), []);
  check("legacy bookings still readable after load", legacyStore.listBookings("beauty_demo").some((b) => b.id === "book_legacy"));

  // Reset clears resources too
  const { store: s3 } = freshStore("resources-reset");
  s3.addResource("beauty_demo", { name: "Amy" });
  s3.reset();
  eq("reset clears resources", s3.listResources("beauty_demo"), []);
})();

// ---------- intersectWindows ----------
(function intersectWindowsTests() {
  eq("intersectWindows empty", intersectWindows([], [{ start: 600, end: 780 }]), []);
  eq("intersectWindows disjoint", intersectWindows([{ start: 600, end: 660 }], [{ start: 720, end: 780 }]), []);
  eq("intersectWindows full overlap", intersectWindows([{ start: 600, end: 780 }], [{ start: 600, end: 780 }]), [{ start: 600, end: 780 }]);
  eq("intersectWindows partial overlap", intersectWindows([{ start: 600, end: 780 }], [{ start: 700, end: 800 }]), [{ start: 700, end: 780 }]);
  eq("intersectWindows multi-window pair", intersectWindows([{ start: 600, end: 700 }, { start: 800, end: 900 }], [{ start: 650, end: 850 }]), [{ start: 650, end: 700 }, { start: 800, end: 850 }]);
  eq("intersectWindows sorted output", intersectWindows([{ start: 800, end: 900 }, { start: 600, end: 700 }], [{ start: 500, end: 1000 }]), [{ start: 600, end: 700 }, { start: 800, end: 900 }]);
})();

// ---------- effectiveWindowsForResource ----------
(function effectiveWindowsTests() {
  const bizWindows = [{ start: 660, end: 1140 }]; // 11:00-19:00

  const noOverride = effectiveWindowsForResource(bizWindows, { id: "res_a", name: "Amy", active: true }, 1);
  eq("no override → inherits business windows", noOverride, bizWindows);

  const undefinedDay = effectiveWindowsForResource(bizWindows, { id: "res_b", name: "Joey", openingHours: { "0": [] }, active: true }, 1);
  eq("override missing this dow → inherits business windows", undefinedDay, bizWindows);

  const narrower = effectiveWindowsForResource(bizWindows, { id: "res_c", name: "Cara", openingHours: { "1": [{ open: "12:00", close: "16:00" }] }, active: true }, 1);
  eq("narrower override → intersected", narrower, [{ start: 720, end: 960 }]);

  const closedThatDay = effectiveWindowsForResource(bizWindows, { id: "res_d", name: "Dom", openingHours: { "1": [] }, active: true }, 1);
  eq("resource closed → empty windows", closedThatDay, []);
})();

// ---------- activeResources ----------
(function activeResourcesTests() {
  const { store } = freshStore("active-resources");
  const a = store.addResource("beauty_demo", { name: "Amy" });
  const b = store.addResource("beauty_demo", { name: "Joey" });
  store.removeResource("beauty_demo", b.resource.id); // soft-delete
  // Direct internal helper expects state shape — load via listAll wrapper
  const state = { businesses: { beauty_demo: { resources: store.listResources("beauty_demo") } } };
  const actives = activeResources(state, "beauty_demo");
  check("only active resources counted", actives.length === 1 && actives[0].id === a.resource.id);
  eq("unknown business → empty", activeResources(state, "nope_demo"), []);
})();

// ---------- listFreeSlots with resources ----------
(function listFreeSlotsResourceTests() {
  // Specific resource: Amy 11:00-15:00 on Mon, Joey inherits business 11:00-19:00
  {
    const { store } = freshStore("free-slots-specific");
    store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
    const amy = store.addResource("beauty_demo", { name: "Amy", openingHours: { "0": [], "1": [{ open: "11:00", close: "15:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] } });
    const joey = store.addResource("beauty_demo", { name: "Joey" });

    const amySlots = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser", resourceId: amy.resource.id });
    eq("Amy-only: slots inside her 11-15 window only", amySlots.freeSlots.map((s) => s.time), ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"]);
    check("Amy slot carries resourceId", amySlots.freeSlots[0].resourceId === amy.resource.id);
    eq("Amy slot availableResources", amySlots.freeSlots[0].availableResources, [amy.resource.id]);

    const joeySlots = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser", resourceId: joey.resource.id });
    check("Joey (no override): inherits full business window", joeySlots.freeSlots.length === 16); // 11:00-18:30 step 30 with 30min duration
  }

  // Any-available: union with availableResources lists who's free at each time
  {
    const { store } = freshStore("free-slots-any");
    store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "13:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
    const amy = store.addResource("beauty_demo", { name: "Amy" });
    const joey = store.addResource("beauty_demo", { name: "Joey" });
    store.addBooking("beauty_demo", { date: "2026-05-25", time: "11:00", service: "laser", durationMinutes: 30, resourceId: amy.resource.id });

    const any = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser" });
    eq("any-available: still 4 start times (Joey covers 11:00)", any.freeSlots.map((s) => s.time), ["11:00", "11:30", "12:00", "12:30"]);
    eq("11:00 only Joey is free", any.freeSlots[0].availableResources, [joey.resource.id]);
    check("11:30 onward both free", any.freeSlots[1].availableResources.length === 2);
    check("reason mentions resource count", any.reason.includes("2 resource"));
  }

  // Any-available where ALL resources are blocked at the same time
  {
    const { store } = freshStore("free-slots-all-blocked");
    store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "13:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
    const amy = store.addResource("beauty_demo", { name: "Amy" });
    const joey = store.addResource("beauty_demo", { name: "Joey" });
    store.addBooking("beauty_demo", { date: "2026-05-25", time: "11:00", service: "laser", durationMinutes: 30, resourceId: amy.resource.id });
    store.addBooking("beauty_demo", { date: "2026-05-25", time: "11:00", service: "laser", durationMinutes: 30, resourceId: joey.resource.id });
    const any = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser" });
    check("11:00 no longer in the list", !any.freeSlots.some((s) => s.time === "11:00"));
    check("later times still available", any.freeSlots.some((s) => s.time === "11:30"));
  }

  // Specific resource not found
  {
    const { store } = freshStore("free-slots-not-found");
    store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "13:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
    store.addResource("beauty_demo", { name: "Amy" });
    const missing = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser", resourceId: "res_does_not_exist" });
    check("unknown resourceId → found=false", missing.found === false && missing.reason.includes("resource not found"));
  }

  // Resource closed that day
  {
    const { store } = freshStore("free-slots-resource-closed");
    store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "13:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
    const amy = store.addResource("beauty_demo", { name: "Amy", openingHours: { "0": [], "1": [], "2": [{ open: "11:00", close: "13:00" }], "3": [], "4": [], "5": [], "6": [] } });
    const closed = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser", resourceId: amy.resource.id });
    check("resource closed on dow → empty list", closed.found === true && closed.freeSlots.length === 0);
  }

  // Zero resources → legacy single-pool path (no availableResources field on slots)
  {
    const { store } = freshStore("free-slots-legacy");
    store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "13:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
    const legacy = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser" });
    eq("legacy path slot times", legacy.freeSlots.map((s) => s.time), ["11:00", "11:30", "12:00", "12:30"]);
    check("legacy path slots do NOT carry availableResources", legacy.freeSlots.every((s) => s.availableResources === undefined));
  }

  // Pool booking (no resourceId) blocks ALL resources at that time
  {
    const { store } = freshStore("free-slots-pool-blocker");
    store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "13:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
    store.addResource("beauty_demo", { name: "Amy" });
    store.addResource("beauty_demo", { name: "Joey" });
    // Inject a legacy pool booking directly via state mutation (since addBooking now requires resourceId)
    const raw = require("node:fs").readFileSync(store._filePath, "utf8");
    const state = JSON.parse(raw);
    state.businesses.beauty_demo.bookings.push({ id: "book_legacy_pool", date: "2026-05-25", time: "11:00", service: "laser", durationMinutes: 30 });
    require("node:fs").writeFileSync(store._filePath, JSON.stringify(state));
    const any = store.listFreeSlots({ businessId: "beauty_demo", date: "2026-05-25", service: "laser" });
    check("pool booking blocks all resources at 11:00", !any.freeSlots.some((s) => s.time === "11:00"));
  }
})();

// ---------- findNextAvailableDates with resourceId ----------
(function findNextWithResourceTests() {
  const { store } = freshStore("find-next-resource");
  store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "12:00" }], "2": [], "3": [{ open: "11:00", close: "12:00" }], "4": [], "5": [], "6": [] });
  const amy = store.addResource("beauty_demo", { name: "Amy", openingHours: { "0": [], "1": [], "2": [], "3": [{ open: "11:00", close: "12:00" }], "4": [], "5": [], "6": [] } });
  // Joey inherits business hours → available Mon + Wed
  store.addResource("beauty_demo", { name: "Joey" });
  // Without resourceId (any-available): Mon (Joey) + Wed (both) both have slots
  const any = store.findNextAvailableDates({ businessId: "beauty_demo", fromDate: "2026-05-24", service: "laser", maxDays: 7 });
  eq("any: Mon + Wed in next 7 days", any.map((s) => s.date), ["2026-05-25", "2026-05-27"]);
  // With Amy (only Wed): just Wed
  const amyOnly = store.findNextAvailableDates({ businessId: "beauty_demo", fromDate: "2026-05-24", service: "laser", resourceId: amy.resource.id, maxDays: 7 });
  eq("Amy: only Wed in next 7 days", amyOnly.map((s) => s.date), ["2026-05-27"]);
})();

// ---------- addBooking requires resourceId when business has resources ----------
(function addBookingResourceRequirementTests() {
  const { store } = freshStore("add-booking-requirement");
  store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
  const amy = store.addResource("beauty_demo", { name: "Amy" });

  const missingId = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial" });
  check("rejects booking without resourceId when business has resources", missingId.ok === false && missingId.error.includes("resourceId required"));

  const badId = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial", resourceId: "res_nope" });
  check("rejects unknown resourceId", badId.ok === false && badId.error.includes("not found or inactive"));

  const inactive = store.addResource("beauty_demo", { name: "OldStaff" });
  store.removeResource("beauty_demo", inactive.resource.id);
  const inactiveId = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial", resourceId: inactive.resource.id });
  check("rejects inactive resourceId", inactiveId.ok === false && inactiveId.error.includes("not found or inactive"));

  const ok = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial", resourceId: amy.resource.id });
  check("accepts valid resourceId", ok.ok === true && ok.booking.resourceId === amy.resource.id);

  // Back-compat: zero resources → resourceId not required (legacy behavior)
  const { store: legacy } = freshStore("legacy-no-resources");
  legacy.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
  const noResources = legacy.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial" });
  check("legacy: no resources → resourceId not required", noResources.ok === true && noResources.booking.resourceId === undefined);
})();

// ---------- Per-resource overlap detection ----------
(function overlapTests() {
  const { store } = freshStore("overlap");
  store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
  const amy = store.addResource("beauty_demo", { name: "Amy" });
  const joey = store.addResource("beauty_demo", { name: "Joey" });

  const first = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial", resourceId: amy.resource.id }); // facial = 75 min
  check("first booking ok", first.ok === true);

  const overlapping = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:30", service: "laser", resourceId: amy.resource.id });
  check("rejects overlapping booking on same resource", overlapping.ok === false && overlapping.error.includes("resource conflict"));

  const sameTimeDifferentResource = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial", resourceId: joey.resource.id });
  check("accepts same time on different resource", sameTimeDifferentResource.ok === true);

  const adjacentSameResource = store.addBooking("beauty_demo", { date: "2026-05-25", time: "14:15", service: "laser", resourceId: amy.resource.id }); // facial ends at 14:15
  check("accepts adjacent booking on same resource", adjacentSameResource.ok === true);

  // updateBooking conflict check
  const move = store.updateBooking("beauty_demo", sameTimeDifferentResource.booking.id, { resourceId: amy.resource.id });
  check("updateBooking rejects move into conflict", move.ok === false && move.error.includes("resource conflict"));

  // updateBooking can move within the same resource without false-positive conflict against itself
  const selfMove = store.updateBooking("beauty_demo", first.booking.id, { time: "12:00" });
  check("updateBooking allows same-id self-move", selfMove.ok === true && selfMove.booking.time === "12:00");
})();

// ---------- Resource-aware checkBookingFitsOpeningHours ----------
(function resourceFitTests() {
  const { store } = freshStore("resource-fit");
  store.setOpeningHours("beauty_demo", { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] });
  const amy = store.addResource("beauty_demo", { name: "Amy", openingHours: { "0": [], "1": [{ open: "11:00", close: "15:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] } });

  // Booking inside business hours but outside Amy's window must be rejected
  const outsideAmy = store.addBooking("beauty_demo", { date: "2026-05-25", time: "16:00", service: "laser", resourceId: amy.resource.id }); // 16:00-16:30 inside biz 11-19 but outside Amy 11-15
  check("rejects booking outside resource's window even if inside business window", outsideAmy.ok === false && outsideAmy.error.includes("outside opening hours"));

  // Same booking on a resource that inherits business hours: ok
  const joey = store.addResource("beauty_demo", { name: "Joey" });
  const okOnJoey = store.addBooking("beauty_demo", { date: "2026-05-25", time: "16:00", service: "laser", resourceId: joey.resource.id });
  check("accepts booking on resource that inherits business hours", okOnJoey.ok === true);

  // Inside Amy's window: ok
  const insideAmy = store.addBooking("beauty_demo", { date: "2026-05-25", time: "14:00", service: "laser", resourceId: amy.resource.id });
  check("accepts booking inside resource's narrower window", insideAmy.ok === true);
})();

// ---------- Direct helper tests ----------
(function helperTests() {
  // checkBookingResourceRequirement
  const stateNoResources = { businesses: { beauty_demo: { resources: [] } } };
  check("no resources → requirement passes", checkBookingResourceRequirement(stateNoResources, "beauty_demo", { date: "2026-05-25", time: "13:00" }).ok === true);

  const stateWithResources = { businesses: { beauty_demo: { resources: [{ id: "res_amy", name: "Amy", active: true }] } } };
  check("with resources but no resourceId → fails", checkBookingResourceRequirement(stateWithResources, "beauty_demo", { date: "2026-05-25", time: "13:00" }).ok === false);
  check("with resources + valid id → passes", checkBookingResourceRequirement(stateWithResources, "beauty_demo", { date: "2026-05-25", time: "13:00", resourceId: "res_amy" }).ok === true);
  check("with resources + bad id → fails", checkBookingResourceRequirement(stateWithResources, "beauty_demo", { date: "2026-05-25", time: "13:00", resourceId: "res_nope" }).ok === false);

  const stateAllInactive = { businesses: { beauty_demo: { resources: [{ id: "res_amy", name: "Amy", active: false }] } } };
  check("all inactive → behaves as no resources", checkBookingResourceRequirement(stateAllInactive, "beauty_demo", { date: "2026-05-25", time: "13:00" }).ok === true);

  // checkBookingResourceOverlap
  const overlapState = { businesses: { beauty_demo: { bookings: [
    { id: "book_a", date: "2026-05-25", time: "13:00", durationMinutes: 60, resourceId: "res_amy" }
  ] } } };
  check("no resourceId on incoming → no overlap check", checkBookingResourceOverlap(overlapState, "beauty_demo", { date: "2026-05-25", time: "13:00", durationMinutes: 60 }).ok === true);
  check("overlapping same resource → conflict", checkBookingResourceOverlap(overlapState, "beauty_demo", { date: "2026-05-25", time: "13:30", durationMinutes: 30, resourceId: "res_amy" }).ok === false);
  check("touching boundary same resource → not a conflict", checkBookingResourceOverlap(overlapState, "beauty_demo", { date: "2026-05-25", time: "14:00", durationMinutes: 30, resourceId: "res_amy" }).ok === true);
  check("excludeId skips matching booking", checkBookingResourceOverlap(overlapState, "beauty_demo", { date: "2026-05-25", time: "13:00", durationMinutes: 60, resourceId: "res_amy" }, "book_a").ok === true);
})();

// ---------- Booking validation accepts and coerces resourceId ----------
(function validateBookingResourceTests() {
  const withId = validateBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial", resourceId: "res_amy" }).booking;
  check("validateBooking preserves resourceId string", withId.resourceId === "res_amy");

  const numericId = validateBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial", resourceId: 42 }).booking;
  check("validateBooking coerces numeric resourceId to string", numericId.resourceId === "42");

  const empty = validateBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial", resourceId: "" }).booking;
  check("validateBooking drops empty-string resourceId", empty.resourceId === undefined);

  const nullId = validateBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial", resourceId: null }).booking;
  check("validateBooking drops null resourceId", nullId.resourceId === undefined);
})();

// ---------- prince_snooker (Phase 6) ----------
(function princeSnookerSeedTests() {
  const { defaultOpeningHours } = require("../src/availabilityStore");

  // Default hours: 11:00–23:30 every day
  const hours = defaultOpeningHours("prince_snooker");
  for (let d = 0; d < 7; d++) {
    const win = hours[String(d)];
    check(`prince_snooker day ${d} has one window`, Array.isArray(win) && win.length === 1);
    eq(`prince_snooker day ${d} window`, win[0], { open: "11:00", close: "23:30" });
  }

  // Fresh store: 12 tables seeded
  const { store } = freshStore("snooker-seed");
  const tables = store.listResources("prince_snooker");
  check("prince_snooker seeded 12 tables", tables.length === 12);
  for (let i = 1; i <= 12; i++) {
    const t = tables.find((r) => r.name === `${i}號枱`);
    check(`prince_snooker table ${i}號枱 seeded`, !!t && t.active === true);
  }
  // Stable ids
  eq("prince_snooker table 1 id stable", tables.find((t) => t.name === "1號枱").id, "res_prince_table_1");
  eq("prince_snooker table 12 id stable", tables.find((t) => t.name === "12號枱").id, "res_prince_table_12");

  // Other businesses still have zero resources by default
  for (const id of ["beauty_demo", "restaurant_demo", "edu_demo", "igshop_demo"]) {
    eq(`${id} stays empty (no auto-seeded resources)`, store.listResources(id), []);
  }
})();

(function princeSnookerUpgradeTests() {
  // A pre-Phase-6 state file with only the 4 demos must auto-seed prince_snooker's
  // 12 tables on first load, so existing shops pick them up without manual setup.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "snooker-upgrade-"));
  const filePath = path.join(dir, "availability.json");
  fs.writeFileSync(filePath, JSON.stringify({
    businesses: {
      beauty_demo: { openingHours: { "0": [], "1": [{ open: "11:00", close: "19:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] }, closedPeriods: [], bookings: [], resources: [] },
      restaurant_demo: { openingHours: {}, closedPeriods: [], bookings: [], resources: [] },
      edu_demo: { openingHours: {}, closedPeriods: [], bookings: [], resources: [] },
      igshop_demo: { openingHours: {}, closedPeriods: [], bookings: [], resources: [] }
      // prince_snooker intentionally absent
    }
  }, null, 2));

  const store = createAvailabilityStore({ filePath });
  const seeded = store.listResources("prince_snooker");
  check("upgrade: prince_snooker auto-seeded when absent from existing file", seeded.length === 12);
  check("upgrade: existing beauty_demo resources untouched (still empty)", store.listResources("beauty_demo").length === 0);

  // Persist on first write
  store.addClosedPeriod("prince_snooker", { date: "2026-05-25", start: "11:00", end: "12:00", reason: "test" });
  const reload = createAvailabilityStore({ filePath });
  check("upgrade: seeded tables persisted after first write", reload.listResources("prince_snooker").length === 12);

  // A file that explicitly declares prince_snooker with empty resources keeps that empty state
  const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), "snooker-explicit-empty-"));
  const filePath2 = path.join(dir2, "availability.json");
  fs.writeFileSync(filePath2, JSON.stringify({
    businesses: {
      prince_snooker: { openingHours: {}, closedPeriods: [], bookings: [], resources: [] }
    }
  }, null, 2));
  const explicit = createAvailabilityStore({ filePath: filePath2 });
  eq("upgrade: explicit empty resources stays empty (no re-seed)", explicit.listResources("prince_snooker"), []);
})();

(function princeSnookerBookingTests() {
  const { store } = freshStore("snooker-bookings");

  // Booking without resourceId rejects (12 active tables)
  const noId = store.addBooking("prince_snooker", { date: "2026-05-25", time: "14:00" });
  check("snooker: addBooking without resourceId rejected", noId.ok === false && noId.error.includes("resourceId required"));

  // Booking on a real table: 60-min default
  const ok = store.addBooking("prince_snooker", { date: "2026-05-25", time: "14:00", resourceId: "res_prince_table_3" });
  check("snooker: addBooking on table 3 ok", ok.ok === true);
  eq("snooker: default durationMinutes is 60", ok.booking.durationMinutes, 60);
  eq("snooker: resourceId persisted", ok.booking.resourceId, "res_prince_table_3");
  check("snooker: no service field on booking", ok.booking.service === undefined);

  // Conflict on same table
  const conflict = store.addBooking("prince_snooker", { date: "2026-05-25", time: "14:30", resourceId: "res_prince_table_3" });
  check("snooker: overlapping booking on same table rejected", conflict.ok === false && conflict.error.includes("resource conflict"));

  // Same time on different table: ok
  const otherTable = store.addBooking("prince_snooker", { date: "2026-05-25", time: "14:00", resourceId: "res_prince_table_5" });
  check("snooker: same time on different table ok", otherTable.ok === true);

  // Out-of-hours rejection still applies (10:00 < 11:00 open)
  const tooEarly = store.addBooking("prince_snooker", { date: "2026-05-25", time: "10:00", resourceId: "res_prince_table_1" });
  check("snooker: pre-open booking rejected", tooEarly.ok === false && tooEarly.error.includes("outside opening hours"));

  // Free slot computation respects bookings
  const slots = store.listFreeSlots({ businessId: "prince_snooker", date: "2026-05-25", durationMinutes: 60, resourceId: "res_prince_table_3" });
  check("snooker: table 3 14:00 removed (booked)", !slots.freeSlots.some((s) => s.time === "14:00"));
  check("snooker: table 3 15:00 still free", slots.freeSlots.some((s) => s.time === "15:00"));

  // Any-available: 14:00 still free because tables 1, 2, 4, 6-12 are free
  const any = store.listFreeSlots({ businessId: "prince_snooker", date: "2026-05-25", durationMinutes: 60 });
  const fourteen = any.freeSlots.find((s) => s.time === "14:00");
  check("snooker: any-available 14:00 lists 10 free tables", fourteen && fourteen.availableResources.length === 10);
})();

console.log(`availabilityStore: ${testCount} tests passed`);
