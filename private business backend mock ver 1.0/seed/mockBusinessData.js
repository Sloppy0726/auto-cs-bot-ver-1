"use strict";

module.exports = {
  beauty_demo: {
    availability: [
      { date: "2026-05-09", time: "19:00", service: "facial", available: true, staff: "Amy" },
      { date: "2026-05-09", time: "20:00", service: "facial", available: false, staff: null }
    ],
    stock: [],
    orders: [],
    payments: []
  },
  restaurant_demo: {
    availability: [
      { date: "2026-05-09", time: "18:30", partySize: 2, available: true, table: "T2" },
      { date: "2026-05-09", time: "20:00", partySize: 4, available: false, table: null }
    ],
    stock: [],
    orders: [],
    payments: []
  },
  igshop_demo: {
    availability: [],
    stock: [
      { sku: "TEE-BLK-M", name: "Black tee M", available: true, quantity: 8 },
      { sku: "BAG-CREAM", name: "Cream tote bag", available: false, quantity: 0 }
    ],
    orders: [
      { orderId: "IG1001", customerExternalId: "ig_sender_1001", status: "paid", shipmentStatus: "pending", courier: "SF Express", trackingNo: null },
      { orderId: "IG1002", customerExternalId: "ig_sender_1002", status: "shipped", shipmentStatus: "in_transit", courier: "SF Express", trackingNo: "SF123456" }
    ],
    payments: [{ reference: "FPS-IG1001", customerExternalId: "ig_sender_1001", status: "received", amount: 500 }]
  },
  edu_demo: {
    availability: [
      { date: "2026-05-10", time: "14:00", service: "assessment", available: true, teacher: "Ms Chan" }
    ],
    stock: [],
    orders: [],
    payments: []
  }
};
