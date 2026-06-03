"use strict";

// In-memory token-bucket rate limiter for webhook abuse defence.
// Keyed by an arbitrary string (typically "<businessId>:<senderId>", or
// a sender-IP fallback if the payload has not been parsed yet).
//
// Defaults: 20 requests / 60s burst, refill 20/60s.
// Tunable via env: RATE_LIMIT_CAPACITY, RATE_LIMIT_REFILL_PER_SEC,
// RATE_LIMIT_IDLE_TTL_MS.

const DEFAULT_CAPACITY = 20;
const DEFAULT_REFILL_PER_SEC = 20 / 60; // 20 per minute
const DEFAULT_IDLE_TTL_MS = 10 * 60 * 1000; // forget buckets idle >10 min

function createRateLimiter(options = {}) {
  const capacity = Number(options.capacity || process.env.RATE_LIMIT_CAPACITY || DEFAULT_CAPACITY);
  const refillPerSec = Number(options.refillPerSec || process.env.RATE_LIMIT_REFILL_PER_SEC || DEFAULT_REFILL_PER_SEC);
  const idleTtlMs = Number(options.idleTtlMs || process.env.RATE_LIMIT_IDLE_TTL_MS || DEFAULT_IDLE_TTL_MS);
  const nowFn = typeof options.nowFn === "function" ? options.nowFn : () => Date.now();
  const buckets = new Map();

  function take(key) {
    if (!key) return { allowed: true, remaining: capacity, retryAfterMs: 0 };
    const now = nowFn();
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { tokens: capacity, updatedAt: now };
      buckets.set(key, bucket);
    } else {
      const elapsedSec = Math.max(0, (now - bucket.updatedAt) / 1000);
      bucket.tokens = Math.min(capacity, bucket.tokens + elapsedSec * refillPerSec);
      bucket.updatedAt = now;
    }
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfterMs: 0 };
    }
    const retryAfterMs = Math.ceil(((1 - bucket.tokens) / refillPerSec) * 1000);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  function reset(key) {
    if (key) buckets.delete(key);
    else buckets.clear();
  }

  function sweep() {
    const now = nowFn();
    for (const [key, bucket] of buckets) {
      if (now - bucket.updatedAt > idleTtlMs) buckets.delete(key);
    }
  }

  return { take, reset, sweep, _state: { buckets, capacity, refillPerSec } };
}

module.exports = { createRateLimiter };
