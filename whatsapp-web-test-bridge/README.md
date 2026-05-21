# WhatsApp Web Test Bridge

Local testing adapter for the auto customer-support bot using Safari + WhatsApp Web.

This folder is intentionally separate from the real channel/API infrastructure. The production path should call the bot through the webhook/API server. This bridge exists only so a developer can test replies through an already logged-in WhatsApp Web session without paying for the WhatsApp Business API during development.

## What It Runs

```text
Safari WhatsApp Web
  -> whatsapp-web-test-bridge/src/whatsappWebBridge.js
  -> shared conversation context stitcher
  -> local bot webhook at http://127.0.0.1:3000/webhook
  -> normal bot pipeline
  -> bridge drafts/sends reply back in WhatsApp Web
```

The bridge does not replace the webhook server. It only watches WhatsApp Web and POSTs messages into the existing local `/webhook` endpoint. Fragmented booking follow-ups use the same `conversation context ver 1.0` stitcher as the API server.

## Fresh Machine Setup

Requirements:

- macOS
- Safari
- Node.js 18+
- `screen`, usually included on macOS
- Safari logged in at [WhatsApp Web](https://web.whatsapp.com/)

From the repo root:

```bash
cd whatsapp-web-test-bridge
cp .env.example .env
```

Edit `.env` if needed. For the salon demo, keep:

```bash
WA_BRIDGE_BUSINESS_ID=beauty_demo
```

For live LLM calls, set `CLAUDE_CODE_OAUTH_TOKEN` in `.env`. Generate it with `claude setup-token` (Claude Pro/Max/Enterprise subscription). The bot sends it as a bearer token against the Anthropic Messages API. `OPENAI_OAUTH_TOKEN` is still accepted as a fallback when no Claude token is set.

Start both the local bot server and bridge:

```bash
npm start
```

or:

```bash
./bin/start-local.sh
```

Check status:

```bash
npm run status
```

Stop packaged screens:

```bash
npm run stop
```

## Important Safety Switch

Default:

```bash
WA_BRIDGE_SEND_REPLIES=true
```

The bridge drafts the reply into WhatsApp Web's composer and clicks Send automatically. The bot is then operating on a live WhatsApp account without human review per message — only run this on accounts where that is acceptable.

To require a human to press Send, flip the switch in `.env`:

```bash
WA_BRIDGE_SEND_REPLIES=false
```

When false, the bridge still drafts the reply into the composer for you to inspect and send manually.

Staff-review outputs can still be converted into customer-facing handoff messages when:

```bash
WA_BRIDGE_SEND_HELD_DRAFTS=true
```

## Human Handoff Pause

When the bridge sends a staff-review handoff for booking, reschedule, payment, order status, complaint, sensitive-health, or human-request intents, it marks that WhatsApp chat as staff-owned. While staff-owned, new customer messages are logged but not sent to the bot, so the bot will not jump back in while staff is handling the case.

The bridge also watches outgoing WhatsApp messages. Once it sees a non-bot outgoing staff reply after the handoff, it treats the handoff as close to resolved:

- If the next customer reply is a short acknowledgement such as `ok`, `收到`, or `多謝`, the bridge stays silent and automatically releases the chat back to the bot.
- If the next customer reply looks like a new substantive question, the bridge automatically releases the chat and lets the bot handle that message.

The pause is stored locally in:

```text
whatsapp-web-test-bridge/state/handoff.json
```

The file is gitignored and expires entries after 24 hours as a fallback if no staff/customer completion signal is detected. Clear all paused chats with:

```bash
npm run handoff:clear
```

Or tune it in `.env`:

```bash
WA_BRIDGE_HANDOFF_PAUSE=true
WA_BRIDGE_HANDOFF_PAUSE_TTL_HOURS=24
WA_BRIDGE_HANDOFF_PAUSE_INTENTS=booking,reschedule,complaint,sensitive_health,human_request,payment,order_status
```

## Config

| Variable | Default | Meaning |
|---|---:|---|
| `BOT_URL` | `http://127.0.0.1:3000/webhook` | Local bot webhook endpoint. |
| `HOST` | `127.0.0.1` | Host for local server starter. |
| `PORT` | `3000` | Port for local server starter. |
| `WA_BRIDGE_BUSINESS_ID` | `beauty_demo` in example | Demo tenant sent to the bot. |
| `WA_BRIDGE_POLL_MS` | `2500` | WhatsApp Web polling interval. |
| `WA_BRIDGE_DRAFT_REPLIES` | `true` | Draft replies into WhatsApp composer. |
| `WA_BRIDGE_SEND_REPLIES` | `false` | Auto-click Send. Set true only for test accounts. |
| `WA_BRIDGE_SEND_HELD_DRAFTS` | `true` | Send customer-facing handoff notices for staff-review items. |
| `WA_BRIDGE_REPLY_LATEST_ON_START` | `false` | Process latest visible incoming message on startup. Useful for one-off replay, risky for normal restarts. |
| `WA_BRIDGE_HANDOFF_PAUSE` | `true` | Pause bot replies after selected human handoff intents. |
| `WA_BRIDGE_HANDOFF_PAUSE_TTL_HOURS` | `24` | How long a chat remains staff-owned before auto-release. |
| `WA_BRIDGE_HANDOFF_PAUSE_INTENTS` | booking/reschedule/etc. | Comma-separated intents that should pause the chat after staff-review. |

## Logs

Packaged scripts write logs here:

```text
whatsapp-web-test-bridge/logs/server.log
whatsapp-web-test-bridge/logs/bridge.log
```

Logs are gitignored.

## Context Stitching

The bridge uses the shared context stitcher before sending a WhatsApp message to the bot. The webhook/API server uses the same stitcher internally, so production-style API tests and this local WhatsApp Web adapter should match for common fragmented booking messages. For example:

```text
Customer: 想book位
Customer: 今晚四點
Bridge -> bot: 想book 今晚四點
```

It also carries service/date context for booking follow-ups:

```text
Customer: 預約首次 你聽日有咩時間？
Customer: 做脫毛
Bridge -> bot: 想book 聽日 laser 做脫毛
```

Limits:

- Reads the latest 30 visible WhatsApp message bubbles.
- Looks back about 8 recent messages for service/date carry-over.
- Memory is DOM-based, not a persistent database.

## Compatibility Entrypoint

The old root command still works:

```bash
npm run bridge:whatsapp
```

It now delegates to this package so older local commands do not break.
