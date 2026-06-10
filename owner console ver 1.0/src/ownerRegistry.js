"use strict";

// Identifies the business owner by phone number. Owner numbers come from the
// OWNER_PHONES env var (comma-separated). Everyone else stays on the normal
// customer-support flow.

// Reduce a phone/senderId to comparable digits. Handles WhatsApp ids like
// "85261112222@c.us", "+852 6111 2222", "tg:12345", etc.
function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function loadOwnerPhones(env = process.env) {
  return String(env.OWNER_PHONES || "")
    .split(",")
    .map((p) => normalizePhone(p))
    .filter(Boolean);
}

// HK phone numbers are 8 local digits. Match on the full normalized number, or
// on the last 8 digits so owners can list numbers with or without the +852
// country code. We deliberately do NOT match on an arbitrary short suffix: the
// old bidirectional endsWith let a short, attacker-chosen senderId (e.g. a
// website sessionId normalized down to a few digits) match a real owner number
// and seize owner privileges. Both sides must carry at least a full local number.
function isOwner(senderId, phones) {
  const sender = normalizePhone(senderId);
  if (sender.length < 8) return false;
  return phones.some((p) => {
    if (p.length < 8) return false;
    return p === sender || p.slice(-8) === sender.slice(-8);
  });
}

module.exports = { normalizePhone, loadOwnerPhones, isOwner };
