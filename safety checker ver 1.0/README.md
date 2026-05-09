# Safety Checker ver 1.0

Deterministic post-generation gate. It runs after the AI Draft Engine and before any staff inbox or channel send.

## Main API

```js
const { checkDraft } = require("./src/safetyChecker");

const safety = checkDraft({ draft, decision, knowledge, intent, gateway });
```

Output:

```js
{
  verdict: "pass" | "revise" | "block",
  safeToSend: true,
  violations: [],
  repairedText: null,
  reasons: []
}
```

## Rules

- `auto_send` must exactly equal the approved KB answer and cite grounding.
- `clarify` must exactly equal `decision.clarificationText`.
- `staff_review` and `handoff` are never marked `safeToSend`; they go to staff.
- `block` is always blocked and must have no text.
- Obvious forbidden capability surfaces are blocked: booking confirmation, refund decisions, medical advice, treatment guarantees, shipment/payment confirmations, PII leaks, and placeholders.

## Run

```bash
node "safety checker ver 1.0/test/safetyChecker.test.js"
node "safety checker ver 1.0/scripts/writeSideBySideResults.js"
```
