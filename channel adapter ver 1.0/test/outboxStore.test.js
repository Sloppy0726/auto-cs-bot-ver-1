"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createOutboxStore } = require("../src/outboxStore");

let count = 0;
function check(label, cond, detail) {
  count++;
  assert.ok(cond, detail ? `${label}: ${detail}` : label);
}
function eq(label, actual, expected) {
  count++;
  assert.deepEqual(actual, expected, label);
}

function tmpStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "outbox-"));
  const filePath = path.join(dir, "outbox.json");
  return { store: createOutboxStore({ filePath }), filePath };
}

function run() {
  // -------- enqueue happy path + listing --------
  {
    const { store } = tmpStore();
    const r1 = store.enqueue({ businessId: "beauty_demo", chatKey: "Amy Wong", chatDisplayName: "Amy Wong", text: "hello", bookingId: "book_1" });
    check("enqueue ok", r1.ok);
    check("enqueue assigns id", r1.record.id.startsWith("out_"));
    eq("enqueue stored chatKey lowercased", r1.record.chatKey, "amy wong");
    eq("enqueue preserves displayName", r1.record.chatDisplayName, "Amy Wong");
    eq("enqueue status pending", r1.record.status, "pending");
    eq("enqueue channel default", r1.record.channel, "whatsapp");

    const pending = store.listPending({ businessId: "beauty_demo" });
    eq("listPending picks up record", pending.length, 1);
    eq("listPending filters by businessId", store.listPending({ businessId: "restaurant_demo" }).length, 0);
  }

  // -------- enqueue validation --------
  {
    const { store } = tmpStore();
    eq("enqueue missing businessId", store.enqueue({ chatKey: "x", text: "y" }).error, "businessId_required");
    eq("enqueue missing chatKey", store.enqueue({ businessId: "x", text: "y" }).error, "chatKey_required");
    eq("enqueue missing text", store.enqueue({ businessId: "x", chatKey: "y" }).error, "text_required");
  }

  // -------- markSent + markFailed --------
  {
    const { store } = tmpStore();
    const { record } = store.enqueue({ businessId: "beauty_demo", chatKey: "amy", text: "hi" });
    const sent = store.markSent(record.id, { sentSnippet: "hi" });
    check("markSent ok", sent.ok);
    eq("markSent flips status", sent.record.status, "sent");
    check("markSent sets sentAt", Boolean(sent.record.sentAt));
    eq("markSent stores snippet", sent.record.sentSnippet, "hi");
    eq("after markSent: listPending excludes", store.listPending().length, 0);

    const failedTry = store.markFailed("unknown_id", "x");
    eq("markFailed unknown id", failedTry.error, "outbox_record_not_found");

    // Re-enqueue and fail it
    const { record: r2 } = store.enqueue({ businessId: "beauty_demo", chatKey: "amy", text: "hi2" });
    const fail1 = store.markFailed(r2.id, "send_failed");
    eq("markFailed attempts=1", fail1.record.attempts, 1);
    eq("markFailed lastError stored", fail1.record.lastError, "send_failed");
    eq("markFailed leaves status pending", fail1.record.status, "pending");
    const fail2 = store.markFailed(r2.id, "send_failed_again");
    eq("markFailed attempts=2", fail2.record.attempts, 2);
  }

  // -------- file persistence: a fresh store sees the same records --------
  {
    const { store, filePath } = tmpStore();
    store.enqueue({ businessId: "beauty_demo", chatKey: "a", text: "1" });
    store.enqueue({ businessId: "beauty_demo", chatKey: "b", text: "2" });
    const store2 = createOutboxStore({ filePath });
    eq("fresh store sees both records", store2.listAll().length, 2);
  }

  // -------- normalize: bad/legacy data tolerated --------
  {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "outbox-legacy-"));
    const filePath = path.join(dir, "outbox.json");
    fs.writeFileSync(filePath, JSON.stringify({ records: [{ id: "out_x", businessId: "beauty_demo", chatKey: "y", text: "z", status: "weird" }] }));
    const store = createOutboxStore({ filePath });
    const all = store.listAll();
    eq("legacy weird status normalized to pending", all[0].status, "pending");
  }

  // -------- reset clears everything --------
  {
    const { store } = tmpStore();
    store.enqueue({ businessId: "beauty_demo", chatKey: "a", text: "1" });
    store.reset();
    eq("reset clears all", store.listAll().length, 0);
  }

  console.log(`outboxStore: ${count} tests passed`);
}

run();
