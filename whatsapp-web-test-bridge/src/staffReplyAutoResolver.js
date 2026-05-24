"use strict";

// Auto-resolve a paused-chat inbox item from staff's manual WhatsApp reply.
// Fetches the inbox item over HTTP, classifies the staff text as confirm/deny,
// then calls /approve or /reject. Returns a structured result; never throws.
//
// Inputs are all injected so this module is unit-testable without a real server:
//   - fetchImpl(url, opts) → { ok, status, json() }
//   - classifyReply(text, { bookingDraft }) → { decision, source, reason }

const { classifyStaffReply } = require("./staffReplyClassifier");

async function tryAutoResolve({
  activeHandoff,
  staffText,
  staffFingerprint,
  businessId,
  adminBaseUrl,
  adminToken,
  fetchImpl = fetch,
  classifyReply = classifyStaffReply,
  llmClassifier = null,
  actor = "whatsapp-web-bridge:auto"
} = {}) {
  if (!activeHandoff || !activeHandoff.staffItemId) {
    return { status: "skipped", reason: "no_staff_item_id" };
  }
  if (!businessId) return { status: "skipped", reason: "no_business_id" };
  if (!adminBaseUrl) return { status: "skipped", reason: "no_admin_base_url" };

  const text = String(staffText || "").trim();
  if (!text) return { status: "skipped", reason: "empty_staff_text" };

  const inboxUrl = `${adminBaseUrl.replace(/\/+$/, "")}/admin/inbox/${encodeURIComponent(businessId)}/${encodeURIComponent(activeHandoff.staffItemId)}`;
  let item;
  try {
    const res = await fetchImpl(inboxUrl, { method: "GET", headers: adminHeaders(adminToken) });
    if (!res.ok) {
      return { status: "skipped", reason: `fetch_item_${res.status}`, http: res.status };
    }
    const body = await res.json();
    item = body && body.item;
  } catch (error) {
    return { status: "error", reason: `fetch_item_error:${error.message}` };
  }
  if (!item) return { status: "skipped", reason: "item_missing" };
  if (item.status !== "open") return { status: "skipped", reason: `item_${item.status}` };
  if (!item.bookingDraft) return { status: "skipped", reason: "no_booking_draft" };

  const verdict = await classifyReply(text, { bookingDraft: item.bookingDraft, llmClassifier });
  if (verdict.decision === "confirm") {
    return await callApprove({ inboxUrl, adminToken, fetchImpl, actor, verdict, item, staffFingerprint });
  }
  if (verdict.decision === "deny") {
    return await callReject({ inboxUrl, adminToken, fetchImpl, actor, verdict, item, staffFingerprint, staffText: text });
  }
  return { status: "skipped", reason: `classifier_${verdict.decision}:${verdict.source}` };
}

async function callApprove({ inboxUrl, adminToken, fetchImpl, actor, verdict, item, staffFingerprint }) {
  const url = `${inboxUrl}/approve`;
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { ...adminHeaders(adminToken), "content-type": "application/json" },
      body: JSON.stringify({ actor })
    });
    const body = await safeJson(res);
    if (!res.ok) {
      return {
        status: "approve_failed",
        reason: body?.error || `approve_${res.status}`,
        http: res.status,
        verdict,
        item,
        staffFingerprint
      };
    }
    return {
      status: "approved",
      reason: verdict.reason,
      verdict,
      item,
      booking: body?.booking || null,
      staffFingerprint
    };
  } catch (error) {
    return { status: "error", reason: `approve_error:${error.message}`, verdict, item };
  }
}

async function callReject({ inboxUrl, adminToken, fetchImpl, actor, verdict, item, staffFingerprint, staffText }) {
  const url = `${inboxUrl}/reject`;
  const reason = `staff in-chat denial: ${truncate(staffText, 200)}`;
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { ...adminHeaders(adminToken), "content-type": "application/json" },
      body: JSON.stringify({ actor, reason })
    });
    const body = await safeJson(res);
    if (!res.ok) {
      return {
        status: "reject_failed",
        reason: body?.error || `reject_${res.status}`,
        http: res.status,
        verdict,
        item,
        staffFingerprint
      };
    }
    return { status: "rejected", reason: verdict.reason, verdict, item, staffFingerprint };
  } catch (error) {
    return { status: "error", reason: `reject_error:${error.message}`, verdict, item };
  }
}

function adminHeaders(adminToken) {
  return adminToken ? { "x-admin-token": adminToken } : {};
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

function truncate(value, max) {
  const str = String(value || "");
  return str.length <= max ? str : str.slice(0, max - 1) + "…";
}

module.exports = { tryAutoResolve };
