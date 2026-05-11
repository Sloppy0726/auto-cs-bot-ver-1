"use strict";

const http = require("node:http");
const crypto = require("node:crypto");
const { createPipeline } = require("./pipeline");

const DEFAULT_MAX_BODY_BYTES = 1_000_000;
const DEFAULT_REPLAY_WINDOW_SECONDS = 300;
const DEFAULT_BODY_TIMEOUT_MS = 5_000;

function createWebhookServer(config = {}) {
  const pipeline = config.pipeline || createPipeline(config);
  return http.createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/webhook") {
      writeJson(res, 404, { error: "not_found" });
      return;
    }

    try {
      const envelopeError = validateWebhookEnvelope(req, config);
      if (envelopeError) throw envelopeError;
      const body = await readBody(req, config.maxBodyBytes, config.bodyTimeoutMs);
      const authContext = verifyWebhookRequest(req, body, config);
      const payload = authorizeWebhookPayload(parseJson(body), authContext, config);
      const result = await pipeline.runMessage(payload);
      writeJson(res, 200, {
        finalStatus: result.finalStatus,
        outbound: result.outbound,
        staffItemId: result.staffItem?.id || null,
        action: result.decision?.action || null
      });
    } catch (error) {
      const statusCode = statusCodeForError(error);
      writeJson(res, statusCode, { error: publicErrorMessage(error, statusCode) });
    }
  });
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

module.exports = {
  createWebhookServer,
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
    writeJson
  }
};
