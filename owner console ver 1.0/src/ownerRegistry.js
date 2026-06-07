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

// Match on digit equality OR suffix (a stored "61112222" matches "85261112222")
// so owners can list numbers with or without the country code.
function isOwner(senderId, phones) {
  const sender = normalizePhone(senderId);
  if (!sender) return false;
  return phones.some((p) => p === sender || sender.endsWith(p) || p.endsWith(sender));
}

module.exports = { normalizePhone, loadOwnerPhones, isOwner };
