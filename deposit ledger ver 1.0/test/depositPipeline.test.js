"use strict";

// Integration: the deposit ledger wired into the end-to-end pipeline.
const assert = require("node:assert/strict");
const { createPipeline } = require("../../end-to-end pipeline ver 1.0/src/pipeline");
const { createDepositLedger, STATES } = require("../src/depositLedger");
const { createWeatherStore } = require("../../weather policy ver 1.0/src/weatherPolicy");

const nowFn = () => new Date("2026-06-13T04:00:00.000Z");
let passed = 0;
async function check(name, fn) { await fn(); passed += 1; }

(async () => {
  // A complete Friday-evening 8-person booking triggers a deposit request with a code.
  await check("complete big-party booking -> deposit request with code", async () => {
    const dep = createDepositLedger({ nowFn });
    const p = createPipeline({ depositLedger: dep, nowFn });
    const r = await p.runMessage({ channel: "website", sessionId: "wa:c1", businessId: "restaurant_demo", text: "想book 6月19號 晚上8點 8位" });
    assert.equal(r.decision.action, "clarify");
    assert.match(r.draft.text, /DEP-[0-9A-Z]{4}/, "reply quotes a DEP code");
    assert.match(r.draft.text, /訂金/, "reply mentions the deposit");
    assert.equal(dep.listActive({ businessId: "restaurant_demo" }).length, 1, "one pending hold created");
  });

  // A small party falls below the policy threshold — no deposit, normal flow.
  await check("small party -> no deposit", async () => {
    const dep = createDepositLedger({ nowFn });
    const p = createPipeline({ depositLedger: dep, nowFn });
    const r = await p.runMessage({ channel: "website", sessionId: "wa:c2", businessId: "restaurant_demo", text: "想book 6月19號 晚上8點 2位" });
    assert.doesNotMatch(r.draft.text || "", /DEP-/, "no deposit code for a small party");
    assert.equal(dep.listActive({ businessId: "restaurant_demo" }).length, 0);
  });

  // Customer pays and quotes the code -> reconciled, staff verify task, ack only.
  await check("過咗數 DEP-XXXX -> claimed + staff verify + non-confirming ack", async () => {
    const dep = createDepositLedger({ nowFn });
    const p = createPipeline({ depositLedger: dep, nowFn });
    const req = await p.runMessage({ channel: "website", sessionId: "wa:c3", businessId: "restaurant_demo", text: "想book 6月19號 晚上8點 8位" });
    const code = req.draft.text.match(/DEP-[0-9A-Z]{4}/)[0];
    const claim = await p.runMessage({ channel: "website", sessionId: "wa:c3", businessId: "restaurant_demo", text: `過咗數 ${code}` });
    assert.equal(dep.get(code).status, STATES.CLAIMED, "deposit moves to claimed");
    assert.equal(claim.staffItem.escalationLabel, "deposit_claim", "staff gets a verify task");
    assert.match(claim.draft.text, /核實緊|未代表/, "ack says checking, never confirms money");
    assert.doesNotMatch(claim.draft.text, /已收到.*款|payment received/i, "must not confirm payment");
  });

  // No deposit ledger configured -> behaviour identical to before (default-safe).
  await check("no depositLedger -> booking flow unchanged", async () => {
    const p = createPipeline({ nowFn });
    const r = await p.runMessage({ channel: "website", sessionId: "wa:c4", businessId: "restaurant_demo", text: "想book 6月19號 晚上8點 8位" });
    assert.doesNotMatch(r.draft.text || "", /DEP-/, "no deposit machinery without a ledger");
  });

  // Typhoon closure pre-empts the deposit request (weather synergy).
  await check("T8 closure pre-empts deposit", async () => {
    const ws = createWeatherStore(); ws.setSignal("tc8");
    const dep = createDepositLedger({ nowFn });
    const p = createPipeline({ depositLedger: dep, weatherStore: ws, nowFn });
    const r = await p.runMessage({ channel: "website", sessionId: "wa:c5", businessId: "restaurant_demo", text: "想book 6月19號 晚上8點 8位" });
    assert.doesNotMatch(r.draft.text || "", /DEP-/, "no deposit asked during a typhoon closure");
    assert.match(r.draft.text, /暫停營業/, "closure banner shown instead");
    assert.equal(dep.listActive({ businessId: "restaurant_demo" }).length, 0);
  });

  console.log(`depositPipeline: ${passed} tests passed`);
})().catch((err) => { console.error(err); process.exitCode = 1; });
