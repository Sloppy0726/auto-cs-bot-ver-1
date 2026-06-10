"use strict";

// Availability store v2: opening-hours + closed-periods + bookings.
// All time-of-day fields are HH:MM (24h). Dates are YYYY-MM-DD.
// Free slots = (opening windows on this date) − (closed periods on this date) − (existing bookings on this date),
// then sliced into 30-minute starting points where the requested service duration fits.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const DEFAULT_FILE = path.join(__dirname, "..", "state", "availability.json");
const VALID_BUSINESS_IDS = new Set(["beauty_demo", "restaurant_demo", "edu_demo", "igshop_demo", "prince_snooker"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^\d{2}:\d{2}$/;
const SLOT_STEP_MINUTES = 30;
const RESOURCE_NAME_MAX = 80;
const PRINCE_SNOOKER_TABLE_COUNT = 12;

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
        bookings: [],
        resources: []
      };
    }
    if (!Array.isArray(state.businesses[businessId].resources)) {
      state.businesses[businessId].resources = [];
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
    return withLock(filePath, () => {
      const state = loadAll();
      ensureBusiness(state, businessId).openingHours = validated.hours;
      saveAll(state);
      return { ok: true, openingHours: validated.hours };
    });
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
    return withLock(filePath, () => {
      const state = loadAll();
      const record = v.period;
      record.id = record.id || newId("close");
      ensureBusiness(state, businessId).closedPeriods.push(record);
      saveAll(state);
      return { ok: true, period: record };
    });
  }

  function removeClosedPeriod(businessId, id) {
    return withLock(filePath, () => {
      const state = loadAll();
      const arr = state.businesses[businessId]?.closedPeriods || [];
      const idx = arr.findIndex((p) => p.id === id);
      if (idx === -1) return { ok: false, error: "closed period not found" };
      const [removed] = arr.splice(idx, 1);
      saveAll(state);
      return { ok: true, period: removed };
    });
  }

  // ---- Bookings ----
  function listBookings(businessId) {
    const state = loadAll();
    return state.businesses[businessId]?.bookings || [];
  }

  function addBooking(businessId, booking) {
    const v = validateBooking(businessId, booking);
    if (v.error) return { ok: false, error: v.error };
    return withLock(filePath, () => {
      const state = loadAll();
      const resReq = checkBookingResourceRequirement(state, businessId, v.booking);
      if (!resReq.ok) return { ok: false, error: resReq.error };
      const overlap = checkBookingResourceOverlap(state, businessId, v.booking);
      if (!overlap.ok) return { ok: false, error: overlap.error };
      const fit = checkBookingFitsOpeningHours(state, businessId, v.booking);
      if (!fit.ok) return { ok: false, error: fit.error };
      const record = v.booking;
      record.id = record.id || newId("book");
      ensureBusiness(state, businessId).bookings.push(record);
      saveAll(state);
      return { ok: true, booking: record };
    });
  }

  function updateBooking(businessId, id, patch) {
    return withLock(filePath, () => {
      const state = loadAll();
      const arr = state.businesses[businessId]?.bookings || [];
      const idx = arr.findIndex((b) => b.id === id);
      if (idx === -1) return { ok: false, error: "booking not found" };
      const merged = { ...arr[idx], ...patch, id };
      const v = validateBooking(businessId, merged);
      if (v.error) return { ok: false, error: v.error };
      const resReq = checkBookingResourceRequirement(state, businessId, v.booking);
      if (!resReq.ok) return { ok: false, error: resReq.error };
      const overlap = checkBookingResourceOverlap(state, businessId, v.booking, id);
      if (!overlap.ok) return { ok: false, error: overlap.error };
      const fit = checkBookingFitsOpeningHours(state, businessId, v.booking);
      if (!fit.ok) return { ok: false, error: fit.error };
      arr[idx] = v.booking;
      saveAll(state);
      return { ok: true, booking: v.booking };
    });
  }

  function removeBooking(businessId, id) {
    return withLock(filePath, () => {
      const state = loadAll();
      const arr = state.businesses[businessId]?.bookings || [];
      const idx = arr.findIndex((b) => b.id === id);
      if (idx === -1) return { ok: false, error: "booking not found" };
      const [removed] = arr.splice(idx, 1);
      saveAll(state);
      return { ok: true, booking: removed };
    });
  }

  // ---- Resources (per-business stylists / tables / rooms) ----
  // Backwards compatible: a business with zero resources keeps the existing
  // single-pool free-slot behavior. Resources are surfaced to Phase 2 logic.
  function listResources(businessId, { includeInactive = true } = {}) {
    const state = loadAll();
    const arr = state.businesses[businessId]?.resources || [];
    return includeInactive ? arr.slice() : arr.filter((r) => r.active !== false);
  }

  function getResource(businessId, id) {
    const arr = listResources(businessId);
    return arr.find((r) => r.id === id) || null;
  }

  function addResource(businessId, resource) {
    if (!VALID_BUSINESS_IDS.has(businessId)) return { ok: false, error: `unknown businessId: ${businessId}` };
    const v = validateResource(resource);
    if (v.error) return { ok: false, error: v.error };
    return withLock(filePath, () => {
      const state = loadAll();
      const record = v.resource;
      record.id = record.id || newId("res");
      ensureBusiness(state, businessId).resources.push(record);
      saveAll(state);
      return { ok: true, resource: record };
    });
  }

  function updateResource(businessId, id, patch) {
    return withLock(filePath, () => {
      const state = loadAll();
      const arr = state.businesses[businessId]?.resources || [];
      const idx = arr.findIndex((r) => r.id === id);
      if (idx === -1) return { ok: false, error: "resource not found" };
      const merged = { ...arr[idx], ...patch, id };
      const v = validateResource(merged);
      if (v.error) return { ok: false, error: v.error };
      arr[idx] = v.resource;
      saveAll(state);
      return { ok: true, resource: v.resource };
    });
  }

  function removeResource(businessId, id) {
    // Soft delete so existing bookings that reference this resourceId still resolve.
    return updateResource(businessId, id, { active: false });
  }

  // ---- Free slot computation ----
  // Three paths:
  // 1. Specific resourceId requested → compute against that resource's effective hours
  //    (resource.openingHours ∩ business.openingHours) minus its own bookings + pool bookings + closed periods.
  // 2. No resourceId but the business has ≥1 active resource → "any-available": a slot is free if
  //    at least one active resource is free at that time. Each free slot carries
  //    `availableResources: [resourceId,…]` so the pipeline can show "any" and the booking write can pick.
  // 3. No resourceId and zero active resources → legacy single-pool path (unchanged shape).
  function listFreeSlots({ businessId, date, service, durationMinutes, partySize, resourceId } = {}) {
    if (!businessId || !date || !ISO_DATE.test(date)) {
      return { found: false, freeSlots: [], reason: "businessId and ISO date required" };
    }
    const state = loadAll();
    const dow = dayOfWeek(date);
    const bizWindows = openWindowsForBusiness(state, businessId, dow);
    const sessionDuration = Number(durationMinutes) || defaultDurationForService(service);

    const closed = (state.businesses?.[businessId]?.closedPeriods || [])
      .filter((p) => p.date === date)
      .map((c) => ({ start: toMinutes(c.start), end: toMinutes(c.end) }));

    const allBookings = (state.businesses?.[businessId]?.bookings || [])
      .filter((b) => b.date === date)
      .filter((b) => businessId !== "restaurant_demo" || !partySize || Number(b.partySize) === Number(partySize))
      .filter((b) => businessId !== "beauty_demo" || !service || !b.service || b.service === service);

    if (resourceId) {
      const resource = (state.businesses?.[businessId]?.resources || []).find((r) => r.id === resourceId);
      if (!resource) return { found: false, freeSlots: [], reason: `resource not found: ${resourceId}` };
      const effective = effectiveWindowsForResource(bizWindows, resource, dow);
      if (effective.length === 0) {
        return { found: true, freeSlots: [], reason: "closed on this date" };
      }
      const blockers = closed.concat(bookingsAsBlockers(allBookings.filter((b) => !b.resourceId || b.resourceId === resourceId)));
      const open = subtractMany(effective, blockers);
      const free = walkFreeStarts(open, sessionDuration).map((t) => ({
        time: fromMinutes(t),
        durationMinutes: sessionDuration,
        endTime: fromMinutes(t + sessionDuration),
        resourceId,
        availableResources: [resourceId]
      }));
      return { found: true, freeSlots: free, reason: `${free.length} free start time(s)` };
    }

    const actives = activeResources(state, businessId);

    if (actives.length === 0) {
      if (bizWindows.length === 0) {
        return { found: true, freeSlots: [], reason: "closed on this date" };
      }
      const blockers = closed.concat(bookingsAsBlockers(allBookings));
      const open = subtractMany(bizWindows, blockers);
      const free = walkFreeStarts(open, sessionDuration).map((t) => ({
        time: fromMinutes(t),
        durationMinutes: sessionDuration,
        endTime: fromMinutes(t + sessionDuration)
      }));
      return { found: true, freeSlots: free, reason: `${free.length} free start time(s)` };
    }

    // Any-available path: union of per-resource free start times.
    const perResource = actives.map((resource) => {
      const effective = effectiveWindowsForResource(bizWindows, resource, dow);
      if (effective.length === 0) return { resource, starts: new Set() };
      // Pool bookings (no resourceId) block every resource. Per-resource bookings only block their own resource.
      const ownBookings = allBookings.filter((b) => !b.resourceId || b.resourceId === resource.id);
      const blockers = closed.concat(bookingsAsBlockers(ownBookings));
      const open = subtractMany(effective, blockers);
      return { resource, starts: new Set(walkFreeStarts(open, sessionDuration)) };
    });

    const allStarts = new Set();
    for (const r of perResource) for (const t of r.starts) allStarts.add(t);
    const sortedStarts = [...allStarts].sort((a, b) => a - b);

    const free = sortedStarts.map((t) => ({
      time: fromMinutes(t),
      durationMinutes: sessionDuration,
      endTime: fromMinutes(t + sessionDuration),
      availableResources: perResource.filter((r) => r.starts.has(t)).map((r) => r.resource.id)
    }));

    return {
      found: true,
      freeSlots: free,
      reason: `${free.length} free start time(s) across ${actives.length} resource(s)`
    };
  }

  function findNextAvailableDates({ businessId, fromDate, service, partySize, durationMinutes, resourceId, maxDays = 7, maxResults = 3 } = {}) {
    if (!businessId || !fromDate || !ISO_DATE.test(fromDate)) return [];
    const out = [];
    for (let i = 1; i <= maxDays && out.length < maxResults; i++) {
      const date = shiftDateStr(fromDate, i);
      const result = listFreeSlots({ businessId, date, service, partySize, durationMinutes, resourceId });
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
    withLock(filePath, () => saveAll(buildInitialState()));
  }

  return {
    getOpeningHours, setOpeningHours,
    listClosedPeriods, addClosedPeriod, removeClosedPeriod,
    listBookings, addBooking, updateBooking, removeBooking,
    listResources, getResource, addResource, updateResource, removeResource,
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
      bookings: [],
      resources: defaultResourcesFor(id)
    };
  }
  return { businesses };
}

function defaultResourcesFor(businessId) {
  if (businessId !== "prince_snooker") return [];
  const out = [];
  for (let i = 1; i <= PRINCE_SNOOKER_TABLE_COUNT; i++) {
    out.push({ id: `res_prince_table_${i}`, name: `${i}號枱`, active: true });
  }
  return out;
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
  if (businessId === "prince_snooker") {
    // Typical HK snooker hall: open every day 11:00 to late evening. Schema can't
    // span midnight, so we cap at 23:30 (last booking slot starts before then).
    const window = [{ open: "11:00", close: "23:30" }];
    return { "0": window, "1": window, "2": window, "3": window, "4": window, "5": window, "6": window };
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
    const present = Object.prototype.hasOwnProperty.call(businesses, id);
    const record = present ? businesses[id] : {};
    out.businesses[id] = {
      openingHours: normalizeOpeningHours(record.openingHours, id),
      closedPeriods: Array.isArray(record.closedPeriods)
        ? record.closedPeriods.map((p) => ({ ...p, id: p.id || newId("close") }))
        : [],
      bookings: Array.isArray(record.bookings)
        ? record.bookings.map((b) => ({ ...b, id: b.id || newId("book") }))
        : [],
      // Businesses absent from the loaded file get the default resource seed —
      // this is the one-time upgrade path so existing shops pick up prince_snooker's
      // 12 tables on first load of the new code. Once persisted, the file is the
      // source of truth.
      resources: Array.isArray(record.resources)
        ? record.resources.map((r) => normalizeResource(r)).filter((r) => r !== null)
        : (present ? [] : defaultResourcesFor(id))
    };
  }
  return out;
}

function normalizeResource(resource) {
  if (!resource || typeof resource !== "object") return null;
  const name = String(resource.name || "").trim();
  if (!name) return null;
  const out = {
    id: resource.id || newId("res"),
    name: name.slice(0, RESOURCE_NAME_MAX),
    active: resource.active !== false
  };
  if (resource.openingHours && typeof resource.openingHours === "object") {
    const normalized = {};
    for (let d = 0; d < 7; d++) {
      const key = String(d);
      const arr = Array.isArray(resource.openingHours[key]) ? resource.openingHours[key] : [];
      normalized[key] = arr
        .filter((w) => w && HHMM.test(w.open) && HHMM.test(w.close) && toMinutes(w.close) > toMinutes(w.open))
        .map((w) => ({ open: w.open, close: w.close }))
        .sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
    }
    out.openingHours = normalized;
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
  } else if (businessId === "prince_snooker") {
    // Snooker booking: per-table. No service, no partySize. Default 60-min sessions.
    const dur = out.durationMinutes != null && out.durationMinutes !== "" ? Number(out.durationMinutes) : 60;
    if (!Number.isInteger(dur) || dur < 5 || dur > 240) return { error: "durationMinutes must be 5-240" };
    out.durationMinutes = dur;
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
  if (out.resourceId != null && out.resourceId !== "") {
    out.resourceId = String(out.resourceId);
  } else {
    delete out.resourceId;
  }
  return { booking: out };
}

function validateResource(resource) {
  if (!resource || typeof resource !== "object") return { error: "resource payload required" };
  const name = String(resource.name || "").trim();
  if (!name) return { error: "name is required" };
  if (name.length > RESOURCE_NAME_MAX) return { error: `name must be ≤ ${RESOURCE_NAME_MAX} chars` };
  const out = {
    id: resource.id,
    name,
    active: resource.active === false ? false : true
  };
  if (resource.openingHours != null) {
    const v = validateOpeningHours(resource.openingHours);
    if (v.error) return { error: `openingHours: ${v.error}` };
    out.openingHours = v.hours;
  }
  return { resource: out };
}

function checkBookingFitsOpeningHours(state, businessId, booking) {
  const dow = dayOfWeek(booking.date);
  const bizWindows = openWindowsForBusiness(state, businessId, dow);
  let windows = bizWindows;
  let scope = businessId;
  if (booking.resourceId) {
    const resource = (state.businesses?.[businessId]?.resources || []).find((r) => r.id === booking.resourceId);
    if (resource) {
      windows = effectiveWindowsForResource(bizWindows, resource, dow);
      scope = `${businessId} resource ${resource.name || resource.id}`;
    }
  }
  if (windows.length === 0) {
    return { ok: false, error: `outside opening hours: ${scope} is closed on ${booking.date}` };
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

function openWindowsForBusiness(state, businessId, dow) {
  const hours = (state.businesses?.[businessId]?.openingHours) || defaultOpeningHours(businessId);
  return (hours[String(dow)] || []).map((w) => ({ start: toMinutes(w.open), end: toMinutes(w.close) }));
}

function effectiveWindowsForResource(bizWindows, resource, dow) {
  if (!resource || !resource.openingHours) return bizWindows;
  const resHours = resource.openingHours[String(dow)];
  if (!Array.isArray(resHours)) return bizWindows;
  const resWindows = resHours.map((w) => ({ start: toMinutes(w.open), end: toMinutes(w.close) }));
  return intersectWindows(bizWindows, resWindows);
}

function intersectWindows(a, b) {
  const out = [];
  for (const x of a) {
    for (const y of b) {
      const start = Math.max(x.start, y.start);
      const end = Math.min(x.end, y.end);
      if (end > start) out.push({ start, end });
    }
  }
  return out.sort((p, q) => p.start - q.start);
}

function activeResources(state, businessId) {
  return (state.businesses?.[businessId]?.resources || []).filter((r) => r.active !== false);
}

function bookingsAsBlockers(bookings) {
  return bookings.map((b) => ({
    start: toMinutes(b.time),
    end: toMinutes(b.time) + (Number(b.durationMinutes) || 30)
  }));
}

function walkFreeStarts(openWindows, sessionDuration) {
  const out = [];
  for (const w of openWindows) {
    const first = ceilTo(w.start, SLOT_STEP_MINUTES);
    for (let t = first; t + sessionDuration <= w.end; t += SLOT_STEP_MINUTES) {
      out.push(t);
    }
  }
  return out;
}

// When a business has ≥1 active resource, every new booking must pin to one.
// Bookings without a resourceId in such a business are pool bookings — created
// in earlier sessions before this requirement landed — and remain valid as
// global blockers, but new writes must specify a resource.
function checkBookingResourceRequirement(state, businessId, booking) {
  const actives = activeResources(state, businessId);
  if (actives.length === 0) return { ok: true };
  if (!booking.resourceId) {
    return { ok: false, error: `resourceId required: ${businessId} has ${actives.length} active resource(s)` };
  }
  const found = actives.find((r) => r.id === booking.resourceId);
  if (!found) {
    return { ok: false, error: `resourceId not found or inactive: ${booking.resourceId}` };
  }
  return { ok: true, resource: found };
}

// Two bookings on the same date with the same resourceId whose time ranges overlap
// are a conflict. Pool bookings (no resourceId) skip this — they're handled by
// the legacy free-slot subtraction path.
function checkBookingResourceOverlap(state, businessId, booking, excludeId) {
  if (!booking.resourceId) return { ok: true };
  const startMin = toMinutes(booking.time);
  const endMin = startMin + Number(booking.durationMinutes || 30);
  const others = (state.businesses?.[businessId]?.bookings || [])
    .filter((b) => b.id !== excludeId)
    .filter((b) => b.date === booking.date && b.resourceId === booking.resourceId);
  for (const b of others) {
    const bStart = toMinutes(b.time);
    const bEnd = bStart + Number(b.durationMinutes || 30);
    if (startMin < bEnd && bStart < endMin) {
      return { ok: false, error: `resource conflict: ${booking.resourceId} already booked ${b.time}-${fromMinutes(bEnd)} on ${b.date} (id ${b.id})` };
    }
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

// Cross-process mutual exclusion for the load→check→save cycle. Node is
// single-threaded, so within one process these mutations already serialize on
// the event loop. But the bot server and the WhatsApp bridge can run as
// separate processes sharing this JSON file; without a lock their read-modify-
// write cycles would clobber each other (last-writer-wins loses bookings) and
// two concurrent writers could both pass the overlap check and double-book the
// same resource (TOCTOU). A lockfile plus a brief synchronous spin gives a
// correct critical section for this low-traffic store.
function acquireLock(lockPath) {
  const start = Date.now();
  for (;;) {
    try {
      fs.mkdirSync(path.dirname(lockPath), { recursive: true });
      return fs.openSync(lockPath, "wx");
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      // Reclaim a stale lock left by a crashed holder.
      try {
        if (Date.now() - fs.statSync(lockPath).mtimeMs > 10_000) {
          fs.unlinkSync(lockPath);
          continue;
        }
      } catch { /* lock vanished between stat and unlink; just retry */ }
      if (Date.now() - start > 5_000) throw new Error("availability store busy");
      const until = Date.now() + 20;
      while (Date.now() < until) { /* brief spin under contention */ }
    }
  }
}

function withLock(filePath, fn) {
  const fd = acquireLock(`${filePath}.lock`);
  try {
    return fn();
  } finally {
    try { fs.closeSync(fd); } catch { /* ignore */ }
    try { fs.unlinkSync(`${filePath}.lock`); } catch { /* ignore */ }
  }
}

module.exports = {
  createAvailabilityStore,
  defaultDurationForService,
  defaultOpeningHours,
  _internal: {
    validateOpeningHours, validateClosedPeriod, validateBooking, validateResource,
    normalizeState, normalizeResource, buildInitialState, subtractOne, subtractMany,
    toMinutes, fromMinutes, dayOfWeek, checkBookingFitsOpeningHours,
    intersectWindows, effectiveWindowsForResource, activeResources,
    checkBookingResourceRequirement, checkBookingResourceOverlap
  }
};
