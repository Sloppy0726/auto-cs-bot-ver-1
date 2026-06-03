"use strict";

// Google Drive client for promo sync.
// Service-account JWT auth (no user OAuth flow). Implements the { listFiles, readFile }
// contract that promoSync expects.
//
// Reads service account JSON from GOOGLE_SERVICE_ACCOUNT_JSON_PATH or an inline
// { credentials } config. Maps businessId -> folderId via GDRIVE_FOLDER_<BUSINESS_ID>
// env vars or an explicit { folders } map.
//
// No npm dependencies: uses node:crypto for RS256 signing and globalThis.fetch
// (Node 22+ ships fetch). Tests inject httpFetch + nowFn.

const fs = require("node:fs");
const crypto = require("node:crypto");

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_BASE = "https://www.googleapis.com/drive/v3";
const DEFAULT_SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];
const TOKEN_LIFETIME_SECONDS = 3600;
const TOKEN_REFRESH_LEAD_MS = 60_000;

function createGoogleDriveClient(config = {}) {
  const credentials = loadCredentials(config);
  const folders = config.folders || loadFoldersFromEnv();
  const scopes = Array.isArray(config.scopes) && config.scopes.length > 0 ? config.scopes : DEFAULT_SCOPES;
  const httpFetch = config.httpFetch || globalThis.fetch;
  const nowFn = config.nowFn || (() => Date.now());

  if (typeof httpFetch !== "function") {
    throw new Error("googleDriveClient requires a fetch implementation (Node >= 22 ships one).");
  }

  let tokenCache = null;

  async function getAccessToken() {
    if (tokenCache && tokenCache.expiresAt - TOKEN_REFRESH_LEAD_MS > nowFn()) return tokenCache.accessToken;
    const jwt = signServiceAccountJwt(credentials, scopes, nowFn);
    const body = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    });
    const res = await httpFetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });
    if (!res.ok) {
      throw new Error(`google_drive_auth_failed: ${res.status} ${await safeText(res)}`);
    }
    const json = await res.json();
    if (!json.access_token) throw new Error("google_drive_auth_failed: no access_token in response");
    const expiresIn = Number(json.expires_in || TOKEN_LIFETIME_SECONDS);
    tokenCache = { accessToken: json.access_token, expiresAt: nowFn() + expiresIn * 1000 };
    return tokenCache.accessToken;
  }

  async function listFiles({ folderId, businessId } = {}) {
    const targetFolder = folderId || folders[String(businessId || "").toLowerCase()];
    if (!targetFolder) return [];
    const token = await getAccessToken();
    const query = `'${targetFolder}' in parents and trashed = false`;
    const url = `${DRIVE_BASE}/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent("files(id,name,mimeType,modifiedTime)")}&pageSize=100`;
    const res = await httpFetch(url, { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`google_drive_list_failed: ${res.status} ${await safeText(res)}`);
    const json = await res.json();
    return Array.isArray(json.files) ? json.files : [];
  }

  async function readFile(file) {
    if (!file || !file.id) throw new Error("google_drive_read_failed: file.id required");
    const token = await getAccessToken();
    const isGoogleDoc = file.mimeType === "application/vnd.google-apps.document";
    const url = isGoogleDoc
      ? `${DRIVE_BASE}/files/${encodeURIComponent(file.id)}/export?mimeType=text%2Fplain`
      : `${DRIVE_BASE}/files/${encodeURIComponent(file.id)}?alt=media`;
    const res = await httpFetch(url, { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`google_drive_read_failed: ${res.status} ${await safeText(res)}`);
    const text = await res.text();
    return { text, mimeType: file.mimeType || null };
  }

  return { listFiles, readFile, folders, _internal: { getAccessToken } };
}

function loadCredentials(config) {
  if (config.credentials) {
    if (!config.credentials.client_email || !config.credentials.private_key) {
      throw new Error("googleDriveClient: credentials must include client_email and private_key");
    }
    return config.credentials;
  }
  const jsonPath = config.serviceAccountJsonPath || process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH;
  if (!jsonPath) {
    throw new Error("googleDriveClient requires { credentials } or GOOGLE_SERVICE_ACCOUNT_JSON_PATH env var.");
  }
  const raw = fs.readFileSync(jsonPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error(`googleDriveClient: invalid service account JSON at ${jsonPath} (missing client_email or private_key).`);
  }
  return parsed;
}

function loadFoldersFromEnv(env = process.env) {
  const folders = {};
  for (const [key, value] of Object.entries(env)) {
    const m = key.match(/^GDRIVE_FOLDER_(.+)$/);
    if (m && value) folders[m[1].toLowerCase()] = String(value);
  }
  return folders;
}

function signServiceAccountJwt(credentials, scopes, nowFn) {
  const now = Math.floor(nowFn() / 1000);
  const header = base64UrlJson({ alg: "RS256", typ: "JWT", kid: credentials.private_key_id });
  const claims = base64UrlJson({
    iss: credentials.client_email,
    scope: scopes.join(" "),
    aud: TOKEN_URL,
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS
  });
  const signingInput = `${header}.${claims}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), credentials.private_key);
  return `${signingInput}.${base64UrlBuffer(signature)}`;
}

function base64UrlJson(obj) {
  return base64UrlBuffer(Buffer.from(JSON.stringify(obj)));
}

function base64UrlBuffer(buf) {
  return Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}

module.exports = {
  createGoogleDriveClient,
  loadFoldersFromEnv,
  _internal: { signServiceAccountJwt, base64UrlBuffer, base64UrlJson }
};
