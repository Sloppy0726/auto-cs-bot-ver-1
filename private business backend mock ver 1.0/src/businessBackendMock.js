"use strict";

// Private Business Backend Mock ver 1.0
// Controlled business facts. The AI flow can consume only minimal sanitized facts.

const defaultData = require("../seed/mockBusinessData");

function createBusinessBackend(config = {}) {
  const data = clone(config.data || defaultData);
  return {
    checkAvailability(query) {
      return checkAvailability(data, query || {});
    },
    lookupOrder(query) {
      return lookupOrder(data, query || {});
    },
    getStock(query) {
      return getStock(data, query || {});
    },
    lookupPayment(query) {
      return lookupPayment(data, query || {});
    },
    lookupPricing(query) {
      return lookupPricing(data, query || {});
    },
    lookupMember(query) {
      return lookupMember(data, query || {});
    },
    getMinimalFacts(input) {
      return getMinimalFacts(data, input || {});
    }
  };
}

function checkAvailability(data, query) {
  if (shouldListAvailability(query)) {
    return listAvailability(data, query);
  }

  const missing = missingAvailabilityFields(query);
  if (missing.length > 0) {
    return {
      found: false,
      available: null,
      facts: [],
      reason: `Missing required availability field(s): ${missing.join(", ")}.`
    };
  }

  const records = recordsFor(data, query.businessId, "availability");
  const match = records.find((item) => {
    return (!query.date || item.date === query.date)
      && (!query.time || item.time === query.time)
      && (!query.service || item.service === query.service)
      && (!query.partySize || item.partySize === query.partySize);
  });
  if (!match) {
    return { found: false, available: null, facts: [], reason: "No matching availability record in mock backend." };
  }
  return {
    found: true,
    available: Boolean(match.available),
    facts: minimalFacts(match, ["date", "time", "service", "partySize", "available"]),
    reason: match.available ? "Mock backend has an available slot/table." : "Mock backend record is unavailable."
  };
}

function shouldListAvailability(query) {
  if (!query?.businessId || !query.date || query.time) return false;
  if (query.businessId === "restaurant_demo") return Boolean(query.partySize);
  return Boolean(query.service);
}

function listAvailability(data, query) {
  const records = recordsFor(data, query.businessId, "availability")
    .filter((item) => {
      return item.date === query.date
        && (!query.service || item.service === query.service)
        && (!query.partySize || item.partySize === query.partySize);
    })
    .sort((left, right) => String(left.time).localeCompare(String(right.time)));
  const availableSlots = records
    .filter((item) => item.available)
    .map((item) => item.time);
  const facts = minimalFacts({ ...query, availableSlots }, ["date", "service", "partySize", "availableSlots"]);

  if (records.length === 0) {
    return {
      found: false,
      available: null,
      facts,
      reason: "No matching availability records in mock backend."
    };
  }

  return {
    found: true,
    available: availableSlots.length > 0,
    facts,
    reason: availableSlots.length > 0
      ? `Mock backend has ${availableSlots.length} available slot(s).`
      : "Mock backend has matching records but no available slots."
  };
}

function missingAvailabilityFields(query) {
  const missing = [];
  if (!query.businessId) missing.push("businessId");
  if (!query.date) missing.push("date");
  if (!query.time) missing.push("time");
  if (query.businessId === "restaurant_demo" && !query.partySize) missing.push("partySize");
  if (query.businessId !== "restaurant_demo" && !query.service) missing.push("service");
  return missing;
}

function lookupOrder(data, query) {
  const orderId = query.orderId || query.reference;
  const match = recordsFor(data, query.businessId, "orders").find((item) => item.orderId === orderId && matchesCustomer(item, query));
  if (!match) return { found: false, facts: [], reason: "Order not found or not verified for this sender." };
  return {
    found: true,
    facts: minimalFacts(match, ["orderId", "status", "shipmentStatus", "courier"]),
    reason: "Order found in mock backend."
  };
}

function getStock(data, query) {
  const records = recordsFor(data, query.businessId, "stock");
  const sku = String(query.sku || "").toLowerCase();
  const name = String(query.name || "").toLowerCase();
  const match = records.find((item) => {
    return (sku && item.sku.toLowerCase() === sku) || (name && item.name.toLowerCase().includes(name));
  });
  if (!match) return { found: false, available: null, facts: [], reason: "Stock item not found in mock backend." };
  return {
    found: true,
    available: Boolean(match.available),
    facts: minimalFacts(match, ["sku", "name", "available", "quantity"]),
    reason: match.available ? "Stock is available in mock backend." : "Stock is unavailable in mock backend."
  };
}

function lookupPayment(data, query) {
  const ref = query.reference || query.orderId;
  const match = recordsFor(data, query.businessId, "payments").find((item) => item.reference === ref && matchesCustomer(item, query));
  if (!match) return { found: false, facts: [], reason: "Payment not found or not verified for this sender." };
  return {
    found: true,
    facts: minimalFacts(match, ["reference", "status", "amount"]),
    reason: "Payment found in mock backend."
  };
}

function lookupPricing(data, query) {
  const records = recordsFor(data, query.businessId, "pricing");
  const service = String(query.service || "").toLowerCase();
  const plan = String(query.plan || query.planId || "").toLowerCase();
  const matches = records.filter((item) => {
    const serviceMatches = !service || String(item.service || "").toLowerCase() === service;
    const planMatches = !plan
      || String(item.planId || "").toLowerCase() === plan
      || String(item.planNameZh || "").toLowerCase().includes(plan)
      || String(item.planNameEn || "").toLowerCase().includes(plan);
    return serviceMatches && planMatches;
  });

  if (matches.length === 0) return { found: false, facts: [], reason: "Pricing plan not found in mock backend." };
  return {
    found: true,
    facts: matches.flatMap((item) => pricingFacts(item)),
    reason: `Found ${matches.length} pricing plan(s) in mock backend.`
  };
}

function lookupMember(data, query) {
  const memberId = String(query.memberId || "").trim();
  if (!memberId) {
    return { found: false, facts: [], reason: "Missing memberId. Ask for the 8-digit member ID." };
  }
  if (!/^\d{8}$/.test(memberId)) {
    return { found: false, facts: [], reason: "Member ID must be exactly 8 digits." };
  }

  const match = recordsFor(data, query.businessId, "members").find((item) => item.memberId === memberId);
  if (!match) return { found: false, facts: [], reason: "Member not found in mock backend." };
  return {
    found: true,
    facts: memberFacts(match),
    reason: "Member found in mock backend."
  };
}

function getMinimalFacts(data, input) {
  const intent = input.intent?.primaryIntent || input.intent || "general";
  if (intent === "pricing") return lookupPricing(data, input.query || { businessId: input.businessId });
  if (intent === "booking" || intent === "reschedule") return checkAvailability(data, input.query || { businessId: input.businessId });
  if (intent === "order_status") return lookupOrder(data, input.query || { businessId: input.businessId });
  if (intent === "payment") return lookupPayment(data, input.query || { businessId: input.businessId });
  if (intent === "membership") return lookupMember(data, input.query || { businessId: input.businessId });
  if (intent === "service_info") return getStock(data, input.query || { businessId: input.businessId });
  return { found: false, facts: [], reason: "Intent does not require backend lookup." };
}

function recordsFor(data, businessId, key) {
  return data[businessId]?.[key] || [];
}

function matchesCustomer(record, query) {
  if (!record.customerExternalId) return true;
  return Boolean(query.senderId) && record.customerExternalId === query.senderId;
}

function minimalFacts(record, keys) {
  return keys
    .filter((key) => record[key] !== undefined && record[key] !== null)
    .map((key) => ({ key, value: record[key] }));
}

function pricingFacts(record) {
  return [
    { key: "planId", value: record.planId },
    { key: "service", value: record.service },
    { key: "planNameZh", value: record.planNameZh },
    { key: "planNameEn", value: record.planNameEn },
    { key: "descriptionZh", value: record.descriptionZh },
    { key: "descriptionEn", value: record.descriptionEn },
    { key: "priceHkd", value: record.priceHkd },
    { key: "originalPriceHkd", value: record.originalPriceHkd },
    { key: "durationMinutes", value: record.durationMinutes },
    { key: "sessions", value: record.sessions },
    { key: "depositHkd", value: record.depositHkd },
    { key: "notesZh", value: record.notesZh },
    { key: "notesEn", value: record.notesEn }
  ].filter((fact) => fact.value !== undefined && fact.value !== null);
}

function memberFacts(record) {
  const points = Number(record.points || 0);
  const rewardThreshold = 10;
  const freeTreatmentsAvailable = Math.floor(points / rewardThreshold);
  const pointsUntilNextReward = freeTreatmentsAvailable > 0 ? 0 : rewardThreshold - (points % rewardThreshold);
  return [
    { key: "memberId", value: record.memberId },
    { key: "displayName", value: record.displayName },
    { key: "points", value: points },
    { key: "pointsPerTreatment", value: 1 },
    { key: "rewardThreshold", value: rewardThreshold },
    { key: "freeTreatmentsAvailable", value: freeTreatmentsAvailable },
    { key: "pointsUntilNextReward", value: pointsUntilNextReward }
  ];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  createBusinessBackend,
  _internal: { checkAvailability, lookupOrder, getStock, lookupPayment, lookupPricing, lookupMember, matchesCustomer, minimalFacts, missingAvailabilityFields, pricingFacts, memberFacts, listAvailability }
};
