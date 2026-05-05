# Privacy Gateway Ver 1.0

The privacy gateway is the routing layer that sits immediately after an inbound
customer message and before any LLM call.

It wraps `privacy filter ver 1.0` and turns deterministic filter output into a
clear decision for the rest of the customer support bot.

## Decisions

- `send_to_llm`: message is sanitized and safe enough for an AI draft
- `review_before_llm`: message can be sanitized, but staff review is required
- `block_and_handoff`: message should not be sent to the LLM

## Run Tests

```bash
node test/privacyGateway.test.js
```

The suite currently contains exactly 200 routing and edge cases.

## Example

```js
const { routeMessage } = require("./src/privacyGateway");

const decision = routeMessage("我電話9123 4567，想問underarm幾錢？");
```

The returned object includes the original text, sanitized text, filter findings,
risk hints, and a routing decision.
