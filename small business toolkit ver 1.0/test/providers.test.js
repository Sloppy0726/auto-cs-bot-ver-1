"use strict";

// Stubs global.fetch and sets credentials so each provider family runs a real
// happy-path through its adapter and handler, returning normalized data.

const assert = require("node:assert/strict");

Object.assign(process.env, {
  STRIPE_API_KEY: "sk_test",
  QUICKBOOKS_ACCESS_TOKEN: "qb_tok",
  QUICKBOOKS_REALM_ID: "123",
  SQUARE_ACCESS_TOKEN: "sq_tok",
  GOOGLE_ACCESS_TOKEN: "g_tok",
  CANVA_ACCESS_TOKEN: "canva_tok",
  DOCUSIGN_ACCESS_TOKEN: "ds_tok",
  DOCUSIGN_ACCOUNT_ID: "acct1"
});

// Route fetch by URL substring to a canned JSON body.
const ROUTES = [
  ["api.stripe.com/v1/invoices", { data: [{ id: "in_1", customer_email: "a@b.com", amount_due: 9900, currency: "hkd", due_date: 1, hosted_invoice_url: "https://x" }] }],
  ["quickbooks.api.intuit.com", { Header: { ReportName: "ProfitAndLoss" }, Rows: {} }],
  ["connect.squareup.com/v2/customers", { customers: [{ id: "c1", phone_number: "852" }, { id: "c2" }] }],
  ["gmail.googleapis.com", { messages: [{ id: "m1" }, { id: "m2" }] }],
  ["api.canva.com", { items: [{ id: "d1" }] }],
  ["docusign.net", { envelopes: [{ status: "sent" }, { status: "completed" }] }]
];

let lastUrl = null;
global.fetch = async (url) => {
  lastUrl = String(url);
  const match = ROUTES.find(([frag]) => lastUrl.includes(frag));
  const body = match ? match[1] : {};
  return { ok: true, status: 200, text: async () => JSON.stringify(body) };
};

const { dispatch } = require("../src/dispatch");

async function run() {
  const stripe = await dispatch("invoice-chase", { limit: 5 });
  assert.equal(stripe.ok, true, JSON.stringify(stripe));
  assert.equal(stripe.data.length, 1);
  assert.equal(stripe.data[0].id, "in_1");

  const qb = await dispatch("business-pulse", { start: "2026-01-01", end: "2026-01-31" });
  assert.equal(qb.ok, true, JSON.stringify(qb));
  assert.equal(qb.data.Header.ReportName, "ProfitAndLoss");

  const square = await dispatch("customer-pulse", {});
  assert.equal(square.ok, true, JSON.stringify(square));
  assert.equal(square.data.total, 2);

  const google = await dispatch("lead-triage", {});
  assert.equal(google.ok, true, JSON.stringify(google));
  assert.equal(google.data.length, 2);

  const canva = await dispatch("content-strategy", {});
  assert.equal(canva.ok, true, JSON.stringify(canva));
  assert.equal(canva.data.length, 1);

  const docusign = await dispatch("review-contract", {});
  assert.equal(docusign.ok, true, JSON.stringify(docusign));
  assert.equal(docusign.data.length, 1, "only the non-completed envelope is pending");

  // Non-2xx surfaces as a provider_error (not a crash).
  global.fetch = async () => ({ ok: false, status: 401, text: async () => JSON.stringify({ error: "bad token" }) });
  const fail = await dispatch("invoice-chase", {});
  assert.equal(fail.ok, false);
  assert.equal(fail.code, "provider_error");
  assert.equal(fail.status, 401);

  console.log("providers: stripe, quickbooks, square, google, canva, docusign happy-paths + error mapping passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
