"use strict";

const http = require("node:http");
const { createPipeline } = require("./pipeline");

function createWebhookServer(config = {}) {
  const pipeline = config.pipeline || createPipeline(config);
  return http.createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/webhook") {
      writeJson(res, 404, { error: "not_found" });
      return;
    }

    try {
      const payload = await readJson(req);
      const result = await pipeline.runMessage(payload);
      writeJson(res, 200, {
        finalStatus: result.finalStatus,
        outbound: result.outbound,
        staffItemId: result.staffItem?.id || null,
        action: result.decision?.action || null
      });
    } catch (error) {
      const statusCode = statusCodeForError(error);
      writeJson(res, statusCode, { error: error.message });
    }
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error("request_too_large"));
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function statusCodeForError(error) {
  if (error?.message === "request_too_large") return 413;
  if (error instanceof SyntaxError) return 400;
  return 500;
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

module.exports = { createWebhookServer, _internal: { readJson, writeJson, statusCodeForError } };
