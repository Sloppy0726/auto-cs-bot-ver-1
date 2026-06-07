"use strict";

const { requestJson, queryString } = require("./http");

const BASE_URL = "https://connect.squareup.com/v2";
const NAME = "square";
const LABEL = "Square";
const ENV_VARS = ["SQUARE_ACCESS_TOKEN"];

function isConfigured() {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN);
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    "Square-Version": "2024-01-18",
    "Content-Type": "application/json"
  };
}

// path e.g. "/customers"; query for GET; json body for POST.
async function request(path, { method = "GET", query, json } = {}) {
  const url = `${BASE_URL}${path}${method === "GET" ? queryString(query) : ""}`;
  const body = method !== "GET" && json ? JSON.stringify(json) : undefined;
  return requestJson(url, { method, headers: authHeaders(), body, provider: NAME });
}

module.exports = { name: NAME, label: LABEL, envVars: ENV_VARS, isConfigured, request };
