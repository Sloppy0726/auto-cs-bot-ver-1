"use strict";

// Integration: the regulars ledger driving "照舊" rebooking through the pipeline.
const assert = require("node:assert/strict");
const { createPipeline } = require("../../end-to-end pipeline ver 1.0/src/pipeline");
const { createRegularsLedger } = require("../src/regularsLedger");

const nowFn = () => new Date("2026-06-20T04:00:00.000Z");
let passed = 0;
async function check(name, fn) { await fn(); passed += 1; }

function seedRegular(ledger, senderId) {
  for (const date of ["2026-06-02", "2026-06-09", "2026-06-16"]) { // Tuesdays
    ledger.recordVisit({ businessId: "restaurant_demo", senderId, booking: { date, time: "15:00", partySize: 4, at: `${date}T07:00:00Z` } });
  }
}

(async () => {
  await check("a regular asking to book with no time gets the 照舊 suggestion", async () => {
    const ledger = createRegularsLedger({ nowFn });
    seedRegular(ledger, "web-may");
    const p = createPipeline({ regularsLedger: ledger, nowFn });
    const r = await p.runMessage({ channel: "website", sessionId: "web-may", businessId: "restaurant_demo", text: "想book返個位" });
    assert.equal(r.decision.action, "clarify");
    assert.match(r.draft.text, /照舊/);
    assert.match(r.draft.text, /星期二/);
    assert.match(r.draft.text, /下午3點/);
    assert.match(r.draft.text, /覆「係」/, "confirm-don't-assume, never auto-books");
  });

  await check("a one-off customer gets the normal booking clarification", async () => {
    const ledger = createRegularsLedger({ nowFn });
    ledger.recordVisit({ businessId: "restaurant_demo", senderId: "web-new", booking: { date: "2026-06-02", time: "15:00", partySize: 4 } });
    const p = createPipeline({ regularsLedger: ledger, nowFn });
    const r = await p.runMessage({ channel: "website", sessionId: "web-new", businessId: "restaurant_demo", text: "想book返個位" });
    assert.doesNotMatch(r.draft.text || "", /照舊/, "no usual-slot suggestion for a one-off customer");
  });

  await check("no regulars ledger -> behaviour unchanged (default-safe)", async () => {
    const p = createPipeline({ nowFn });
    const r = await p.runMessage({ channel: "website", sessionId: "web-may", businessId: "restaurant_demo", text: "想book返個位" });
    assert.doesNotMatch(r.draft.text || "", /照舊/);
  });

  await check("a regular who pins a specific time is not nudged to the usual slot", async () => {
    const ledger = createRegularsLedger({ nowFn });
    seedRegular(ledger, "web-may");
    const p = createPipeline({ regularsLedger: ledger, nowFn });
    const r = await p.runMessage({ channel: "website", sessionId: "web-may", businessId: "restaurant_demo", text: "聽日晚上8點想book 2位" });
    assert.doesNotMatch(r.draft.text || "", /照舊/, "explicit request is respected, not overridden");
  });

  console.log(`regularsPipeline: ${passed} tests passed`);
})().catch((err) => { console.error(err); process.exitCode = 1; });
