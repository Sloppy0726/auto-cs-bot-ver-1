"use strict";

const assert = require("node:assert/strict");
const { classifyStaffReply, classifyByHeuristic } = require("../src/staffReplyClassifier");

let count = 0;
function check(label, cond, detail) {
  count++;
  assert.ok(cond, detail ? `${label}: ${detail}` : label);
}
function eq(label, actual, expected) {
  count++;
  assert.deepEqual(actual, expected, label);
}

async function run() {
  // -------- Heuristic: confirm signals --------
  const confirmCases = [
    "好嘅，幫你book咗5月25號14:00 facial，到時見！",
    "已預約 5月25 14:00 facial",
    "你預約已確認",
    "已book左 5/25 2pm",
    "Booking confirmed, see you on May 25 at 2pm",
    "All set! You're booked for tomorrow 2pm.",
    "We've booked you in for 14:00",
    "Confirmed!",
    "確認預約"
  ];
  for (const text of confirmCases) {
    const result = await classifyStaffReply(text);
    eq(`confirm heuristic: "${text}"`, result.decision, "confirm");
    eq(`confirm heuristic source: "${text}"`, result.source, "heuristic");
  }

  // -------- Heuristic: deny signals --------
  const denyCases = [
    "對唔住，嗰個時段滿晒",
    "唔好意思，嗰日冇位",
    "Sorry, fully booked at that time",
    "Sorry, we're fully booked on May 25.",
    "No availability on that date.",
    "Unfortunately unable to book for that time.",
    "冇位"
  ];
  for (const text of denyCases) {
    const result = await classifyStaffReply(text);
    eq(`deny heuristic: "${text}"`, result.decision, "deny");
    eq(`deny heuristic source: "${text}"`, result.source, "heuristic");
  }

  // -------- Heuristic: unclear --------
  const unclearCases = [
    "我要check吓",
    "等等",
    "Let me check",
    "稍等",
    "你好",
    ""
  ];
  for (const text of unclearCases) {
    const result = await classifyStaffReply(text);
    eq(`unclear heuristic: "${text}"`, result.decision, "unclear");
    eq(`unclear heuristic source: "${text}"`, result.source, "heuristic");
  }

  // -------- LLM fallback fires only when heuristics return unclear --------
  {
    let llmCalls = 0;
    const llm = async () => { llmCalls++; return { decision: "confirm", reason: "llm-says-yes" }; };
    await classifyStaffReply("已預約", { llmClassifier: llm });
    eq("llm not called when heuristic confirms", llmCalls, 0);
  }
  {
    let llmCalls = 0;
    const llm = async () => { llmCalls++; return { decision: "deny" }; };
    await classifyStaffReply("對唔住，冇位", { llmClassifier: llm });
    eq("llm not called when heuristic denies", llmCalls, 0);
  }
  {
    let llmCalls = 0;
    let receivedText = null;
    let receivedDraft = null;
    const llm = async ({ text, bookingDraft }) => {
      llmCalls++;
      receivedText = text;
      receivedDraft = bookingDraft;
      return { decision: "confirm", reason: "llm-says-yes" };
    };
    const draft = { businessId: "beauty_demo", date: "2026-05-25", time: "14:00", service: "facial" };
    const result = await classifyStaffReply("等等我幫你睇睇", { llmClassifier: llm, bookingDraft: draft });
    eq("llm called when heuristic unclear", llmCalls, 1);
    eq("llm received text", receivedText, "等等我幫你睇睇");
    eq("llm received bookingDraft", receivedDraft, draft);
    eq("llm result returned: decision", result.decision, "confirm");
    eq("llm result returned: source", result.source, "llm");
  }
  {
    const llm = async () => { throw new Error("connection refused"); };
    const result = await classifyStaffReply("等陣", { llmClassifier: llm });
    eq("llm error → unclear", result.decision, "unclear");
    eq("llm error → source = llm_error", result.source, "llm_error");
    check("llm error reason includes message", result.reason.includes("connection refused"));
  }
  {
    const llm = async () => ({ decision: "unclear", reason: "model_low_confidence" });
    const result = await classifyStaffReply("等等", { llmClassifier: llm });
    eq("llm unclear → still unclear", result.decision, "unclear");
    eq("llm unclear source = llm", result.source, "llm");
  }
  {
    const llm = async () => ({ decision: "maybe" });
    const result = await classifyStaffReply("等等", { llmClassifier: llm });
    eq("llm garbage decision → unclear", result.decision, "unclear");
  }

  // -------- classifyByHeuristic exposed for direct use --------
  eq("direct heuristic confirm", classifyByHeuristic("已預約").decision, "confirm");
  eq("direct heuristic deny", classifyByHeuristic("冇位").decision, "deny");
  eq("direct heuristic unclear", classifyByHeuristic("我要check吓").decision, "unclear");
  eq("direct heuristic empty", classifyByHeuristic("").decision, "unclear");

  console.log(`staffReplyClassifier: ${count} tests passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
