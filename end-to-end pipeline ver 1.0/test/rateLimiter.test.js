"use strict";

const assert = require("node:assert/strict");
const { createRateLimiter } = require("../src/rateLimiter");

// Burst: capacity = 3, refill = 1 per second.
let fakeNow = 0;
const limiter = createRateLimiter({ capacity: 3, refillPerSec: 1, nowFn: () => fakeNow });

for (let i = 0; i < 3; i += 1) {
  const v = limiter.take("85291110001");
  assert.equal(v.allowed, true, `burst request ${i + 1} should be allowed`);
}

const denied = limiter.take("85291110001");
assert.equal(denied.allowed, false, "fourth burst request should be denied");
assert.ok(denied.retryAfterMs > 0, "denial should include retry-after");

// Another sender is isolated.
const other = limiter.take("85291110002");
assert.equal(other.allowed, true, "different sender should have its own bucket");

// Refill after time passes.
fakeNow += 2000;
const refilled = limiter.take("85291110001");
assert.equal(refilled.allowed, true, "bucket should refill after time passes");

// Empty key bypasses (defensive).
const empty = limiter.take("");
assert.equal(empty.allowed, true, "empty key should not be rate-limited");

// Sweep removes idle buckets.
fakeNow += 60 * 60 * 1000;
limiter.sweep();
assert.equal(limiter._state.buckets.size, 0, "sweep should drop idle buckets");

console.log("rateLimiter: 8 tests passed");
