# Channel Adapter ver 1.0

Pure adapter for inbound and outbound channel payloads. It supports WhatsApp, Instagram, Facebook Messenger, and website chat shapes without sending network requests.

## Main API

```js
const { normalizeInbound, buildOutboundMessage } = require("./src/channelAdapter");
```

`normalizeInbound(payload)` returns:

```js
{
  channel: "whatsapp" | "instagram" | "facebook" | "website",
  businessId: "beauty_demo",
  externalMessageId: "wamid.1",
  senderId: "85261234567",
  rawText: "想book今晚",
  receivedAt: "2026-05-09T00:00:00.000Z",
  replyToken: "wamid.1",
  metadata: {},
  errors: []
}
```

`buildOutboundMessage({ normalizedMessage, draft, safety })` returns `ready_to_send` only when the draft action is `auto_send` or `clarify` and Safety Checker says `safeToSend: true`.

## Run

```bash
node "channel adapter ver 1.0/test/channelAdapter.test.js"
node "channel adapter ver 1.0/scripts/writeSideBySideResults.js"
```
