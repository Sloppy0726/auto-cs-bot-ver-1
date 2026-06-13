"use strict";

// Integration: owner 核銷 fast-path wired into the pipeline.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createPipeline } = require("../../end-to-end pipeline ver 1.0/src/pipeline");
const { createRedemptionLedger } = require("../src/redemptionLedger");
const { createOutboxStore } = require("../../channel adapter ver 1.0/src/outboxStore");
const packageSeed = require("../../package ops ver 1.0/seed/packageSeed");

const nowFn = () => new Date("2026-06-13T04:00:00.000Z");
let passed = 0;
async function check(name, fn) { await fn(); passed += 1; }

(async () => {
  function freshPipeline() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rp-"));
    const ledger = createRedemptionLedger({ nowFn });
    ledger.seedFromPackages(packageSeed);
    const outbox = createOutboxStore({ filePath: path.join(dir, "outbox.json") });
    const pipeline = createPipeline({ redemptionLedger: ledger, outboxStore: outbox, env: { OWNER_PHONES: "85290001111" }, nowFn });
    return { ledger, outbox, pipeline, dir };
  }

  await check("owner 核銷 redeems + pushes a customer receipt + replies to owner", async () => {
    const { ledger, outbox, pipeline, dir } = freshPipeline();
    const before = ledger.findPackage({ businessId: "beauty_demo", customerExternalId: "85261112222", service: "facial" }).remaining;
    const r = await pipeline.runMessage({ channel: "whatsapp", from: "85290001111", businessId: "beauty_demo", text: "核銷 85261112222 facial" });
    assert.match(r.draft.text, /已核銷/, "owner gets a confirmation");
    assert.match(r.draft.text, /仲剩 2 次/);
    const pending = outbox.listPending({ businessId: "beauty_demo" });
    assert.equal(pending.length, 1, "customer receipt queued");
    assert.match(pending[0].text, /已為你核銷/);
    assert.equal(ledger.findPackage({ businessId: "beauty_demo", customerExternalId: "85261112222", service: "facial" }).remaining, before - 1);
    assert.equal(ledger.verify("pkg_may_hydrafacial_active").ok, true, "chain still verifies after redemption");
    fs.rmSync(dir, { recursive: true, force: true });
  });

  await check("a non-owner cannot redeem", async () => {
    const { pipeline, outbox, dir } = freshPipeline();
    const r = await pipeline.runMessage({ channel: "whatsapp", from: "85261112222", businessId: "beauty_demo", text: "核銷 85261112222 facial" });
    assert.doesNotMatch(r.draft.text || "", /已核銷/, "customer text is not treated as a redemption");
    assert.equal(outbox.listPending({ businessId: "beauty_demo" }).length, 0, "no receipt from a non-owner");
    fs.rmSync(dir, { recursive: true, force: true });
  });

  await check("no redemption ledger -> 核銷 is inert (default-safe)", async () => {
    const p = createPipeline({ env: { OWNER_PHONES: "85290001111" }, nowFn });
    const r = await p.runMessage({ channel: "whatsapp", from: "85290001111", businessId: "beauty_demo", text: "核銷 85261112222 facial" });
    assert.doesNotMatch(r.draft && r.draft.text || "", /已核銷 1 次/, "no redemption machinery without a ledger");
  });

  console.log(`redemptionPipeline: ${passed} tests passed`);
})().catch((err) => { console.error(err); process.exitCode = 1; });
