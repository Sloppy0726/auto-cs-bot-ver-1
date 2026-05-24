"use strict";

// Drives one tick of the outbox queue: drains pending records that match this
// bridge's businessId, calls the injected sendToChat for each, and updates the
// store accordingly. Designed pure-functional w.r.t. the store + sender so the
// bridge can wire real Safari operations and tests can mock both.

const DEFAULT_MAX_ATTEMPTS = 3;

async function processOutboxOnce({
  store,
  businessId,
  sendToChat,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  log = noop
} = {}) {
  if (!store || typeof store.listPending !== "function") {
    return { processed: 0, results: [] };
  }
  if (typeof sendToChat !== "function") {
    return { processed: 0, results: [] };
  }
  const pending = store.listPending({ businessId });
  const results = [];
  for (const record of pending) {
    const attemptsBefore = Number(record.attempts) || 0;
    if (attemptsBefore >= maxAttempts) {
      log(`outbox: skipping record ${record.id} (attempts=${attemptsBefore} >= max=${maxAttempts})`);
      results.push({ id: record.id, status: "skipped_max_attempts" });
      continue;
    }
    try {
      const sendResult = await sendToChat(record);
      if (sendResult && sendResult.ok) {
        const snippet = (record.text || "").slice(0, 200);
        store.markSent(record.id, { sentSnippet: snippet });
        log(`outbox: sent record ${record.id} → chat=${record.chatDisplayName || record.chatKey} bookingId=${record.bookingId || "(none)"}`);
        results.push({ id: record.id, status: "sent" });
      } else {
        const err = sendResult?.error || "send_failed";
        store.markFailed(record.id, err);
        log(`outbox: send_failed record ${record.id} reason=${err}; attempts now=${attemptsBefore + 1}`);
        results.push({ id: record.id, status: "failed", error: err });
      }
    } catch (error) {
      store.markFailed(record.id, error.message);
      log(`outbox: send threw on record ${record.id}: ${error.message}; attempts now=${attemptsBefore + 1}`);
      results.push({ id: record.id, status: "error", error: error.message });
    }
  }
  return { processed: results.length, results };
}

function noop() {}

module.exports = { processOutboxOnce, DEFAULT_MAX_ATTEMPTS };
