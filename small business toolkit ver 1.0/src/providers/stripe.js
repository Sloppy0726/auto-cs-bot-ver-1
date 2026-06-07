"use strict";

const { requestJson, formEncode, queryString } = require("./http");

const BASE_URL = "https://api.stripe.com/v1";
const NAME = "stripe";
const LABEL = "Stripe";
const ENV_VARS = ["STRIPE_API_KEY"];

function isConfigured() {
  return Boolean(process.env.STRIPE_API_KEY);
}

function authHeaders() {
  return { Authorization: `Bearer ${process.env.STRIPE_API_KEY}` };
}

// path e.g. "/invoices"; query for GET; form for POST (Stripe uses form-encoded bodies).
async function request(path, { method = "GET", query, form } = {}) {
  const url = `${BASE_URL}${path}${method === "GET" ? queryString(query) : ""}`;
  const headers = authHeaders();
  let body;
  if (method !== "GET" && form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = formEncode(form);
  }
  return requestJson(url, { method, headers, body, provider: NAME });
}

module.exports = { name: NAME, label: LABEL, envVars: ENV_VARS, isConfigured, request };
