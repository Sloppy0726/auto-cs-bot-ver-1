"use strict";

const assert = require("node:assert/strict");
const { createOpenAIAdapters, _internal } = require("../src/openaiAdapter");

async function run() {
  const calls = [];
  const fetchImpl = async (url, request) => {
    calls.push({ url, body: JSON.parse(request.body) });
    const isIntent = request.body.includes("expectedJsonShape");
    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: isIntent
                ? JSON.stringify({
                    primaryIntent: "booking",
                    secondaryIntents: ["service_info"],
                    confidence: 0.83,
                    language: "zh-HK",
                    customerGoal: "Customer wants to book a treatment.",
                    entities: { service: "laser" },
                    riskLevel: "low",
                    needsHumanReview: false,
                    reasons: ["Customer mentions booking context."]
                  })
                : "可以呀，麻煩提供日期同時間，我哋再幫你確認。"
            }
          }
        ]
      })
    };
  };

  const adapters = createOpenAIAdapters({
    apiKey: "test-key",
    draftModel: "gpt-test-draft",
    intentModel: "gpt-test-intent",
    organization: "org_test",
    project: "proj_test",
    fetchImpl
  });

  const draft = await adapters.llmAdapter("full prompt", {
    systemPrompt: "system policy",
    userPrompt: "customer prompt"
  });
  assert.equal(draft.text, "可以呀，麻煩提供日期同時間，我哋再幫你確認。");

  const intent = await adapters.llmIntentAnalyzer({
    sanitizedText: "想book脫毛",
    deterministicGuess: { primaryIntent: "service_info", confidence: 0.52 }
  });
  assert.equal(intent.primaryIntent, "booking");
  assert.equal(intent.confidence, 0.83);
  assert.equal(intent.entities.service, "laser");

  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "https://api.openai.com/v1/chat/completions");
  assert.equal(calls[0].body.model, "gpt-test-draft");
  assert.equal(calls[1].body.model, "gpt-test-intent");
  assert.deepEqual(
    _internal.openAIHeaders({ apiKey: "key", organization: "org_1", project: "proj_1" }),
    {
      authorization: "Bearer key",
      "content-type": "application/json",
      "OpenAI-Organization": "org_1",
      "OpenAI-Project": "proj_1"
    }
  );
  assert.deepEqual(_internal.parseJsonObject("prefix {\"primaryIntent\":\"pricing\"} suffix"), { primaryIntent: "pricing" });

  console.log("openaiAdapter: 13 tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
