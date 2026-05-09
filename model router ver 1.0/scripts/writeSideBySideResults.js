"use strict";

const path = require("node:path");
const { routeModel } = require("../src/modelRouter");
const { standardCases } = require("../test/modelRouter.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

const rows = standardCases.map((c) => {
  const result = routeModel({ decision: c.decision, intent: c.intent, gateway: c.gateway || {} });
  const expected = { model: c.expectModel, shouldCallLLM: c.expectShouldCall };
  const actual = {
    provider: result.provider,
    model: result.model,
    shouldCallLLM: result.shouldCallLLM,
    promptCache: result.promptCache,
    maxTokens: result.maxTokens,
    reasons: result.reasons
  };
  const problems = [];
  if (actual.model !== expected.model) problems.push(`model expected ${expected.model}, got ${actual.model}`);
  if (actual.shouldCallLLM !== expected.shouldCallLLM) problems.push(`shouldCallLLM expected ${expected.shouldCallLLM}, got ${actual.shouldCallLLM}`);
  return {
    name: c.name,
    status: problems.length ? "FAIL" : "PASS",
    keyResult: `${actual.model} / call=${actual.shouldCallLLM}`,
    context: { decision: c.decision, intent: c.intent, gateway: c.gateway || {} },
    expected,
    actual,
    problems
  };
});

const out = path.join(__dirname, "..", "model-router-side-by-side-results.md");
writeReadableReport(out, {
  title: "Model Router ver 1.0 - Readable Side-by-side Results",
  description: "Each case compares the deterministic model routing policy against the actual provider/model decision.",
  rows
});
console.log(`Wrote ${rows.length} readable rows to ${out}`);
if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
