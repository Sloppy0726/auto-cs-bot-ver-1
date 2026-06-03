"use strict";

const assert = require("node:assert/strict");
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

function makeFetch(handlers) {
  const calls = [];
  const impl = async (url, opts = {}) => {
    calls.push({ url, opts });
    for (const [matcher, response] of handlers) {
      if (matcher(url, opts)) return response;
    }
    return { ok: false, status: 500, json: async () => ({ error: "unhandled" }) };
  };
  impl.calls = calls;
  return impl;
}
function jsonRes(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

const OPEN_BOOKING_ITEM = {
  id: "staff_001",
  status: "open",
  businessId: "beauty_demo",
  bookingDraft: { businessId: "beauty_demo", date: "2026-05-25", time: "14:00", service: "facial", customer: "Amy" }
};

async function run() {
  const baseUrl = "http://127.0.0.1:3000";
  const adminToken = "secret-123";
  const handoff = { staffItemId: "staff_001" };

  // -------- skipped: no staffItemId on handoff --------
  {
    const result = await tryAutoResolve({
      activeHandoff: { staffItemId: null },
      staffText: "已預約",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      fetchImpl: makeFetch([])
    });
    eq("skipped when no staffItemId", result.status, "skipped");
    eq("skipped reason", result.reason, "no_staff_item_id");
  }

  // -------- skipped: empty text --------
  {
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText: "   ",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      fetchImpl: makeFetch([])
    });
    eq("skipped on empty text", result.status, "skipped");
    eq("empty text reason", result.reason, "empty_staff_text");
  }

  // -------- skipped: inbox fetch 404 --------
  {
    const fetchImpl = makeFetch([
      [(url) => url.endsWith("/admin/inbox/beauty_demo/staff_001"), jsonRes(404, { error: "inbox_item_not_found" })]
    ]);
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText: "已預約",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      fetchImpl
    });
    eq("skipped on 404", result.status, "skipped");
    eq("skipped 404 reason", result.reason, "fetch_item_404");
  }

  // -------- skipped: item is not open --------
  {
    const fetchImpl = makeFetch([
      [(url) => url.endsWith("/admin/inbox/beauty_demo/staff_001"),
        jsonRes(200, { item: { ...OPEN_BOOKING_ITEM, status: "approved" } })]
    ]);
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText: "已預約",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      fetchImpl
    });
    eq("skipped when item already approved", result.status, "skipped");
    eq("skipped item-status reason", result.reason, "item_approved");
  }

  // -------- skipped: item has no bookingDraft --------
  {
    const fetchImpl = makeFetch([
      [(url) => url.endsWith("/admin/inbox/beauty_demo/staff_001"),
        jsonRes(200, { item: { ...OPEN_BOOKING_ITEM, bookingDraft: null } })]
    ]);
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText: "已預約",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      fetchImpl
    });
    eq("skipped when no bookingDraft", result.status, "skipped");
    eq("no bookingDraft reason", result.reason, "no_booking_draft");
  }

  // -------- skipped: classifier returns unclear --------
  {
    const fetchImpl = makeFetch([
      [(url) => url.endsWith("/admin/inbox/beauty_demo/staff_001"), jsonRes(200, { item: OPEN_BOOKING_ITEM })]
    ]);
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText: "我要check吓",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      fetchImpl
    });
    eq("skipped on unclear", result.status, "skipped");
    check("unclear reason includes classifier_unclear", result.reason.startsWith("classifier_unclear"));
  }

  // -------- approved: confirm heuristic + 200 --------
  {
    const fetchImpl = makeFetch([
      [(url) => url.endsWith("/admin/inbox/beauty_demo/staff_001"), jsonRes(200, { item: OPEN_BOOKING_ITEM })],
      [(url) => url.endsWith("/admin/inbox/beauty_demo/staff_001/approve"),
        jsonRes(200, { item: { ...OPEN_BOOKING_ITEM, status: "approved" }, booking: { id: "book_xyz" } })]
    ]);
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText: "已預約 5月25 14:00 facial",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      adminToken,
      fetchImpl
    });
    eq("approved status", result.status, "approved");
    eq("approve returned booking id", result.booking?.id, "book_xyz");
    eq("approve verdict source = heuristic", result.verdict.source, "heuristic");
    // Verify request shape on the approve call
    const approveCall = fetchImpl.calls.find((c) => c.url.endsWith("/approve"));
    check("approve was called", Boolean(approveCall));
    eq("approve method", approveCall.opts.method, "POST");
    eq("approve x-admin-token header", approveCall.opts.headers["x-admin-token"], adminToken);
    eq("approve body contains actor", JSON.parse(approveCall.opts.body).actor, "whatsapp-web-bridge:auto");
  }

  // -------- rejected: deny heuristic + 200 --------
  {
    const fetchImpl = makeFetch([
      [(url) => url.endsWith("/admin/inbox/beauty_demo/staff_001"), jsonRes(200, { item: OPEN_BOOKING_ITEM })],
      [(url) => url.endsWith("/admin/inbox/beauty_demo/staff_001/reject"),
        jsonRes(200, { item: { ...OPEN_BOOKING_ITEM, status: "rejected" } })]
    ]);
    const staffText = "對唔住, 嗰個時段滿晒, 改第二日得唔得?";
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText,
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      fetchImpl
    });
    eq("rejected status", result.status, "rejected");
    eq("rejected verdict source = heuristic", result.verdict.source, "heuristic");
    const rejectCall = fetchImpl.calls.find((c) => c.url.endsWith("/reject"));
    const rejectBody = JSON.parse(rejectCall.opts.body);
    eq("reject actor", rejectBody.actor, "whatsapp-web-bridge:auto");
    check("reject reason embeds staff text", rejectBody.reason.includes("滿晒"));
    check("reject reason has prefix", rejectBody.reason.startsWith("staff in-chat denial:"));
  }

  // -------- approve_failed: 400 from server --------
  {
    const fetchImpl = makeFetch([
      [(url) => url.endsWith("/admin/inbox/beauty_demo/staff_001"), jsonRes(200, { item: OPEN_BOOKING_ITEM })],
      [(url) => url.endsWith("/approve"), jsonRes(400, { error: "outside opening hours" })]
    ]);
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText: "已預約",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      fetchImpl
    });
    eq("approve_failed status", result.status, "approve_failed");
    eq("approve_failed http code", result.http, 400);
    eq("approve_failed reason from body", result.reason, "outside opening hours");
  }

  // -------- LLM fallback used on unclear text --------
  {
    let llmCalls = 0;
    const llm = async () => { llmCalls++; return { decision: "confirm", reason: "llm-call" }; };
    const fetchImpl = makeFetch([
      [(url) => url.endsWith("/admin/inbox/beauty_demo/staff_001"), jsonRes(200, { item: OPEN_BOOKING_ITEM })],
      [(url) => url.endsWith("/approve"), jsonRes(200, { item: { ...OPEN_BOOKING_ITEM, status: "approved" }, booking: { id: "b2" } })]
    ]);
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText: "等等我幫你睇睇先",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      fetchImpl,
      llmClassifier: llm
    });
    eq("llm-fallback approved", result.status, "approved");
    eq("llm called once", llmCalls, 1);
    eq("verdict source = llm", result.verdict.source, "llm");
  }

  // -------- fetch error during inbox fetch --------
  {
    const fetchImpl = async () => { throw new Error("connection refused"); };
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText: "已預約",
      businessId: "beauty_demo",
      adminBaseUrl: baseUrl,
      fetchImpl
    });
    eq("fetch error → status=error", result.status, "error");
    check("fetch error reason mentions connection refused", result.reason.includes("connection refused"));
  }

  // -------- no admin base url --------
  {
    const result = await tryAutoResolve({
      activeHandoff: handoff,
      staffText: "已預約",
      businessId: "beauty_demo",
      adminBaseUrl: null,
      fetchImpl: makeFetch([])
    });
    eq("skipped on no_admin_base_url", result.status, "skipped");
  }

  console.log(`staffReplyAutoResolver: ${count} tests passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
