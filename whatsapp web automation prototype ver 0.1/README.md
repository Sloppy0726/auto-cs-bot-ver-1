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
| `WA_LLM_ADAPTER` | `local-stub` | Set `claude-api` to use a Claude API key for staff-review/handoff LLM drafts. Set `claude` for local Claude OAuth via Hermes credentials. `codex` remains available for Codex CLI tests. |
| `ANTHROPIC_API_KEY` | empty | Claude API key used when `WA_LLM_ADAPTER=claude-api`. `CLAUDE_API_KEY` is also accepted as a local alias. |
| `CLAUDE_API_MODEL` | route-selected | Optional fixed Claude model when `WA_LLM_ADAPTER=claude-api`; otherwise the model router can choose. |
| `CLAUDE_API_MAX_TOKENS` | route/default | Optional output cap for one Claude API-key draft. |
| `CLAUDE_OAUTH_MODEL` | `claude-opus-4-6` | Model passed to Anthropic Messages API when `WA_LLM_ADAPTER=claude`. |
| `CLAUDE_OAUTH_MAX_TOKENS` | `700` | Output cap for one Claude OAuth draft. |
| `CODEX_LLM_MODEL` | `gpt-5.4-mini` | Model passed to Codex CLI when `WA_LLM_ADAPTER=codex`. |
| `CODEX_LLM_TIMEOUT_MS` | `90000` | Timeout for one Codex CLI model call. |
| `WA_POLL_MS` | `3000` | Poll interval. |
| `WA_PROFILE_DIR` | `.local/whatsapp-web-profile` | Browser profile for the WhatsApp Web login session. |
| `TOKEN_USAGE_LOG` | `.local/token-usage.jsonl` | Per-chat estimated token usage log. |

## Multi-Chat Scan Demo

```bash
WA_TEST_CHAT="卜仔,May Test,Jack Test" \
WA_BUSINESS_ID="beauty_demo" \
WA_SCAN_CHATS=1 \
WA_SEND=1 \
node "whatsapp web automation prototype ver 0.1/scripts/runWhatsAppWebPilot.js"
```

Scan mode searches and opens each chat title in `WA_TEST_CHAT`. Keep the names exact. If `WA_ALLOW_ANY_CHAT=1` is explicitly set, it falls back to scanning visible chats near the top of the WhatsApp Web chat list.

## Claude API-Key LLM Smoke Demo

```bash
WA_TEST_CHAT="卜仔" \
WA_BUSINESS_ID="beauty_demo" \
WA_SCAN_CHATS=1 \
WA_LLM_ADAPTER=claude-api \
ANTHROPIC_API_KEY="sk-ant-..." \
WA_SEND=1 \
node "whatsapp web automation prototype ver 0.1/scripts/runWhatsAppWebPilot.js"
```

This uses the Claude API key path and leaves the rest of the WhatsApp pilot flow unchanged.

## Claude OAuth LLM Smoke Demo

```bash
WA_TEST_CHAT="卜仔" \
WA_BUSINESS_ID="beauty_demo" \
WA_SCAN_CHATS=1 \
WA_LLM_ADAPTER=claude \
CLAUDE_OAUTH_MODEL="claude-opus-4-6" \
WA_SEND=1 \
node "whatsapp web automation prototype ver 0.1/scripts/runWhatsAppWebPilot.js"
```

This uses the local Hermes Anthropic OAuth credential pool instead of an Anthropic API key. It is useful for validating that staff-review / handoff prompts can reach a real Claude model through subscription auth. It is still a local demo path, not a production WhatsApp setup.

## Good Test Messages

For `beauty_demo`:

- `你哋幾點開門？`
- `facial幾錢？`
- `想book今晚個facial有冇位`

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
