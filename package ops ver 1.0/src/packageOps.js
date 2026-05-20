"use strict";

const DEFAULT_OPTIONS = Object.freeze({
  expiringSoonDays: 14
});

function createPackageStore(config = {}) {
  const entries = normalizeEntries(config.entries || []);
  const options = { ...DEFAULT_OPTIONS, ...(config.options || {}) };
  return {
    lookup(input = {}) {
      return lookup(entries, input, options);
    },
    list(businessId) {
      return entries.filter((entry) => entry.businessId === businessId).map(toPublicPackage);
    },
    has(businessId) {
      return entries.some((entry) => entry.businessId === businessId);
    }
  };
}

function lookup(entries, input, options) {
  const businessId = input.businessId || "default";
  const senderId = input.senderId || "";
  const sanitizedText = String(input.sanitizedText || "");
  const nowKey = dateKey(input.now || new Date());
  const senderMatches = entries.filter((entry) => entry.businessId === businessId && entry.customerExternalId === senderId);

  if (!senderId || senderMatches.length === 0) {
    return result({
      businessId,
      found: false,
      verifiedSender: false,
      packages: [],
      bestPackage: null,
      autoSendEligible: false,
      approvedReplyText: null,
      riskFlags: ["sender_not_verified"],
      grounding: [],
      reasons: ["No verified package record matched this sender."]
    });
  }

  const packages = senderMatches.map((entry) => decoratePackage(entry, nowKey, options));
  const bestPackage = pickBestPackage(packages, sanitizedText);
  const riskFlags = [...new Set(packages.flatMap((item) => item.riskFlags))];
  const bestRiskFlags = bestPackage?.riskFlags || [];
  const autoSendEligible = Boolean(bestPackage)
    && bestPackage.status === "active"
    && !bestRiskFlags.some((flag) => ["expired", "disputed", "prior_complaint"].includes(flag));
  const approvedReplyText = autoSendEligible ? replyFor(bestPackage) : null;

  return result({
    businessId,
    found: true,
    verifiedSender: true,
    packages,
    bestPackage,
    autoSendEligible,
    approvedReplyText,
    riskFlags,
    grounding: packages.map((item) => item.id),
    reasons: [
      `Matched ${packages.length} verified package record(s).`,
      autoSendEligible ? "Package facts are eligible for deterministic reply." : "Package facts require staff review."
    ]
  });
}

function normalizeEntries(rawEntries) {
  return rawEntries
    .filter((entry) => entry && typeof entry === "object" && entry.enabled !== false)
    .map((entry) => ({
      id: String(entry.id),
      businessId: entry.businessId || "default",
      customerExternalId: String(entry.customerExternalId || ""),
      customerName: entry.customerName || "",
      packageName: entry.packageName || "",
      serviceName: entry.serviceName || "",
      totalSessions: Number(entry.totalSessions) || 0,
      usedSessions: Number(entry.usedSessions) || 0,
      expiryDate: entry.expiryDate || null,
      lastServiceDate: entry.lastServiceDate || null,
      termsRef: entry.termsRef || null,
      status: entry.status || "active",
      riskFlags: Array.isArray(entry.riskFlags) ? entry.riskFlags.map(String) : []
    }));
}

function decoratePackage(entry, nowKey, options) {
  const remainingSessions = Math.max(0, entry.totalSessions - entry.usedSessions);
  const riskFlags = new Set(entry.riskFlags);
  let status = entry.status;
  if (entry.expiryDate && entry.expiryDate < nowKey) {
    status = "expired";
    riskFlags.add("expired");
  }
  if (status === "disputed") riskFlags.add("prior_complaint");
  if (status === "active" && entry.expiryDate && daysBetween(nowKey, entry.expiryDate) <= options.expiringSoonDays) {
    riskFlags.add("expiring_soon");
  }

  return {
    ...toPublicPackage(entry),
    remainingSessions,
    status,
    riskFlags: [...riskFlags]
  };
}

function pickBestPackage(packages, sanitizedText) {
  const lower = sanitizedText.toLowerCase();
  const serviceHit = packages.find((item) => {
    const service = String(item.serviceName || "").toLowerCase();
    if (!service) return false;
    if (lower.includes(service)) return true;
    return service.split(/\s+/).some((part) => part.length >= 2 && lower.includes(part));
  });
  if (serviceHit) return serviceHit;
  return packages[0] || null;
}

function replyFor(pkg) {
  const name = pkg.customerName ? `${pkg.customerName}，` : "";
  return `${name}你而家剩餘 ${pkg.remainingSessions} 次${pkg.serviceName ? pkg.serviceName : pkg.packageName}，套票到期日係 ${pkg.expiryDate}。`;
}

function result(payload) {
  return {
    businessId: payload.businessId,
    found: payload.found,
    verifiedSender: payload.verifiedSender,
    packages: payload.packages,
    bestPackage: payload.bestPackage,
    autoSendEligible: payload.autoSendEligible,
    approvedReplyText: payload.approvedReplyText,
    riskFlags: payload.riskFlags,
    grounding: payload.grounding,
    reasons: payload.reasons
  };
}

function toPublicPackage(entry) {
  return {
    id: entry.id,
    businessId: entry.businessId,
    customerName: entry.customerName,
    packageName: entry.packageName,
    serviceName: entry.serviceName,
    totalSessions: entry.totalSessions,
    usedSessions: entry.usedSessions,
    expiryDate: entry.expiryDate,
    lastServiceDate: entry.lastServiceDate,
    termsRef: entry.termsRef,
    status: entry.status
  };
}

function dateKey(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value || "").slice(0, 10);
}

function daysBetween(startKey, endKey) {
  const start = Date.parse(`${startKey}T00:00:00.000Z`);
  const end = Date.parse(`${endKey}T00:00:00.000Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return Infinity;
  return Math.floor((end - start) / 86_400_000);
}

module.exports = {
  createPackageStore,
  _internal: { lookup, normalizeEntries, decoratePackage, pickBestPackage, replyFor, daysBetween }
};
