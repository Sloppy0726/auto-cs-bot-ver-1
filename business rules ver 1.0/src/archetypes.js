"use strict";

// locale SME archetype defaults. The boss can override any field per businessId.
// Conservative by default: the owner opts INTO auto_send for each intent,
// never the other way around.

const ARCHETYPES = Object.freeze({
  beauty_clinic: {
    archetype: "beauty_clinic",
    tone: "luxury_beauty",
    autoSendIntents: ["hours_location", "pricing", "service_info"],
    reviewIntents: ["aftercare"],
    policies: ["no_medical_claim", "deposit_required", "no_refund_decision"],
    askStaffBeforePromise: true
  },
  restaurant: {
    archetype: "restaurant",
    tone: "friendly_local",
    autoSendIntents: ["hours_location", "service_info"],
    reviewIntents: ["pricing"],
    policies: ["no_refund_decision"],
    askStaffBeforePromise: false
  },
  ig_shop: {
    archetype: "ig_shop",
    tone: "casual_ig",
    autoSendIntents: ["service_info", "hours_location"],
    reviewIntents: ["pricing", "order_status"],
    policies: ["no_refund_decision"],
    askStaffBeforePromise: false
  },
  education: {
    archetype: "education",
    tone: "education",
    autoSendIntents: ["hours_location"],
    reviewIntents: ["pricing", "service_info"],
    // no_academic_guarantee: never promise exam/interview results for a child.
    policies: ["no_refund_decision", "no_academic_guarantee"],
    askStaffBeforePromise: true
  },
  bazi_consultant: {
    archetype: "bazi_consultant",
    tone: "mystic_practical",
    autoSendIntents: ["hours_location", "pricing", "service_info", "payment"],
    reviewIntents: ["booking", "complaint", "sensitive_health"],
    policies: ["no_refund_decision"],
    askStaffBeforePromise: false
  },
  general_sme: {
    archetype: "general_sme",
    tone: "polite_professional",
    autoSendIntents: ["hours_location"],
    reviewIntents: ["pricing", "service_info"],
    policies: [],
    askStaffBeforePromise: true
  }
});

// Map businessId → archetype + per-business overrides for our seeded demos.
// In production this comes from the SaaS tenant config table.
const DEMO_BUSINESS_CONFIGS = Object.freeze({
  beauty_demo: {
    businessId: "beauty_demo",
    ...ARCHETYPES.beauty_clinic,
    // Deposit only applies once a depositLedger is wired into the pipeline (opt-in).
    depositPolicy: {
      ttlMinutes: 90,
      rails: { payme: "https://payme.hsbc/glowbeauty", payee: "Glow Beauty Studio" },
      rules: [{ service: "laser", amount: 200 }]
    }
  },
  restaurant_demo: {
    businessId: "restaurant_demo",
    ...ARCHETYPES.restaurant,
    depositPolicy: {
      ttlMinutes: 120,
      currency: "HKD",
      rails: { payme: "https://payme.hsbc/sunriserestaurant", fps: "163829005", payee: "Sunrise Restaurant Ltd" },
      rules: [{ minPartySize: 6, days: [5, 6], fromHour: 19, toHour: 22, amount: 500 }]
    }
  },
  igshop_demo: { businessId: "igshop_demo", ...ARCHETYPES.ig_shop },
  edu_demo: { businessId: "edu_demo", ...ARCHETYPES.education },
  // BrightPath Learning Centre — the education-centre vertical demo tenant.
  // businessId matches centre_id in verticals/education-centre/demo-data/brightpath-centre.json.
  // Shares the education archetype safety settings with edu_demo.
  "brightpath-demo": { businessId: "brightpath-demo", ...ARCHETYPES.education },
  solara_bazi: { businessId: "solara_bazi", ...ARCHETYPES.bazi_consultant }
});

function getConfig(businessId, overrides) {
  const base = DEMO_BUSINESS_CONFIGS[businessId] || { businessId: businessId || "default", ...ARCHETYPES.general_sme };
  return overrides ? { ...base, ...overrides } : base;
}

module.exports = { ARCHETYPES, DEMO_BUSINESS_CONFIGS, getConfig };
