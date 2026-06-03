# Intent Classifier

The intent classifier runs after the privacy gateway.

It takes the privacy gateway output, reads the sanitized Traditional Chinese, English, or mixed customer message, and
returns normalized intent JSON for the rest of the bot.

The classifier is deterministic-first:

1. Use backend rules for obvious SME customer support intents in Traditional Chinese, English, or mixed-language messages.
2. Optionally call an injected LLM classifier for ambiguous messages.
3. Normalize the result so later modules always receive the same shape.

It does not send the original raw customer message to an LLM.

## Input

Expected input is the object returned by the privacy gateway:

```js
{
  route: "send_to_llm",
  sanitizedText: "My phone is [PHONE_1], how much is underarm laser and do you have a slot tonight?",
  filter: {
    findings: [{ type: "hong_kong_phone" }],
    hints: []
  }
}
```

## Output

The classifier always returns normalized intent JSON:

```js
{
  primaryIntent: "pricing",
  secondaryIntents: ["booking", "service_info"],
  confidence: 0.92,
  riskLevel: "low",
  needsHumanReview: false,
  language: "en",
  customerGoal: "Customer asks about price and appointment availability.",
  entities: {
    service: "underarm",
    requestedTime: "tonight"
  },
  source: "deterministic",
  reasons: ["Matched pricing keyword", "Matched booking keyword"]
}
```

## Run Tests

From this folder:

```bash
node test/intentClassifier.test.js
node test/intentClassifier.edge.test.js
```

Expected result:

```text
intentClassifier: 103 tests passed
intentClassifier edge: 23 checks passed
```

Generate the side-by-side report:

```bash
node scripts/writeSideBySideResults.js
```

This writes `intent-classifier-side-by-side-results.md` with every standard, edge, and special classifier case.
