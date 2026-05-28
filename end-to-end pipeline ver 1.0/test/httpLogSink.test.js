"use strict";

const assert = require("node:assert/strict");
const { createLogger, createHttpSink } = require("../src/observability");

(async () => {
  // --- batch fill triggers immediate flush ---
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return { ok: true, json: async () => ({}) };
  };
  const sink = createHttpSink({
    url: "https://ingest.example/v1/logs",
    token: "test-token",
    batchSize: 2,
    flushIntervalMs: 60_000,
    fetchImpl
  });
  const local = [];
  const logger = createLogger({ sink: (line) => local.push(line), httpSink: sink });

  logger.info("first");
  assert.equal(calls.length, 0, "should not flush before batch is full");
  logger.info("second");
  // batch fill triggers a fire-and-forget flush; wait a tick.
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(calls.length, 1, "filling the batch should trigger a single POST");
  assert.equal(calls[0].url, "https://ingest.example/v1/logs", "post URL should match config");
  assert.equal(calls[0].init.headers.authorization, "Bearer test-token", "bearer token should be set");
  assert.equal(calls[0].init.headers["content-type"], "application/json", "content-type should be json");
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.length, 2, "body should be a JSON array of records");
  assert.equal(body[0].event, "first", "records should be parsed JSON, not strings");
  assert.equal(body[1].event, "second", "second record should be present");
  assert.equal(local.length, 2, "local sink should still receive lines");

  // --- explicit flush drains buffer below batch size ---
  logger.warn("third");
  assert.equal(calls.length, 1, "single record under batch size should not flush yet");
  await logger.flush();
  assert.equal(calls.length, 2, "explicit flush should POST remaining record");

  // --- fetch failure is swallowed ---
  const failingFetch = async () => { throw new Error("network down"); };
  const failingSink = createHttpSink({ url: "https://x", batchSize: 1, fetchImpl: failingFetch });
  failingSink.write('{"event":"a"}');
  await new Promise((resolve) => setImmediate(resolve));
  // Should not have thrown. Buffer should be drained even on failure.
  assert.equal(failingSink._buffer.length, 0, "buffer should drain even when POST fails");

  // --- no URL => createHttpSink returns null ---
  assert.equal(createHttpSink({}), null, "missing URL should return null");

  console.log("httpLogSink: 12 tests passed");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
