# Draft Privacy Policy

Last updated: 2026-05-12

Draft status: This Privacy Policy is a working draft for the Traditional Chinese AI Customer Support Safety Framework. It is not legal advice, not final customer-facing policy text, and should not be published until placeholders are replaced and legal review is complete.

## 1. Who We Are

`[Company Legal Name]` provides a Traditional Chinese AI receptionist for SMEs.

Contact: `[privacy contact email]`

## 2. Scope

This policy explains how we handle personal data when:

- A business customer signs up for or manages the service.
- A business customer connects customer messaging channels.
- End customers send messages to a business using the service.
- Staff review, edit, approve, reject, or take over AI-assisted replies.

Where we process end-customer messages on behalf of a business customer, the business customer may be the primary data user or controller for that customer relationship, and we may act as its processor or service provider. The Data Processing Addendum provides more detail.

## 3. Data We May Process

We may process the following data depending on configuration:

- Business account data: business name, contact person, email, phone, billing details, plan, settings, and support messages.
- Staff user data: name, email, role, login records, approval/edit/reject actions, and audit logs.
- End-customer message data: channel, sender ID, message text, timestamps, reply tokens, metadata, and conversation context.
- Approved business knowledge: prices, opening hours, policies, services, FAQs, promotions, and staff instructions.
- Integration data: channel credentials, webhook metadata, Google Drive folder IDs or document data, and backend lookup results.
- Technical data: IP address, user agent, device data, logs, diagnostics, error reports, and security events.
- Billing and usage data: subscription, invoice, usage volume, and payment status.

## 4. Sensitive Data and Redaction

The service is designed to detect and redact certain personal or sensitive values before AI processing where possible, including phone numbers, email addresses, HKID-like values, credit-card-like values, payment references, order or booking references, address hints, and certain medical or child-data risk hints.

Automated filtering is not perfect. Customers and staff should avoid entering unnecessary sensitive data into the service.

## 5. How We Use Data

We use data to:

- Provide and operate the service.
- Normalize channel messages and route replies.
- Detect privacy or safety risk.
- Generate AI-assisted drafts or staff summaries.
- Show staff review and handoff items.
- Sync approved promotion and knowledge content.
- Secure webhooks, accounts, and tenant access.
- Troubleshoot, monitor, and improve service quality.
- Provide support, billing, and account administration.
- Comply with law, enforce terms, and prevent misuse.

## 6. AI Providers and Model Processing

The service may send sanitized or minimized message content, approved knowledge, business rules, and context to AI model providers to generate draft replies or staff summaries.

The system is designed so that:

- Privacy filtering occurs before LLM calls where possible.
- Auto-send replies must use approved knowledge or approved clarification text.
- Risky cases are routed to staff review.
- AI drafts are subject to safety checks before channel send.

We do not intentionally use customer message data to train third-party AI models unless expressly agreed in writing.

## 7. Subprocessors and Third Parties

We may use third parties to provide the service, such as:

| Category | Examples | Purpose |
|---|---|---|
| AI model provider | `[Anthropic / OpenAI / other]` | Draft generation and staff summaries. |
| Hosting provider | `[provider]` | Hosting, storage, networking, backups. |
| Messaging platforms | WhatsApp, Instagram, Facebook Messenger, website chat provider | Receiving and sending customer messages. |
| Document provider | Google Drive | Syncing approved promotions or knowledge. |
| Billing provider | `[provider]` | Invoices, payments, subscriptions. |
| Support and monitoring | `[provider]` | Support, logs, uptime, diagnostics. |

The final production list should be published before launch and updated when subprocessors materially change.

## 8. Data Retention

Retention periods should be confirmed before launch. Suggested defaults:

| Data Type | Suggested Retention |
|---|---|
| End-customer message logs | `[90 days]`, configurable by customer plan. |
| Staff inbox items and audit events | `[180 days]`. |
| Security logs | `[12 months]`. |
| Billing records | As required for accounting and legal compliance. |
| Backups | Deleted on normal backup rotation. |

We may retain data longer where required by law, dispute, security investigation, abuse prevention, or a written customer instruction.

## 9. Data Location and Cross-Border Processing

The service may process or store data in the target locale or other regions depending on production hosting and subprocessors.

Before launch, customers should be told the hosting region, AI provider region if available, and whether data may be transferred outside the target locale.

## 10. Security

We use reasonable technical and organizational measures designed to protect data, which may include:

- Privacy filtering before AI processing.
- Tenant-bound webhook credentials.
- HMAC webhook signatures and replay protection.
- Body-size and content-type checks.
- Staff review and safety checks before sending.
- Access controls and least-necessary data exposure.
- Logging, monitoring, backups, and incident response processes.

No system is completely secure. Customers must also protect their own staff accounts, channel credentials, devices, and connected systems.

## 11. Access, Correction, and Deletion

Business customers may request access, correction, export, or deletion of account data and service data by contacting `[privacy contact email]`.

End customers should normally contact the business they messaged. If an end customer contacts us directly, we may refer the request to the relevant business customer unless we are legally required to respond directly.

## 12. Marketing

We may use business contact details to send service updates, onboarding messages, billing notices, product announcements, or marketing communications where permitted by law. Recipients can opt out of marketing messages.

The service should not be used to send unlawful spam or marketing messages without proper notices, consent, or compliance with applicable platform rules.

## 13. Children and Sensitive Use

The service is not designed for unsupervised use by children or for high-risk professional advice. Child-data signals, medical signals, complaints, and other sensitive cases should be routed to staff review or handoff.

## 14. Changes

We may update this Privacy Policy as the service evolves. Material changes should be notified to customers through the service, email, or website.

## 15. Contact

Privacy questions should be sent to `[privacy contact email]`.
