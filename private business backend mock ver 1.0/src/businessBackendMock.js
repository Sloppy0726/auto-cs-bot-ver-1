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
    getMinimalFacts(input) {
      return getMinimalFacts(data, input || {});
    }
  };
}

function checkAvailability(data, query) {
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

function lookupOrder(data, query) {
  const orderId = query.orderId || query.reference;
  const match = recordsFor(data, query.businessId, "orders").find((item) => item.orderId === orderId);
  if (!match) return { found: false, facts: [], reason: "Order not found in mock backend." };
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
  const match = recordsFor(data, query.businessId, "payments").find((item) => item.reference === ref);
  if (!match) return { found: false, facts: [], reason: "Payment not found in mock backend." };
  return {
    found: true,
    facts: minimalFacts(match, ["reference", "status", "amount"]),
    reason: "Payment found in mock backend."
  };
}

function getMinimalFacts(data, input) {
  const intent = input.intent?.primaryIntent || input.intent || "general";
  if (intent === "booking" || intent === "reschedule") return checkAvailability(data, input.query || { businessId: input.businessId });
  if (intent === "order_status") return lookupOrder(data, input.query || { businessId: input.businessId });
  if (intent === "payment") return lookupPayment(data, input.query || { businessId: input.businessId });
  if (intent === "service_info") return getStock(data, input.query || { businessId: input.businessId });
  return { found: false, facts: [], reason: "Intent does not require backend lookup." };
}

function recordsFor(data, businessId, key) {
  return data[businessId]?.[key] || [];
}

function minimalFacts(record, keys) {
  return keys
    .filter((key) => record[key] !== undefined && record[key] !== null)
    .map((key) => ({ key, value: record[key] }));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  createBusinessBackend,
  _internal: { checkAvailability, lookupOrder, getStock, lookupPayment, minimalFacts }
};
