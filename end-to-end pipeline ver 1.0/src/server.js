"use strict";

const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { createPipeline } = require("./pipeline");
const { createOpenAIAdapters } = require("./openaiAdapter");
const { createClaudeAdapters } = require("./claudeAdapter");
const { buildParaphrasePrompt } = require("../../AI draft engine ver 1.0/src/draftEngine");
const { createBusinessBackend } = require("../../private business backend mock ver 1.0/src/businessBackendMock");
const { createAvailabilityStore } = require("../../private business backend mock ver 1.0/src/availabilityStore");
const mockBusinessSeed = require("../../private business backend mock ver 1.0/seed/mockBusinessData");
const { createConversationContextStore } = require("../../conversation context ver 1.0/src/conversationContext");
const fakeBusinessData = require("../../private business backend mock ver 1.0/seed/mockBusinessData");
const { createPromoSync, createPromotionStore } = require("../../google drive promo sync ver 1.0/src/promoSync");
const { createGoogleDriveClient, loadFoldersFromEnv } = require("../../google drive promo sync ver 1.0/src/googleDriveClient");
const { createOutboxStore } = require("../../channel adapter ver 1.0/src/outboxStore");
const { createRateLimiter } = require("./rateLimiter");
const { createLogger, createMetrics } = require("./observability");

const DEFAULT_MAX_BODY_BYTES = 1_000_000;
const DEFAULT_REPLAY_WINDOW_SECONDS = 300;
const DEFAULT_BODY_TIMEOUT_MS = 5_000;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3000;

function createWebhookServer(config = {}) {
  const pipeline = config.pipeline || createPipeline(config);
  const availabilityStore = config.availabilityStore || null;
  const staffInbox = config.staffInbox || (pipeline && typeof pipeline.inbox === "object" ? pipeline.inbox : null);
  const outboxStore = config.outboxStore || null;
  const conversationContextStore = config.conversationContextStore === false
    ? null
    : (config.conversationContextStore || createConversationContextStore(config.conversationContext || {}));
  const rateLimiter = config.rateLimiter === false ? null : (config.rateLimiter || createRateLimiter(config.rateLimit || {}));
  const logger = config.logger || createLogger();
  const metrics = config.metrics || createMetrics();
  return http.createServer(async (req, res) => {
    if (req.method === "GET" && ["/", "/webhook"].includes(req.url)) {
      writeHtml(res, 200, webChatHtml());
      return;
    }

    if (req.method === "GET" && req.url === "/admin") {
      writeHtml(res, 200, adminSlotsHtml());
      return;
    }

    if (req.method === "GET" && req.url === "/debug/fake-db") {
      writeJson(res, 200, summarizeFakeDatabase(fakeBusinessData));
      return;
    }

    if (req.method === "GET" && req.url === "/metrics") {
      res.writeHead(200, { "content-type": "text/plain; version=0.0.4" });
      res.end(metrics.renderPrometheus());
      return;
    }

    if (req.url && req.url.startsWith("/admin/")) {
      await handleAdminRequest(req, res, { availabilityStore, staffInbox, outboxStore, config });
      return;
    }

    if (req.method !== "POST" || req.url !== "/webhook") {
      writeJson(res, 404, { error: "not_found" });
      return;
    }

    const startedAt = Date.now();
    const ipKey = remoteAddressKey(req);
    if (rateLimiter) {
      const verdict = rateLimiter.take(ipKey);
      if (!verdict.allowed) {
        metrics.incrementCounter("webhook_requests_total", { outcome: "rate_limited" });
        logger.warn("webhook_rate_limited", { ip: ipKey, retry_after_ms: verdict.retryAfterMs });
        res.writeHead(429, {
          "content-type": "application/json",
          "retry-after": String(Math.ceil(verdict.retryAfterMs / 1000))
        });
        res.end(JSON.stringify({ error: "rate_limited", retry_after_ms: verdict.retryAfterMs }));
        return;
      }
    }

    let outcome = "ok";
    try {
      const envelopeError = validateWebhookEnvelope(req, config);
      if (envelopeError) throw envelopeError;
      const body = await readBody(req, config.maxBodyBytes, config.bodyTimeoutMs);
      const authContext = verifyWebhookRequest(req, body, config);
      const payload = authorizeWebhookPayload(parseJson(body), authContext, config);
      const contextResult = conversationContextStore
        ? conversationContextStore.enrichPayload(payload)
        : { payload, changed: false, originalText: payload?.text || null, stitchedText: payload?.text || null, reason: null, commit() {} };
      const result = await pipeline.runMessage(contextResult.payload);
      contextResult.commit();
      const action = result?.decision?.action || result?.action || "unknown";
      metrics.incrementCounter("webhook_requests_total", { outcome: "ok" });
      logger.info("webhook_handled", { action, business_id: contextResult.payload?.businessId || null, latency_ms: Date.now() - startedAt });
      writeJson(res, 200, publicWebhookResponse(result, contextResult.payload, config, contextResult));
    } catch (error) {
      const statusCode = statusCodeForError(error);
      outcome = `error_${statusCode}`;
      metrics.incrementCounter("webhook_requests_total", { outcome });
      logger.error("webhook_failed", { status: statusCode, reason: String(error?.message || error) });
      writeJson(res, statusCode, { error: publicErrorMessage(error, statusCode) });
    } finally {
      metrics.observeHistogram("webhook_latency_ms", { outcome }, Date.now() - startedAt);
    }
  });
}

function remoteAddressKey(req) {
  const forwarded = getHeader(req, "x-forwarded-for");
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function createUsageReporter({ logger, metrics } = {}) {
  return function reportLlmUsage(record = {}) {
    const provider = record.provider || "unknown";
    const model = record.model || "unknown";
    const kind = record.kind || "unknown";
    const usage = record.usage || {};
    const input = Number(usage.input_tokens) || 0;
    const output = Number(usage.output_tokens) || 0;
    const cacheRead = Number(usage.cache_read_input_tokens) || 0;
    const cacheCreate = Number(usage.cache_creation_input_tokens) || 0;

    if (logger) {
      logger.info("llm_call", {
        provider,
        model,
        kind,
        input_tokens: input,
        output_tokens: output,
        cache_read_input_tokens: cacheRead,
        cache_creation_input_tokens: cacheCreate,
        total_tokens: input + output
      });
    }

    if (metrics) {
      const labels = { provider, model, kind };
      metrics.incrementCounter("llm_calls_total", labels);
      metrics.incrementCounter("llm_tokens_total", { ...labels, direction: "input" }, input);
      metrics.incrementCounter("llm_tokens_total", { ...labels, direction: "output" }, output);
      if (cacheRead) metrics.incrementCounter("llm_tokens_total", { ...labels, direction: "cache_read" }, cacheRead);
      if (cacheCreate) metrics.incrementCounter("llm_tokens_total", { ...labels, direction: "cache_creation" }, cacheCreate);
    }
  };
}

function readJson(req) {
  return readBody(req).then(parseJson);
}

function readBody(req, maxBodyBytes = DEFAULT_MAX_BODY_BYTES, timeoutMs = DEFAULT_BODY_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    let body = "";
    let tooLarge = false;
    const timer = setTimeout(() => {
      reject(new Error("request_timeout"));
      req.destroy();
    }, timeoutMs);

    function settle(fn, value) {
      clearTimeout(timer);
      fn(value);
    }

    req.on("data", (chunk) => {
      if (tooLarge) return;
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > maxBodyBytes) {
        tooLarge = true;
        settle(reject, new Error("request_too_large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!tooLarge) settle(resolve, body);
    });
    req.on("error", (error) => settle(reject, error));
  });
}

function parseJson(body) {
  return body ? JSON.parse(body) : {};
}

function validateWebhookEnvelope(req, config = {}) {
  const contentType = getHeader(req, "content-type") || "";
  if (!/^application\/json\b/i.test(contentType)) return httpError("unsupported_media_type", 415);

  const maxBodyBytes = config.maxBodyBytes || DEFAULT_MAX_BODY_BYTES;
  const contentLength = getHeader(req, "content-length");
  const declaredLength = Number(contentLength);
  if (contentLength && Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
    return new Error("request_too_large");
  }

  return null;
}

function verifyWebhookRequest(req, body, config = {}) {
  const candidates = webhookSecretCandidates(config);
  if (candidates.length === 0 && config.allowUnsignedWebhooks !== true) throw authError("webhook_secret_required");
  if (candidates.length === 0) {
    verifyUnsignedWebhookMode(config);
    return { businessId: config.webhookBusinessId || null, unsigned: true };
  }

  const timestamp = getHeader(req, "x-webhook-timestamp");
  const signature = getHeader(req, "x-webhook-signature");
  if (!timestamp || !signature) throw authError("missing_webhook_signature");

  verifyFreshTimestamp(timestamp, config);

  const matchingCredential = candidates.find((candidate) => {
    const expected = signBody({ body, timestamp, secret: candidate.secret });
    return constantTimeEqual(normalizeSignature(signature), expected);
  });
  if (!matchingCredential) throw authError("invalid_webhook_signature");

  return {
    businessId: matchingCredential.businessId || null,
    credentialId: matchingCredential.id || matchingCredential.businessId || null
  };
}

function webhookSecretCandidates(config = {}) {
  const candidates = [];
  const singleSecret = config.webhookSecret || process.env.WEBHOOK_SECRET;
  if (singleSecret) {
    candidates.push({
      id: "default",
      businessId: config.webhookBusinessId || null,
      secret: singleSecret
    });
  }

  const tenantSecrets = config.webhookSecrets || {};
  if (Array.isArray(tenantSecrets)) {
    for (const item of tenantSecrets) {
      if (!item?.secret) continue;
      candidates.push({
        id: item.id || item.businessId || null,
        businessId: item.businessId || null,
        secret: item.secret
      });
    }
  } else {
    for (const [businessId, secret] of Object.entries(tenantSecrets)) {
      if (!secret) continue;
      candidates.push({ id: businessId, businessId, secret });
    }
  }

  return candidates;
}

function authorizeWebhookPayload(payload, authContext = {}, config = {}) {
  const authorizedBusinessId = authContext.businessId || config.webhookBusinessId || null;
  const requestedBusinessId = payload?.businessId;
  if (requestedBusinessId && !authorizedBusinessId && authContext.unsigned === true) {
    return payload;
  }

  if (requestedBusinessId && !authorizedBusinessId) {
    throw authError("business_id_binding_required");
  }

  if (!authorizedBusinessId) return payload;

  if (requestedBusinessId && requestedBusinessId !== authorizedBusinessId) {
    throw authError("business_id_not_authorized");
  }

  return { ...payload, businessId: authorizedBusinessId };
}

function verifyUnsignedWebhookMode(config = {}) {
  const nodeEnv = config.nodeEnv || process.env.NODE_ENV;
  if (nodeEnv === "production") throw authError("webhook_signature_required");
}

function verifyFreshTimestamp(timestamp, config = {}) {
  const numericTimestamp = Number(timestamp);
  if (!Number.isFinite(numericTimestamp)) throw authError("invalid_webhook_timestamp");

  const nowFn = config.nowFn || (() => new Date());
  const nowSeconds = Math.floor(nowFn().getTime() / 1000);
  const replayWindowSeconds = config.replayWindowSeconds || DEFAULT_REPLAY_WINDOW_SECONDS;
  if (Math.abs(nowSeconds - numericTimestamp) > replayWindowSeconds) {
    throw authError("stale_webhook_timestamp");
  }
}

function signBody({ body, timestamp, secret }) {
  return crypto
    .createHmac("sha256", String(secret))
    .update(String(timestamp) + "." + body)
    .digest("hex");
}

function normalizeSignature(signature) {
  return String(signature || "").replace(/^sha256=/i, "");
}

function constantTimeEqual(left, right) {
  const normalizedLeft = normalizeSignature(left);
  const normalizedRight = normalizeSignature(right);
  if (!/^[a-f0-9]+$/i.test(normalizedLeft) || !/^[a-f0-9]+$/i.test(normalizedRight)) return false;

  const leftBuffer = Buffer.from(normalizedLeft, "hex");
  const rightBuffer = Buffer.from(normalizedRight, "hex");
  if (leftBuffer.length === 0 || leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getHeader(req, name) {
  const value = req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function authError(message) {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
}

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function statusCodeForError(error) {
  if (error?.statusCode) return error.statusCode;
  if (error?.message === "request_too_large") return 413;
  if (error?.message === "request_timeout") return 408;
  if (error instanceof SyntaxError) return 400;
  return 500;
}

function publicErrorMessage(error, statusCode) {
  if (statusCode === 500) return "internal_server_error";
  if (statusCode === 401) return "unauthorized";
  if (statusCode === 400) return "bad_request";
  return error.message;
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

function writeHtml(res, statusCode, html) {
  res.writeHead(statusCode, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}

function publicWebhookResponse(result, payload = {}, config = {}, contextResult = null) {
  const response = {
    finalStatus: result.finalStatus,
    outbound: result.outbound,
    staffItemId: result.staffItem?.id || null,
    action: result.decision?.action || null
  };

  if (payload.debug === true || config.localDebug === true) {
    response.debug = {
      businessId: result.normalizedMessage?.businessId || null,
      senderId: result.normalizedMessage?.senderId || null,
      sanitizedText: result.gateway?.sanitizedText || null,
      intent: result.intent,
      knowledge: {
        bestMatchId: result.knowledge?.bestMatch?.id || null,
        bestMatchAnswer: result.knowledge?.bestMatch?.answer || null,
        grounding: result.knowledge?.grounding || []
      },
      backendFacts: result.backendFacts,
      promotions: result.promotions
        ? {
            bestPromotion: result.promotions.bestPromotion
              ? {
                  id: result.promotions.bestPromotion.id,
                  title: result.promotions.bestPromotion.title || null,
                  summary: result.promotions.bestPromotion.summary || null,
                  expiresOn: result.promotions.bestPromotion.expiresOn || null
                }
              : null,
            activePromotions: (result.promotions.activePromotions || []).map((promo) => ({
              id: promo.id,
              title: promo.title || null,
              summary: promo.summary || null,
              expiresOn: promo.expiresOn || null
            }))
          }
        : null,
      draft: result.draft,
      decision: {
        action: result.decision?.action || null,
        reason: result.decision?.reason || null,
        reasons: result.decision?.reasons || []
      },
      safety: result.safety,
      staffItem: result.staffItem
        ? {
            id: result.staffItem.id,
            status: result.staffItem.status,
            escalationLabel: result.staffItem.escalationLabel || null,
            customerText: result.staffItem.customerText || null
          }
        : null,
      conversationContext: contextResult
        ? {
            changed: Boolean(contextResult.changed),
            originalText: contextResult.originalText || null,
            stitchedText: contextResult.stitchedText || null,
            reason: contextResult.reason || null,
            key: contextResult.key || null
          }
        : null
    };
  }

  return response;
}

async function handleAdminRequest(req, res, { availabilityStore, staffInbox, outboxStore, config }) {
  try {
    const auth = verifyAdminRequest(req, config);
    if (auth.error) {
      writeJson(res, auth.status || 401, { error: auth.error });
      return;
    }

    const url = parseAdminPath(req.url || "");
    if (!url || !url.resource) {
      writeJson(res, 404, { error: "not_found" });
      return;
    }

    const readPayload = async () => {
      const body = await readBody(req, config.maxBodyBytes, config.bodyTimeoutMs);
      return parseJson(body);
    };

    // Inbox endpoints work without availabilityStore, but the approve action
    // needs it to actually write the booking. Keep them outside the availability gate.
    if (url.resource === "inbox") {
      await handleInboxRequest(req, res, { staffInbox, availabilityStore, outboxStore, url, readPayload });
      return;
    }

    if (!availabilityStore) {
      writeJson(res, 503, { error: "availability_store_disabled" });
      return;
    }

    // Opening hours: GET/PUT  /admin/opening-hours/:businessId
    if (url.resource === "opening-hours" && url.businessId && !url.id) {
      if (req.method === "GET") {
        writeJson(res, 200, { businessId: url.businessId, openingHours: availabilityStore.getOpeningHours(url.businessId) });
        return;
      }
      if (req.method === "PUT") {
        const payload = await readPayload();
        const result = availabilityStore.setOpeningHours(url.businessId, payload.openingHours || payload);
        writeJson(res, result.ok ? 200 : 400, result.ok ? result : { error: result.error });
        return;
      }
    }

    // Closed periods: GET/POST/DELETE
    if (url.resource === "closed-periods") {
      if (req.method === "GET" && url.businessId && !url.id) {
        writeJson(res, 200, { businessId: url.businessId, closedPeriods: availabilityStore.listClosedPeriods(url.businessId) });
        return;
      }
      if (req.method === "POST" && url.businessId && !url.id) {
        const payload = await readPayload();
        const result = availabilityStore.addClosedPeriod(url.businessId, payload);
        writeJson(res, result.ok ? 201 : 400, result.ok ? result : { error: result.error });
        return;
      }
      if (req.method === "DELETE" && url.businessId && url.id) {
        const result = availabilityStore.removeClosedPeriod(url.businessId, url.id);
        writeJson(res, result.ok ? 200 : 404, result.ok ? result : { error: result.error });
        return;
      }
    }

    // Bookings: GET/POST/PATCH/DELETE
    if (url.resource === "bookings") {
      if (req.method === "GET" && url.businessId && !url.id) {
        writeJson(res, 200, { businessId: url.businessId, bookings: availabilityStore.listBookings(url.businessId) });
        return;
      }
      if (req.method === "POST" && url.businessId && !url.id) {
        const payload = await readPayload();
        const result = availabilityStore.addBooking(url.businessId, payload);
        writeJson(res, result.ok ? 201 : 400, result.ok ? result : { error: result.error });
        return;
      }
      if (req.method === "PATCH" && url.businessId && url.id) {
        const payload = await readPayload();
        const result = availabilityStore.updateBooking(url.businessId, url.id, payload);
        writeJson(res, result.ok ? 200 : (result.error === "booking not found" ? 404 : 400), result.ok ? result : { error: result.error });
        return;
      }
      if (req.method === "DELETE" && url.businessId && url.id) {
        const result = availabilityStore.removeBooking(url.businessId, url.id);
        writeJson(res, result.ok ? 200 : 404, result.ok ? result : { error: result.error });
        return;
      }
    }

    // Read-only debug dump of the whole store
    if (url.resource === "store" && req.method === "GET") {
      writeJson(res, 200, { businesses: availabilityStore.listAll() });
      return;
    }

    writeJson(res, 405, { error: "method_not_allowed" });
  } catch (error) {
    const statusCode = statusCodeForError(error);
    writeJson(res, statusCode, { error: publicErrorMessage(error, statusCode) });
  }
}

async function handleInboxRequest(req, res, { staffInbox, availabilityStore, outboxStore, url, readPayload }) {
  if (!staffInbox) {
    writeJson(res, 503, { error: "staff_inbox_disabled" });
    return;
  }

  // GET /admin/inbox/:businessId  — list open + recent items
  if (req.method === "GET" && url.businessId && !url.id) {
    const all = staffInbox.list({ businessId: url.businessId });
    const items = all.map(publicInboxItem);
    writeJson(res, 200, { businessId: url.businessId, items });
    return;
  }

  // GET /admin/inbox/:businessId/:id  — single item
  if (req.method === "GET" && url.businessId && url.id && !url.action) {
    const item = staffInbox.get(url.id);
    if (!item || item.businessId !== url.businessId) {
      writeJson(res, 404, { error: "inbox_item_not_found" });
      return;
    }
    writeJson(res, 200, { item: publicInboxItem(item) });
    return;
  }

  // POST /admin/inbox/:businessId/:id/approve  — approve + write booking
  if (req.method === "POST" && url.businessId && url.id && url.action === "approve") {
    const item = staffInbox.get(url.id);
    if (!item || item.businessId !== url.businessId) {
      writeJson(res, 404, { error: "inbox_item_not_found" });
      return;
    }
    if (item.status !== "open") {
      writeJson(res, 409, { error: `inbox_item_already_${item.status}` });
      return;
    }
    const overrides = await readPayload();
    const bookingDraft = item.bookingDraft;
    if (!bookingDraft) {
      // Non-booking review item — just approve, no calendar write
      const updated = staffInbox.approve(url.id, overrides?.actor || "staff");
      writeJson(res, 200, { item: publicInboxItem(updated), booking: null });
      return;
    }
    if (!availabilityStore) {
      writeJson(res, 503, { error: "availability_store_disabled" });
      return;
    }

    const finalDraft = mergeBookingOverrides(bookingDraft, overrides || {});
    const written = availabilityStore.addBooking(bookingDraft.businessId, finalDraft);
    if (!written.ok) {
      // Don't transition the inbox item — leave it open so staff can edit and retry
      staffInbox.recordBookingResult(url.id, { ok: false, error: written.error, attemptedAt: new Date().toISOString() });
      writeJson(res, 400, { error: written.error });
      return;
    }
    staffInbox.recordBookingResult(url.id, { ok: true, bookingId: written.booking.id, booking: written.booking, approvedAt: new Date().toISOString() });
    const updated = staffInbox.approve(url.id, overrides?.actor || "staff");
    const outbox = enqueueBookingConfirmation({ outboxStore, item: updated, booking: written.booking, bookingDraft: finalDraft });
    writeJson(res, 200, { item: publicInboxItem(updated), booking: written.booking, outbox });
    return;
  }

  // POST /admin/inbox/:businessId/:id/reject  — reject with reason
  if (req.method === "POST" && url.businessId && url.id && url.action === "reject") {
    const item = staffInbox.get(url.id);
    if (!item || item.businessId !== url.businessId) {
      writeJson(res, 404, { error: "inbox_item_not_found" });
      return;
    }
    if (item.status !== "open") {
      writeJson(res, 409, { error: `inbox_item_already_${item.status}` });
      return;
    }
    const body = await readPayload();
    const updated = staffInbox.reject(url.id, String(body?.reason || "").slice(0, 500), body?.actor || "staff");
    writeJson(res, 200, { item: publicInboxItem(updated) });
    return;
  }

  writeJson(res, 405, { error: "method_not_allowed" });
}

function publicInboxItem(item) {
  return {
    id: item.id,
    status: item.status,
    priority: item.priority,
    action: item.action,
    businessId: item.businessId,
    channel: item.channel,
    senderId: item.senderId,
    customerText: item.customerText,
    draftText: item.draftText,
    escalationLabel: item.escalationLabel,
    reasons: item.reasons,
    bookingDraft: item.bookingDraft,
    bookingResult: item.bookingResult,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

function mergeBookingOverrides(draft, overrides) {
  const allowed = ["date", "time", "service", "partySize", "durationMinutes", "customer", "notes"];
  const merged = { ...draft };
  for (const key of allowed) {
    if (overrides[key] !== undefined && overrides[key] !== null && overrides[key] !== "") {
      merged[key] = overrides[key];
    }
  }
  return merged;
}

function enqueueBookingConfirmation({ outboxStore, item, booking, bookingDraft }) {
  if (!outboxStore || typeof outboxStore.enqueue !== "function") return null;
  const chatDisplayName = bookingDraft?.senderId || item?.senderId || null;
  if (!chatDisplayName) return { ok: false, error: "no_sender_id" };
  if ((item?.channel || bookingDraft?.channel) !== "whatsapp") {
    return { ok: false, error: "channel_unsupported" };
  }
  const text = buildBookingConfirmationText({ booking, bookingDraft });
  const result = outboxStore.enqueue({
    businessId: bookingDraft.businessId,
    chatKey: chatDisplayName,
    chatDisplayName,
    channel: "whatsapp",
    text,
    bookingId: booking?.id || null
  });
  return result.ok ? { ok: true, id: result.record.id } : { ok: false, error: result.error };
}

function buildBookingConfirmationText({ booking, bookingDraft }) {
  const date = booking?.date || bookingDraft?.date || "";
  const time = booking?.time || bookingDraft?.time || "";
  const service = booking?.service || bookingDraft?.service || null;
  const partySize = booking?.partySize || bookingDraft?.partySize || null;
  const lines = ["你好，已為你確認預約："];
  if (date) lines.push(`- 日期：${date}`);
  if (time) lines.push(`- 時間：${time}`);
  if (service) lines.push(`- 療程：${formatServiceLabel(service)}`);
  if (partySize) lines.push(`- 人數：${partySize}位`);
  lines.push("到時見！如有問題請隨時通知。");
  return lines.join("\n");
}

function formatServiceLabel(service) {
  const map = { facial: "facial", laser: "脫毛", assessment: "皮膚評估", p3_english: "P3 英文評估" };
  return map[service] || service;
}

function parseAdminPath(url) {
  const [pathOnly] = String(url || "").split("?");
  const parts = pathOnly.replace(/^\/+|\/+$/g, "").split("/");
  if (parts[0] !== "admin") return null;
  return {
    resource: parts[1] ? decodeURIComponent(parts[1]) : null,
    businessId: parts[2] ? decodeURIComponent(parts[2]) : null,
    id: parts[3] ? decodeURIComponent(parts[3]) : null,
    action: parts[4] ? decodeURIComponent(parts[4]) : null
  };
}

function verifyAdminRequest(req, config = {}) {
  const expected = config.adminToken || process.env.ADMIN_TOKEN || null;
  const provided = getHeader(req, "x-admin-token") || null;
  if (expected) {
    if (!provided || provided !== expected) return { error: "unauthorized", status: 401 };
    return {};
  }
  const nodeEnv = config.nodeEnv || process.env.NODE_ENV;
  if (nodeEnv === "production") return { error: "admin_token_required", status: 401 };
  return {};
}

function summarizeFakeDatabase(data) {
  return Object.fromEntries(Object.entries(data).map(([businessId, record]) => {
    return [businessId, {
      customers: (record.customers || []).map((customer) => ({
        customerExternalId: customer.customerExternalId,
        displayName: customer.displayName || customer.handle || null,
        notes: customer.notes || null
      })),
      availability: record.availability || [],
      pricing: record.pricing || [],
      stock: record.stock || [],
      orders: (record.orders || []).map((order) => ({
        orderId: order.orderId,
        customerExternalId: order.customerExternalId,
        status: order.status,
        shipmentStatus: order.shipmentStatus,
        courier: order.courier
      })),
      payments: (record.payments || []).map((payment) => ({
        reference: payment.reference,
        customerExternalId: payment.customerExternalId,
        status: payment.status,
        amount: payment.amount
      }))
    }];
  }));
}

function webChatHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Website Chat Test</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f5f7fb;
      --panel: #ffffff;
      --text: #17191f;
      --muted: #626b7a;
      --line: #d8dde7;
      --accent: #0b65d8;
      --accent-text: #ffffff;
      --customer: #e9eef8;
      --bot: #eef8f2;
      --held: #fff5df;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #101317;
        --panel: #181c22;
        --text: #f3f5f8;
        --muted: #a9b1bf;
        --line: #303743;
        --accent: #78a9ff;
        --accent-text: #101317;
        --customer: #252b35;
        --bot: #1d3028;
        --held: #3a2f1c;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
    }
    main {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 28px 0;
    }
    header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 18px;
    }
    h1 {
      margin: 0 0 6px;
      font-size: 28px;
      line-height: 1.15;
      letter-spacing: 0;
    }
    p {
      margin: 0;
      color: var(--muted);
      line-height: 1.45;
    }
    .status {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 8px 12px;
      font-weight: 700;
      color: #0b7a50;
      white-space: nowrap;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 300px) minmax(0, 1fr);
      gap: 16px;
    }
    aside, .chat-panel, .debug-panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
    }
    aside {
      padding: 16px;
    }
    label {
      display: block;
      margin: 0 0 6px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
    }
    select, input, textarea, button {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      color: var(--text);
      font: inherit;
    }
    select, input {
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    button {
      padding: 10px 12px;
      cursor: pointer;
      font-weight: 750;
    }
    .scenario-list {
      display: grid;
      gap: 8px;
      margin: 4px 0 16px;
    }
    .scenario-list button {
      background: transparent;
      text-align: left;
    }
    .chat-panel {
      display: grid;
      grid-template-rows: auto minmax(420px, 58vh) auto;
      min-height: 600px;
      overflow: hidden;
    }
    .chat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid var(--line);
      padding: 14px 16px;
    }
    .chat-title {
      font-weight: 800;
    }
    .chat-subtitle {
      color: var(--muted);
      font-size: 13px;
      margin-top: 2px;
    }
    .messages {
      overflow: auto;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .message {
      max-width: min(76%, 620px);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px 12px;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .message.customer {
      align-self: flex-end;
      background: var(--customer);
    }
    .message.bot {
      align-self: flex-start;
      background: var(--bot);
    }
    .message.held {
      align-self: flex-start;
      background: var(--held);
    }
    .composer {
      border-top: 1px solid var(--line);
      padding: 14px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 116px;
      gap: 10px;
    }
    textarea {
      min-height: 48px;
      max-height: 160px;
      resize: vertical;
      padding: 11px 12px;
      line-height: 1.4;
    }
    .send {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--accent-text);
    }
    .debug-panel {
      margin-top: 16px;
      padding: 14px;
    }
    .debug-panel summary {
      cursor: pointer;
      color: var(--muted);
      font-weight: 750;
    }
    pre {
      max-height: 320px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 12px 0 0;
      font-size: 13px;
      line-height: 1.45;
    }
    @media (max-width: 820px) {
      header { display: block; }
      .status { display: inline-block; margin-top: 12px; }
      .layout { grid-template-columns: 1fr; }
      .chat-panel { min-height: 560px; }
      .composer { grid-template-columns: 1fr; }
      .message { max-width: 92%; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Website Chat Test</h1>
        <p>Local web channel simulator for the customer support bot.</p>
      </div>
      <div class="status" id="server-status">Server running</div>
    </header>

    <div class="layout">
      <aside>
        <label for="businessId">Business</label>
        <select id="businessId">
          <option value="restaurant_demo">Restaurant</option>
          <option value="beauty_demo">Beauty clinic</option>
          <option value="igshop_demo">IG shop</option>
          <option value="edu_demo">Education centre</option>
        </select>

        <label for="sessionId">Test Customer</label>
        <select id="sessionId"></select>

        <label>Try A Scenario</label>
        <div class="scenario-list">
          <button type="button" data-scenario="hours">Opening hours</button>
          <button type="button" data-scenario="restaurant">Book restaurant table</button>
          <button type="button" data-scenario="beauty">Book facial slot</button>
          <button type="button" data-scenario="order">Check fake order</button>
          <button type="button" data-scenario="payment">Check fake payment</button>
          <button type="button" data-scenario="complaint">Complaint handoff</button>
        </div>

        <button type="button" id="reset-chat">Reset Chat</button>
      </aside>

      <section>
        <div class="chat-panel">
          <div class="chat-top">
            <div>
              <div class="chat-title" id="chat-title">Restaurant</div>
              <div class="chat-subtitle" id="chat-subtitle">website channel</div>
            </div>
            <div id="last-status">Ready</div>
          </div>
          <div class="messages" id="messages"></div>
          <form class="composer" id="chat-form">
            <textarea id="message" placeholder="Type a customer message...">What time are you open?</textarea>
            <button class="send" type="submit">Send</button>
          </form>
        </div>

        <details class="debug-panel" open>
          <summary>Debug output</summary>
          <pre id="debug">Send a message to see pipeline details.</pre>
        </details>
      </section>
    </div>
  </main>

  <script>
    const businessSelect = document.getElementById("businessId");
    const sessionSelect = document.getElementById("sessionId");
    const form = document.getElementById("chat-form");
    const input = document.getElementById("message");
    const messages = document.getElementById("messages");
    const debug = document.getElementById("debug");
    const lastStatus = document.getElementById("last-status");
    const chatTitle = document.getElementById("chat-title");
    const chatSubtitle = document.getElementById("chat-subtitle");

    const customers = {
      restaurant_demo: [
        ["table_guest_001", "Chris W."],
        ["table_guest_004", "Ms Lee"]
      ],
      beauty_demo: [
        ["beauty_customer_amy", "Amy C."],
        ["beauty_customer_may", "May L."]
      ],
      igshop_demo: [
        ["local-browser-demo", "Demo User"],
        ["ig_sender_1001", "Cass"],
        ["ig_sender_1002", "Tony"]
      ],
      edu_demo: [
        ["parent_demo_001", "Parent Demo"],
        ["parent_chan_002", "Mrs Chan"]
      ]
    };

    const businessNames = {
      restaurant_demo: "Restaurant",
      beauty_demo: "Beauty clinic",
      igshop_demo: "IG shop",
      edu_demo: "Education centre"
    };

    const scenarios = {
      hours: { businessId: "restaurant_demo", sessionId: "table_guest_001", text: "What time are you open?" },
      restaurant: { businessId: "restaurant_demo", sessionId: "table_guest_001", text: "Can I book tonight 18:30 for 2 people?" },
      beauty: { businessId: "beauty_demo", sessionId: "beauty_customer_may", text: "想book今日19:00 facial有冇位" },
      order: { businessId: "igshop_demo", sessionId: "ig_sender_1001", text: "Can you check my order IG1001 status?" },
      payment: { businessId: "igshop_demo", sessionId: "local-browser-demo", text: "I paid FPS-IG2001, can you check payment?" },
      complaint: { businessId: "igshop_demo", sessionId: "local-browser-demo", text: "I am angry, no reply, I want refund for IG2002" }
    };

    function syncCustomers() {
      const businessId = businessSelect.value;
      sessionSelect.innerHTML = "";
      for (const customer of customers[businessId] || [["local-browser-demo", "Demo User"]]) {
        const option = document.createElement("option");
        option.value = customer[0];
        option.textContent = customer[1] + " (" + customer[0] + ")";
        sessionSelect.appendChild(option);
      }
      chatTitle.textContent = businessNames[businessId] || businessId;
      chatSubtitle.textContent = sessionSelect.value + " via website channel";
    }

    function addMessage(kind, text) {
      const item = document.createElement("div");
      item.className = "message " + kind;
      item.textContent = text;
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
    }

    function botTextFromResponse(body) {
      if (body.outbound && body.outbound.payload && body.outbound.payload.text) {
        return body.outbound.payload.text;
      }
      if (body.debug && body.debug.draft && body.debug.draft.text) {
        return body.debug.draft.text;
      }
      if (body.staffItemId) {
        return "Held for staff review: " + body.staffItemId;
      }
      return JSON.stringify(body, null, 2);
    }

    async function sendMessage(text) {
      const payload = {
        channel: "website",
        businessId: businessSelect.value,
        sessionId: sessionSelect.value,
        senderId: sessionSelect.value,
        text,
        debug: true
      };

      addMessage("customer", text);
      lastStatus.textContent = "Sending";

      const response = await fetch("/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await response.json();
      const held = body.finalStatus !== "ready_to_send";
      addMessage(held ? "held" : "bot", botTextFromResponse(body));
      lastStatus.textContent = body.action + " / " + body.finalStatus;
      debug.textContent = JSON.stringify(body, null, 2);
    }

    businessSelect.addEventListener("change", syncCustomers);
    sessionSelect.addEventListener("change", () => {
      chatSubtitle.textContent = sessionSelect.value + " via website channel";
    });

    document.querySelectorAll("[data-scenario]").forEach((button) => {
      button.addEventListener("click", () => {
        const scenario = scenarios[button.dataset.scenario];
        businessSelect.value = scenario.businessId;
        syncCustomers();
        sessionSelect.value = scenario.sessionId;
        chatSubtitle.textContent = sessionSelect.value + " via website channel";
        input.value = scenario.text;
        input.focus();
      });
    });

    document.getElementById("reset-chat").addEventListener("click", () => {
      messages.innerHTML = "";
      debug.textContent = "Send a message to see pipeline details.";
      lastStatus.textContent = "Ready";
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      try {
        await sendMessage(text);
      } catch (error) {
        lastStatus.textContent = "Error";
        addMessage("held", error.message);
      }
    });

    syncCustomers();
    addMessage("bot", "Hi, this is the local website test chat. Send a message when ready.");
  </script>
</body>
</html>`;
}

function adminSlotsHtml() { return require("./adminHtml").adminSlotsHtml(); }

function localConsoleHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Local Customer Support Bot</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f7f8fb;
      --panel: #ffffff;
      --text: #17181c;
      --muted: #5d6472;
      --line: #d8dce5;
      --accent: #1464f4;
      --ok: #0b7a50;
      --hold: #9a5b00;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #101216;
        --panel: #181b21;
        --text: #f1f3f7;
        --muted: #aab1c0;
        --line: #303541;
        --accent: #78a6ff;
        --ok: #63d89f;
        --hold: #ffc267;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
    }
    main {
      width: min(980px, calc(100% - 32px));
      margin: 0 auto;
      padding: 40px 0;
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 28px;
      line-height: 1.15;
      letter-spacing: 0;
    }
    p {
      margin: 0;
      color: var(--muted);
      line-height: 1.5;
    }
    .status {
      flex: 0 0 auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--ok);
      background: var(--panel);
      font-weight: 650;
      font-size: 14px;
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
      gap: 16px;
    }
    section {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 18px;
    }
    label {
      display: block;
      margin: 0 0 6px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 650;
    }
    input, select, textarea, button {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      color: var(--text);
      font: inherit;
    }
    input, select, textarea {
      padding: 10px 12px;
      margin-bottom: 14px;
    }
    textarea {
      min-height: 120px;
      resize: vertical;
      line-height: 1.45;
    }
    button {
      padding: 10px 14px;
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
      cursor: pointer;
      font-weight: 700;
    }
    pre {
      min-height: 300px;
      margin: 0;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 13px;
      line-height: 1.45;
      color: var(--text);
    }
    .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 650;
    }
    .badge {
      color: var(--hold);
    }
    .scenario-list {
      display: grid;
      gap: 8px;
      margin-bottom: 14px;
    }
    .scenario-list button {
      background: transparent;
      color: var(--text);
      border-color: var(--line);
      text-align: left;
      font-weight: 650;
    }
    @media (max-width: 760px) {
      header { display: block; }
      .status { display: inline-block; margin-top: 16px; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Local Customer Support Bot</h1>
        <p>Test the webhook pipeline running on this machine.</p>
      </div>
      <div class="status">Server running</div>
    </header>

    <div class="grid">
      <section>
        <label>Test Scenarios</label>
        <div class="scenario-list">
          <button type="button" data-scenario="restaurant">Restaurant table tonight</button>
          <button type="button" data-scenario="igorder">IG order status</button>
          <button type="button" data-scenario="igpayment">IG payment check</button>
          <button type="button" data-scenario="beauty">Beauty booking</button>
          <button type="button" data-scenario="edu">Education assessment</button>
        </div>

        <form id="message-form">
          <label for="businessId">Business</label>
          <select id="businessId" name="businessId">
            <option value="restaurant_demo">restaurant_demo</option>
            <option value="beauty_demo">beauty_demo</option>
            <option value="igshop_demo">igshop_demo</option>
            <option value="edu_demo">edu_demo</option>
          </select>

          <label for="channel">Channel</label>
          <select id="channel" name="channel">
            <option value="website">website</option>
            <option value="whatsapp">whatsapp</option>
            <option value="instagram">instagram</option>
            <option value="facebook">facebook</option>
          </select>

          <label for="sessionId">Session ID</label>
          <input id="sessionId" name="sessionId" value="local-browser-demo">

          <label for="senderId">Sender ID</label>
          <input id="senderId" name="senderId" value="local-browser-demo">

          <label for="text">Customer Message</label>
          <textarea id="text" name="text">What time are you open?</textarea>

          <button type="submit">Send Test Message</button>
        </form>
      </section>

      <section>
        <div class="meta">
          <span>Response</span>
          <span id="result-status" class="badge">Waiting</span>
        </div>
        <pre id="result">Submit a message to see the pipeline response.</pre>
      </section>
    </div>
  </main>

  <script>
    const form = document.getElementById("message-form");
    const result = document.getElementById("result");
    const status = document.getElementById("result-status");
    const scenarios = {
      restaurant: {
        businessId: "restaurant_demo",
        channel: "website",
        sessionId: "table_guest_001",
        senderId: "table_guest_001",
        text: "Can I book tonight 18:30 for 2 people?"
      },
      igorder: {
        businessId: "igshop_demo",
        channel: "instagram",
        sessionId: "ig_sender_1001",
        senderId: "ig_sender_1001",
        text: "Can you check my order IG1001 status?"
      },
      igpayment: {
        businessId: "igshop_demo",
        channel: "instagram",
        sessionId: "local-browser-demo",
        senderId: "local-browser-demo",
        text: "I paid FPS-IG2001, can you check payment?"
      },
      beauty: {
        businessId: "beauty_demo",
        channel: "website",
        sessionId: "beauty_customer_may",
        senderId: "beauty_customer_may",
        text: "想book今日19:00 facial有冇位"
      },
      edu: {
        businessId: "edu_demo",
        channel: "website",
        sessionId: "parent_demo_001",
        senderId: "parent_demo_001",
        text: "Can I book today 17:30 assessment for P3 English?"
      }
    };

    document.querySelectorAll("[data-scenario]").forEach((button) => {
      button.addEventListener("click", () => {
        const scenario = scenarios[button.dataset.scenario];
        for (const [key, value] of Object.entries(scenario)) {
          form.elements[key].value = value;
        }
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.textContent = "Sending";
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.debug = true;
      try {
        const response = await fetch("/webhook", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const body = await response.json();
        status.textContent = response.ok ? "OK" : "Error";
        result.textContent = JSON.stringify(body, null, 2);
      } catch (error) {
        status.textContent = "Error";
        result.textContent = error.message;
      }
    });
  </script>
</body>
</html>`;
}

function startWebhookServer(config = {}) {
  loadLocalEnvFiles(config.envFiles);
  const host = config.host || process.env.HOST || DEFAULT_HOST;
  const port = Number(config.port || process.env.PORT || DEFAULT_PORT);
  const nodeEnv = config.nodeEnv || process.env.NODE_ENV;
  const hasWebhookSecret = Boolean(config.webhookSecret || process.env.WEBHOOK_SECRET);
  const allowUnsignedWebhooks = config.allowUnsignedWebhooks ?? (!hasWebhookSecret && nodeEnv !== "production");
  const webhookBusinessId = config.webhookBusinessId || process.env.WEBHOOK_BUSINESS_ID || null;
  const logger = config.logger || createLogger();
  const metrics = config.metrics || createMetrics();
  const onUsage = config.onUsage || createUsageReporter({ logger, metrics });
  const claudeAdapters = createClaudeAdapters({ ...(config.claude || {}), onUsage });
  const openAIAdapters = createOpenAIAdapters({ ...(config.openAI || {}), onUsage });
  const allowLocalDemoLlm = config.allowLocalDemoLlm ?? process.env.ALLOW_LOCAL_DEMO_LLM === "true";
  if (!config.llmAdapter && !claudeAdapters.llmAdapter && !openAIAdapters.llmAdapter && !allowLocalDemoLlm) {
    throw new Error("CLAUDE_CODE_OAUTH_TOKEN, ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, or OPENAI_OAUTH_TOKEN is required to start the bot. Set one in whatsapp-web-test-bridge/.env, or set ALLOW_LOCAL_DEMO_LLM=true for offline demo mode.");
  }
  const realLlmAdapter = config.llmAdapter || claudeAdapters.llmAdapter || openAIAdapters.llmAdapter || null;
  const llmAdapter = realLlmAdapter || localDemoLlmAdapter;
  const llmIntentAnalyzer = config.llmIntentAnalyzer || claudeAdapters.llmIntentAnalyzer || openAIAdapters.llmIntentAnalyzer || null;
  const paraphraseDisabled = config.paraphraseEnabled === false || process.env.PARAPHRASE_ENABLED === "false";
  const paraphraser = config.paraphraser
    || (realLlmAdapter && !paraphraseDisabled ? createParaphraser(realLlmAdapter) : null);
  const availabilityStore = config.availabilityStore || createAvailabilityStore({ seed: mockBusinessSeed });
  const backend = config.backend || createBusinessBackend({ availabilityStore });
  const outboxStore = config.outboxStore ?? createOutboxStore(config.outboxFile ? { filePath: config.outboxFile } : (process.env.OUTBOX_FILE ? { filePath: process.env.OUTBOX_FILE } : {}));
  const driveIntegration = config.promotionStore ? null : maybeCreateDriveIntegration(config);
  const promotionStore = config.promotionStore || (driveIntegration ? driveIntegration.store : null);
  const llmMode = claudeAdapters.llmAdapter
    ? `claude:${process.env.CLAUDE_MODEL || process.env.CLAUDE_DRAFT_MODEL || "claude-haiku-4-5-20251001"}`
    : openAIAdapters.llmAdapter
      ? `openai:${process.env.OPENAI_MODEL || process.env.OPENAI_DRAFT_MODEL || "gpt-4.1-mini"}`
      : "local-demo";
  const llmIntentMode = config.llmIntentMode || process.env.LLM_INTENT_MODE || process.env.OPENAI_INTENT_MODE || "always";
  const server = createWebhookServer({
    ...config,
    allowUnsignedWebhooks,
    webhookBusinessId,
    llmAdapter,
    llmIntentAnalyzer,
    llmIntentMode,
    paraphraser,
    backend,
    availabilityStore,
    outboxStore,
    logger,
    metrics,
    ...(promotionStore ? { promotionStore } : {})
  });

  return server.listen(port, host, async () => {
    const mode = allowUnsignedWebhooks ? "unsigned local mode" : "signed webhook mode";
    console.log(`Webhook server listening at http://${host}:${port}/webhook (${mode}, businessId=${webhookBusinessId || "payload-selected"})`);
    console.log(`LLM mode: ${llmMode}; intent analyzer: ${llmIntentAnalyzer ? llmIntentMode : "deterministic"}; paraphraser: ${paraphraser ? "on" : "off"}`);
    const adminAuth = (config.adminToken || process.env.ADMIN_TOKEN) ? "token required" : (nodeEnv === "production" ? "blocked (set ADMIN_TOKEN)" : "open (local dev)");
    console.log(`Admin slots page: http://${host}:${port}/admin  (auth: ${adminAuth})`);
    if (driveIntegration) {
      console.log(`Google Drive promo sync: enabled for ${Object.keys(driveIntegration.folders).join(", ") || "(no folders mapped)"}`);
      await driveIntegration.syncAll().catch((error) => {
        console.error(`Google Drive initial sync failed: ${error.message}`);
      });
    } else {
      console.log(`Google Drive promo sync: disabled (set GOOGLE_SERVICE_ACCOUNT_JSON_PATH + GDRIVE_FOLDER_<BUSINESS_ID> to enable)`);
    }
  });
}

// Wires a real Google Drive client into a fresh promotion store if the user has
// configured a service account + at least one GDRIVE_FOLDER_* env var. Returns
// null otherwise so the pipeline falls back to the seed promo store.
function maybeCreateDriveIntegration(config = {}) {
  const jsonPath = config.googleServiceAccountJsonPath || process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH;
  const folders = config.gdriveFolders || loadFoldersFromEnv();
  if (!jsonPath || Object.keys(folders).length === 0) return null;

  let driveClient;
  try {
    driveClient = createGoogleDriveClient({ serviceAccountJsonPath: jsonPath, folders });
  } catch (error) {
    console.error(`Google Drive client init failed: ${error.message}`);
    return null;
  }

  const store = createPromotionStore();
  const syncs = Object.keys(folders).map((businessId) => createPromoSync({ driveClient, store, businessId, folderId: folders[businessId] }));

  return {
    store,
    folders,
    async syncAll() {
      for (const sync of syncs) await sync.syncOnce();
    }
  };
}

function createParaphraser(llmAdapter) {
  return async function paraphrase(context = {}) {
    const prompt = buildParaphrasePrompt({
      text: context.text,
      intent: context.intent,
      gateway: context.gateway
    });
    return llmAdapter(prompt.fullPrompt, {
      action: "paraphrase",
      decision: context.decision,
      intent: context.intent,
      knowledge: context.knowledge,
      gateway: context.gateway,
      promotions: context.promotions,
      backendFacts: context.backendFacts,
      modelRoute: context.modelRoute,
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      cacheSystem: true
    });
  };
}

function loadLocalEnvFiles(files) {
  const envFiles = files || [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "whatsapp-web-test-bridge", ".env")
  ];
  for (const file of envFiles) loadEnvFile(file);
}

function loadEnvFile(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      process.env[key] = unquoteEnvValue(rawValue.trim());
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function unquoteEnvValue(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

async function localDemoLlmAdapter(prompt, context = {}) {
  const intent = context.intent?.primaryIntent || "general";
  const action = context.decision?.action || "staff_review";
  const facts = factsObject(context.backendFacts);

  if (action === "handoff") {
    return { text: `員工交接摘要\n意圖：${intent}\n原因：${context.decision?.reason || "需要人手跟進"}\n建議：請同事檢查對話同後台資料後回覆。` };
  }

  if (context.backendFacts?.found) {
    if (intent === "pricing") {
      return {
        text: formatPricingDraft(context)
      };
    }

    if (intent === "booking" || intent === "reschedule") {
      if (Array.isArray(facts.availableSlots)) {
        const slots = facts.availableSlots.length > 0 ? facts.availableSlots.join("、") : "暫時未見到可選時段";
        return {
          text: `後台草稿：${facts.date || "指定日期"} ${facts.service || facts.partySize || ""} 可選時段：${slots}。正式確認前請同事再核實並回覆客人。`
        };
      }
      const availability = facts.available === true ? "暫時見到有位" : "暫時未見到有位";
      return {
        text: `後台草稿：${facts.date || "指定日期"} ${facts.time || "指定時間"} ${facts.partySize ? `${facts.partySize}位` : facts.service || ""} ${availability}。正式確認前請同事再核實並回覆客人。`
      };
    }

    if (intent === "order_status") {
      return {
        text: `後台草稿：訂單 ${facts.orderId || ""} 狀態為 ${facts.status || "未提供"}，物流狀態為 ${facts.shipmentStatus || "未提供"}，快遞為 ${facts.courier || "未提供"}。請同事核實後回覆客人。`
      };
    }

    if (intent === "payment") {
      return {
        text: `後台草稿：付款參考 ${facts.reference || ""} 的後台狀態為 ${facts.status || "未提供"}，金額 HK$${facts.amount ?? "未提供"}。請同事核實後回覆客人。`
      };
    }

    if (intent === "membership") {
      return {
        text: formatMembershipDraft(context)
      };
    }

    if (intent === "service_info") {
      const stock = facts.available === true ? "有庫存" : "未見庫存";
      return {
        text: `後台草稿：${facts.name || facts.sku || "查詢項目"} ${stock}，數量 ${facts.quantity ?? "未提供"}。請同事核實後回覆客人。`
      };
    }
  }

  return { text: context.knowledge?.bestMatch?.answer || "後台草稿：資料不足，請同事向客人追問一個必要資料。" };
}

function factsObject(backendFacts = {}) {
  return Object.fromEntries((backendFacts.facts || []).map((fact) => [fact.key, fact.value]));
}

function formatPricingDraft(context = {}) {
  const language = context.intent?.language || "zh-HK";
  if (language === "en") {
    return `Staff draft:\n${formatPricingPlans(context.backendFacts, language)}\n\nPlease confirm which treatment the customer wants, remind them that results vary by person, and mention that a booking deposit is required.`;
  }

  return `後台草稿：\n${formatPricingPlans(context.backendFacts, language)}\n\n請同事確認客人需要邊個療程，再提醒效果因人而異及預約需付留位費。`;
}

function formatMembershipDraft(context = {}) {
  const language = context.intent?.language || "zh-HK";
  const facts = factsObject(context.backendFacts);
  const eligible = Number(facts.freeTreatmentsAvailable || 0) > 0;
  if (language === "en") {
    return [
      `Staff draft: Member ${facts.memberId || ""} (${facts.displayName || "member"}) has ${facts.points ?? 0} point(s).`,
      `The test rule is 1 point per completed treatment, and every ${facts.rewardThreshold || 10} points can be redeemed for 1 free treatment.`,
      eligible
        ? `This member is eligible for ${facts.freeTreatmentsAvailable} free treatment(s). Please confirm redemption details with staff before booking.`
        : `They need ${facts.pointsUntilNextReward ?? "more"} more point(s) for the next free treatment.`
    ].join("\n");
  }

  return [
    `後台草稿：會員 ${facts.memberId || ""}（${facts.displayName || "會員"}）現有 ${facts.points ?? 0} 分。`,
    `測試規則：每完成1次療程有1分；每 ${facts.rewardThreshold || 10} 分可換1次免費療程。`,
    eligible
      ? `此會員現時可換 ${facts.freeTreatmentsAvailable} 次免費療程；正式安排前請同事確認兌換細節。`
      : `距離下次免費療程尚欠 ${facts.pointsUntilNextReward ?? "若干"} 分。`
  ].join("\n");
}

function formatPricingPlans(backendFacts = {}, language = "zh-HK") {
  const plans = [];
  let current = null;
  for (const fact of backendFacts.facts || []) {
    if (fact.key === "planId") {
      current = { planId: fact.value };
      plans.push(current);
      continue;
    }
    if (current) current[fact.key] = fact.value;
  }

  if (plans.length === 0) return language === "en" ? "No matching pricing found." : "未搵到相符價目。";

  return plans.map((plan) => {
    if (language === "en") {
      const original = plan.originalPriceHkd ? `, original HK$${plan.originalPriceHkd}` : "";
      const sessions = plan.sessions ? `, ${plan.sessions} session${plan.sessions > 1 ? "s" : ""}` : "";
      const duration = plan.durationMinutes ? `, around ${plan.durationMinutes} minutes` : "";
      const deposit = plan.depositHkd ? `, booking deposit HK$${plan.depositHkd}` : "";
      const notes = plan.notesEn ? `\n  Notes: ${plan.notesEn}` : "";
      return `- ${plan.planNameEn || plan.planNameZh || plan.planId}: HK$${plan.priceHkd}${original}${sessions}${duration}${deposit}${notes}`;
    }

    const original = plan.originalPriceHkd ? `，原價HK$${plan.originalPriceHkd}` : "";
    const sessions = plan.sessions ? `，${plan.sessions}次` : "";
    const duration = plan.durationMinutes ? `，約${plan.durationMinutes}分鐘` : "";
    const deposit = plan.depositHkd ? `，留位費HK$${plan.depositHkd}` : "";
    const notes = plan.notesZh ? `\n  備註：${plan.notesZh}` : "";
    return `- ${plan.planNameZh || plan.planNameEn || plan.planId}: HK$${plan.priceHkd}${original}${sessions}${duration}${deposit}${notes}`;
  }).join("\n");
}

if (require.main === module) {
  startWebhookServer();
}

module.exports = {
  createWebhookServer,
  startWebhookServer,
  _internal: {
    authorizeWebhookPayload,
    constantTimeEqual,
    parseJson,
    publicErrorMessage,
    readBody,
    readJson,
    signBody,
    statusCodeForError,
    validateWebhookEnvelope,
    verifyUnsignedWebhookMode,
    verifyFreshTimestamp,
    verifyWebhookRequest,
    webhookSecretCandidates,
    writeJson,
    createUsageReporter
  }
};
