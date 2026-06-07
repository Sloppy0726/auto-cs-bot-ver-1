"use strict";

const { requestJson, queryString } = require("./http");

const BASE_URL = "https://www.docusign.net/restapi/v2.1/accounts";
const NAME = "docusign";
const LABEL = "DocuSign";
const ENV_VARS = ["DOCUSIGN_ACCESS_TOKEN", "DOCUSIGN_ACCOUNT_ID"];

function isConfigured() {
  return Boolean(process.env.DOCUSIGN_ACCESS_TOKEN && process.env.DOCUSIGN_ACCOUNT_ID);
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.DOCUSIGN_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  };
}

// path e.g. "/envelopes"; query for GET; json body for POST.
async function request(path, { method = "GET", query, json } = {}) {
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const url = `${BASE_URL}/${accountId}${path}${method === "GET" ? queryString(query) : ""}`;
  const body = method !== "GET" && json ? JSON.stringify(json) : undefined;
  return requestJson(url, { method, headers: authHeaders(), body, provider: NAME });
}

module.exports = { name: NAME, label: LABEL, envVars: ENV_VARS, isConfigured, request };
