"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  GENESIS_HASH,
  createActionJournal,
  verifyChain,
  buildEvidenceBundle,
  loadChain,
  canonicalize,
  sha256
} = require("../src/actionJournal");
const { evaluate } = require("../../business rules ver 1.0/src/businessRules");
const { getConfig } = require("../../business rules ver 1.0/src/archetypes");
const { orderedTurns, autoSendTurn, handoffTurn } = require("./actionJournal.cases");

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
}

const fixedNow = () => new Date("2026-06-13T02:00:00.000Z");

// --- chain construction + linkage ---
check("chain links each record to the previous hash", () => {
  const journal = createActionJournal({ nowFn: fixedNow });
  const records = orderedTurns.map((t) => journal.append(t));
  assert.equal(records[0].prevHash, GENESIS_HASH, "first record chains from genesis");
  for (let i = 1; i < records.length; i += 1) {
    assert.equal(records[i].prevHash, records[i - 1].entryHash, "prevHash points at prior entryHash");
  }
  assert.deepEqual(records.map((r) => r.seq), [1, 2, 3], "seq is monotonic from 1");
  assert.equal(journal.verify().ok, true, "freshly built chain verifies");
});

// --- tamper detection ---
check("editing a field breaks the chain at that record", () => {
  const journal = createActionJournal({ nowFn: fixedNow });
  orderedTurns.forEach((t) => journal.append(t));
  const records = journal.records();
  records[1].decision.action = "auto_send"; // forge a softer decision
  const report = verifyChain(records);
  assert.equal(report.ok, false, "tampered chain must fail");
  assert.equal(report.brokenAt, 1, "failure pinpoints the tampered record");
  assert.equal(report.reason, "entryHash_mismatch");
});

check("deleting a record breaks the chain", () => {
  const journal = createActionJournal({ nowFn: fixedNow });
  orderedTurns.forEach((t) => journal.append(t));
  const records = journal.records();
  records.splice(1, 1); // drop the middle turn
  const report = verifyChain(records);
  assert.equal(report.ok, false, "deletion must be detectable");
  assert.equal(report.brokenAt, 1);
});

check("reordering records breaks the chain", () => {
  const journal = createActionJournal({ nowFn: fixedNow });
  orderedTurns.forEach((t) => journal.append(t));
  const records = journal.records();
  [records[0], records[1]] = [records[1], records[0]];
  assert.equal(verifyChain(records).ok, false, "reordering must be detectable");
});

// --- privacy minimisation ---
check("sender ids are pseudonymised, never stored raw", () => {
  const journal = createActionJournal({ nowFn: fixedNow });
  const rec = journal.append(autoSendTurn);
  assert.equal(rec.senderRef, sha256("sender:wa:85291234567").slice(0, 16));
  assert.notEqual(rec.senderRef, "wa:85291234567");
  assert.equal(JSON.stringify(rec).includes("85291234567"), false, "raw phone never appears in a record");
});

check("only sendable replies retain text; staff drafts keep only a hash", () => {
  const journal = createActionJournal({ nowFn: fixedNow });
  const autoRec = journal.append(autoSendTurn);
  const handoffRec = journal.append(handoffTurn);
  assert.equal(autoRec.replyText, "我哋每日 11:00–22:00 營業。", "sendable reply text is retained as evidence");
  assert.equal(handoffRec.replyText, null, "un-sent staff draft text is not retained");
  assert.equal(handoffRec.replyTextHash, sha256("（員工備註）客人要求退款，需要人手跟進。"), "but its hash proves what was produced");
});

// --- canonicalisation is order-independent ---
check("canonicalize is stable regardless of key order", () => {
  assert.equal(canonicalize({ a: 1, b: [2, { d: 4, c: 3 }] }), canonicalize({ b: [2, { c: 3, d: 4 }], a: 1 }));
});

// --- replay: re-run the real policy gate and prove the decision reproduces ---
check("replay reproduces the recorded decision via real evaluate()", () => {
  const journal = createActionJournal({ nowFn: fixedNow });
  // Generate decisions with the REAL business-rules gate so replay is an honest test.
  const inputs = [
    { businessId: "restaurant_demo", gateway: { route: "allow", sanitizedText: "幾點開門", shouldCallLLM: false, businessId: "restaurant_demo" }, intent: { primaryIntent: "hours_location", language: "zh-HK", confidence: 0.96 }, knowledge: { businessId: "restaurant_demo", matched: true, grounding: ["kb:hours"], language: "zh-HK", answer: "11:00–22:00", score: 0.9 } },
    { businessId: "beauty_demo", gateway: { route: "allow", sanitizedText: "想問脫毛價錢", shouldCallLLM: false, businessId: "beauty_demo" }, intent: { primaryIntent: "pricing", language: "zh-HK", confidence: 0.9 }, knowledge: { businessId: "beauty_demo", matched: true, grounding: ["kb:pricing"], language: "zh-HK", answer: "脫毛 HK$X", score: 0.8 } }
  ];
  for (const inp of inputs) {
    const businessConfig = getConfig(inp.businessId);
    const decision = evaluate({ gateway: inp.gateway, intent: inp.intent, knowledge: inp.knowledge, businessConfig });
    const modelRoute = { provider: "none", model: "no_llm", shouldCallLLM: false };
    journal.append({ result: {
      normalizedMessage: { businessId: inp.businessId, channel: "whatsapp", senderId: "wa:test" },
      gateway: inp.gateway, intent: inp.intent, knowledge: inp.knowledge,
      decision, modelRoute,
      draft: { action: decision.action, text: decision.action === "auto_send" ? inp.knowledge.answer : "請稍等" },
      safety: { verdict: "pass", safeToSend: decision.action === "auto_send" },
      finalStatus: decision.action === "auto_send" ? "ready_to_send" : "staff_review"
    } });
  }
  const report = journal.replay(evaluate, getConfig);
  assert.equal(report.ok, true, "all replayable decisions reproduce");
  assert.equal(report.replayable, 2);
  assert.equal(report.matched, 2);
  assert.deepEqual(report.divergences, []);
});

check("replay flags a forged decision as a divergence", () => {
  const journal = createActionJournal({ nowFn: fixedNow });
  const businessConfig = getConfig("beauty_demo");
  const gateway = { route: "review", sanitizedText: "我要退款", shouldCallLLM: true, businessId: "beauty_demo" };
  const intent = { primaryIntent: "complaint", language: "zh-HK", confidence: 0.85 };
  const knowledge = { businessId: "beauty_demo", matched: false, grounding: [], language: "zh-HK", answer: null, score: 0 };
  const realDecision = evaluate({ gateway, intent, knowledge, businessConfig });
  // Forge the journaled decision to a softer action while keeping the same inputs.
  journal.append({ result: {
    normalizedMessage: { businessId: "beauty_demo", channel: "whatsapp", senderId: "wa:x" },
    gateway, intent, knowledge,
    decision: { ...realDecision, action: "auto_send", escalationLabel: null },
    modelRoute: { provider: "none", model: "no_llm", shouldCallLLM: false },
    draft: { action: "auto_send", text: "已幫你退款" },
    safety: { verdict: "pass", safeToSend: true },
    finalStatus: "ready_to_send"
  } });
  const report = journal.replay(evaluate, getConfig);
  assert.equal(report.ok, false, "a decision that the gate would not produce is caught");
  assert.equal(report.divergences.length, 1);
  assert.equal(report.divergences[0].recorded.action, "auto_send");
  assert.notEqual(report.divergences[0].replayed.action, "auto_send");
});

// --- file persistence + rehydration ---
check("chain persists to JSONL and rehydrates with continued seq", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "journal-"));
  const filePath = path.join(dir, "journal.jsonl");
  const j1 = createActionJournal({ filePath, nowFn: fixedNow });
  orderedTurns.forEach((t) => j1.append(t));

  const reloaded = loadChain(filePath);
  assert.equal(reloaded.length, 3);
  assert.equal(verifyChain(reloaded).ok, true, "persisted chain verifies after reload");

  // A new journal over the same file continues the chain instead of resetting it.
  const j2 = createActionJournal({ filePath, nowFn: fixedNow });
  const next = j2.append(autoSendTurn);
  assert.equal(next.seq, 4, "seq continues across process restarts");
  assert.equal(next.prevHash, reloaded[2].entryHash, "new record chains onto the persisted tail");
  assert.equal(j2.verify().ok, true);

  fs.rmSync(dir, { recursive: true, force: true });
});

// --- evidence bundle ---
check("evidence bundle scopes by business and reports chain status", () => {
  const journal = createActionJournal({ nowFn: fixedNow });
  orderedTurns.forEach((t) => journal.append(t));
  const bundle = buildEvidenceBundle(journal.records(), { businessId: "restaurant_demo" });
  assert.equal(bundle.chainVerified, true);
  assert.equal(bundle.recordCount, 1, "only the restaurant turn is in scope");
  assert.equal(bundle.records[0].businessId, "restaurant_demo");
});

console.log(`actionJournal: ${passed} tests passed`);
