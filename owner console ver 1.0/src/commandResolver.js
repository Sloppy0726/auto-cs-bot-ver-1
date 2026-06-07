"use strict";

const { ALIASES, MENU, MENU_TRIGGERS } = require("./aliases");

// Map an owner's raw message to an action:
//   { type: "menu" }                       -> show the numbered menu
//   { type: "tool", tool, source }         -> run this tool
//   { type: "nl", text }                   -> hand to natural-language router
function resolveCommand(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return { type: "nl", text: "" };

  const lower = text.toLowerCase();
  if (MENU_TRIGGERS.some((t) => lower === t.toLowerCase())) {
    return { type: "menu" };
  }

  // A lone number picks from the menu (1-based).
  if (/^\d{1,2}$/.test(text)) {
    const idx = Number(text) - 1;
    if (idx >= 0 && idx < MENU.length) {
      return { type: "tool", tool: MENU[idx].tool, source: "menu" };
    }
  }

  // Keyword aliases (first containing match wins).
  for (const entry of ALIASES) {
    if (entry.keywords.some((kw) => text.includes(kw) || lower.includes(kw.toLowerCase()))) {
      return { type: "tool", tool: entry.tool, source: "alias" };
    }
  }

  return { type: "nl", text };
}

module.exports = { resolveCommand };
