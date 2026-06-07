"use strict";

const { requestJson, queryString } = require("./http");

const NAME = "google";
const LABEL = "Google (Gmail / Calendar / Drive)";
const ENV_VARS = ["GOOGLE_ACCESS_TOKEN"];

const BASE_URLS = {
  gmail: "https://gmail.googleapis.com/gmail/v1",
  calendar: "https://www.googleapis.com/calendar/v3",
  drive: "https://www.googleapis.com/drive/v3"
};

function isConfigured() {
  return Boolean(process.env.GOOGLE_ACCESS_TOKEN);
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  };
}

// service: "gmail" | "calendar" | "drive"; path e.g. "/users/me/messages".
async function request(service, path, { method = "GET", query, json } = {}) {
  const base = BASE_URLS[service];
  if (!base) throw new Error(`Unknown Google service: ${service}`);
  const url = `${base}${path}${method === "GET" ? queryString(query) : ""}`;
  const body = method !== "GET" && json ? JSON.stringify(json) : undefined;
  return requestJson(url, { method, headers: authHeaders(), body, provider: NAME });
}

module.exports = { name: NAME, label: LABEL, envVars: ENV_VARS, isConfigured, request };
