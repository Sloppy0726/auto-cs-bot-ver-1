"use strict";

// Integration test: tryAutoResolve calling a real admin server.
// Confirms the resolver's request/response shape matches the server contract
// end-to-end (inbox fetch + approve + reject paths writing to the calendar).

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createWebhookServer } = require("../../end-to-end pipeline ver 1.0/src/server");
const { createAvailabilityStore } = require("../../private business backend mock ver 1.0/src/availabilityStore");
const { createStaffInbox } = require("../../staff inbox ver 1.0/src/staffInbox");
const { tryAutoResolve } = require("../src/staffReplyAutoResolver");

let count = 0;
function check(label, cond, detail) {
  count++;
  assert.ok(cond, detail ? `${label}: ${detail}` : label);
}
function eq(label, actual, expected) {
  count++;
  assert.deepEqual(actual, expected, label);
}

function freshLive() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bridge-int-"));
  const filePath = path.join(dir, "availability.json");
  const store = createAvailabilityStore({ filePath });
  store.setOpeningHours("beauty_demo", {
    "0": [], "1": [{ open: "11:00", close: "21:00" }], "2": [], "3": [], "4": [], "5": [], "6": []
  });
  const inbox = createStaffInbox();
  const stubPipeline = { async runMessage() { return { finalStatus: "ready_to_send", outbound: { status: "ready_to_send", payload: { text: "ok" } }, staffItem: null, decision: { action: "auto_send" } }; } };
  const server = createWebhookServer({
    pipeline: stubPipeline,
    availabilityStore: store,
    staffInbox: inbox,
    allowUnsignedWebhooks: true,
    conversationContextStore: false
  });
  return { server, store, inbox };
}

function listen(server) {
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${server.address().port}`)));
}
function shutdown(server) {
  return new Promise((resolve) => server.close(() => resolve()));
}

function submitBookingItem(inbox, overrides = {}) {
  return inbox.submit({
    decision: { action: "staff_review", businessId: "beauty_demo" },
    draft: { action: "staff_review", text: "x" },
    safety: { verdict: "revise", safeToSend: false },
    normalizedMessage: { businessId: "beauty_demo", senderId: "wa-customer", channel: "whatsapp" },
    customerText: "想book 5月25號 1pm facial",
    bookingDraft: {
      businessId: "beauty_demo",
      date: "2026-05-25",
      time: "13:00",
      service: "facial",
      customer: "wa-customer",
      senderId: "wa-customer",
      channel: "whatsapp",
      ...overrides
    }
  });
}

async function run() {
  // -------- confirm path: resolver approves item, booking lands in store --------
  {
    const { server, store, inbox } = freshLive();
    const baseUrl = await listen(server);
    const item = submitBookingItem(inbox);

    const result = await tryAutoResolve({
      activeHandoff: { staffItemId: item.id },
      staffText: "已預約 5月25 1pm facial",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl
    });

    eq("live approve: status", result.status, "approved");
    check("live approve: booking object present", Boolean(result.booking?.id));
    const bookings = store.listBookings("beauty_demo");
    eq("live approve: store has 1 booking", bookings.length, 1);
    eq("live approve: booking time matches draft", bookings[0].time, "13:00");
    eq("live approve: booking service matches draft", bookings[0].service, "facial");
    eq("live approve: item flipped to approved", inbox.get(item.id).status, "approved");

    await shutdown(server);
  }

  // -------- deny path: resolver rejects item, store stays empty --------
  {
    const { server, store, inbox } = freshLive();
    const baseUrl = await listen(server);
    const item = submitBookingItem(inbox);

    const result = await tryAutoResolve({
      activeHandoff: { staffItemId: item.id },
      staffText: "對唔住, 嗰個時段滿晒, 改第二日得唔得?",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl
    });

    eq("live deny: status", result.status, "rejected");
    eq("live deny: store is empty", store.listBookings("beauty_demo").length, 0);
    eq("live deny: item flipped to rejected", inbox.get(item.id).status, "rejected");

    await shutdown(server);
  }

  // -------- unclear path: resolver does nothing; item still open, store empty --------
  {
    const { server, store, inbox } = freshLive();
    const baseUrl = await listen(server);
    const item = submitBookingItem(inbox);

    const result = await tryAutoResolve({
      activeHandoff: { staffItemId: item.id },
      staffText: "我要check吓",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl
    });

    eq("live unclear: status=skipped", result.status, "skipped");
    eq("live unclear: store empty", store.listBookings("beauty_demo").length, 0);
    eq("live unclear: item still open", inbox.get(item.id).status, "open");

    await shutdown(server);
  }

  // -------- admin token required: missing token → resolver records approve_failed --------
  {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bridge-int-auth-"));
    const filePath = path.join(dir, "availability.json");
    const store = createAvailabilityStore({ filePath });
    const inbox = createStaffInbox();
    const stubPipeline = { async runMessage() { return { finalStatus: "ready_to_send", outbound: { status: "ready_to_send", payload: { text: "ok" } }, staffItem: null, decision: { action: "auto_send" } }; } };
    const server = createWebhookServer({
      pipeline: stubPipeline,
      availabilityStore: store,
      staffInbox: inbox,
      adminToken: "secret-token",
      allowUnsignedWebhooks: true,
      conversationContextStore: false
    });
    const baseUrl = await listen(server);
    const item = submitBookingItem(inbox);

    const noTokenResult = await tryAutoResolve({
      activeHandoff: { staffItemId: item.id },
      staffText: "已預約",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl
      // adminToken omitted
    });
    eq("live no-token: inbox fetch 401 → skipped", noTokenResult.status, "skipped");
    check("live no-token: reason mentions 401", noTokenResult.reason.includes("401"));

    const withTokenResult = await tryAutoResolve({
      activeHandoff: { staffItemId: item.id },
      staffText: "已預約",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      adminToken: "secret-token"
    });
    eq("live with-token: approved", withTokenResult.status, "approved");
    eq("live with-token: booking written", store.listBookings("beauty_demo").length, 1);

    await shutdown(server);
  }

  console.log(`staffReplyAutoResolver.integration: ${count} tests passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
