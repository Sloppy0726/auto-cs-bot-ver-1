# Draft Data Processing Addendum

Last updated: 2026-05-12

Draft status: This Data Processing Addendum (`DPA`) is a working draft for B2B customers of the Traditional Chinese AI Customer Support Safety Framework. It is not legal advice, not final contract text, and should not be used with customers until placeholders are replaced and legal review is complete.

## 1. Parties and Role

This DPA forms part of the agreement between `[Company Legal Name]` (`Provider`) and the business customer (`Customer`).

For end-customer messages and related customer service data processed through the service, the Customer is generally expected to determine why and how the data is processed. The Provider processes that data to provide the service according to the Customer's instructions and this DPA.

The final role allocation should be confirmed by legal counsel for each production deployment.

## 2. Subject Matter and Duration

The Provider processes personal data to provide AI-assisted customer support, privacy filtering, approved knowledge management, staff review, channel routing, integrations, security, support, and related service operations.

Processing continues for the term of the agreement and any agreed retention, deletion, backup, dispute, audit, or legal-compliance period.

## 3. Categories of Data Subjects

Data subjects may include:

- Customer staff, admins, and account users.
- End customers who message the Customer through connected channels.
- Leads and prospective customers.
- Support contacts.

## 4. Categories of Personal Data

Processed data may include:

- Names, phone numbers, email addresses, channel sender IDs, and account identifiers.
- Message content and conversation metadata.
- Booking, order, payment, product, promotion, or support context.
- Staff review actions and audit logs.
- Technical logs, IP addresses, device data, and security events.
- Billing and account administration data.

The service is designed to redact or minimize certain sensitive values before AI processing where possible, but the Customer should avoid sending unnecessary sensitive data.

## 5. Processing Instructions

The Provider will process personal data only:

- To provide, secure, support, maintain, and improve the service.
- According to the agreement, this DPA, the Privacy Policy, order forms, and documented Customer settings.
- As required by law, platform rules, or security obligations.

If the Provider believes an instruction creates legal, security, privacy, platform, or operational risk, the Provider may suspend the instruction and notify the Customer where appropriate.

## 6. Confidentiality

The Provider will ensure personnel authorized to process personal data are subject to confidentiality obligations or equivalent professional obligations.

## 7. Security Measures

The Provider will maintain reasonable technical and organizational measures appropriate to the service, which may include:

- Privacy filtering and redaction before LLM calls where possible.
- Deterministic business rules and safety checks before automatic sending.
- Staff review for sensitive, risky, unclear, or policy-sensitive cases.
- Tenant-bound webhook authorization.
- HMAC signature verification and replay protection.
- Request size, content-type, and timeout controls.
- Access control, logging, monitoring, backup, and incident response procedures.
- Minimal backend fact exposure for order and payment lookups.

Production security measures should be documented in a security schedule before launch.

## 8. Subprocessors

The Customer authorizes the Provider to use subprocessors needed to provide the service, such as hosting, AI model, messaging, document sync, billing, monitoring, and support providers.

The Provider should maintain a current subprocessor list, including:

| Subprocessor | Location | Purpose | Status |
|---|---|---|---|
| `[AI provider]` | `[region]` | AI draft generation and staff summaries | To confirm |
| `[Hosting provider]` | `[region]` | Hosting, storage, backups | To confirm |
| Meta / WhatsApp / Instagram / Facebook | To confirm | Messaging channel integration | To confirm |
| Google Drive | To confirm | Promotion or knowledge sync | To confirm |
| `[Monitoring/support/billing providers]` | To confirm | Operations | To confirm |

The Provider should require subprocessors to protect personal data at a level appropriate to their role.

## 9. Cross-Border Transfers

Personal data may be processed outside the target locale depending on hosting, AI providers, messaging platforms, document providers, and other subprocessors.

Before production launch, the Provider should disclose the expected processing regions and any applicable safeguards or contractual protections.

## 10. Assistance

Taking into account the nature of the service and available information, the Provider will reasonably assist the Customer with:

- Data access, correction, export, and deletion requests.
- Security incident investigation.
- Privacy and data protection assessments.
- Information reasonably needed to demonstrate compliance with this DPA.

The Provider may charge reasonable fees for assistance outside normal support scope unless prohibited by law or agreed otherwise.

## 11. Security Incidents

The Provider will notify the Customer without undue delay after becoming aware of a confirmed personal data breach affecting Customer data.

The notice should include, where available:

- Nature of the incident.
- Categories and approximate volume of affected data.
- Likely consequences.
- Measures taken or proposed.
- Contact point for follow-up.

The Provider may update the Customer as investigation continues.

## 12. Return and Deletion

At the end of the service, the Customer may request export or deletion of Customer data, subject to technical feasibility, legal obligations, backup rotation, dispute preservation, and fraud/security requirements.

Suggested deletion behavior should be confirmed before launch:

- Active tenant data deleted within `[30 days]` after verified request.
- Backups deleted on normal backup rotation within `[90 days]`.
- Billing, audit, security, and legal records retained as required.

## 13. Audit and Information Rights

On reasonable written request, the Provider will provide information necessary to verify compliance with this DPA, subject to confidentiality, security, and protection of other customers.

Any formal audit process should be agreed in advance and limited to reasonable business hours, scope, frequency, and security constraints.

## 14. Customer Obligations

The Customer is responsible for:

- Giving required privacy notices to end customers and staff.
- Obtaining required consents or other lawful basis.
- Ensuring connected channel use complies with platform terms and applicable law.
- Providing accurate approved knowledge and staff instructions.
- Managing staff access and credentials.
- Avoiding unnecessary sensitive data collection.
- Reviewing staff-review and handoff cases before sending.

## 15. Order of Precedence

If there is a conflict between this DPA and the main agreement, this DPA controls for personal data processing matters, unless the parties expressly agree otherwise in writing.
