"use strict";

// Unit tests for the Google Drive service-account client.
// All HTTP calls go through an injected httpFetch stub so no real network is touched.
// A throwaway RSA key is generated per test to exercise the real JWT signing path.

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createGoogleDriveClient, loadFoldersFromEnv, _internal } = require("../src/googleDriveClient");

let testCount = 0;
function check(label, condition, detail) {
  testCount++;
  assert.ok(condition, detail ? `${label}: ${detail}` : label);
}
function eq(label, actual, expected) {
  testCount++;
  assert.deepEqual(actual, expected, label);
}

function fakeCredentials() {
  const { privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  return {
    type: "service_account",
    client_email: "bot@auto-cs-test.iam.gserviceaccount.com",
    private_key: privateKey.export({ type: "pkcs1", format: "pem" }).toString(),
    private_key_id: "test-key-id"
  };
}

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), { status: init.status || 200, headers: { "content-type": "application/json" } });
}

function makeRecorder(responseQueue) {
  const calls = [];
  async function httpFetch(url, options = {}) {
    calls.push({ url, options });
    const next = responseQueue.shift();
    if (!next) throw new Error(`unexpected fetch to ${url} (queue empty)`);
    if (typeof next === "function") return next({ url, options });
    return next;
  }
  return { httpFetch, calls };
}

async function runAll() {
  // ---- loadCredentials guards ----
  {
    try {
      createGoogleDriveClient({});
      check("missing credentials: throws", false, "expected error");
    } catch (e) {
      check("missing credentials: throws", String(e.message).includes("GOOGLE_SERVICE_ACCOUNT_JSON_PATH"));
    }
  }
  {
    try {
      createGoogleDriveClient({ credentials: { client_email: "x", private_key: "" } });
      check("incomplete credentials: throws", false, "expected error");
    } catch (e) {
      check("incomplete credentials: throws", String(e.message).includes("client_email and private_key"));
    }
  }
  {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gdrive-sa-"));
    const file = path.join(dir, "sa.json");
    fs.writeFileSync(file, JSON.stringify({ ...fakeCredentials() }));
    const client = createGoogleDriveClient({ serviceAccountJsonPath: file, httpFetch: () => { throw new Error("unused"); } });
    check("loads service account JSON from disk path", typeof client.listFiles === "function");
  }
  {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gdrive-sa-bad-"));
    const file = path.join(dir, "sa.json");
    fs.writeFileSync(file, JSON.stringify({ client_email: "x" }));
    try {
      createGoogleDriveClient({ serviceAccountJsonPath: file, httpFetch: () => null });
      check("invalid json file: throws", false);
    } catch (e) {
      check("invalid json file: throws", String(e.message).includes("missing client_email or private_key"));
    }
  }

  // ---- loadFoldersFromEnv ----
  {
    const folders = loadFoldersFromEnv({
      GDRIVE_FOLDER_BEAUTY_DEMO: "abc",
      GDRIVE_FOLDER_RESTAURANT_DEMO: "def",
      OTHER_ENV: "ignored",
      GDRIVE_FOLDER_EMPTY: ""
    });
    eq("env folder mapping", folders, { beauty_demo: "abc", restaurant_demo: "def" });
  }

  // ---- JWT signing produces a verifiable RS256 signature ----
  {
    const cred = fakeCredentials();
    const jwt = _internal.signServiceAccountJwt(cred, ["https://www.googleapis.com/auth/drive.readonly"], () => 1_700_000_000_000);
    const parts = jwt.split(".");
    check("jwt has 3 parts", parts.length === 3);
    const decode = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + "===", "base64").toString();
    const header = JSON.parse(decode(parts[0]));
    const claims = JSON.parse(decode(parts[1]));
    check("jwt header alg=RS256", header.alg === "RS256");
    check("jwt header kid carries private_key_id", header.kid === "test-key-id");
    check("jwt iss = client_email", claims.iss === cred.client_email);
    check("jwt aud = google token endpoint", claims.aud === "https://oauth2.googleapis.com/token");
    check("jwt scope is drive.readonly", claims.scope === "https://www.googleapis.com/auth/drive.readonly");
    check("jwt iat = floor(now/1000)", claims.iat === 1_700_000_000);
    check("jwt exp = iat + 3600", claims.exp === 1_700_000_000 + 3600);

    const signingInput = parts[0] + "." + parts[1];
    const signature = Buffer.from(parts[2].replace(/-/g, "+").replace(/_/g, "/") + "===", "base64");
    const verified = crypto.verify("RSA-SHA256", Buffer.from(signingInput), cred.private_key, signature);
    check("jwt signature verifies with the private key (RS256)", verified === true);
  }

  // ---- getAccessToken: token exchange + caching ----
  {
    const credentials = fakeCredentials();
    let now = 1_700_000_000_000;
    const responseQueue = [
      jsonResponse({ access_token: "tok-1", expires_in: 3600 }),
      jsonResponse({ access_token: "tok-2", expires_in: 3600 })
    ];
    const { httpFetch, calls } = makeRecorder(responseQueue);
    const client = createGoogleDriveClient({ credentials, httpFetch, nowFn: () => now });

    const t1 = await client._internal.getAccessToken();
    eq("first token = tok-1", t1, "tok-1");
    check("hit Google token endpoint", calls[0].url === "https://oauth2.googleapis.com/token");
    check("posted form-urlencoded body", calls[0].options.headers["content-type"] === "application/x-www-form-urlencoded");
    check("body contains JWT assertion + grant_type", calls[0].options.body.includes("grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer") && calls[0].options.body.includes("assertion="));

    // Still cached within TTL minus lead time
    now += 100_000;
    const t2 = await client._internal.getAccessToken();
    eq("cached token reused", t2, "tok-1");
    eq("only one token fetch", calls.length, 1);

    // Past expiry minus lead → refresh
    now += 3_600_000;
    const t3 = await client._internal.getAccessToken();
    eq("refreshed after expiry", t3, "tok-2");
    eq("two token fetches total", calls.length, 2);
  }

  // ---- getAccessToken: auth failure surfaces error ----
  {
    const credentials = fakeCredentials();
    const responseQueue = [new Response("invalid_grant", { status: 401 })];
    const { httpFetch } = makeRecorder(responseQueue);
    const client = createGoogleDriveClient({ credentials, httpFetch });
    try {
      await client._internal.getAccessToken();
      check("auth failure surfaces error", false);
    } catch (e) {
      check("auth failure surfaces error", String(e.message).includes("google_drive_auth_failed: 401"));
    }
  }
  {
    const credentials = fakeCredentials();
    const responseQueue = [jsonResponse({})];
    const { httpFetch } = makeRecorder(responseQueue);
    const client = createGoogleDriveClient({ credentials, httpFetch });
    try {
      await client._internal.getAccessToken();
      check("missing access_token surfaces error", false);
    } catch (e) {
      check("missing access_token surfaces error", String(e.message).includes("no access_token"));
    }
  }

  // ---- listFiles ----
  {
    const credentials = fakeCredentials();
    const responseQueue = [
      jsonResponse({ access_token: "tok", expires_in: 3600 }),
      jsonResponse({ files: [{ id: "f1", name: "May promo.gdoc", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-05-01T00:00:00Z" }] })
    ];
    const { httpFetch, calls } = makeRecorder(responseQueue);
    const client = createGoogleDriveClient({ credentials, httpFetch, folders: { beauty_demo: "FOLDER_BEAUTY" } });
    const files = await client.listFiles({ businessId: "beauty_demo" });
    eq("listFiles returns the file list", files.length, 1);
    eq("listFiles passes through file id", files[0].id, "f1");

    const listUrl = calls[1].url;
    check("listFiles hits drive v3 /files", listUrl.startsWith("https://www.googleapis.com/drive/v3/files?"));
    check("listFiles query scopes to parent folder", listUrl.includes(encodeURIComponent("'FOLDER_BEAUTY' in parents")));
    check("listFiles excludes trashed", listUrl.includes(encodeURIComponent("trashed = false")));
    check("listFiles uses bearer auth", calls[1].options.headers.authorization === "Bearer tok");
  }
  {
    // Unknown businessId + no folderId → empty list, no fetch attempted
    const credentials = fakeCredentials();
    const { httpFetch, calls } = makeRecorder([]);
    const client = createGoogleDriveClient({ credentials, httpFetch, folders: { beauty_demo: "x" } });
    const files = await client.listFiles({ businessId: "unknown_demo" });
    eq("unknown business: empty list", files, []);
    eq("unknown business: no fetch", calls.length, 0);
  }
  {
    const credentials = fakeCredentials();
    const responseQueue = [
      jsonResponse({ access_token: "tok", expires_in: 3600 }),
      new Response("internal", { status: 500 })
    ];
    const { httpFetch } = makeRecorder(responseQueue);
    const client = createGoogleDriveClient({ credentials, httpFetch, folders: { beauty_demo: "F" } });
    try {
      await client.listFiles({ businessId: "beauty_demo" });
      check("listFiles 500: throws", false);
    } catch (e) {
      check("listFiles 500: throws", String(e.message).includes("google_drive_list_failed: 500"));
    }
  }

  // ---- readFile: Google Doc uses /export ----
  {
    const credentials = fakeCredentials();
    const responseQueue = [
      jsonResponse({ access_token: "tok", expires_in: 3600 }),
      new Response("Title: May promo\nApproved: yes\nSummary: 15% off\n", { status: 200, headers: { "content-type": "text/plain" } })
    ];
    const { httpFetch, calls } = makeRecorder(responseQueue);
    const client = createGoogleDriveClient({ credentials, httpFetch });
    const out = await client.readFile({ id: "F1", mimeType: "application/vnd.google-apps.document" });
    check("readFile google doc: exports text/plain", calls[1].url === "https://www.googleapis.com/drive/v3/files/F1/export?mimeType=text%2Fplain");
    check("readFile google doc: returns the body text", out.text.includes("Title: May promo"));
    eq("readFile google doc: surfaces mimeType", out.mimeType, "application/vnd.google-apps.document");
  }
  {
    // Plain file: uses alt=media
    const credentials = fakeCredentials();
    const responseQueue = [
      jsonResponse({ access_token: "tok", expires_in: 3600 }),
      new Response("plain body", { status: 200, headers: { "content-type": "text/plain" } })
    ];
    const { httpFetch, calls } = makeRecorder(responseQueue);
    const client = createGoogleDriveClient({ credentials, httpFetch });
    const out = await client.readFile({ id: "P1", mimeType: "text/plain" });
    check("readFile plain: uses alt=media", calls[1].url === "https://www.googleapis.com/drive/v3/files/P1?alt=media");
    eq("readFile plain: body", out.text, "plain body");
  }
  {
    // No id → fast error
    const credentials = fakeCredentials();
    const client = createGoogleDriveClient({ credentials, httpFetch: () => { throw new Error("unused"); } });
    try {
      await client.readFile({});
      check("readFile no id: throws", false);
    } catch (e) {
      check("readFile no id: throws", String(e.message).includes("file.id required"));
    }
  }

  console.log(`googleDriveClient: ${testCount} tests passed`);
}

runAll().catch((error) => { console.error(error); process.exitCode = 1; });
