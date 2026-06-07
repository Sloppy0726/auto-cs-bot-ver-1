"use strict";

const { providers } = require("../providers");

function thirtyDaysAgoIso() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function listEnvelopes() {
  const result = await providers.docusign.request("/envelopes", { query: { from_date: thirtyDaysAgoIso() } });
  return Array.isArray(result?.envelopes) ? result.envelopes : [];
}

module.exports = {
  "contract-review": async () => {
    const envelopes = await listEnvelopes();
    return { summary: `Contract review: ${envelopes.length} envelope(s) in the last 30 days.`, data: envelopes };
  },

  "review-contract": async () => {
    const envelopes = await listEnvelopes();
    const pending = envelopes.filter((e) => e.status && e.status !== "completed");
    return { summary: `Review contract: ${pending.length} envelope(s) awaiting action.`, data: pending };
  },

  "job-post-builder": async () => {
    const result = await providers.google.request("drive", "/files", {
      query: { q: "mimeType='application/vnd.google-apps.document'", pageSize: 25, fields: "files(id,name,modifiedTime)" }
    });
    const files = Array.isArray(result?.files) ? result.files : [];
    return { summary: `Job-post builder: ${files.length} Google Doc(s) to base a post on.`, data: files };
  }
};
