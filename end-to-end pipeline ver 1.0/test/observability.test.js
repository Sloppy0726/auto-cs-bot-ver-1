"use strict";

const assert = require("node:assert/strict");
const { createLogger, createMetrics } = require("../src/observability");

const lines = [];
const logger = createLogger({
  baseFields: { service: "test" },
  sink: (line) => lines.push(line),
  nowFn: () => new Date("2026-05-25T00:00:00.000Z")
});

logger.info("hello", { foo: "bar" });
logger.warn("uh_oh", { code: 42 });
const records = lines.map((l) => JSON.parse(l));

assert.equal(records.length, 2, "logger should emit one line per call");
assert.equal(records[0].event, "hello", "event should be preserved");
assert.equal(records[0].level, "info", "level should be set");
assert.equal(records[0].service, "test", "base fields should be merged");
assert.equal(records[0].foo, "bar", "extra fields should be merged");
assert.equal(records[1].level, "warn", "warn level should be set");

const child = logger.child({ business_id: "beauty_demo" });
child.error("kaboom");
const childRecord = JSON.parse(lines.at(-1));
assert.equal(childRecord.business_id, "beauty_demo", "child logger should add fields");

const metrics = createMetrics();
metrics.incrementCounter("webhook_requests_total", { outcome: "ok" });
metrics.incrementCounter("webhook_requests_total", { outcome: "ok" });
metrics.incrementCounter("webhook_requests_total", { outcome: "rate_limited" });
metrics.observeHistogram("webhook_latency_ms", { outcome: "ok" }, 12);
metrics.observeHistogram("webhook_latency_ms", { outcome: "ok" }, 300);

const snap = metrics.snapshot();
const okSeries = snap.counters.webhook_requests_total.find((s) => s.labels.outcome === "ok");
assert.equal(okSeries.value, 2, "counter should accumulate");
const rlSeries = snap.counters.webhook_requests_total.find((s) => s.labels.outcome === "rate_limited");
assert.equal(rlSeries.value, 1, "counter should isolate label values");

const histSeries = snap.histograms.webhook_latency_ms[0];
assert.equal(histSeries.count, 2, "histogram should count observations");
assert.equal(histSeries.sum, 312, "histogram should sum observations");
const bucket500 = histSeries.buckets.find((b) => b.le === 500);
assert.equal(bucket500.count, 2, "bucket 500 should contain both observations");
const bucket25 = histSeries.buckets.find((b) => b.le === 25);
assert.equal(bucket25.count, 1, "bucket 25 should contain only the fast observation");

const prom = metrics.renderPrometheus();
assert.ok(prom.includes("# TYPE webhook_requests_total counter"), "prometheus output should declare counter type");
assert.ok(prom.includes('webhook_requests_total{outcome="ok"} 2'), "prometheus output should include label values");
assert.ok(prom.includes("# TYPE webhook_latency_ms histogram"), "prometheus output should declare histogram type");
assert.ok(prom.includes('webhook_latency_ms_bucket{outcome="ok",le="+Inf"} 2'), "prometheus output should include +Inf bucket");

console.log("observability: 13 tests passed");
