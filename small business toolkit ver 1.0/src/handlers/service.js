"use strict";

const { providers } = require("../providers");

async function searchGmail(q) {
  const result = await providers.google.request("gmail", "/users/me/messages", { query: { q, maxResults: 25 } });
  return Array.isArray(result?.messages) ? result.messages : [];
}

module.exports = {
  "handle-complaint": async (input = {}) => {
    const q = input.query || "newer_than:14d (complaint OR refund OR 投訴 OR 退款)";
    const messages = await searchGmail(q);
    return { summary: `Handle complaint: ${messages.length} complaint email(s) matching "${q}".`, data: messages };
  },

  "ticket-deflector": async (input = {}) => {
    const q = input.query || "newer_than:7d (how OR hours OR price OR booking OR 點樣 OR 時間)";
    const messages = await searchGmail(q);
    return { summary: `Ticket deflector: ${messages.length} potentially self-serviceable email(s).`, data: messages };
  }
};
