"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { classifyIntent, buildLLMIntentInput } = require("../src/intentClassifier");
const { routeMessage, ROUTES } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { standardCases, edgeCases } = require("../test/intentClassifier.cases");

function stringify(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return String(value);
  return value == null ? "" : String(value);
}

function cell(value) {
  return stringify(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function expectedSummary(testCase) {
  return {
    route: testCase.expectedRoute || testCase.route || "send_to_llm",
    primaryIntent: testCase.primaryIntent,
    secondaryIntents: testCase.secondaryIntents || [],
    needsHumanReview: testCase.needsHumanReview ?? false,
    riskLevel: testCase.riskLevel || "",
    language: testCase.language || "",
    source: testCase.source || "deterministic"
  };
}

function actualSummary(gatewayOutput, result) {
  return {
    route: gatewayOutput.route,
    sanitizedText: gatewayOutput.sanitizedText,
    privacyFindings: gatewayOutput.filter.findings.map((item) => item.type),
    riskHints: gatewayOutput.filter.hints.map((item) => item.type),
    primaryIntent: result.primaryIntent,
    secondaryIntents: result.secondaryIntents,
    confidence: result.confidence.toFixed(2),
    needsHumanReview: result.needsHumanReview,
    riskLevel: result.riskLevel,
    language: result.language,
    source: result.source,
    entities: result.entities,
    reasons: result.reasons
  };
}

function compare(testCase, gatewayOutput, result) {
  const problems = [];
  const expectedRoute = testCase.expectedRoute || testCase.route;
  if (expectedRoute && gatewayOutput.route !== expectedRoute) problems.push(`route expected ${expectedRoute}`);
  if (result.primaryIntent !== testCase.primaryIntent) problems.push(`primary expected ${testCase.primaryIntent}`);
  if (testCase.secondaryIntents && JSON.stringify(result.secondaryIntents) !== JSON.stringify(testCase.secondaryIntents)) {
    problems.push(`secondary expected ${testCase.secondaryIntents.join(",")}`);
  }
  if (typeof testCase.needsHumanReview === "boolean" && result.needsHumanReview !== testCase.needsHumanReview) {
    problems.push(`review expected ${testCase.needsHumanReview}`);
  }
  if (testCase.riskLevel && result.riskLevel !== testCase.riskLevel) problems.push(`risk expected ${testCase.riskLevel}`);
  if (testCase.language && result.language !== testCase.language) problems.push(`language expected ${testCase.language}`);
  if (testCase.source && result.source !== testCase.source) problems.push(`source expected ${testCase.source}`);
  if (testCase.minConfidence && result.confidence < testCase.minConfidence) problems.push(`confidence below ${testCase.minConfidence}`);
  if (testCase.maxConfidence && result.confidence > testCase.maxConfidence) problems.push(`confidence above ${testCase.maxConfidence}`);
  for (const placeholder of testCase.expectedPlaceholders || []) {
    if (!gatewayOutput.sanitizedText.includes(placeholder)) problems.push(`missing ${placeholder}`);
  }
  return problems;
}

function makeRows(groupName, cases) {
  return cases.map((testCase, index) => {
    const gatewayOutput = routeMessage(testCase.input, testCase.gatewayOptions);
    const result = classifyIntent(gatewayOutput, testCase.classifierOptions || {});
    const expected = expectedSummary(testCase);
    const actual = actualSummary(gatewayOutput, result);
    const problems = compare(testCase, gatewayOutput, result);
    return {
      number: index + 1,
      group: groupName,
      status: problems.length ? "FAIL" : "PASS",
      problems: problems.join("; "),
      name: testCase.name,
      input: testCase.input,
      expected,
      actual
    };
  });
}

async function makeSpecialRows() {
  const rows = [];

  {
    const gatewayOutput = routeMessage("我電話係9123 4567，想問幾錢");
    const deterministic = classifyIntent(gatewayOutput);
    const llmInput = buildLLMIntentInput(gatewayOutput, deterministic);
    const pass = !llmInput.sanitizedText.includes("9123") && llmInput.sanitizedText.includes("[PHONE_1]");
    rows.push({
      group: "special",
      status: pass ? "PASS" : "FAIL",
      problems: pass ? "" : "raw phone leaked or placeholder missing",
      name: "LLM input receives sanitized phone placeholder",
      input: "我電話係9123 4567，想問幾錢",
      expected: { sanitizedContains: "[PHONE_1]", rawPhoneLeaked: false },
      actual: { llmInput }
    });
  }

  {
    const gatewayOutput = routeMessage("HKID A123456(3) 想問underarm幾錢");
    let llmWasCalled = false;
    const result = classifyIntent(gatewayOutput, {
      confidenceThreshold: 0.99,
      llmClassifier: () => {
        llmWasCalled = true;
        return { primaryIntent: "pricing", confidence: 0.9 };
      }
    });
    const pass = gatewayOutput.route === ROUTES.REVIEW_BEFORE_LLM && !llmWasCalled && result.primaryIntent === "pricing";
    rows.push({
      group: "special",
      status: pass ? "PASS" : "FAIL",
      problems: pass ? "" : "review_before_llm called LLM or misclassified",
      name: "review_before_llm prevents optional LLM fallback",
      input: "HKID A123456(3) 想問underarm幾錢",
      expected: { route: ROUTES.REVIEW_BEFORE_LLM, llmWasCalled: false, primaryIntent: "pricing" },
      actual: { route: gatewayOutput.route, llmWasCalled, result }
    });
  }

  {
    const gatewayOutput = routeMessage("想問下你哋個plan係點");
    const result = await classifyIntent(gatewayOutput, {
      confidenceThreshold: 0.8,
      llmClassifier: (input) => ({
        primaryIntent: "service_info",
        confidence: 0.82,
        customerGoal: "Customer asks for plan details.",
        entities: { service: "plan" },
        reasons: [`LLM fallback saw ${input.deterministicGuess.primaryIntent}`]
      })
    });
    const pass = result.primaryIntent === "service_info" && result.source === "llm";
    rows.push({
      group: "special",
      status: pass ? "PASS" : "FAIL",
      problems: pass ? "" : "LLM fallback did not return service_info",
      name: "optional LLM fallback handles ambiguous safe message",
      input: "想問下你哋個plan係點",
      expected: { primaryIntent: "service_info", source: "llm" },
      actual: { route: gatewayOutput.route, result }
    });
  }

  return rows;
}

function render(rows) {
  const generatedAt = new Date().toISOString();
  const passCount = rows.filter((row) => row.status === "PASS").length;
  const lines = [
    "# Intent Classifier Side-by-Side Results",
    "",
    `Generated at: ${generatedAt}`,
    "",
    `Total rows: ${rows.length}`,
    `Passed: ${passCount}`,
    `Failed: ${rows.length - passCount}`,
    "",
    "| # | Group | Status | Case | Input | Sanitized input | Expected | Actual | Notes |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"
  ];

  rows.forEach((row, index) => {
    lines.push([
      index + 1,
      row.group,
      row.status,
      row.name,
      row.input,
      row.actual.sanitizedText || row.actual.llmInput?.sanitizedText || "",
      row.expected,
      row.actual,
      row.problems
    ].map(cell).join(" | ").replace(/^/, "|").replace(/$/, "|"));
  });

  lines.push("");
  return lines.join("\n");
}

async function main() {
  const rows = [
    ...makeRows("standard", standardCases),
    ...makeRows("edge", edgeCases),
    ...(await makeSpecialRows())
  ];
  const reportPath = path.join(__dirname, "..", "intent-classifier-side-by-side-results.md");
  fs.writeFileSync(reportPath, render(rows));
  const failed = rows.filter((row) => row.status !== "PASS");
  console.log(`intentClassifier report: ${rows.length} rows written to ${path.basename(reportPath)}`);
  if (failed.length) {
    console.error(`${failed.length} report rows failed`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
