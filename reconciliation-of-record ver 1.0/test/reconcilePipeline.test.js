"use strict";

// Integration: the fraud gate inside the deposit-claim pipeline path.
const assert = require("node:assert/strict");
const { createPipeline } = require("../../end-to-end pipeline ver 1.0/src/pipeline");
const { createDepositLedger } = require("../../deposit ledger ver 1.0/src/depositLedger");

const nowFn = () => new Date("2026-06-13T04:00:00.000Z");
let passed = 0;
async function check(name, fn) { await fn(); passed += 1; }

async function issuedDeposit() {
  const dep = createDepositLedger({ nowFn });
  const p = createPipeline({ depositLedger: dep, nowFn });
  const b = await p.runMessage({ channel: "website", sessionId: "wa:c1", businessId: "restaurant_demo", text: "想book 6月26號 晚上8點 8位" });
  const code = b.draft.text.match(/DEP-[0-9A-Z]{4}/)[0];
  return { dep, p, code };
}

(async () => {
  await check("clean claim still flows to claimed + verify task (regression)", async () => {
    const { dep, p, code } = await issuedDeposit();
    const c = await p.runMessage({ channel: "website", sessionId: "wa:c1", businessId: "restaurant_demo", text: `過咗數 ${code}` });
    assert.equal(dep.get(code).status, "claimed");
    assert.equal(c.staffItem.escalationLabel, "deposit_claim");
  });

  await check("amount mismatch is flagged, not claimed", async () => {
    const { dep, p, code } = await issuedDeposit();
    const c = await p.runMessage({ channel: "website", sessionId: "wa:c1", businessId: "restaurant_demo", text: `過咗數 ${code} HK$200` });
    assert.equal(dep.get(code).status, "pending", "suspicious claim does NOT claim the deposit");
    assert.equal(c.staffItem.escalationLabel, "deposit_suspicious");
    assert.match(c.draft.text, /未代表已確認收款/, "customer ack never confirms money");
    assert.equal(dep.listSuspicious({ businessId: "restaurant_demo" }).length, 1, "logged for loss-prevention");
  });

  await check("made-up reference is flagged suspicious", async () => {
    const { dep, p } = await issuedDeposit();
    const c = await p.runMessage({ channel: "website", sessionId: "wa:scam", businessId: "restaurant_demo", text: "過咗數 DEP-9Z9Z" });
    assert.equal(c.staffItem.escalationLabel, "deposit_suspicious");
  });

  await check("another customer cannot claim someone's code", async () => {
    const { dep, p, code } = await issuedDeposit();
    const c = await p.runMessage({ channel: "website", sessionId: "wa:stranger", businessId: "restaurant_demo", text: `過咗數 ${code}` });
    assert.equal(dep.get(code).status, "pending");
    assert.equal(c.staffItem.escalationLabel, "deposit_suspicious");
  });

  console.log(`reconcilePipeline: ${passed} tests passed`);
})().catch((err) => { console.error(err); process.exitCode = 1; });
