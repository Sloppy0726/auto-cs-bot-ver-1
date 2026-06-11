"use strict";

// Focused unit tests for tenant → archetype mapping.
// Proves brightpath-demo (the education-centre vertical demo tenant) inherits
// the education archetype safety settings.

const assert = require("node:assert/strict");
const { ARCHETYPES, DEMO_BUSINESS_CONFIGS, getConfig } = require("../src/archetypes");

let passed = 0;

// brightpath-demo is registered as a known demo tenant.
assert.ok(DEMO_BUSINESS_CONFIGS["brightpath-demo"], "brightpath-demo must be a registered demo tenant");
passed += 1;

const cfg = getConfig("brightpath-demo");

// businessId matches centre_id in verticals/education-centre/demo-data/brightpath-centre.json.
assert.equal(cfg.businessId, "brightpath-demo", "businessId must be brightpath-demo");
passed += 1;

// It is mapped to the education archetype, not the general_sme fallback.
assert.equal(cfg.archetype, "education", "brightpath-demo must map to the education archetype");
assert.equal(cfg.tone, "education", "brightpath-demo must use the education tone");
passed += 1;

// Education safety settings: conservative review + ask-staff-before-promise + no refund decisions.
assert.equal(cfg.askStaffBeforePromise, true, "education tenants must ask staff before promising");
assert.deepEqual(cfg.autoSendIntents, ["hours_location"], "only hours_location may auto-send");
assert.deepEqual(cfg.reviewIntents, ["pricing", "service_info"], "pricing & service_info must route to review");
assert.ok(cfg.policies.includes("no_refund_decision"), "no_refund_decision policy must apply");
passed += 1;

// Reconciliation: brightpath-demo carries the SAME education archetype settings as edu_demo.
const eduCfg = getConfig("edu_demo");
for (const key of ["archetype", "tone", "autoSendIntents", "reviewIntents", "policies", "askStaffBeforePromise"]) {
  assert.deepEqual(cfg[key], eduCfg[key], `brightpath-demo.${key} must match edu_demo.${key}`);
}
assert.deepEqual(cfg.autoSendIntents, ARCHETYPES.education.autoSendIntents, "must inherit education archetype defaults");
passed += 1;

console.log(`archetypes: ${passed} tests passed`);
