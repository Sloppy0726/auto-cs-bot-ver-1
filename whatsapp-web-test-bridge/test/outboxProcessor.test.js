"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createOutboxStore } = require("../../channel adapter ver 1.0/src/outboxStore");
const { processOutboxOnce } = require("../src/outboxProcessor");

let count = 0;
function check(label, cond, detail) { count++; assert.ok(cond, detail ? `${label}: ${detail}` : label); }
function eq(label, actual, expected) { count++; assert.deepEqual(actual, expected, label); }

function freshStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "outbox-proc-"));
  return createOutboxStore({ filePath: path.join(dir, "outbox.json") });
}

async function run() {
  // -------- happy path: 2 records sent, both marked sent --------
  {
    const store = freshStore();
    store.enqueue({ businessId: "beauty_demo", chatKey: "Amy Wong", text: "msg-1" });
    store.enqueue({ businessId: "beauty_demo", chatKey: "May Lee", text: "msg-2" });
    const sent = [];
    const result = await processOutboxOnce({
      store,
      businessId: "beauty_demo",
      sendToChat: async (record) => { sent.push(record); return { ok: true }; }
    });
    eq("happy: processed 2", result.processed, 2);
    eq("happy: both sent", result.results.map((r) => r.status), ["sent", "sent"]);
    eq("happy: sendToChat received text 1", sent[0].text, "msg-1");
    eq("happy: sendToChat received text 2", sent[1].text, "msg-2");
    eq("happy: store has 0 pending after", store.listPending().length, 0);
    eq("happy: store has 2 sent in listAll", store.listAll().filter((r) => r.status === "sent").length, 2);
  }

  // -------- filters by businessId --------
  {
    const store = freshStore();
    store.enqueue({ businessId: "beauty_demo", chatKey: "a", text: "1" });
    store.enqueue({ businessId: "restaurant_demo", chatKey: "b", text: "2" });
    const result = await processOutboxOnce({
      store,
      businessId: "beauty_demo",
      sendToChat: async () => ({ ok: true })
    });
    eq("filter: only 1 processed", result.processed, 1);
    eq("filter: restaurant_demo still pending", store.listPending({ businessId: "restaurant_demo" }).length, 1);
  }

  // -------- send failure: marks failed, leaves pending, attempts+1 --------
  {
    const store = freshStore();
    const { record } = store.enqueue({ businessId: "beauty_demo", chatKey: "a", text: "msg" });
    const result = await processOutboxOnce({
      store,
      businessId: "beauty_demo",
      sendToChat: async () => ({ ok: false, error: "chat_not_found" })
    });
    eq("fail: 1 processed", result.processed, 1);
    eq("fail: status failed", result.results[0].status, "failed");
    const reloaded = store.listAll()[0];
    eq("fail: still pending in store", reloaded.status, "pending");
    eq("fail: attempts=1", reloaded.attempts, 1);
    eq("fail: lastError recorded", reloaded.lastError, "chat_not_found");
    void record;
  }

  // -------- send throws: caught, marked failed --------
  {
    const store = freshStore();
    store.enqueue({ businessId: "beauty_demo", chatKey: "a", text: "msg" });
    const result = await processOutboxOnce({
      store,
      businessId: "beauty_demo",
      sendToChat: async () => { throw new Error("safari_died"); }
    });
    eq("throw: status=error", result.results[0].status, "error");
    eq("throw: lastError in store", store.listAll()[0].lastError, "safari_died");
  }

  // -------- attempts cap reached: skipped, sendToChat NOT called --------
  {
    const store = freshStore();
    const { record } = store.enqueue({ businessId: "beauty_demo", chatKey: "a", text: "msg" });
    store.markFailed(record.id, "x");
    store.markFailed(record.id, "x");
    store.markFailed(record.id, "x");
    let calls = 0;
    const result = await processOutboxOnce({
      store,
      businessId: "beauty_demo",
      sendToChat: async () => { calls++; return { ok: true }; }
    });
    eq("cap: sendToChat not called", calls, 0);
    eq("cap: status=skipped_max_attempts", result.results[0].status, "skipped_max_attempts");
  }

  // -------- no store / no sender → no-op --------
  {
    const r1 = await processOutboxOnce({ store: null, businessId: "x", sendToChat: async () => ({ ok: true }) });
    eq("no store: processed=0", r1.processed, 0);
    const store = freshStore();
    store.enqueue({ businessId: "x", chatKey: "a", text: "y" });
    const r2 = await processOutboxOnce({ store, businessId: "x", sendToChat: null });
    eq("no sender: processed=0", r2.processed, 0);
  }

  // -------- log function receives messages --------
  {
    const store = freshStore();
    store.enqueue({ businessId: "x", chatKey: "a", text: "m", chatDisplayName: "A" });
    const logs = [];
    await processOutboxOnce({
      store,
      businessId: "x",
      sendToChat: async () => ({ ok: true }),
      log: (msg) => logs.push(msg)
    });
    check("log: received a sent message", logs.some((m) => m.includes("sent record")));
  }

  console.log(`outboxProcessor: ${count} tests passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
