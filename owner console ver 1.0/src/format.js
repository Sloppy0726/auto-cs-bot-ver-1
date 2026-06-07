"use strict";

const { MENU, CN_LABELS } = require("./aliases");

function label(tool) {
  return CN_LABELS[tool] || tool;
}

function formatMenu() {
  const lines = MENU.map((m, i) => `${i + 1}. ${m.label}`);
  return ["你好老闆 👋 想做咩?打數字或關鍵字都得:", ...lines, "", "（例:打「追數」或「3」）"].join("\n");
}

// Roughly count "how many items" a tool returned, for a friendly one-liner.
function countOf(data) {
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === "object") {
    if (typeof data.total === "number") return data.total;
    if (Array.isArray(data.suggestions)) return data.suggestions.length;
  }
  return null;
}

// Turn a toolkit dispatch result into a short Chinese WhatsApp reply.
function formatToolResult(tool, result) {
  const name = label(tool);
  if (!result || result.ok !== true) {
    const code = result?.code;
    if (code === "auth_required") {
      return `⚠️ 「${name}」未連接 ${result.provider}。\n請喺 .env 設定 ${(result.requiredEnv || []).join("、")} 再試。`;
    }
    if (code === "invalid_input") {
      return `⚠️ 「${name}」需要多啲資料:${(result.errors || []).join("；")}`;
    }
    if (code === "provider_error") {
      return `❌ 「${name}」連接 ${result.provider} 出錯（${result.status || "?"}）。`;
    }
    return `❌ 「${name}」做唔到:${result?.message || "未知錯誤"}`;
  }

  const n = countOf(result.data);
  const tail = n === null ? "" : `（共 ${n} 項）`;
  return `✅ ${name} 完成${tail}`;
}

function confirmPrompt(tool) {
  return `「${label(tool)}」會實際發送/改動嘢。確認執行?回覆「確認」或「取消」。`;
}

module.exports = { formatMenu, formatToolResult, confirmPrompt, label };
