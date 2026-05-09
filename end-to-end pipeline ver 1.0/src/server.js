"use strict";

const http = require("node:http");
const crypto = require("node:crypto");
const { createPipeline } = require("./pipeline");

const DEFAULT_MAX_BODY_BYTES = 1_000_000;
const DEFAULT_REPLAY_WINDOW_SECONDS = 300;

function createWebhookServer(config = {}) {
  const pipeline = config.pipeline || createPipeline(config);
  return http.createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/webhook") {
      writeJson(res, 404, { error: "not_found" });
      return;
    }

    try {
      const body = await readBody(req, config.maxBodyBytes);
      verifyWebhookRequest(req, body, config);
      const payload = parseJson(body);
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

function readBody(req, maxBodyBytes = DEFAULT_MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let body = "";
    let tooLarge = false;

    req.on("data", (chunk) => {
      if (tooLarge) return;
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > maxBodyBytes) {
        tooLarge = true;
        reject(new Error("request_too_large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!tooLarge) resolve(body);
    });
    req.on("error", reject);
  });
}

function parseJson(body) {
  return body ? JSON.parse(body) : {};
}

function verifyWebhookRequest(req, body, config = {}) {
  const secret = config.webhookSecret || process.env.WEBHOOK_SECRET;
  if (!secret && config.allowUnsignedWebhooks !== true) throw authError("webhook_secret_required");
  if (!secret) return;

  const timestamp = getHeader(req, "x-webhook-timestamp");
  const signature = getHeader(req, "x-webhook-signature");
  if (!timestamp || !signature) throw authError("missing_webhook_signature");

  verifyFreshTimestamp(timestamp, config);

  const expected = signBody({ body, timestamp, secret });
  if (!constantTimeEqual(normalizeSignature(signature), expected)) {
    throw authError("invalid_webhook_signature");
  }
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

function statusCodeForError(error) {
  if (error?.statusCode) return error.statusCode;
  if (error?.message === "request_too_large") return 413;
  if (error instanceof SyntaxError) return 400;
  return 500;
}

function publicErrorMessage(error, statusCode) {
  if (statusCode === 500) return "internal_server_error";
  return error.message;
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

module.exports = {
  createWebhookServer,
  _internal: {
    constantTimeEqual,
    parseJson,
    publicErrorMessage,
    readBody,
    readJson,
    signBody,
    statusCodeForError,
    verifyFreshTimestamp,
    verifyWebhookRequest,
    writeJson
  }
};
