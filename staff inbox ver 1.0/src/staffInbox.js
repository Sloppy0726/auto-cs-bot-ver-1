"use strict";

// Staff Inbox ver 1.0
// Queue for review, handoff, and blocked-message items.
// In-memory by default; opt into disk persistence by passing `filePath`.

const fs = require("node:fs");
const path = require("node:path");

const STATUSES = Object.freeze({
  OPEN: "open",
  APPROVED: "approved",
  EDITED: "edited",
  REJECTED: "rejected",
  TAKEN_OVER: "taken_over",
  CLOSED: "closed"
});

function createStaffInbox(config = {}) {
  const items = new Map();
  const nowFn = config.nowFn || (() => new Date());
  const filePath = config.filePath || null;

  // Disk-backed inbox: hydrate from file first, then layer any explicit
  // config.items (useful for tests and one-off seeding).
  if (filePath) {
    for (const item of loadFromDisk(filePath)) {
      items.set(item.id, normalizeItem(item));
    }
  }
  for (const item of config.items || []) {
    items.set(item.id, normalizeItem(item));
  }

  function persist() {
    if (!filePath) return;
    saveToDisk(filePath, Array.from(items.values()));
  }

  return {
    submit(input) {
      const item = createItem(input || {}, items.size + 1, nowFn);
      items.set(item.id, item);
      persist();
      return item;
    },
    list(filter = {}) {
      return Array.from(items.values()).filter((item) => matches(filter, item));
    },
    get(id) {
      return items.get(id) || null;
    },
    approve(id, actor = "staff") {
      const updated = transition(items, id, STATUSES.APPROVED, { actor }, nowFn);
      if (updated) persist();
      return updated;
    },
    edit(id, editedText, actor = "staff") {
      const updated = transition(items, id, STATUSES.EDITED, { actor, editedText }, nowFn);
      if (updated) persist();
      return updated;
    },
    reject(id, reason, actor = "staff") {
      const updated = transition(items, id, STATUSES.REJECTED, { actor, reason }, nowFn);
      if (updated) persist();
      return updated;
    },
    takeOver(id, actor = "staff") {
      const updated = transition(items, id, STATUSES.TAKEN_OVER, { actor }, nowFn);
      if (updated) persist();
      return updated;
    },
    recordBookingResult(id, result) {
      const item = items.get(id);
      if (!item) return null;
      const updated = { ...item, bookingResult: result || null, updatedAt: timestamp(nowFn) };
      items.set(id, updated);
      persist();
      return updated;
    },
    _filePath: filePath
  };
}

function loadFromDisk(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    return [];
  }
}

function saveToDisk(filePath, items) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify({ items }, null, 2));
  fs.renameSync(tmp, filePath);
}

function createItem(input, index, nowFn = () => new Date()) {
  const decision = input.decision || {};
  const draft = input.draft || {};
  const safety = input.safety || {};
  const normalizedMessage = input.normalizedMessage || {};
  const id = input.id || `staff_${String(index).padStart(4, "0")}`;
  const action = decision.action || draft.action || "staff_review";

  return normalizeItem({
    id,
    status: STATUSES.OPEN,
    priority: priorityFor({ decision, safety }),
    action,
    businessId: decision.businessId || normalizedMessage.businessId || "default",
    channel: normalizedMessage.channel || "unknown",
    senderId: normalizedMessage.senderId || "unknown_sender",
    customerText: input.customerText || normalizedMessage.sanitizedText || "",
    draftText: draft.text || null,
    safetyVerdict: safety.verdict || null,
    safeToSend: Boolean(safety.safeToSend),
    escalationLabel: decision.escalationLabel || null,
    staffPacket: decision.staffPacket || null,
    backendFacts: input.backendFacts || null,
    promotions: input.promotions || null,
    bookingDraft: input.bookingDraft || null,
    bookingResult: null,
    reasons: [...(decision.reasons || []), ...(safety.reasons || [])],
    history: [{ status: STATUSES.OPEN, actor: "system", at: timestamp(nowFn) }],
    createdAt: timestamp(nowFn),
    updatedAt: timestamp(nowFn)
  });
}

function transition(items, id, status, meta, nowFn = () => new Date()) {
  const item = items.get(id);
  if (!item) return null;
  const updated = {
    ...item,
    status,
    draftText: meta.editedText || item.draftText,
    updatedAt: timestamp(nowFn),
    history: [
      ...item.history,
      { status, actor: meta.actor || "staff", reason: meta.reason || null, at: timestamp(nowFn) }
    ]
  };
  items.set(id, updated);
  return updated;
}

function priorityFor({ decision, safety }) {
  if (decision.action === "block" || safety.verdict === "block") return "critical";
  if (decision.action === "handoff" || decision.escalationLabel) return "high";
  if (decision.action === "staff_review") return "medium";
  return "low";
}

function matches(filter, item) {
  if (filter.status && item.status !== filter.status) return false;
  if (filter.businessId && item.businessId !== filter.businessId) return false;
  if (filter.priority && item.priority !== filter.priority) return false;
  return true;
}

function normalizeItem(item) {
  return {
    ...item,
    history: Array.isArray(item.history) ? item.history : []
  };
}

function timestamp(nowFn = () => new Date()) {
  return nowFn().toISOString();
}

module.exports = {
  STATUSES,
  createStaffInbox,
  _internal: { priorityFor, matches }
};
