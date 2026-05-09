"use strict";

const standardCases = [
  {
    name: "beauty available facial slot",
    fn: "checkAvailability",
    query: { businessId: "beauty_demo", date: "2026-05-09", time: "19:00", service: "facial" },
    expectFound: true,
    expectAvailable: true
  },
  {
    name: "restaurant unavailable table",
    fn: "checkAvailability",
    query: { businessId: "restaurant_demo", date: "2026-05-09", time: "20:00", partySize: 4 },
    expectFound: true,
    expectAvailable: false
  },
  {
    name: "ig shop stock available",
    fn: "getStock",
    query: { businessId: "igshop_demo", sku: "TEE-BLK-M" },
    expectFound: true,
    expectAvailable: true
  },
  {
    name: "ig shop order lookup",
    fn: "lookupOrder",
    query: { businessId: "igshop_demo", orderId: "IG1002" },
    expectFound: true
  }
];

module.exports = { standardCases };
