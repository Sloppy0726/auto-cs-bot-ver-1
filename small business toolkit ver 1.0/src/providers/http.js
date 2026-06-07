"use strict";

// Shared HTTP helper for provider adapters.
// Uses Node 20 global fetch so the repo stays dependency-light.

class ProviderError extends Error {
  constructor(message, { provider, status, body } = {}) {
    super(message);
    this.name = "ProviderError";
    this.provider = provider;
    this.status = status;
    this.body = body;
  }
}

async function requestJson(url, { method = "GET", headers = {}, body, provider } = {}) {
  let response;
  try {
    response = await fetch(url, { method, headers, body });
  } catch (err) {
    throw new ProviderError(`Network error calling ${provider}: ${err.message}`, { provider });
  }

  const text = await response.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    throw new ProviderError(`${provider} responded ${response.status}`, {
      provider,
      status: response.status,
      body: parsed
    });
  }
  return parsed;
}

function formEncode(params = {}) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    usp.append(key, String(value));
  }
  return usp.toString();
}

function queryString(params = {}) {
  const qs = formEncode(params);
  return qs ? `?${qs}` : "";
}

module.exports = { ProviderError, requestJson, formEncode, queryString };
