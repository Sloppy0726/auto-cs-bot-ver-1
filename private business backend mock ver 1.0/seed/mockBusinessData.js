"use strict";

module.exports = {
  beauty_demo: {
    customers: [
      { customerExternalId: "beauty_customer_amy", displayName: "Amy C.", tier: "trial", notes: "Sensitive skin; prefers evening slots." },
      { customerExternalId: "beauty_customer_may", displayName: "May L.", tier: "package", notes: "Has facial package balance." }
    ],
    availability: [
      { date: "2026-05-09", time: "19:00", service: "facial", available: true, staff: "Amy" },
      { date: "2026-05-09", time: "20:00", service: "facial", available: false, staff: null },
      { date: "2026-05-20", time: "19:00", service: "facial", available: true, staff: "Amy" },
      { date: "2026-05-20", time: "20:30", service: "facial", available: false, staff: null },
      { date: "2026-05-21", time: "13:00", service: "facial", available: true, staff: "Amy" },
      { date: "2026-05-21", time: "18:30", service: "facial", available: true, staff: "Joey" },
      { date: "2026-05-21", time: "18:00", service: "laser", available: true, staff: "Joey" },
      { date: "2026-05-21", time: "19:30", service: "assessment", available: true, staff: "Amy" }
    ],
    bookings: [
      { bookingId: "B-FACIAL-2001", customerExternalId: "beauty_customer_may", date: "2026-05-20", time: "19:00", service: "facial", status: "tentative", depositStatus: "unpaid" }
    ],
    pricing: [
      {
        planId: "BEAUTY-FACIAL-TRIAL",
        service: "facial",
        planNameZh: "首次體驗面部護理",
        descriptionZh: "適合第一次到店客人，包含基本皮膚狀態分析、深層清潔、保濕導入及舒緩面膜。",
        priceHkd: 380,
        originalPriceHkd: 680,
        durationMinutes: 75,
        sessions: 1,
        depositHkd: 200,
        notesZh: "只限新客一次；預約需先付留位費，療程當日可扣回。"
      },
      {
        planId: "BEAUTY-FACIAL-SINGLE",
        service: "facial",
        planNameZh: "皇牌保濕修護護理",
        descriptionZh: "針對乾燥、暗啞及屏障不穩肌膚，重點做補水、舒緩及修護。",
        priceHkd: 680,
        originalPriceHkd: null,
        durationMinutes: 90,
        sessions: 1,
        depositHkd: 200,
        notesZh: "效果因人而異，療程前會先做皮膚狀態評估。"
      },
      {
        planId: "BEAUTY-FACIAL-5",
        service: "facial",
        planNameZh: "面部護理五次套票",
        descriptionZh: "適合想定期保養的客人，可按皮膚狀態安排保濕、舒緩或清潔護理。",
        priceHkd: 2980,
        originalPriceHkd: 3400,
        durationMinutes: 90,
        sessions: 5,
        depositHkd: 200,
        notesZh: "套票有效期六個月；不可轉讓，不保證指定效果。"
      },
      {
        planId: "BEAUTY-LASER-UNDERARM",
        service: "laser",
        planNameZh: "腋下脫毛單次護理",
        descriptionZh: "適合想了解脫毛流程的客人，療程前需由同事確認膚況及禁忌事項。",
        priceHkd: 480,
        originalPriceHkd: 680,
        durationMinutes: 30,
        sessions: 1,
        depositHkd: 200,
        notesZh: "懷孕、皮膚敏感、傷口或用藥情況需先由真人同事跟進。"
      }
    ],
    stock: [
      { sku: "SERUM-CALM-30", name: "Calming serum 30ml", available: true, quantity: 12 },
      { sku: "MASK-HYDRATE", name: "Hydrating mask box", available: false, quantity: 0 }
    ],
    orders: [],
    payments: [
      { reference: "DEP-B-FACIAL-2001", customerExternalId: "beauty_customer_may", status: "pending", amount: 200 }
    ]
  },
  restaurant_demo: {
    customers: [
      { customerExternalId: "table_guest_001", displayName: "Chris W.", notes: "Usually books for two." },
      { customerExternalId: "table_guest_004", displayName: "Ms Lee", notes: "Asked about birthday dinner." }
    ],
    availability: [
      { date: "2026-05-09", time: "18:30", partySize: 2, available: true, table: "T2" },
      { date: "2026-05-09", time: "20:00", partySize: 4, available: false, table: null },
      { date: "2026-05-20", time: "18:30", partySize: 2, available: true, table: "T5" },
      { date: "2026-05-20", time: "20:00", partySize: 4, available: false, table: null },
      { date: "2026-05-21", time: "19:00", partySize: 4, available: true, table: "T8" },
      { date: "2026-05-21", time: "21:00", partySize: 6, available: false, table: null }
    ],
    bookings: [
      { bookingId: "R-BOOK-9001", customerExternalId: "table_guest_001", date: "2026-05-20", time: "18:30", partySize: 2, status: "tentative" }
    ],
    stock: [],
    orders: [],
    payments: []
  },
  igshop_demo: {
    customers: [
      { customerExternalId: "ig_sender_1001", handle: "@cass_shop", displayName: "Cass", notes: "Asked for locker pickup." },
      { customerExternalId: "ig_sender_1002", handle: "@tony_hk", displayName: "Tony", notes: "Has shipped order." },
      { customerExternalId: "local-browser-demo", handle: "@demo_user", displayName: "Demo User", notes: "Browser test account." }
    ],
    availability: [],
    stock: [
      { sku: "TEE-BLK-M", name: "Black tee M", available: true, quantity: 8 },
      { sku: "TEE-WHT-S", name: "White tee S", available: true, quantity: 3 },
      { sku: "BAG-CREAM", name: "Cream tote bag", available: false, quantity: 0 },
      { sku: "CAP-NAVY", name: "Navy cap", available: true, quantity: 15 },
      { sku: "DRESS-FLORAL-M", name: "Floral dress M", available: true, quantity: 2 }
    ],
    orders: [
      { orderId: "IG1001", customerExternalId: "ig_sender_1001", status: "paid", shipmentStatus: "pending", courier: "SF Express", trackingNo: null },
      { orderId: "IG1002", customerExternalId: "ig_sender_1002", status: "shipped", shipmentStatus: "in_transit", courier: "SF Express", trackingNo: "SF123456" },
      { orderId: "IG2001", customerExternalId: "local-browser-demo", status: "packed", shipmentStatus: "ready_for_pickup", courier: "SF Express", trackingNo: null },
      { orderId: "IG2002", customerExternalId: "local-browser-demo", status: "awaiting_payment", shipmentStatus: "not_started", courier: null, trackingNo: null }
    ],
    payments: [
      { reference: "FPS-IG1001", customerExternalId: "ig_sender_1001", status: "received", amount: 500 },
      { reference: "FPS-IG2001", customerExternalId: "local-browser-demo", status: "received", amount: 680 },
      { reference: "FPS-IG2002", customerExternalId: "local-browser-demo", status: "not_found", amount: 0 }
    ]
  },
  edu_demo: {
    customers: [
      { customerExternalId: "parent_demo_001", displayName: "Parent Demo", notes: "Interested in P3 English." },
      { customerExternalId: "parent_chan_002", displayName: "Mrs Chan", notes: "Asked for trial assessment." }
    ],
    availability: [
      { date: "2026-05-10", time: "14:00", service: "assessment", available: true, teacher: "Ms Chan" },
      { date: "2026-05-20", time: "17:30", service: "assessment", available: true, teacher: "Mr Wong" },
      { date: "2026-05-21", time: "18:30", service: "assessment", available: false, teacher: null },
      { date: "2026-05-23", time: "11:00", service: "p3_english", available: true, teacher: "Ms Chan" }
    ],
    bookings: [
      { bookingId: "E-ASSESS-3001", customerExternalId: "parent_demo_001", date: "2026-05-20", time: "17:30", service: "assessment", status: "tentative" }
    ],
    stock: [],
    orders: [],
    payments: []
  }
};
