"use strict";

// Admin HTTP endpoint integration tests.
// Wires a tmp-file-backed availabilityStore into a real http server and exercises
// /admin/opening-hours, /admin/closed-periods, /admin/bookings, /admin/store.

const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createWebhookServer } = require("../src/server");
const { createAvailabilityStore } = require("../../private business backend mock ver 1.0/src/availabilityStore");
const { createStaffInbox } = require("../../staff inbox ver 1.0/src/staffInbox");
const { createOutboxStore } = require("../../channel adapter ver 1.0/src/outboxStore");

let testCount = 0;
function check(label, condition, detail) {
  testCount++;
  assert.ok(condition, detail ? `${label}: ${detail}` : label);
}
function eq(label, actual, expected) {
  testCount++;
  assert.deepEqual(actual, expected, label);
}

const stubPipeline = { async runMessage() { return { finalStatus: "ready_to_send", outbound: { status: "ready_to_send", payload: { text: "ok" } }, staffItem: null, decision: { action: "auto_send" } }; } };

function freshServer({ adminToken, nodeEnv, withInbox, withOutbox } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "admin-test-"));
  const filePath = path.join(dir, "availability.json");
  const store = createAvailabilityStore({ filePath });
  const inbox = withInbox ? createStaffInbox() : null;
  const outboxStore = withOutbox ? createOutboxStore({ filePath: path.join(dir, "outbox.json") }) : null;
  const server = createWebhookServer({
    pipeline: stubPipeline,
    availabilityStore: store,
    staffInbox: inbox,
    outboxStore,
    adminToken,
    nodeEnv,
    allowUnsignedWebhooks: true,
    conversationContextStore: false
  });
  return { server, store, inbox, outboxStore, filePath };
}

function sendAdmin({ server, method, urlPath, headers = {}, body }) {
  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      const bodyText = body == null ? null : (typeof body === "string" ? body : JSON.stringify(body));
      const reqHeaders = { ...headers };
      if (bodyText != null) {
        reqHeaders["content-type"] = reqHeaders["content-type"] || "application/json";
        reqHeaders["content-length"] = Buffer.byteLength(bodyText);
      }
      const req = http.request({ hostname: "127.0.0.1", port, path: urlPath, method, headers: reqHeaders }, (res) => {
        let responseBody = "";
        res.on("data", (chunk) => { responseBody += chunk; });
        res.on("end", () => {
          server.close(() => {
            let parsed = null;
            try { parsed = responseBody ? JSON.parse(responseBody) : null; } catch { parsed = responseBody; }
            resolve({ statusCode: res.statusCode, body: parsed });
          });
        });
      });
      req.on("error", reject);
      if (bodyText != null) req.write(bodyText);
      req.end();
    });
  });
}

async function runAll() {
  // ---- Auth ----
  {
    // Local dev with no token: 200
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/opening-hours/beauty_demo" });
    check("dev open access: 200", res.statusCode === 200);
    check("dev open access: returns openingHours", res.body && typeof res.body.openingHours === "object");
  }
  {
    // Production without token: 401
    const { server } = freshServer({ nodeEnv: "production" });
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/opening-hours/beauty_demo" });
    check("prod without token: 401", res.statusCode === 401);
    eq("prod without token: error shape", res.body, { error: "admin_token_required" });
  }
  {
    // Token configured, wrong token: 401
    const { server } = freshServer({ adminToken: "secret" });
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/opening-hours/beauty_demo", headers: { "x-admin-token": "wrong" } });
    check("wrong token: 401", res.statusCode === 401);
    eq("wrong token: error shape", res.body, { error: "unauthorized" });
  }
  {
    // Token configured, correct token: 200
    const { server } = freshServer({ adminToken: "secret" });
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/opening-hours/beauty_demo", headers: { "x-admin-token": "secret" } });
    check("correct token: 200", res.statusCode === 200);
  }

  // ---- Opening hours GET/PUT ----
  {
    const { server, filePath } = freshServer({});
    const newHours = { "0": [], "1": [{ open: "10:00", close: "20:00" }], "2": [], "3": [], "4": [], "5": [], "6": [] };
    const putRes = await sendAdmin({ server, method: "PUT", urlPath: "/admin/opening-hours/beauty_demo", body: { openingHours: newHours } });
    check("PUT opening-hours: 200", putRes.statusCode === 200);
    eq("PUT opening-hours: returns saved hours for Mon", putRes.body.openingHours["1"], [{ open: "10:00", close: "20:00" }]);

    // Persistence: re-read via a fresh store pointed at the same file
    const reloaded = createAvailabilityStore({ filePath });
    eq("PUT opening-hours: persisted to disk", reloaded.getOpeningHours("beauty_demo")["1"], [{ open: "10:00", close: "20:00" }]);
  }
  {
    // PUT with invalid hours → 400
    const { server } = freshServer({});
    const putRes = await sendAdmin({ server, method: "PUT", urlPath: "/admin/opening-hours/beauty_demo", body: { openingHours: { "1": [{ open: "bad", close: "12:00" }] } } });
    check("PUT opening-hours bad payload: 400", putRes.statusCode === 400);
    check("PUT opening-hours bad payload: error mentions HH:MM", putRes.body.error && putRes.body.error.includes("HH:MM"));
  }

  // ---- Closed periods POST/GET/DELETE ----
  {
    const { server } = freshServer({});
    const postRes = await sendAdmin({ server, method: "POST", urlPath: "/admin/closed-periods/beauty_demo", body: { date: "2026-05-25", start: "13:00", end: "14:00", reason: "lunch" } });
    check("POST closed-period: 201", postRes.statusCode === 201);
    check("POST closed-period: id assigned", postRes.body.period.id.startsWith("close_"));
    const id = postRes.body.period.id;

    // Reuse a fresh server but the same store (we need a new server because sendAdmin closes after each request)
    const { server: server2, store } = freshServer({});
    store.addClosedPeriod("beauty_demo", { date: "2026-05-26", start: "12:00", end: "13:00", reason: "block" });
    const listRes = await sendAdmin({ server: server2, method: "GET", urlPath: "/admin/closed-periods/beauty_demo" });
    check("GET closed-periods: 200", listRes.statusCode === 200);
    check("GET closed-periods: returns list", Array.isArray(listRes.body.closedPeriods) && listRes.body.closedPeriods.length === 1);

    const { server: server3, store: store3 } = freshServer({});
    const added = store3.addClosedPeriod("beauty_demo", { date: "2026-05-25", start: "13:00", end: "14:00", reason: "lunch" });
    const delRes = await sendAdmin({ server: server3, method: "DELETE", urlPath: `/admin/closed-periods/beauty_demo/${added.period.id}` });
    check("DELETE closed-period: 200", delRes.statusCode === 200);

    const { server: server4 } = freshServer({});
    const delMissing = await sendAdmin({ server: server4, method: "DELETE", urlPath: `/admin/closed-periods/beauty_demo/close_does_not_exist` });
    check("DELETE missing closed-period: 404", delMissing.statusCode === 404);

    // POST with bad payload → 400
    const { server: server5 } = freshServer({});
    const badPost = await sendAdmin({ server: server5, method: "POST", urlPath: "/admin/closed-periods/beauty_demo", body: { date: "2026-05-25", start: "14:00", end: "13:00" } });
    check("POST closed-period invalid: 400", badPost.statusCode === 400);
    check("POST closed-period invalid: error mentions end/start", badPost.body.error && badPost.body.error.includes("after"));
    // Avoid unused-var warning
    void id;
  }

  // ---- Bookings POST/GET/PATCH/DELETE ----
  {
    const { server } = freshServer({});
    const postRes = await sendAdmin({ server, method: "POST", urlPath: "/admin/bookings/beauty_demo", body: { date: "2026-05-25", time: "13:00", service: "facial", customer: "Alice" } });
    check("POST booking: 201", postRes.statusCode === 201);
    check("POST booking: id + default duration", postRes.body.booking.id.startsWith("book_") && postRes.body.booking.durationMinutes === 75);
  }
  {
    // GET bookings
    const { server, store } = freshServer({});
    store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial" });
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/bookings/beauty_demo" });
    check("GET bookings: 200", res.statusCode === 200);
    check("GET bookings: list has 1", Array.isArray(res.body.bookings) && res.body.bookings.length === 1);
  }
  {
    // PATCH booking
    const { server, store } = freshServer({});
    const added = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial" });
    const res = await sendAdmin({ server, method: "PATCH", urlPath: `/admin/bookings/beauty_demo/${added.booking.id}`, body: { notes: "VIP" } });
    check("PATCH booking: 200", res.statusCode === 200);
    check("PATCH booking: notes applied", res.body.booking.notes === "VIP");
  }
  {
    // PATCH unknown booking → 404
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "PATCH", urlPath: "/admin/bookings/beauty_demo/book_missing", body: { notes: "x" } });
    check("PATCH unknown booking: 404", res.statusCode === 404);
  }
  {
    // PATCH bad payload → 400
    const { server, store } = freshServer({});
    const added = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial" });
    const res = await sendAdmin({ server, method: "PATCH", urlPath: `/admin/bookings/beauty_demo/${added.booking.id}`, body: { time: "noon" } });
    check("PATCH invalid: 400", res.statusCode === 400);
  }
  {
    // DELETE booking
    const { server, store } = freshServer({});
    const added = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial" });
    const res = await sendAdmin({ server, method: "DELETE", urlPath: `/admin/bookings/beauty_demo/${added.booking.id}` });
    check("DELETE booking: 200", res.statusCode === 200);
  }
  {
    // DELETE unknown booking → 404
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "DELETE", urlPath: "/admin/bookings/beauty_demo/book_missing" });
    check("DELETE unknown booking: 404", res.statusCode === 404);
  }
  {
    // POST booking with bad payload → 400
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "POST", urlPath: "/admin/bookings/beauty_demo", body: { date: "2026-05-25", time: "13:00" } });
    check("POST booking missing service: 400", res.statusCode === 400);
    check("POST booking missing service: error", res.body.error && res.body.error.includes("service is required"));
  }

  // ---- Out-of-hours booking rejection ----
  {
    // beauty_demo Mon default hours: 11:00-21:00. 22:00 facial is past close.
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "POST", urlPath: "/admin/bookings/beauty_demo", body: { date: "2026-05-25", time: "22:00", service: "facial" } });
    check("POST out-of-hours booking: 400", res.statusCode === 400);
    check("POST out-of-hours booking: error mentions outside opening hours", res.body.error && res.body.error.includes("outside opening hours"));
  }
  {
    // PATCH that moves an existing booking out of hours → 400
    const { server, store } = freshServer({});
    const added = store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial" });
    const res = await sendAdmin({ server, method: "PATCH", urlPath: `/admin/bookings/beauty_demo/${added.booking.id}`, body: { time: "22:00" } });
    check("PATCH out-of-hours: 400", res.statusCode === 400);
    check("PATCH out-of-hours: error mentions outside opening hours", res.body.error && res.body.error.includes("outside opening hours"));
  }

  // ---- /admin/inbox: list + approve + reject ----
  {
    // No inbox wired → 503
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/inbox/beauty_demo" });
    check("GET /admin/inbox without inbox wired: 503", res.statusCode === 503);
  }
  {
    // Empty inbox list
    const { server } = freshServer({ withInbox: true });
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/inbox/beauty_demo" });
    check("GET /admin/inbox empty: 200", res.statusCode === 200);
    eq("GET /admin/inbox empty: items=[]", res.body.items, []);
  }
  {
    // Submit a booking-shaped item, list it, approve it → calendar gets the booking
    const { server, inbox, store } = freshServer({ withInbox: true });
    const submitted = inbox.submit({
      decision: { action: "staff_review", businessId: "beauty_demo" },
      draft: { action: "staff_review", text: "draft for 2026-05-25 13:00 facial" },
      safety: { verdict: "revise", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "amy_001", channel: "whatsapp" },
      customerText: "想book 5月25號 1pm facial",
      bookingDraft: {
        businessId: "beauty_demo",
        date: "2026-05-25",
        time: "13:00",
        service: "facial",
        customer: "amy_001",
        senderId: "amy_001",
        channel: "whatsapp",
        notes: null
      }
    });

    const listRes = await sendAdmin({ server, method: "GET", urlPath: "/admin/inbox/beauty_demo" });
    check("GET inbox after submit: 200", listRes.statusCode === 200);
    check("GET inbox: includes the new item", listRes.body.items.length === 1 && listRes.body.items[0].id === submitted.id);
    check("GET inbox: bookingDraft is surfaced", listRes.body.items[0].bookingDraft?.date === "2026-05-25");

    // Approve → addBooking → calendar
    const { server: server2 } = freshServer({ withInbox: true });
    // The first freshServer call already wrote to its own store; we need to re-use the same inbox+store,
    // so use sendAdmin against the same server (it closes after each call), and we already only call once below.
    void server2;
    const approveRes = await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/approve`, body: {} });
    check("POST approve: 200", approveRes.statusCode === 200);
    check("POST approve: returns booking with id", approveRes.body.booking?.id?.startsWith("book_"));
    check("POST approve: item status flips to approved", approveRes.body.item.status === "approved");
    check("POST approve: writes to availabilityStore", store.listBookings("beauty_demo").length === 1);
    check("POST approve: bookingResult recorded", approveRes.body.item.bookingResult?.ok === true);
  }
  {
    // Approve a booking with overrides (staff changes time before approving)
    const { server, inbox, store } = freshServer({ withInbox: true });
    const submitted = inbox.submit({
      decision: { action: "staff_review", businessId: "beauty_demo" },
      draft: { action: "staff_review", text: "x" },
      safety: { verdict: "revise", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "may_002", channel: "whatsapp" },
      customerText: "x",
      bookingDraft: { businessId: "beauty_demo", date: "2026-05-25", time: "13:00", service: "facial", customer: "may_002", senderId: "may_002", channel: "whatsapp" }
    });
    const res = await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/approve`, body: { time: "14:00", notes: "VIP, prefers Amy" } });
    check("approve with override: 200", res.statusCode === 200);
    const booked = store.listBookings("beauty_demo")[0];
    check("approve with override: time overridden", booked?.time === "14:00");
    check("approve with override: notes overridden", booked?.notes === "VIP, prefers Amy");
  }
  {
    // Approve a booking that violates opening hours → 400, item stays open
    const { server, inbox, store } = freshServer({ withInbox: true });
    const submitted = inbox.submit({
      decision: { action: "staff_review", businessId: "beauty_demo" },
      draft: { action: "staff_review", text: "x" },
      safety: { verdict: "revise", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "u", channel: "whatsapp" },
      customerText: "x",
      bookingDraft: { businessId: "beauty_demo", date: "2026-05-25", time: "22:00", service: "facial", customer: "u", senderId: "u", channel: "whatsapp" }
    });
    const res = await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/approve`, body: {} });
    check("approve out-of-hours: 400", res.statusCode === 400);
    check("approve out-of-hours: error mentions outside opening hours", res.body.error && res.body.error.includes("outside opening hours"));
    check("approve out-of-hours: no booking written", store.listBookings("beauty_demo").length === 0);
    // Item should still be open (so staff can edit + retry)
    const { server: s2 } = freshServer({ withInbox: true });
    void s2;
    // Fetch via the inbox directly since the server above is now closed
    const itemAfter = inbox.get(submitted.id);
    check("approve out-of-hours: item still open for retry", itemAfter.status === "open");
    check("approve out-of-hours: bookingResult error recorded", itemAfter.bookingResult?.ok === false);
  }
  {
    // Reject a booking with a reason
    const { server, inbox } = freshServer({ withInbox: true });
    const submitted = inbox.submit({
      decision: { action: "staff_review", businessId: "beauty_demo" },
      draft: { action: "staff_review", text: "x" },
      safety: { verdict: "revise", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "u", channel: "whatsapp" },
      customerText: "x",
      bookingDraft: { businessId: "beauty_demo", date: "2026-05-25", time: "13:00", service: "facial", customer: "u", senderId: "u", channel: "whatsapp" }
    });
    const res = await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/reject`, body: { reason: "Customer cancelled by phone" } });
    check("reject: 200", res.statusCode === 200);
    check("reject: status=rejected", res.body.item.status === "rejected");
  }
  {
    // Approving an already-approved item → 409
    const { server, inbox } = freshServer({ withInbox: true });
    const submitted = inbox.submit({
      decision: { action: "staff_review", businessId: "beauty_demo" },
      draft: { action: "staff_review", text: "x" },
      safety: { verdict: "revise", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "u", channel: "whatsapp" },
      customerText: "x",
      bookingDraft: { businessId: "beauty_demo", date: "2026-05-25", time: "13:00", service: "facial", customer: "u", senderId: "u", channel: "whatsapp" }
    });
    inbox.approve(submitted.id);
    const res = await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/approve`, body: {} });
    check("approve already-approved: 409", res.statusCode === 409);
  }
  {
    // Approve a non-booking review item (no bookingDraft) → no calendar write, just approves
    const { server, inbox, store } = freshServer({ withInbox: true });
    const submitted = inbox.submit({
      decision: { action: "handoff", businessId: "beauty_demo", escalationLabel: "complaint" },
      draft: { action: "handoff", text: "staff handoff text" },
      safety: { verdict: "revise", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "u", channel: "whatsapp" },
      customerText: "complaint"
    });
    const res = await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/approve`, body: {} });
    check("approve non-booking: 200", res.statusCode === 200);
    check("approve non-booking: no booking written", store.listBookings("beauty_demo").length === 0);
    check("approve non-booking: booking field null", res.body.booking === null);
    check("approve non-booking: status approved", res.body.item.status === "approved");
  }
  {
    // Unknown id → 404
    const { server } = freshServer({ withInbox: true });
    const res = await sendAdmin({ server, method: "POST", urlPath: "/admin/inbox/beauty_demo/staff_does_not_exist/approve", body: {} });
    check("approve unknown id: 404", res.statusCode === 404);
  }

  // ---- Outbox: approve enqueues a confirmation message ----
  {
    const { server, inbox, outboxStore } = freshServer({ withInbox: true, withOutbox: true });
    const submitted = inbox.submit({
      decision: { action: "staff_review", businessId: "beauty_demo" },
      draft: { action: "staff_review", text: "x" },
      safety: { verdict: "revise", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "amy_001", channel: "whatsapp" },
      customerText: "想book 5月25號 1pm facial",
      bookingDraft: { businessId: "beauty_demo", date: "2026-05-25", time: "13:00", service: "facial", customer: "amy_001", senderId: "amy_001", channel: "whatsapp" }
    });
    const res = await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/approve`, body: {} });
    check("approve with outbox: 200", res.statusCode === 200);
    check("approve with outbox: response has outbox.ok", res.body.outbox?.ok === true);
    const pending = outboxStore.listPending({ businessId: "beauty_demo" });
    eq("approve with outbox: enqueues 1 record", pending.length, 1);
    eq("approve with outbox: chatKey lowercased", pending[0].chatKey, "amy_001");
    eq("approve with outbox: chatDisplayName preserved", pending[0].chatDisplayName, "amy_001");
    eq("approve with outbox: channel = whatsapp", pending[0].channel, "whatsapp");
    eq("approve with outbox: bookingId attached", pending[0].bookingId, res.body.booking.id);
    check("approve with outbox: text mentions date", pending[0].text.includes("2026-05-25"));
    check("approve with outbox: text mentions time", pending[0].text.includes("13:00"));
    check("approve with outbox: text mentions facial", pending[0].text.toLowerCase().includes("facial"));
  }
  {
    // Approve with override → outbox text reflects the override
    const { server, inbox, outboxStore } = freshServer({ withInbox: true, withOutbox: true });
    const submitted = inbox.submit({
      decision: { action: "staff_review", businessId: "beauty_demo" },
      draft: { action: "staff_review", text: "x" },
      safety: { verdict: "revise", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "may_002", channel: "whatsapp" },
      customerText: "x",
      bookingDraft: { businessId: "beauty_demo", date: "2026-05-25", time: "13:00", service: "facial", customer: "may_002", senderId: "may_002", channel: "whatsapp" }
    });
    await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/approve`, body: { time: "14:30" } });
    const pending = outboxStore.listPending({ businessId: "beauty_demo" });
    check("approve override outbox: text mentions overridden time", pending[0].text.includes("14:30"));
    check("approve override outbox: text does NOT mention original time", !pending[0].text.includes("13:00"));
  }
  {
    // No outbox wired → approve still works, response has no outbox field
    const { server, inbox } = freshServer({ withInbox: true });
    const submitted = inbox.submit({
      decision: { action: "staff_review", businessId: "beauty_demo" },
      draft: { action: "staff_review", text: "x" },
      safety: { verdict: "revise", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "u", channel: "whatsapp" },
      customerText: "x",
      bookingDraft: { businessId: "beauty_demo", date: "2026-05-25", time: "13:00", service: "facial", customer: "u", senderId: "u", channel: "whatsapp" }
    });
    const res = await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/approve`, body: {} });
    check("approve no outbox: 200", res.statusCode === 200);
    eq("approve no outbox: outbox is null", res.body.outbox, null);
  }
  {
    // Non-whatsapp channel → outbox declines
    const { server, inbox, outboxStore } = freshServer({ withInbox: true, withOutbox: true });
    const submitted = inbox.submit({
      decision: { action: "staff_review", businessId: "beauty_demo" },
      draft: { action: "staff_review", text: "x" },
      safety: { verdict: "revise", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "u", channel: "instagram" },
      customerText: "x",
      bookingDraft: { businessId: "beauty_demo", date: "2026-05-25", time: "13:00", service: "facial", customer: "u", senderId: "u", channel: "instagram" }
    });
    const res = await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/approve`, body: {} });
    check("approve IG channel: 200", res.statusCode === 200);
    eq("approve IG channel: outbox declines with channel_unsupported", res.body.outbox?.error, "channel_unsupported");
    eq("approve IG channel: outbox empty", outboxStore.listPending().length, 0);
  }

  // ---- /admin/store dump ----
  {
    const { server, store } = freshServer({});
    store.addBooking("beauty_demo", { date: "2026-05-25", time: "13:00", service: "facial" });
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/store" });
    check("GET /admin/store: 200", res.statusCode === 200);
    check("GET /admin/store: businesses block present", res.body && typeof res.body.businesses === "object" && res.body.businesses.beauty_demo);
    check("GET /admin/store: dump contains the booking", res.body.businesses.beauty_demo.bookings.some((b) => b.time === "13:00"));
  }

  // ---- Routing edge cases ----
  {
    // Unknown resource → 404
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/unknown-thing" });
    check("unknown admin resource: 405 or 404", res.statusCode === 404 || res.statusCode === 405);
  }
  {
    // Wrong method on a real resource → 405
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "DELETE", urlPath: "/admin/opening-hours/beauty_demo" });
    check("DELETE opening-hours: 405", res.statusCode === 405);
  }

  // ---- Resources endpoints ----
  {
    // Empty list on fresh business
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/resources/beauty_demo" });
    check("GET resources empty: 200", res.statusCode === 200);
    eq("GET resources empty: list", res.body.resources, []);
  }
  {
    // POST new resource
    const { server, store } = freshServer({});
    const res = await sendAdmin({ server, method: "POST", urlPath: "/admin/resources/beauty_demo", body: { name: "Amy" } });
    check("POST resource: 201", res.statusCode === 201);
    check("POST resource: id assigned", res.body.resource.id.startsWith("res_"));
    eq("POST resource: name preserved", res.body.resource.name, "Amy");
    // Persisted
    const direct = store.listResources("beauty_demo");
    check("POST resource: persisted to store", direct.some((r) => r.name === "Amy"));
  }
  {
    // POST invalid → 400
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "POST", urlPath: "/admin/resources/beauty_demo", body: { name: "" } });
    check("POST resource invalid: 400", res.statusCode === 400);
    check("POST resource invalid: error message", res.body.error?.includes("name"));
  }
  {
    // GET single resource
    const { server, store } = freshServer({});
    const added = store.addResource("beauty_demo", { name: "Joey" });
    const res = await sendAdmin({ server, method: "GET", urlPath: `/admin/resources/beauty_demo/${added.resource.id}` });
    check("GET single resource: 200", res.statusCode === 200);
    eq("GET single resource: name", res.body.resource.name, "Joey");
  }
  {
    // GET missing resource → 404
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "GET", urlPath: "/admin/resources/beauty_demo/res_does_not_exist" });
    check("GET missing resource: 404", res.statusCode === 404);
  }
  {
    // PATCH rename
    const { server, store } = freshServer({});
    const added = store.addResource("beauty_demo", { name: "Amy" });
    const res = await sendAdmin({ server, method: "PATCH", urlPath: `/admin/resources/beauty_demo/${added.resource.id}`, body: { name: "Amy Chan" } });
    check("PATCH resource: 200", res.statusCode === 200);
    eq("PATCH resource: name updated", res.body.resource.name, "Amy Chan");
  }
  {
    // PATCH missing → 404
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "PATCH", urlPath: "/admin/resources/beauty_demo/res_nope", body: { name: "X" } });
    check("PATCH missing resource: 404", res.statusCode === 404);
  }
  {
    // PATCH invalid → 400
    const { server, store } = freshServer({});
    const added = store.addResource("beauty_demo", { name: "Amy" });
    const res = await sendAdmin({ server, method: "PATCH", urlPath: `/admin/resources/beauty_demo/${added.resource.id}`, body: { name: "" } });
    check("PATCH resource invalid: 400", res.statusCode === 400);
  }
  {
    // DELETE = soft-delete
    const { server, store } = freshServer({});
    const added = store.addResource("beauty_demo", { name: "Amy" });
    const res = await sendAdmin({ server, method: "DELETE", urlPath: `/admin/resources/beauty_demo/${added.resource.id}` });
    check("DELETE resource: 200", res.statusCode === 200);
    eq("DELETE resource: active=false", res.body.resource.active, false);
    // Active-only filter excludes soft-deleted
    const activeOnly = await sendAdmin({ server: freshServerWithStore({}, store).server, method: "GET", urlPath: "/admin/resources/beauty_demo?activeOnly=true" });
    check("GET ?activeOnly=true excludes soft-deleted", !activeOnly.body.resources.some((r) => r.id === added.resource.id));
  }
  {
    // DELETE missing → 404
    const { server } = freshServer({});
    const res = await sendAdmin({ server, method: "DELETE", urlPath: "/admin/resources/beauty_demo/res_nope" });
    check("DELETE missing resource: 404", res.statusCode === 404);
  }
  {
    // POST booking with resourceId
    const { server, store } = freshServer({});
    const added = store.addResource("beauty_demo", { name: "Amy" });
    const res = await sendAdmin({ server, method: "POST", urlPath: "/admin/bookings/beauty_demo", body: { date: "2026-05-25", time: "13:00", service: "facial", resourceId: added.resource.id } });
    check("POST booking with resourceId: 201", res.statusCode === 201);
    eq("POST booking with resourceId: pinned", res.body.booking.resourceId, added.resource.id);
  }
  {
    // POST booking with conflicting resource → 400
    const { server, store } = freshServer({});
    const added = store.addResource("beauty_demo", { name: "Amy" });
    await sendAdmin({ server: freshServerWithStore({}, store).server, method: "POST", urlPath: "/admin/bookings/beauty_demo", body: { date: "2026-05-25", time: "13:00", service: "facial", resourceId: added.resource.id } });
    const res2 = await sendAdmin({ server: freshServerWithStore({}, store).server, method: "POST", urlPath: "/admin/bookings/beauty_demo", body: { date: "2026-05-25", time: "13:30", service: "laser", resourceId: added.resource.id } });
    check("POST booking conflict: 400", res2.statusCode === 400);
    check("POST booking conflict: error message", res2.body.error?.includes("resource conflict"));
  }
  {
    // Approve inbox item with resourceId override
    const { server, store, inbox } = freshServer({ withInbox: true });
    const added = store.addResource("beauty_demo", { name: "Amy" });
    const submitted = inbox.submit({
      decision: { action: "staff_review", businessId: "beauty_demo", reasons: ["test"] },
      draft: { action: "staff_review", text: "draft" },
      safety: { verdict: "pass", safeToSend: false },
      normalizedMessage: { businessId: "beauty_demo", senderId: "u", channel: "whatsapp" },
      customerText: "want facial",
      bookingDraft: { businessId: "beauty_demo", date: "2026-05-25", time: "13:00", service: "facial", customer: "u", senderId: "u", channel: "whatsapp" }
    });
    const res = await sendAdmin({ server, method: "POST", urlPath: `/admin/inbox/beauty_demo/${submitted.id}/approve`, body: { resourceId: added.resource.id } });
    check("approve with resourceId override: 200", res.statusCode === 200);
    eq("approve with resourceId override: written to calendar", res.body.booking.resourceId, added.resource.id);
  }

  console.log(`admin: ${testCount} tests passed`);
}

// Helper for tests that need to re-open the server after mutating its store from a previous request.
function freshServerWithStore(opts, store) {
  const { createWebhookServer: cws } = require("../src/server");
  const { createStaffInbox } = require("../../staff inbox ver 1.0/src/staffInbox");
  const inbox = opts.withInbox ? createStaffInbox() : null;
  return {
    server: cws({
      pipeline: stubPipeline,
      availabilityStore: store,
      staffInbox: inbox,
      adminToken: opts.adminToken,
      nodeEnv: opts.nodeEnv,
      allowUnsignedWebhooks: true,
      conversationContextStore: false
    })
  };
}

runAll().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
