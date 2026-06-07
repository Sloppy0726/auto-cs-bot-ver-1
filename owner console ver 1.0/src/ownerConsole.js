"use strict";

const { loadOwnerPhones, isOwner } = require("./ownerRegistry");
const { resolveCommand } = require("./commandResolver");
const { formatMenu, formatToolResult, confirmPrompt } = require("./format");
const { WRITE_TOOLS } = require("./aliases");

const YES = ["確認", "係", "是", "好", "好的", "ok", "okay", "yes", "y", "可以", "得"];
const NO = ["取消", "唔", "唔好", "否", "no", "n", "算", "唔使"];

function matches(text, list) {
  const t = String(text || "").trim().toLowerCase();
  return list.some((w) => t === w.toLowerCase());
}

// createOwnerConsole wires the owner command layer.
//   dispatch(toolName, args) -> toolkit dispatch (injectable for tests)
//   ownerPhones / env        -> owner allowlist source (defaults to OWNER_PHONES)
//   toolRouter(text)         -> optional NL router returning { tool, args } | null
//                               (inject your local LLM here; falls back to smb-router)
function createOwnerConsole(options = {}) {
  const dispatch = options.dispatch || require("../../small business toolkit ver 1.0/src").dispatch;
  const phones = options.ownerPhones || loadOwnerPhones(options.env || process.env);
  const toolRouter = options.toolRouter || null;
  const pending = new Map(); // senderId -> { tool, args }

  async function routeNaturalLanguage(text) {
    if (toolRouter) {
      const routed = await toolRouter(text);
      if (routed && routed.tool) return routed;
    }
    // Fallback: reuse the toolkit's keyword router.
    const res = await dispatch("smb-router", { request: text });
    const top = res?.ok && res.data.suggestions[0];
    return top ? { tool: top.name, args: {} } : null;
  }

  async function runTool(tool, args) {
    const result = await dispatch(tool, args || {});
    return { handled: true, tool, result, text: formatToolResult(tool, result) };
  }

  // Returns { handled: false } for non-owners (caller continues normal flow),
  // or { handled: true, text, ... } with the owner-facing reply.
  async function handle(input = {}) {
    const senderId = input.senderId;
    const text = String(input.text || "");
    if (!isOwner(senderId, phones)) return { handled: false };

    // Resolve any outstanding confirmation first.
    if (pending.has(senderId)) {
      const job = pending.get(senderId);
      if (matches(text, YES)) {
        pending.delete(senderId);
        return runTool(job.tool, job.args);
      }
      if (matches(text, NO)) {
        pending.delete(senderId);
        return { handled: true, text: "好,已取消。" };
      }
      pending.delete(senderId); // anything else = new command
    }

    const cmd = resolveCommand(text);
    if (cmd.type === "menu") return { handled: true, text: formatMenu() };

    let tool = cmd.tool;
    let args = cmd.args || {};
    if (cmd.type === "nl") {
      const routed = await routeNaturalLanguage(cmd.text);
      if (!routed) {
        return { handled: true, text: "我唔肯定你想做咩 🤔 打「選單」睇下有咩功能。" };
      }
      tool = routed.tool;
      args = routed.args || {};
    }

    if (WRITE_TOOLS.has(tool)) {
      pending.set(senderId, { tool, args });
      return { handled: true, text: confirmPrompt(tool), awaitingConfirm: true, tool };
    }

    return runTool(tool, args);
  }

  return { handle, isOwner: (sid) => isOwner(sid, phones), _pending: pending };
}

module.exports = { createOwnerConsole };
