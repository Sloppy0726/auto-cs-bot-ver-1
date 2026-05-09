# Model Router ver 1.0

Deterministic model selection for the Hong Kong AI Customer Support SaaS. It does not call model APIs; it only returns the provider/model choice and reasons.

## Main API

```js
const { routeModel } = require("./src/modelRouter");

const route = routeModel({ decision, intent, gateway });
```

## Policy

| Situation | Model |
|---|---|
| `auto_send`, `clarify`, `block` | `no_llm` |
| simple `staff_review` | `claude-haiku-4-5-20251001` |
| `handoff`, high-risk, complaint, sensitive, child, payment/order/reschedule | `claude-sonnet-4-6` |

Prompt caching is enabled for real LLM paths.

## Run

```bash
node "model router ver 1.0/test/modelRouter.test.js"
node "model router ver 1.0/scripts/writeSideBySideResults.js"
```
