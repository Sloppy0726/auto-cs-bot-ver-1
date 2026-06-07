# Small-Business Toolkit ver 1.0

Recreates Claude's **small-business** plugin (~31 workflow tools) as real,
provider-backed functions exposed over **MCP**, so the bot — or any MCP client
such as Claude Code — can call them.

These capabilities are intentionally generic for now; HK-style localization
(Traditional-Chinese copy, local business rules) is layered on later.

## Design

- **Real only, block until logged in.** Every provider-backed tool checks its
  provider's credentials *before* any network call. If the provider isn't
  connected, the tool returns a structured `auth_required` error naming the env
  vars to set — it never falls back to mock data.
- **Dependency-light.** Provider adapters use Node 20's global `fetch`; the only
  added dependency is `@modelcontextprotocol/sdk` for the MCP server.

## Layout

```
src/
  registry.js        ~31 tool definitions (name, category, provider, inputSchema, summary)
  auth.js            credential gate + connection status (smb-onboard)
  providers/         one adapter per service (isConfigured + request)
                     stripe, quickbooks, square, paypal, google, canva, docusign
  handlers/          one file per category; each calls a provider adapter
  dispatch.js        validate input -> auth gate -> handler -> normalized result
  server.js          MCP stdio server (ListTools / CallTool)
  index.js           { REGISTRY, dispatch, providers, connectionStatus }
test/                registry, auth (block gate), dispatch, providers (stubbed fetch)
```

## Tools by category

| Category | Tools | Provider |
| --- | --- | --- |
| Finance | business-pulse, cash-flow-snapshot, margin-analyzer, close-month, month-end-prep, month-heads-up, quarterly-review, plan-payroll, tax-prep, tax-season-organizer | QuickBooks |
| Finance | price-check | Square |
| Billing | invoice-chase | Stripe |
| CRM | crm-cleanup, crm-maintenance, customer-pulse, customer-pulse-check, call-list | Square |
| CRM | lead-triage | Gmail |
| Service | handle-complaint, ticket-deflector | Gmail |
| Marketing | run-campaign | Gmail |
| Marketing | content-strategy, canva-creator | Canva |
| Marketing | sales-brief | Square |
| Ops/Legal | contract-review, review-contract | DocuSign |
| Ops/Legal | job-post-builder | Google Drive |
| Briefings | friday-brief, monday-brief | QuickBooks |
| Meta | smb-router, smb-onboard | none |

`smb-router` suggests the right tool for a free-text request; `smb-onboard`
reports which providers are connected (this is where PayPal surfaces for setup).

## Run

```bash
# from repo root
npm run mcp:smb           # start the MCP stdio server
npm test                  # runs this module's suites too (auto-discovered)
```

Credentials live in `.env` (see `.env.example`). Set only the providers you use.

## Status / next steps

- Handlers make one meaningful real call each; richer per-tool logic is added as
  tools are iterated.
- Not yet wired into the live conversation pipeline (deferred by design).
- PayPal has an adapter and appears in `smb-onboard`, but no dedicated tool maps
  to it yet — wire one when a payments-specific workflow is needed.
