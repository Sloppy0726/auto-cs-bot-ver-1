"use strict";

const { requestJson, queryString } = require("./http");

const BASE_URL = "https://quickbooks.api.intuit.com/v3/company";
const NAME = "quickbooks";
const LABEL = "QuickBooks";
const ENV_VARS = ["QUICKBOOKS_ACCESS_TOKEN", "QUICKBOOKS_REALM_ID"];

function isConfigured() {
  return Boolean(process.env.QUICKBOOKS_ACCESS_TOKEN && process.env.QUICKBOOKS_REALM_ID);
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.QUICKBOOKS_ACCESS_TOKEN}`,
    Accept: "application/json"
  };
}

// path e.g. "/reports/ProfitAndLoss" or "/query"; query merged into URL.
async function request(path, { method = "GET", query } = {}) {
  const realmId = process.env.QUICKBOOKS_REALM_ID;
  const url = `${BASE_URL}/${realmId}${path}${queryString(query)}`;
  return requestJson(url, { method, headers: authHeaders(), provider: NAME });
}

module.exports = { name: NAME, label: LABEL, envVars: ENV_VARS, isConfigured, request };
