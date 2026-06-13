"use strict";

// A restaurant deposit policy: HK$500 hold for parties of 6+ on Fri/Sat 19:00–22:00.
const restaurantPolicyConfig = {
  businessId: "restaurant_demo",
  depositPolicy: {
    ttlMinutes: 120,
    currency: "HKD",
    rails: { payme: "https://payme.hsbc/sunriserestaurant", fps: "163829005", payee: "Sunrise Restaurant Ltd" },
    rules: [
      { minPartySize: 6, days: [5, 6], fromHour: 19, toHour: 22, amount: 500 }
    ]
  }
};

// A beauty policy: HK$200 deposit for first-time laser, any day.
const beautyPolicyConfig = {
  businessId: "beauty_demo",
  depositPolicy: {
    ttlMinutes: 90,
    rails: { payme: "https://payme.hsbc/glowbeauty" },
    rules: [{ service: "laser", amount: 200 }]
  }
};

// bookingDraft snapshots (as the pipeline's inferBookingDraft would produce).
const fridayBigParty = { businessId: "restaurant_demo", date: "2026-06-19", time: "20:00", partySize: 8 }; // 2026-06-19 = Friday
const tuesdaySmallParty = { businessId: "restaurant_demo", date: "2026-06-16", time: "20:00", partySize: 2 }; // Tue, below threshold
const fridayLunch = { businessId: "restaurant_demo", date: "2026-06-19", time: "12:30", partySize: 8 }; // Fri but lunch, outside window
const laserBooking = { businessId: "beauty_demo", date: "2026-06-20", time: "15:00", service: "laser" };
const facialBooking = { businessId: "beauty_demo", date: "2026-06-20", time: "15:00", service: "facial" };

module.exports = {
  restaurantPolicyConfig,
  beautyPolicyConfig,
  fridayBigParty,
  tuesdaySmallParty,
  fridayLunch,
  laserBooking,
  facialBooking
};
