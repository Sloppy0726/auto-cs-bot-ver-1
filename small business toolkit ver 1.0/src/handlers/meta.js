"use strict";

const { connectionStatus } = require("../auth");
const { REGISTRY } = require("../registry");

module.exports = {
  // Suggest which tool best fits a free-text request via keyword scoring.
  "smb-router": async (input = {}) => {
    const request = String(input.request || "").toLowerCase();
    // Keep meaningful tokens: 3+ chars for latin words, or any CJK run (single
    // Chinese chars carry meaning). Drops noise like "i", "to", "an".
    const tokens = request
      .split(/[^a-z0-9一-鿿]+/)
      .filter((tok) => tok.length >= 3 || /[一-鿿]/.test(tok));
    const scored = REGISTRY
      .filter((t) => t.category !== "meta")
      .map((t) => {
        const haystack = `${t.name} ${t.title} ${t.summary} ${t.category}`.toLowerCase();
        const score = tokens.reduce((acc, tok) => (haystack.includes(tok) ? acc + 1 : acc), 0);
        return { name: t.name, title: t.title, category: t.category, provider: t.provider, score };
      })
      .filter((t) => t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    return {
      summary: scored.length ? `Top match: ${scored[0].name}.` : "No matching tool found.",
      data: { request: input.request, suggestions: scored }
    };
  },

  // Show which providers are connected and what env to set for the rest.
  "smb-onboard": async () => {
    const status = connectionStatus();
    const connected = status.filter((s) => s.connected).length;
    return {
      summary: `SMB onboard: ${connected}/${status.length} provider(s) connected.`,
      data: status
    };
  }
};
