# End-to-end Pipeline ver 1.0

Orchestrates the workflow from channel payload to outbound reply or staff inbox item.

## Workflow

```
channel adapter
  -> privacy gateway
  -> intent classifier
  -> knowledge base
  -> business rules
  -> private backend mock
  -> model router
  -> AI draft engine
  -> safety checker
  -> outbound payload or staff inbox
```

This follows the architecture diagram: privacy runs before any model, business rules constrain generation, safety checks drafts before send, and private backend facts stay controlled.

## Main API

```js
const { createPipeline } = require("./src/pipeline");

const pipeline = createPipeline({ llmAdapter });
const result = await pipeline.runMessage({
  channel: "website",
  businessId: "restaurant_demo",
  sessionId: "s1",
  text: "你哋幾點開門？"
});
```

## Server

`src/server.js` exposes `createWebhookServer()` using Node's built-in `http` module. It supports `POST /webhook`.

## Run

```bash
node "end-to-end pipeline ver 1.0/test/pipeline.test.js"
node "end-to-end pipeline ver 1.0/scripts/writeSideBySideResults.js"
```
