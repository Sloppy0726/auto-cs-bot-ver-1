"use strict";

// Availability store v2: opening-hours + closed-periods + bookings.
// All time-of-day fields are HH:MM (24h). Dates are YYYY-MM-DD.
// Free slots = (opening windows on this date) − (closed periods on this date) − (existing bookings on this date),
// then sliced into 30-minute starting points where the requested service duration fits.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const DEFAULT_FILE = path.join(__dirname, "..", "state", "availability.json");
const VALID_BUSINESS_IDS = new Set(["beauty_demo", "restaurant_demo", "edu_demo", "igshop_demo"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^\d{2}:\d{2}$/;
const SLOT_STEP_MINUTES = 30;

function createAvailabilityStore(options = {}) {
  const filePath = options.filePath || DEFAULT_FILE;

  function ensureFile() {
    if (fs.existsSync(filePath)) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    atomicWrite(filePath, buildInitialState());
  }

  function loadAll() {
    ensureFile();
    try {
      return normalizeState(JSON.parse(fs.readFileSync(filePath, "utf8")));
    } catch {
      return buildInitialState();
    }
  }

  function saveAll(state) {
    atomicWrite(filePath, normalizeState(state));
  }

  function ensureBusiness(state, businessId) {
    if (!state.businesses[businessId]) {
      state.businesses[businessId] = {
        openingHours: defaultOpeningHours(businessId),
        closedPeriods: [],
        bookings: []
      };
    }
    return state.businesses[businessId];
  }

  // ---- Opening hours ----
  function getOpeningHours(businessId) {
    const state = loadAll();
    return state.businesses[businessId]?.openingHours || defaultOpeningHours(businessId);
  }

  function setOpeningHours(businessId, hours) {
    if (!VALID_BUSINESS_IDS.has(businessId)) return { ok: false, error: `unknown businessId: ${businessId}` };
    const validated = validateOpeningHours(hours);
    if (validated.error) return { ok: false, error: validated.error };
    const state = loadAll();
    ensureBusiness(state, businessId).openingHours = validated.hours;
    saveAll(state);
    return { ok: true, openingHours: validated.hours };
  }

  // ---- Closed periods (one-off blocks) ----
  function listClosedPeriods(businessId) {
    const state = loadAll();
    return state.businesses[businessId]?.closedPeriods || [];
  }

  function addClosedPeriod(businessId, period) {
    if (!VALID_BUSINESS_IDS.has(businessId)) return { ok: false, error: `unknown businessId: ${businessId}` };
    const v = validateClosedPeriod(period);
    if (v.error) return { ok: false, error: v.error };
    const state = loadAll();
    const record = v.period;
    record.id = record.id || newId("close");
    ensureBusiness(state, businessId).closedPeriods.push(record);
    saveAll(state);
    return { ok: true, period: record };
  }

  function removeClosedPeriod(businessId, id) {
    const state = loadAll();
    const arr = state.businesses[businessId]?.closedPeriods || [];
    const idx = arr.findIndex((p) => p.id === id);
    if (idx === -1) return { ok: false, error: "closed period not found" };
    const [removed] = arr.splice(idx, 1);
    saveAll(state);
    return { ok: true, period: removed };
  }

  // ---- Bookings ----
  function listBookings(businessId) {
    const state = loadAll();
    return state.businesses[businessId]?.bookings || [];
  }

  function addBooking(businessId, booking) {
    const v = validateBooking(businessId, booking);
    if (v.error) return { ok: false, error: v.error };
    const state = loadAll();
    const fit = checkBookingFitsOpeningHours(state, businessId, v.booking);
    if (!fit.ok) return { ok: false, error: fit.error };
    const record = v.booking;
    record.id = record.id || newId("book");
    ensureBusiness(state, businessId).bookings.push(record);
    saveAll(state);
    return { ok: true, booking: record };
  }

  function updateBooking(businessId, id, patch) {
    const state = loadAll();
    const arr = state.businesses[businessId]?.bookings || [];
    const idx = arr.findIndex((b) => b.id === id);
    if (idx === -1) return { ok: false, error: "booking not found" };
    const merged = { ...arr[idx], ...patch, id };
    const v = validateBooking(businessId, merged);
    if (v.error) return { ok: false, error: v.error };
    const fit = checkBookingFitsOpeningHours(state, businessId, v.booking);
    if (!fit.ok) return { ok: false, error: fit.error };
    arr[idx] = v.booking;
    saveAll(state);
    return { ok: true, booking: v.booking };
  }

  function removeBooking(businessId, id) {
    const state = loadAll();
    const arr = state.businesses[businessId]?.bookings || [];
    const idx = arr.findIndex((b) => b.id === id);
    if (idx === -1) return { ok: false, error: "booking not found" };
    const [removed] = arr.splice(idx, 1);
    saveAll(state);
    return { ok: true, booking: removed };
  }

  // ---- Free slot computation ----
  function listFreeSlots({ businessId, date, service, durationMinutes, partySize } = {}) {
    if (!businessId || !date || !ISO_DATE.test(date)) {
      return { found: false, freeSlots: [], reason: "businessId and ISO date required" };
    }
    const hours = getOpeningHours(businessId);
    const dow = dayOfWeek(date);
    const windows = (hours[String(dow)] || []).map((w) => ({ start: toMinutes(w.open), end: toMinutes(w.close) }));
    if (windows.length === 0) {
      return { found: true, freeSlots: [], reason: "closed on this date" };
    }

    const closed = listClosedPeriods(businessId)
      .filter((p) => p.date === date)
      .map((c) => ({ start: toMinutes(c.start), end: toMinutes(c.end) }));

    const bookings = listBookings(businessId)
      .filter((b) => b.date === date)
      .filter((b) => businessId !== "restaurant_demo" || !partySize || Number(b.partySize) === Number(partySize))
      .filter((b) => businessId !== "beauty_demo" || !service || !b.service || b.service === service)
      .map((b) => ({ start: toMinutes(b.time), end: toMinutes(b.time) + (Number(b.durationMinutes) || 30) }));

    const open = subtractMany(windows, closed.concat(bookings));

    const sessionDuration = Number(durationMinutes) || defaultDurationForService(service);
    const free = [];
    for (const w of open) {
      const first = ceilTo(w.start, SLOT_STEP_MINUTES);
      for (let t = first; t + sessionDuration <= w.end; t += SLOT_STEP_MINUTES) {
        free.push({ time: fromMinutes(t), durationMinutes: sessionDuration, endTime: fromMinutes(t + sessionDuration) });
      }
    }

    return {
      found: true,
      freeSlots: free,
      reason: `${free.length} free start time(s)`
    };
  }

  function findNextAvailableDates({ businessId, fromDate, service, partySize, durationMinutes, maxDays = 7, maxResults = 3 } = {}) {
    if (!businessId || !fromDate || !ISO_DATE.test(fromDate)) return [];
    const out = [];
    for (let i = 1; i <= maxDays && out.length < maxResults; i++) {
      const date = shiftDateStr(fromDate, i);
      const result = listFreeSlots({ businessId, date, service, partySize, durationMinutes });
      const slots = Array.isArray(result.freeSlots) ? result.freeSlots : [];
      if (slots.length > 0) {
        out.push({ date, freeCount: slots.length, firstSlot: slots[0] });
      }
    }
    return out;
  }

  function listAll() {
    return loadAll().businesses;
  }

  function reset() {
    saveAll(buildInitialState());
  }

  return {
    getOpeningHours, setOpeningHours,
    listClosedPeriods, addClosedPeriod, removeClosedPeriod,
    listBookings, addBooking, updateBooking, removeBooking,
    listFreeSlots, findNextAvailableDates,
    listAll, reset,
    _filePath: filePath
  };
}

function shiftDateStr(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ----------- helpers / defaults -----------

function buildInitialState() {
  const businesses = {};
  for (const id of VALID_BUSINESS_IDS) {
    businesses[id] = {
      openingHours: defaultOpeningHours(id),
      closedPeriods: [],
      bookings: []
    };
  }
  return { businesses };
}

function defaultOpeningHours(businessId) {
  if (businessId === "beauty_demo") {
    // Mon-Sat 11:00-21:00, Sun 11:00-19:00 (matches KB)
    return {
      "0": [{ open: "11:00", close: "19:00" }],
      "1": [{ open: "11:00", close: "21:00" }],
      "2": [{ open: "11:00", close: "21:00" }],
      "3": [{ open: "11:00", close: "21:00" }],
      "4": [{ open: "11:00", close: "21:00" }],
      "5": [{ open: "11:00", close: "21:00" }],
      "6": [{ open: "11:00", close: "21:00" }]
    };
  }
  if (businessId === "restaurant_demo") {
    return {
      "0": [{ open: "11:30", close: "22:00" }],
      "1": [{ open: "11:30", close: "22:30" }],
      "2": [{ open: "11:30", close: "22:30" }],
      "3": [{ open: "11:30", close: "22:30" }],
      "4": [{ open: "11:30", close: "22:30" }],
      "5": [{ open: "11:30", close: "23:00" }],
      "6": [{ open: "11:30", close: "23:00" }]
    };
  }
  if (businessId === "edu_demo") {
    return {
      "0": [],
      "1": [{ open: "14:00", close: "20:00" }],
      "2": [{ open: "14:00", close: "20:00" }],
      "3": [{ open: "14:00", close: "20:00" }],
      "4": [{ open: "14:00", close: "20:00" }],
      "5": [{ open: "14:00", close: "20:00" }],
      "6": [{ open: "10:00", close: "18:00" }]
    };
  }
  // igshop_demo or unknown: closed all days (no slot booking)
  return { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] };
}

function defaultDurationForService(service) {
  const map = { facial: 75, laser: 30, assessment: 20, p3_english: 45 };
  return map[service] || 30;
}

function normalizeState(state) {
  const out = { businesses: {} };
  const businesses = state && typeof state.businesses === "object" && state.businesses !== null ? state.businesses : {};
  for (const id of VALID_BUSINESS_IDS) {
    const record = businesses[id] || {};
    out.businesses[id] = {
      openingHours: normalizeOpeningHours(record.openingHours, id),
      closedPeriods: Array.isArray(record.closedPeriods)
        ? record.closedPeriods.map((p) => ({ ...p, id: p.id || newId("close") }))
        : [],
      bookings: Array.isArray(record.bookings)
        ? record.bookings.map((b) => ({ ...b, id: b.id || newId("book") }))
        : []
    };
  }
  return out;
}

function normalizeOpeningHours(hours, businessId) {
  if (!hours || typeof hours !== "object") return defaultOpeningHours(businessId);
  const out = {};
  for (let d = 0; d < 7; d++) {
    const key = String(d);
    const arr = Array.isArray(hours[key]) ? hours[key] : [];
    out[key] = arr
      .filter((w) => w && HHMM.test(w.open) && HHMM.test(w.close) && toMinutes(w.close) > toMinutes(w.open))
      .map((w) => ({ open: w.open, close: w.close }))
      .sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
  }
  return out;
}

function validateOpeningHours(hours) {
  if (!hours || typeof hours !== "object") return { error: "openingHours must be an object" };
  const out = {};
  for (let d = 0; d < 7; d++) {
    const key = String(d);
    const arr = hours[key];
    if (arr == null) { out[key] = []; continue; }
    if (!Array.isArray(arr)) return { error: `day ${d}: must be an array of windows` };
    const cleaned = [];
    for (const w of arr) {
      if (!w || typeof w !== "object") return { error: `day ${d}: each window must be an object` };
      if (!HHMM.test(String(w.open || ""))) return { error: `day ${d}: open must be HH:MM` };
      if (!HHMM.test(String(w.close || ""))) return { error: `day ${d}: close must be HH:MM` };
      if (toMinutes(w.close) <= toMinutes(w.open)) return { error: `day ${d}: close must be after open` };
      cleaned.push({ open: w.open, close: w.close });
    }
    cleaned.sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
    out[key] = cleaned;
  }
  return { hours: out };
}

function validateClosedPeriod(period) {
  if (!period || typeof period !== "object") return { error: "period payload required" };
  if (!period.date || !ISO_DATE.test(String(period.date))) return { error: "date must be YYYY-MM-DD" };
  if (!period.start || !HHMM.test(String(period.start))) return { error: "start must be HH:MM" };
  if (!period.end || !HHMM.test(String(period.end))) return { error: "end must be HH:MM" };
  if (toMinutes(period.end) <= toMinutes(period.start)) return { error: "end must be after start" };
  return {
    period: {
      id: period.id,
      date: period.date,
      start: period.start,
      end: period.end,
      reason: String(period.reason || "").slice(0, 200)
    }
  };
}

function validateBooking(businessId, booking) {
  if (!VALID_BUSINESS_IDS.has(businessId)) return { error: `unknown businessId: ${businessId}` };
  if (!booking || typeof booking !== "object") return { error: "booking payload required" };
  const out = { ...booking };
  if (!out.date || !ISO_DATE.test(String(out.date))) return { error: "date must be YYYY-MM-DD" };
  if (!out.time || !HHMM.test(String(out.time))) return { error: "time must be HH:MM" };
  if (businessId === "restaurant_demo") {
    const size = Number(out.partySize);
    if (!Number.isInteger(size) || size <= 0 || size > 20) return { error: "partySize must be 1-20" };
    out.partySize = size;
    const dur = out.durationMinutes != null && out.durationMinutes !== "" ? Number(out.durationMinutes) : 90;
    if (!Number.isInteger(dur) || dur < 5 || dur > 240) return { error: "durationMinutes must be 5-240" };
    out.durationMinutes = dur;
  } else if (businessId === "igshop_demo") {
    return { error: "igshop_demo does not support bookings" };
  } else {
    if (!out.service || typeof out.service !== "string") return { error: "service is required" };
    const dur = out.durationMinutes != null && out.durationMinutes !== ""
      ? Number(out.durationMinutes)
      : defaultDurationForService(out.service);
    if (!Number.isInteger(dur) || dur < 5 || dur > 240) return { error: "durationMinutes must be 5-240" };
    out.durationMinutes = dur;
  }
  if (out.customer != null) out.customer = String(out.customer).slice(0, 200);
  if (out.notes != null) out.notes = String(out.notes).slice(0, 500);
  return { booking: out };
}

function checkBookingFitsOpeningHours(state, businessId, booking) {
  const hours = (state.businesses?.[businessId]?.openingHours) || defaultOpeningHours(businessId);
  const dow = dayOfWeek(booking.date);
  const windows = (hours[String(dow)] || []).map((w) => ({ start: toMinutes(w.open), end: toMinutes(w.close) }));
  if (windows.length === 0) {
    return { ok: false, error: `outside opening hours: ${businessId} is closed on ${booking.date}` };
  }

  const closed = (state.businesses?.[businessId]?.closedPeriods || [])
    .filter((p) => p.date === booking.date)
    .map((c) => ({ start: toMinutes(c.start), end: toMinutes(c.end) }));

  const open = subtractMany(windows, closed);
  const startMin = toMinutes(booking.time);
  const endMin = startMin + Number(booking.durationMinutes || 30);

  const fits = open.some((w) => startMin >= w.start && endMin <= w.end);
  if (!fits) {
    const windowList = open.length === 0
      ? "no open window on this date"
      : open.map((w) => `${fromMinutes(w.start)}-${fromMinutes(w.end)}`).join(", ");
    return { ok: false, error: `outside opening hours: ${booking.time}-${fromMinutes(endMin)} not within open window(s) on ${booking.date} (open: ${windowList})` };
  }
  return { ok: true };
}

function dayOfWeek(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay();
}

function toMinutes(timeStr) {
  const parts = String(timeStr || "").split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : 0;
}

function fromMinutes(total) {
  const h = Math.floor(total / 60) % 24;
  const m = ((total % 60) + 60) % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

function ceilTo(value, step) {
  return Math.ceil(value / step) * step;
}

function subtractMany(windows, blocks) {
  let result = windows.map((w) => ({ ...w }));
  for (const block of blocks) {
    result = result.flatMap((w) => subtractOne(w, block));
  }
  return result.filter((w) => w.end > w.start);
}

function subtractOne(window, block) {
  if (block.end <= window.start || block.start >= window.end) return [{ ...window }];
  const out = [];
  if (window.start < block.start) out.push({ start: window.start, end: block.start });
  if (block.end < window.end) out.push({ start: block.end, end: window.end });
  return out;
}

function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function atomicWrite(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify(contents, null, 2));
  fs.renameSync(tmp, filePath);
}

module.exports = {
  createAvailabilityStore,
  defaultDurationForService,
  defaultOpeningHours,
  _internal: {
    validateOpeningHours, validateClosedPeriod, validateBooking,
    normalizeState, buildInitialState, subtractOne, subtractMany,
    toMinutes, fromMinutes, dayOfWeek, checkBookingFitsOpeningHours
  }
};
