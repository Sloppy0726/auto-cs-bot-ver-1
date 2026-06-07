"use strict";

const { requestJson, queryString } = require("./http");

const BASE_URL = "https://api.canva.com/rest/v1";
const NAME = "canva";
const LABEL = "Canva";
const ENV_VARS = ["CANVA_ACCESS_TOKEN"];

function isConfigured() {
  return Boolean(process.env.CANVA_ACCESS_TOKEN);
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.CANVA_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  };
}

// path e.g. "/designs"; query for GET; json body for POST.
async function request(path, { method = "GET", query, json } = {}) {
  const url = `${BASE_URL}${path}${method === "GET" ? queryString(query) : ""}`;
  const body = method !== "GET" && json ? JSON.stringify(json) : undefined;
  return requestJson(url, { method, headers: authHeaders(), body, provider: NAME });
}

module.exports = { name: NAME, label: LABEL, envVars: ENV_VARS, isConfigured, request };
