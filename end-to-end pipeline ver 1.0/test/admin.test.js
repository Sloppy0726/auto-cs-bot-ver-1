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

function freshServer({ adminToken, nodeEnv } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "admin-test-"));
  const filePath = path.join(dir, "availability.json");
  const store = createAvailabilityStore({ filePath });
  const server = createWebhookServer({
    pipeline: stubPipeline,
    availabilityStore: store,
    adminToken,
    nodeEnv,
    allowUnsignedWebhooks: true,
    conversationContextStore: false
  });
  return { server, store, filePath };
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

  console.log(`admin: ${testCount} tests passed`);
}

runAll().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
