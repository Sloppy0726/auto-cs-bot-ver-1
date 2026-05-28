"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createTokenBudget, createTokenBudgetFromEnv } = require("../src/tokenBudget");

// --- disabled by default: no limit means everything is allowed ---
const off = createTokenBudget({});
const offVerdict = off.check("shopA");
assert.equal(offVerdict.allowed, true, "no limit configured should always allow");
assert.equal(offVerdict.limit, null, "no limit should report null limit");
off.record("shopA", 999999);
assert.equal(off.check("shopA").allowed, true, "recording usage with no limit should still allow");

// --- default limit caps usage ---
const capped = createTokenBudget({ defaultLimit: 100 });
assert.equal(capped.check("shopA").allowed, true, "fresh shop should be under budget");
capped.record("shopA", 60);
assert.equal(capped.check("shopA").allowed, true, "60 of 100 should still be allowed");
assert.equal(capped.check("shopA").remaining, 40, "remaining should reflect spend");
capped.record("shopA", 50);
const over = capped.check("shopA");
assert.equal(over.allowed, false, "110 of 100 should be over budget");
assert.equal(over.remaining, 0, "over budget remaining should clamp to 0");
assert.equal(capped.check("shopB").allowed, true, "a different shop should have its own budget");

// --- per-shop override beats the default ---
const mixed = createTokenBudget({ defaultLimit: 100, limits: { shopB: 10 } });
assert.equal(mixed.check("shopA").limit, 100, "shopA should use the default limit");
assert.equal(mixed.check("shopB").limit, 10, "shopB should use its override");
mixed.record("shopB", 10);
assert.equal(mixed.check("shopB").allowed, false, "shopB should hit its smaller cap");
assert.equal(mixed.check("shopA").allowed, true, "shopA unaffected by shopB override");

// --- record ignores invalid input ---
const guard = createTokenBudget({ defaultLimit: 100 });
guard.record(null, 5);
guard.record("shopA", 0);
guard.record("shopA", -3);
guard.record("shopA", NaN);
assert.equal(guard.check("shopA").used, 0, "invalid records should be no-ops");

// --- monthly reset when the HK month rolls over ---
let fakeNow = new Date("2026-05-15T00:00:00.000Z");
const monthly = createTokenBudget({ defaultLimit: 100, nowFn: () => fakeNow });
monthly.record("shopA", 80);
assert.equal(monthly.check("shopA").used, 80, "usage should accumulate within the month");
fakeNow = new Date("2026-06-15T00:00:00.000Z");
const fresh = monthly.check("shopA");
assert.equal(fresh.used, 0, "usage should reset when the month changes");
assert.equal(fresh.month, "2026-06", "check should report the new month");

// --- persistence across instances ---
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tokenbudget-"));
const filePath = path.join(tmpDir, "budget.json");
const persistA = createTokenBudget({ defaultLimit: 1000, filePath, nowFn: () => new Date("2026-05-20T00:00:00.000Z") });
persistA.record("shopA", 250);
assert.ok(fs.existsSync(filePath), "recording should persist the file to disk");
const persistB = createTokenBudget({ defaultLimit: 1000, filePath, nowFn: () => new Date("2026-05-20T00:00:00.000Z") });
assert.equal(persistB.check("shopA").used, 250, "a fresh instance should hydrate usage from disk");
assert.equal(persistB.check("shopA").month, "2026-05", "hydrated month should match disk");

// --- snapshot exposes per-shop state ---
const snapBudget = createTokenBudget({ defaultLimit: 100, limits: { shopB: 10 } });
snapBudget.record("shopA", 30);
snapBudget.record("shopB", 10);
const snap = snapBudget.snapshot();
assert.equal(typeof snap.month, "string", "snapshot should include the month");
assert.equal(snap.defaultLimit, 100, "snapshot should include the default limit");
const shopA = snap.shops.find((s) => s.businessId === "shopA");
const shopB = snap.shops.find((s) => s.businessId === "shopB");
assert.equal(shopA.used, 30, "snapshot should report shopA usage");
assert.equal(shopA.overBudget, false, "shopA should not be over budget");
assert.equal(shopB.overBudget, true, "shopB at its cap should be over budget");

// --- env factory: off when nothing configured, on when a cap is set ---
assert.equal(createTokenBudgetFromEnv({}), null, "no env config should return null (feature off)");
const envBudget = createTokenBudgetFromEnv({
  TOKEN_BUDGET_MONTHLY: "500",
  TOKEN_BUDGET_PRINCE_SNOOKER: "50",
  TOKEN_BUDGET_FILE: "/tmp/ignored.json",
  TOKEN_BUDGET_MESSAGE: "ignored"
});
assert.ok(envBudget, "a configured cap should produce a budget");
assert.equal(envBudget.check("other_shop").limit, 500, "default monthly cap should apply to unlisted shops");
assert.equal(envBudget.check("prince_snooker").limit, 50, "per-shop env override should be parsed and lowercased");

console.log("tokenBudget: 22 tests passed");
