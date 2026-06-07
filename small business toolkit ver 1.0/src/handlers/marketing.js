"use strict";

const { providers } = require("../providers");

// Build a raw RFC2822 message, base64url-encoded, for the Gmail drafts API.
function buildRawEmail({ to, subject, body }) {
  const mime = [`To: ${to}`, `Subject: ${subject}`, "Content-Type: text/plain; charset=UTF-8", "", body].join("\r\n");
  return Buffer.from(mime, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

module.exports = {
  "run-campaign": async (input = {}) => {
    const raw = buildRawEmail({ to: input.to, subject: input.subject, body: input.body });
    const result = await providers.google.request("gmail", "/users/me/drafts", {
      method: "POST",
      json: { message: { raw } }
    });
    return { summary: `Run campaign: created Gmail draft to ${input.to}.`, data: { draftId: result?.id, result } };
  },

  "content-strategy": async () => {
    const result = await providers.canva.request("/designs", { query: { limit: 50 } });
    const items = Array.isArray(result?.items) ? result.items : [];
    return { summary: `Content strategy: ${items.length} existing Canva design(s).`, data: items };
  },

  "canva-creator": async () => {
    const result = await providers.canva.request("/brand-templates", { query: { limit: 50 } });
    const items = Array.isArray(result?.items) ? result.items : [];
    return { summary: `Canva creator: ${items.length} brand template(s) available.`, data: items };
  },

  "sales-brief": async () => {
    const result = await providers.square.request("/orders/search", {
      method: "POST",
      json: { limit: 50, query: { sort: { sort_field: "CREATED_AT", sort_order: "DESC" } } }
    });
    const orders = Array.isArray(result?.orders) ? result.orders : [];
    return { summary: `Sales brief: ${orders.length} recent order(s).`, data: orders };
  }
};
