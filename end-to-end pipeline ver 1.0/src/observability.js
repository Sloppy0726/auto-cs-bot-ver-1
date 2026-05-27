"use strict";

// Tiny stdlib observability helpers: structured JSON logger + counter /
// histogram registry exposing Prometheus text format at /metrics.

function createLogger(options = {}) {
  const baseFields = options.baseFields || {};
  const silentDefault = process.env.LOG_LEVEL === "silent" || process.env.NODE_ENV === "test";
  const defaultSink = silentDefault ? () => {} : (line) => process.stdout.write(line + "\n");
  const sink = typeof options.sink === "function" ? options.sink : defaultSink;
  const httpSink = options.httpSink !== undefined ? options.httpSink : createHttpSinkFromEnv();
  const nowFn = typeof options.nowFn === "function" ? options.nowFn : () => new Date();

  function log(level, event, fields = {}) {
    const record = { ts: nowFn().toISOString(), level, event, ...baseFields, ...fields };
    let line;
    try {
      line = JSON.stringify(record);
    } catch (error) {
      line = JSON.stringify({ ts: nowFn().toISOString(), level: "error", event: "log_serialize_failed", reason: String(error.message || error) });
    }
    sink(line);
    if (httpSink) httpSink.write(line);
  }

  return {
    info: (event, fields) => log("info", event, fields),
    warn: (event, fields) => log("warn", event, fields),
    error: (event, fields) => log("error", event, fields),
    debug: (event, fields) => log("debug", event, fields),
    child: (extraFields) => createLogger({ ...options, httpSink, baseFields: { ...baseFields, ...extraFields } }),
    flush: () => (httpSink ? httpSink.flush() : Promise.resolve())
  };
}

// Buffered HTTP sink. Posts a JSON array of records to `url` with optional
// bearer token. Flushes on batch fill or after flushIntervalMs. Failures
// are swallowed — log shipping must never block the main flow.
function createHttpSink(options = {}) {
  const url = options.url;
  if (!url) return null;
  const token = options.token || null;
  const batchSize = Number(options.batchSize) || 25;
  const flushIntervalMs = Number(options.flushIntervalMs) || 5_000;
  const fetchImpl = typeof options.fetchImpl === "function" ? options.fetchImpl : globalThis.fetch;
  const buffer = [];
  let timer = null;

  function schedule() {
    if (timer || typeof setTimeout !== "function") return;
    timer = setTimeout(() => { flush().catch(() => {}); }, flushIntervalMs);
    if (typeof timer?.unref === "function") timer.unref();
  }

  async function flush() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (buffer.length === 0 || typeof fetchImpl !== "function") return;
    const batch = buffer.splice(0, buffer.length);
    const records = batch.map((line) => {
      try { return JSON.parse(line); } catch { return { raw: line }; }
    });
    try {
      await fetchImpl(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(records)
      });
    } catch {
      // drop on failure; do not retry indefinitely
    }
  }

  return {
    write(line) {
      buffer.push(line);
      if (buffer.length >= batchSize) flush().catch(() => {});
      else schedule();
    },
    flush,
    _buffer: buffer
  };
}

function createHttpSinkFromEnv() {
  const url = process.env.LOG_INGEST_URL;
  if (!url) return null;
  return createHttpSink({
    url,
    token: process.env.LOG_INGEST_TOKEN,
    batchSize: Number(process.env.LOG_INGEST_BATCH_SIZE) || undefined,
    flushIntervalMs: Number(process.env.LOG_INGEST_FLUSH_MS) || undefined
  });
}

function createMetrics() {
  const counters = new Map(); // name -> Map(labelKey -> { labels, value })
  const histograms = new Map(); // name -> Map(labelKey -> { labels, buckets, sum, count })
  const DEFAULT_BUCKETS_MS = [5, 25, 100, 250, 500, 1000, 2500, 5000, 10000];

  function labelKey(labels = {}) {
    const entries = Object.entries(labels).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return entries.map(([k, v]) => `${k}=${String(v)}`).join(",");
  }

  function incrementCounter(name, labels = {}, value = 1) {
    if (!counters.has(name)) counters.set(name, new Map());
    const series = counters.get(name);
    const key = labelKey(labels);
    const existing = series.get(key) || { labels, value: 0 };
    existing.value += value;
    series.set(key, existing);
  }

  function observeHistogram(name, labels = {}, valueMs = 0) {
    if (!histograms.has(name)) histograms.set(name, new Map());
    const series = histograms.get(name);
    const key = labelKey(labels);
    let entry = series.get(key);
    if (!entry) {
      entry = { labels, buckets: DEFAULT_BUCKETS_MS.map((le) => ({ le, count: 0 })), sum: 0, count: 0 };
      series.set(key, entry);
    }
    entry.sum += valueMs;
    entry.count += 1;
    for (const bucket of entry.buckets) {
      if (valueMs <= bucket.le) bucket.count += 1;
    }
  }

  function renderPrometheus() {
    const lines = [];
    for (const [name, series] of counters) {
      lines.push(`# TYPE ${name} counter`);
      for (const { labels, value } of series.values()) {
        lines.push(`${name}${formatLabels(labels)} ${value}`);
      }
    }
    for (const [name, series] of histograms) {
      lines.push(`# TYPE ${name} histogram`);
      for (const entry of series.values()) {
        for (const bucket of entry.buckets) {
          lines.push(`${name}_bucket${formatLabels({ ...entry.labels, le: String(bucket.le) })} ${bucket.count}`);
        }
        lines.push(`${name}_bucket${formatLabels({ ...entry.labels, le: "+Inf" })} ${entry.count}`);
        lines.push(`${name}_sum${formatLabels(entry.labels)} ${entry.sum}`);
        lines.push(`${name}_count${formatLabels(entry.labels)} ${entry.count}`);
      }
    }
    return lines.join("\n") + (lines.length ? "\n" : "");
  }

  function snapshot() {
    const out = { counters: {}, histograms: {} };
    for (const [name, series] of counters) {
      out.counters[name] = Array.from(series.values()).map(({ labels, value }) => ({ labels, value }));
    }
    for (const [name, series] of histograms) {
      out.histograms[name] = Array.from(series.values()).map((entry) => ({
        labels: entry.labels,
        sum: entry.sum,
        count: entry.count,
        buckets: entry.buckets.map((b) => ({ ...b }))
      }));
    }
    return out;
  }

  function reset() {
    counters.clear();
    histograms.clear();
  }

  return { incrementCounter, observeHistogram, renderPrometheus, snapshot, reset };
}

function formatLabels(labels = {}) {
  const entries = Object.entries(labels).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  if (entries.length === 0) return "";
  const parts = entries.map(([k, v]) => `${k}="${escapeLabel(v)}"`);
  return `{${parts.join(",")}}`;
}

function escapeLabel(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

module.exports = { createLogger, createMetrics, createHttpSink, createHttpSinkFromEnv };
