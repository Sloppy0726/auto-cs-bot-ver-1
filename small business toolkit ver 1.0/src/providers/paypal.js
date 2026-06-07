"use strict";

const { requestJson, queryString, formEncode } = require("./http");

const BASE_URL = "https://api-m.paypal.com";
const NAME = "paypal";
const LABEL = "PayPal";
const ENV_VARS = ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"];

function isConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

// PayPal uses OAuth2 client-credentials: exchange id/secret for a short-lived token.
async function getAccessToken() {
  const basic = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const token = await requestJson(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formEncode({ grant_type: "client_credentials" }),
    provider: NAME
  });
  return token.access_token;
}

// path e.g. "/v1/reporting/transactions"; query for GET.
async function request(path, { method = "GET", query, json } = {}) {
  const accessToken = await getAccessToken();
  const url = `${BASE_URL}${path}${method === "GET" ? queryString(query) : ""}`;
  const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
  const body = method !== "GET" && json ? JSON.stringify(json) : undefined;
  return requestJson(url, { method, headers, body, provider: NAME });
}

module.exports = { name: NAME, label: LABEL, envVars: ENV_VARS, isConfigured, request };
