"use strict";

const assert = require("node:assert/strict");
const { evaluate, ACTIONS } = require("../src/businessRules");
const { getConfig } = require("../src/archetypes");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { createKnowledgeBase } = require("../../knowledge base ver 1.0/src/knowledgeBase");
const seed = require("../../knowledge base ver 1.0/seed/hkSmeSeed");
const { standardCases } = require("./businessRules.cases");

const kb = createKnowledgeBase({ entries: seed });

function runCase(c) {
  const gateway = routeMessage(c.input);
  const intent = classifyIntent(gateway);
  const knowledge = kb.lookup({ businessId: c.businessId, sanitizedText: gateway.sanitizedText, intent });
  const businessConfig = getConfig(c.businessId);
  const result = evaluate({ gateway, intent, knowledge, businessConfig });

  const label = c.name;

  if (c.expectAction) {
    assert.equal(result.action, c.expectAction, `${label}: action mismatch (got ${result.action}, reasons=${result.reasons.join("; ")})`);
  }
  if (c.expectActionOneOf) {
    assert.ok(c.expectActionOneOf.includes(result.action), `${label}: action ${result.action} not in ${c.expectActionOneOf.join("/")}`);
  }
  if (c.expectEscalation) {
    assert.ok(c.expectEscalation.includes(result.escalationLabel), `${label}: escalation ${result.escalationLabel} not in ${c.expectEscalation.join("/")}`);
  }
  for (const cap of c.expectMustForbid || []) {
    assert.ok(result.forbiddenCapabilities.includes(cap), `${label}: forbidden capabilities should include ${cap}`);
  }
  for (const cap of c.expectMustAllow || []) {
    assert.ok(result.allowedCapabilities.includes(cap), `${label}: allowed capabilities should include ${cap}`);
  }

  // Invariants
  assert.ok(Object.values(ACTIONS).includes(result.action), `${label}: action must be one of ACTIONS`);
  for (const cap of result.allowedCapabilities) {
    assert.ok(!result.forbiddenCapabilities.includes(cap), `${label}: capability ${cap} appears in BOTH allowed and forbidden`);
  }
  if (result.action !== "auto_send") {
    assert.ok(result.staffPacket, `${label}: non-auto_send must include staffPacket`);
  } else {
    assert.equal(result.staffPacket, null, `${label}: auto_send must not include staffPacket`);
  }
  // Always-forbidden defence
  for (const must of ["invent_prices", "leak_pii", "give_legal_advice"]) {
    assert.ok(result.forbiddenCapabilities.includes(must), `${label}: ${must} must always be forbidden`);
  }
}

for (const c of standardCases) runCase(c);

// Sanity: capability derivation for a synthetic auto_send scenario
const syntheticAutoSend = evaluate({
  gateway: { route: "send_to_llm", sanitizedText: "hi", requiresHumanReview: false, filter: { highestRisk: "none" } },
  intent: { primaryIntent: "hours_location", confidence: 0.9, riskLevel: "none", language: "en", needsHumanReview: false },
  knowledge: {
    businessId: "restaurant_demo",
    primaryIntent: "hours_location",
    matches: [{ id: "x", answer: "Open daily.", score: 0.95 }],
    bestMatch: { id: "x", answer: "Open daily.", score: 0.95, policyRef: null },
    grounding: ["x"],
    gap: false,
    handoff: false,
    backendBound: false
  },
  businessConfig: getConfig("restaurant_demo")
});
assert.equal(syntheticAutoSend.action, "auto_send", "synthetic auto_send case should pass");
assert.ok(syntheticAutoSend.allowedCapabilities.includes("quote_kb_verbatim"));
assert.ok(syntheticAutoSend.allowedCapabilities.includes("cite_entry:x"));

const syntheticPackageAutoSend = evaluate({
  gateway: { route: "send_to_llm", sanitizedText: "我想問個package仲有幾多次", requiresHumanReview: false, filter: { highestRisk: "none" } },
  intent: { primaryIntent: "package_status", confidence: 0.93, riskLevel: "none", language: "mixed", needsHumanReview: false },
  knowledge: { businessId: "beauty_demo", grounding: [], gap: true, handoff: false, backendBound: false },
  packageFacts: {
    found: true,
    verifiedSender: true,
    autoSendEligible: true,
    approvedReplyText: "May，你而家剩餘 3 次保濕 facial，套票到期日係 2026-07-31。",
    grounding: ["pkg_may_hydrafacial_active"],
    bestPackage: { id: "pkg_may_hydrafacial_active", status: "active" },
    riskFlags: []
  },
  businessConfig: getConfig("beauty_demo")
});
assert.equal(syntheticPackageAutoSend.action, "auto_send", "verified active package status should auto_send");
assert.ok(syntheticPackageAutoSend.allowedCapabilities.includes("quote_package_facts"));
assert.ok(syntheticPackageAutoSend.allowedCapabilities.includes("cite_package:pkg_may_hydrafacial_active"));

const syntheticPackageReview = evaluate({
  gateway: { route: "send_to_llm", sanitizedText: "我個package可唔可以延期？", requiresHumanReview: false, filter: { highestRisk: "none" } },
  intent: { primaryIntent: "package_status", confidence: 0.93, riskLevel: "none", language: "mixed", needsHumanReview: false },
  knowledge: { businessId: "beauty_demo", grounding: [], gap: true, handoff: false, backendBound: false },
  packageFacts: {
    found: true,
    verifiedSender: true,
    autoSendEligible: false,
    approvedReplyText: null,
    grounding: ["pkg_carmen_expired"],
    bestPackage: { id: "pkg_carmen_expired", status: "expired" },
    riskFlags: ["expired"]
  },
  businessConfig: getConfig("beauty_demo")
});
assert.equal(syntheticPackageReview.action, "staff_review", "expired package status should require staff review");
assert.ok(syntheticPackageReview.forbiddenCapabilities.includes("extend_package"));
assert.ok(syntheticPackageReview.forbiddenCapabilities.includes("alter_remaining_sessions"));

console.log(`businessRules: ${standardCases.length + 3} tests passed`);
