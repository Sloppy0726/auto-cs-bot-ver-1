"use strict";

const assert = require("node:assert/strict");
const { createPackageStore } = require("../src/packageOps");
const { packageEntries, standardCases } = require("./packageOps.cases");

function run() {
  const store = createPackageStore({ entries: packageEntries });

  for (const c of standardCases) {
    const result = store.lookup(c.input);
    assert.equal(result.found, c.expectFound, `${c.name}: found mismatch`);
    assert.equal(result.autoSendEligible, c.expectAutoSendEligible, `${c.name}: autoSendEligible mismatch`);
    if (c.expectBestPackage) {
      assert.equal(result.bestPackage.packageName, c.expectBestPackage, `${c.name}: best package mismatch`);
    }
    if (c.expectRemainingSessions !== undefined) {
      assert.equal(result.bestPackage.remainingSessions, c.expectRemainingSessions, `${c.name}: remaining mismatch`);
      assert.match(result.approvedReplyText, /剩餘 3 次/, `${c.name}: reply should include remaining sessions`);
    }
    if (c.expectStatus) {
      assert.equal(result.bestPackage.status, c.expectStatus, `${c.name}: package status mismatch`);
    }
    if (c.expectRiskFlag) {
      assert.ok(result.riskFlags.includes(c.expectRiskFlag), `${c.name}: missing risk flag ${c.expectRiskFlag}`);
    }
    if (c.expectReason) {
      assert.ok(result.reasons.includes(c.expectReason), `${c.name}: reason mismatch`);
    }
  }

  const mayResult = store.lookup({
    businessId: "beauty_demo",
    senderId: "85261112222",
    sanitizedText: "我有咩package？",
    now: new Date("2026-05-10T00:00:00.000Z")
  });
  assert.equal(mayResult.packages.length, 2, "multiple packages for same sender should be returned");

  console.log(`packageOps: ${standardCases.length + 1} tests passed`);
}

run();
