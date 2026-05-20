"use strict";

// HK SME archetype defaults. The boss can override any field per businessId.
// Conservative by default: the owner opts INTO auto_send for each intent,
// never the other way around.

const ARCHETYPES = Object.freeze({
  beauty_clinic: {
    archetype: "beauty_clinic",
    tone: "luxury_beauty",
    autoSendIntents: ["hours_location"],
    reviewIntents: ["pricing", "service_info", "aftercare"],
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
    policies: ["no_refund_decision"],
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
  beauty_demo: { businessId: "beauty_demo", ...ARCHETYPES.beauty_clinic },
  restaurant_demo: { businessId: "restaurant_demo", ...ARCHETYPES.restaurant },
  igshop_demo: { businessId: "igshop_demo", ...ARCHETYPES.ig_shop },
  edu_demo: { businessId: "edu_demo", ...ARCHETYPES.education },
  solara_bazi: { businessId: "solara_bazi", ...ARCHETYPES.bazi_consultant }
});

function getConfig(businessId, overrides) {
  const base = DEMO_BUSINESS_CONFIGS[businessId] || { businessId: businessId || "default", ...ARCHETYPES.general_sme };
  return overrides ? { ...base, ...overrides } : base;
}

module.exports = { ARCHETYPES, DEMO_BUSINESS_CONFIGS, getConfig };
