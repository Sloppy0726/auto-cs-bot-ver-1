"use strict";

// Staff Inbox ver 1.0
// In-memory queue for review, handoff, and blocked-message items.

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
  for (const item of config.items || []) {
    items.set(item.id, normalizeItem(item));
  }

  return {
    submit(input) {
      const item = createItem(input || {}, items.size + 1, nowFn);
      items.set(item.id, item);
      return item;
    },
    list(filter = {}) {
      return Array.from(items.values()).filter((item) => matches(filter, item));
    },
    get(id) {
      return items.get(id) || null;
    },
    approve(id, actor = "staff") {
      return transition(items, id, STATUSES.APPROVED, { actor }, nowFn);
    },
    edit(id, editedText, actor = "staff") {
      return transition(items, id, STATUSES.EDITED, { actor, editedText }, nowFn);
    },
    reject(id, reason, actor = "staff") {
      return transition(items, id, STATUSES.REJECTED, { actor, reason }, nowFn);
    },
    takeOver(id, actor = "staff") {
      return transition(items, id, STATUSES.TAKEN_OVER, { actor }, nowFn);
    }
  };
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
