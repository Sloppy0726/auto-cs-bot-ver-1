"use strict";

const DEFAULT_MODELS = Object.freeze({
  cheap: "claude-haiku-4-5-20251001",
  complex: "claude-sonnet-4-6"
});

const COMPLEX_INTENTS = Object.freeze([
  "complaint",
  "sensitive_health",
  "child_data",
  "human_request",
  "payment",
  "order_status",
  "reschedule"
]);

function createAnthropicAdapter(config = {}) {
  return async function anthropicAdapter(prompt, context = {}) {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is required to use the Anthropic adapter.");
    }
    if (typeof fetch !== "function") {
      throw new Error("This Node.js runtime does not expose global fetch.");
    }

    const model = config.model || chooseModel(context);
    const systemPrompt = context.systemPrompt || config.systemPrompt || "You are a grounded customer-support draft engine.";
    const userPrompt = context.userPrompt || String(prompt || "");

    const response = await fetch(config.url || "https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": config.apiVersion || "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: config.maxTokens || 700,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" }
          }
        ],
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: userPrompt }]
          }
        ]
      })
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = json.error?.message || response.statusText || "Anthropic API request failed";
      throw new Error(message);
    }

    return {
      text: extractText(json),
      model,
      raw: json
    };
  };
}

function chooseModel(context = {}) {
  const decision = context.decision || {};
  const intent = context.intent || {};
  const intentName = intent.primaryIntent || "";
  if (decision.action === "handoff" || intent.riskLevel === "high" || COMPLEX_INTENTS.includes(intentName)) {
    return DEFAULT_MODELS.complex;
  }
  return DEFAULT_MODELS.cheap;
}

function extractText(json) {
  return (json.content || [])
    .filter((block) => block && block.type === "text")
    .map((block) => block.text || "")
    .join("");
}

module.exports = {
  DEFAULT_MODELS,
  createAnthropicAdapter,
  chooseModel,
  _internal: { extractText, COMPLEX_INTENTS }
};
