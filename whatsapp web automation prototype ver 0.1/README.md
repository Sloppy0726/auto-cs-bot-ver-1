# WhatsApp Web Automation Prototype ver 0.1

Burner-number demo for testing the feeling of automation without converting a WhatsApp Business App number to Cloud API.

This is not a production channel integration. It opens WhatsApp Web in a local browser profile, watches the current chat for the latest inbound message, runs the existing pipeline, and only sends when the pipeline returns `ready_to_send`.

## Guardrails

- Single-chat demo by default via `WA_TEST_CHAT`.
- No contact scraping.
- No bulk outbound.
- No proactive first message.
- Dry-run by default.
- Staff-review / blocked pipeline results are not sent unless `WA_SEND_HELD_NOTICE=1`.

## Run

From repo root:

```bash
WA_TEST_CHAT="Exact WhatsApp chat title" \
WA_BUSINESS_ID="beauty_demo" \
WA_SEND=1 \
node "whatsapp web automation prototype ver 0.1/scripts/runWhatsAppWebPilot.js"
```

First run:

1. A browser opens `web.whatsapp.com`.
2. Scan the QR code from WhatsApp Business App > Linked devices.
3. Open the one test chat manually.
4. Send a message from the other phone.

Useful env vars:

| Variable | Default | Purpose |
|---|---:|---|
| `WA_TEST_CHAT` | required | Exact chat title allowlist. |
| `WA_ALLOW_ANY_CHAT` | `0` | Set `1` only for burner-number demos. |
| `WA_BUSINESS_ID` | `beauty_demo` | Demo business config used by the existing pipeline. |
| `WA_SEND` | `0` | Set `1` to actually send. Otherwise dry-run only. |
| `WA_SCAN_CHATS` | `0` | Set `1` to search/open each allowlisted chat title every loop. With `WA_ALLOW_ANY_CHAT=1`, it falls back to visible-list scanning. |
| `WA_SCAN_LIMIT` | `20` | Maximum visible chat titles to inspect per scan loop when `WA_ALLOW_ANY_CHAT=1`. |
| `WA_SCAN_UNREAD_ONLY` | `0` | Set `1` to process only chats that WhatsApp Web marks unread. |
| `WA_VERBOSE_SCAN` | `0` | Set `1` to print scan heartbeat/debug lines. |
| `WA_SEND_HELD_NOTICE` | `0` | Set `1` to send a generic staff-follow-up message for held replies. |
| `WA_POLL_MS` | `3000` | Poll interval. |
| `WA_PROFILE_DIR` | `.local/whatsapp-web-profile` | Browser profile for the WhatsApp Web login session. |
| `TOKEN_USAGE_LOG` | `.local/token-usage.jsonl` | Per-chat estimated token usage log. |

## Multi-Chat Scan Demo

```bash
WA_TEST_CHAT="卜仔,May Test,Jack Test" \
WA_BUSINESS_ID="solara_bazi" \
WA_SCAN_CHATS=1 \
WA_SEND=1 \
node "whatsapp web automation prototype ver 0.1/scripts/runWhatsAppWebPilot.js"
```

Scan mode searches and opens each chat title in `WA_TEST_CHAT`. Keep the names exact. If `WA_ALLOW_ANY_CHAT=1` is explicitly set, it falls back to scanning visible chats near the top of the WhatsApp Web chat list.

## Good Test Messages

For `beauty_demo`:

- `你哋幾點開門？`

For `solara_bazi`:

- `詳細批同流年幾錢？`
- `批八字需要咩資料？`
- `你哋係咪24小時？`

For `restaurant_demo`:

- `你哋幾點開門？`
- `有冇泊車？`

Messages that involve pricing, refunds, medical claims, bookings, or complaints may be held by the existing safety rules.

## Test

```bash
node "whatsapp web automation prototype ver 0.1/test/whatsappWebPilot.test.js"
```

## Token Usage

Each processed chat turn is appended to `.local/token-usage.jsonl` by default. The current prototype records estimated input/output tokens plus route metadata such as business, chat title, intent, action, and whether the draft used an LLM. If a future LLM adapter returns provider usage, that can be recorded as actual usage too.
