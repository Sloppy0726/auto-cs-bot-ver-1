"use strict";

const standardCases = [
  availability("beauty available facial slot", "beauty_demo", "2026-05-09", "19:00", "facial", undefined, true, true),
  availability("beauty unavailable facial slot", "beauty_demo", "2026-05-09", "20:00", "facial", undefined, true, false),
  availability("restaurant available early dinner table", "restaurant_demo", "2026-05-09", "18:30", undefined, 2, true, true),
  availability("restaurant unavailable peak dinner table", "restaurant_demo", "2026-05-09", "20:00", undefined, 4, true, false),
  stock("ig shop black tee has stock", "igshop_demo", "TEE-BLK-M", undefined, true, true),
  stock("ig shop cream tote is sold out", "igshop_demo", "BAG-CREAM", undefined, true, false),
  order("ig shop paid order lookup", "igshop_demo", "IG1001", true),
  order("ig shop shipped order lookup", "igshop_demo", "IG1002", true),
  payment("ig shop FPS payment received", "igshop_demo", "FPS-IG1001", true)
];

const availabilityScenarios = [
  availability("beauty wrong date has no facial slot", "beauty_demo", "2026-05-10", "19:00", "facial", undefined, false, null),
  availability("beauty wrong service has no laser slot", "beauty_demo", "2026-05-09", "19:00", "laser", undefined, false, null),
  availability("restaurant wrong party size has no table", "restaurant_demo", "2026-05-09", "18:30", undefined, 5, false, null),
  availability("education assessment slot is available", "edu_demo", "2026-05-10", "14:00", "assessment", undefined, true, true),
  availability("education evening assessment not in mock backend", "edu_demo", "2026-05-10", "19:00", "assessment", undefined, false, null),
  availability("unknown business booking lookup is empty", "unknown_business", "2026-05-09", "19:00", "facial", undefined, false, null)
];

const stockScenarios = [
  stock("stock lookup by product name finds black tee", "igshop_demo", undefined, "black tee", true, true),
  stock("stock lookup by lowercase sku finds black tee", "igshop_demo", "tee-blk-m", undefined, true, true),
  stock("stock lookup missing sku returns not found", "igshop_demo", "TEE-WHT-S", undefined, false, null),
  stock("restaurant has no retail stock records", "restaurant_demo", "TEE-BLK-M", undefined, false, null),
  stock("beauty has no product stock records", "beauty_demo", "SERUM-001", undefined, false, null)
];

const orderScenarios = [
  order("unknown IG order is not found", "igshop_demo", "IG9999", false),
  order("restaurant order lookup stays private and empty", "restaurant_demo", "IG1001", false),
  order("beauty order lookup stays empty", "beauty_demo", "IG1002", false)
];

const paymentScenarios = [
  payment("unknown FPS payment is not found", "igshop_demo", "FPS-MISSING", false),
  payment("beauty payment lookup does not expose IG payment", "beauty_demo", "FPS-IG1001", false),
  payment("restaurant payment lookup is empty", "restaurant_demo", "FPS-IG1001", false)
];

const minimalFactsScenarios = [
  minimal("minimal facts booking routes to availability", "beauty_demo", "booking", { businessId: "beauty_demo", date: "2026-05-09", time: "19:00", service: "facial" }, true),
  minimal("minimal facts reschedule routes to availability", "restaurant_demo", "reschedule", { businessId: "restaurant_demo", date: "2026-05-09", time: "18:30", partySize: 2 }, true),
  minimal("minimal facts order status routes to order lookup", "igshop_demo", "order_status", { businessId: "igshop_demo", orderId: "IG1001" }, true),
  minimal("minimal facts payment routes to payment lookup", "igshop_demo", "payment", { businessId: "igshop_demo", reference: "FPS-IG1001" }, true),
  minimal("minimal facts service info routes to stock lookup", "igshop_demo", "service_info", { businessId: "igshop_demo", sku: "TEE-BLK-M" }, true),
  minimal("minimal facts general skips backend lookup", "igshop_demo", "general", { businessId: "igshop_demo", sku: "TEE-BLK-M" }, false)
];

for (const scenario of [
  ...availabilityScenarios,
  ...stockScenarios,
  ...orderScenarios,
  ...paymentScenarios,
  ...minimalFactsScenarios
]) {
  standardCases.push(scenario);
}

const businesses = ["beauty_demo", "restaurant_demo", "igshop_demo", "edu_demo", "unknown_business"];
const times = ["11:00", "14:00", "18:30", "19:00", "20:00", "21:30"];
const skus = ["TEE-BLK-M", "BAG-CREAM", "TEE-WHT-S", "SERUM-001", "COURSE-P3"];
let index = 1;
while (standardCases.length < 100) {
  const businessId = businesses[index % businesses.length];
  if (index % 4 === 0) {
    standardCases.push(availability(`matrix availability ${businessId} future empty slot ${index}`, businessId, "2027-01-01", times[index % times.length], index % 2 ? "facial" : undefined, index % 3 === 0 ? 4 : undefined, false, null));
  } else if (index % 4 === 1) {
    const sku = skus[index % skus.length];
    const found = businessId === "igshop_demo" && ["TEE-BLK-M", "BAG-CREAM"].includes(sku);
    const available = found ? (sku === "TEE-BLK-M") : null;
    standardCases.push(stock(`matrix stock ${businessId} ${sku} ${index}`, businessId, sku, undefined, found, available));
  } else if (index % 4 === 2) {
    const orderId = index % 3 === 0 ? "IG1002" : `IG${3000 + index}`;
    standardCases.push(order(`matrix order ${businessId} ${orderId} ${index}`, businessId, orderId, businessId === "igshop_demo" && orderId === "IG1002"));
  } else {
    const ref = index % 5 === 0 ? "FPS-IG1001" : `FPS-MOCK-${index}`;
    standardCases.push(payment(`matrix payment ${businessId} ${ref} ${index}`, businessId, ref, businessId === "igshop_demo" && ref === "FPS-IG1001"));
  }
  index += 1;
}

function availability(name, businessId, date, time, service, partySize, expectFound, expectAvailable) {
  return {
    name,
    fn: "checkAvailability",
    query: { businessId, date, time, service, partySize },
    expectFound,
    expectAvailable
  };
}

function stock(name, businessId, sku, nameQuery, expectFound, expectAvailable) {
  return {
    name,
    fn: "getStock",
    query: { businessId, sku, name: nameQuery },
    expectFound,
    expectAvailable
  };
}

function order(name, businessId, orderId, expectFound) {
  return {
    name,
    fn: "lookupOrder",
    query: { businessId, orderId },
    expectFound
  };
}

function payment(name, businessId, reference, expectFound) {
  return {
    name,
    fn: "lookupPayment",
    query: { businessId, reference },
    expectFound
  };
}

function minimal(name, businessId, intent, query, expectFound) {
  return {
    name,
    fn: "getMinimalFacts",
    query: { businessId, intent: { primaryIntent: intent }, query },
    expectFound
  };
}

module.exports = { standardCases };
