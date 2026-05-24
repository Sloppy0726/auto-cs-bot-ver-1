"use strict";

// File-backed outbound message queue shared between the server (enqueues
// confirmations after admin approves a booking) and the bridge (dequeues
// and actually sends over WhatsApp Web).
//
// Each record:
//   {
//     id: "out_<hex>",
//     businessId: "beauty_demo",
//     chatKey: "amy wong",          // lowercased; matches handoffState
//     chatDisplayName: "Amy Wong",  // case-preserved; for sidebar matching
//     channel: "whatsapp",
//     text: "...",
//     bookingId: "book_xyz" | null,
//     status: "pending" | "sent" | "failed",
//     attempts: 0,
//     createdAt: "ISO",
//     sentAt: "ISO" | null,
//     lastError: "..." | null
//   }

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const DEFAULT_FILE = path.join(__dirname, "..", "state", "outbox.json");

function createOutboxStore(options = {}) {
  const filePath = options.filePath || DEFAULT_FILE;
  const nowFn = typeof options.nowFn === "function" ? options.nowFn : () => new Date();

  function load() {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return normalize(parsed);
    } catch (error) {
      if (error.code === "ENOENT") return { records: [] };
      return { records: [] };
    }
  }

  function save(state) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(normalize(state), null, 2));
    fs.renameSync(tmp, filePath);
  }

  function enqueue(input = {}) {
    if (!input.businessId) return { ok: false, error: "businessId_required" };
    if (!input.chatKey) return { ok: false, error: "chatKey_required" };
    if (!input.text) return { ok: false, error: "text_required" };
    const state = load();
    const record = {
      id: input.id || `out_${crypto.randomBytes(6).toString("hex")}`,
      businessId: String(input.businessId),
      chatKey: String(input.chatKey).toLowerCase(),
      chatDisplayName: input.chatDisplayName || input.chatKey,
      channel: input.channel || "whatsapp",
      text: String(input.text),
      bookingId: input.bookingId || null,
      status: "pending",
      attempts: 0,
      createdAt: nowFn().toISOString(),
      sentAt: null,
      lastError: null
    };
    state.records.push(record);
    save(state);
    return { ok: true, record };
  }

  function listPending({ businessId } = {}) {
    const state = load();
    return state.records.filter((r) => r.status === "pending" && (!businessId || r.businessId === businessId));
  }

  function listAll() {
    return load().records;
  }

  function markSent(id, info = {}) {
    const state = load();
    const idx = state.records.findIndex((r) => r.id === id);
    if (idx === -1) return { ok: false, error: "outbox_record_not_found" };
    state.records[idx] = {
      ...state.records[idx],
      status: "sent",
      sentAt: nowFn().toISOString(),
      lastError: null,
      ...sanitizeInfo(info)
    };
    save(state);
    return { ok: true, record: state.records[idx] };
  }

  function markFailed(id, error) {
    const state = load();
    const idx = state.records.findIndex((r) => r.id === id);
    if (idx === -1) return { ok: false, error: "outbox_record_not_found" };
    state.records[idx] = {
      ...state.records[idx],
      attempts: (state.records[idx].attempts || 0) + 1,
      lastError: String(error || "unknown")
    };
    save(state);
    return { ok: true, record: state.records[idx] };
  }

  function reset() {
    save({ records: [] });
  }

  return { enqueue, listPending, listAll, markSent, markFailed, reset, _filePath: filePath };
}

function sanitizeInfo(info) {
  const out = {};
  if (info.sentSnippet) out.sentSnippet = String(info.sentSnippet).slice(0, 200);
  return out;
}

function normalize(state) {
  const records = Array.isArray(state?.records) ? state.records : [];
  return {
    records: records.map((r) => ({
      id: r.id || `out_${crypto.randomBytes(6).toString("hex")}`,
      businessId: r.businessId || "",
      chatKey: r.chatKey || "",
      chatDisplayName: r.chatDisplayName || r.chatKey || "",
      channel: r.channel || "whatsapp",
      text: r.text || "",
      bookingId: r.bookingId || null,
      status: r.status === "sent" || r.status === "failed" ? r.status : "pending",
      attempts: Number(r.attempts) || 0,
      createdAt: r.createdAt || null,
      sentAt: r.sentAt || null,
      lastError: r.lastError || null,
      sentSnippet: r.sentSnippet || null
    }))
  };
}

module.exports = { createOutboxStore };
