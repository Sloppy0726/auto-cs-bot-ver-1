# Draft Legal and Trust Documents

Draft customer-facing legal/trust documents for the Traditional Chinese AI Customer Support Safety Framework.

These files are product-specific working drafts. They are written to match the current v1.0 architecture: privacy filtering before LLM calls, approved knowledge, deterministic business rules, safety checks, staff review, and conservative auto-send behavior.

They are not legal advice and should be reviewed by a the target locale-qualified lawyer before use with paying customers.

## Documents

| Document | Purpose |
|---|---|
| [Draft Trust and Safety Overview](draft-trust-and-safety-overview.md) | Plain-English sales/support page explaining what the product does, how privacy is handled, and when staff review is required. |
| [Draft Pilot Terms of Service](draft-pilot-terms-of-service.md) | B2B pilot/subscription terms covering service scope, AI limitations, customer responsibilities, support, payment, and liability. |
| [Draft Privacy Policy](draft-privacy-policy.md) | Customer-facing privacy notice for business users and end-customer message data. |
| [Draft Data Processing Addendum](draft-data-processing-addendum.md) | B2B data processing terms for SME customers using the product with their own customer messages. |

## Launch Checklist

- Replace bracketed placeholders such as `[Company Legal Name]`, `[contact email]`, and `[retention period]`.
- Confirm whether the service provider is acting as data processor, data user, or both for each data flow.
- Confirm production hosting region, LLM provider, channel providers, logging tools, and support tools.
- Confirm final retention periods for message logs, staff inbox items, audit logs, backups, and deleted tenant data.
- Confirm whether pilots are free, paid, refundable, or credit-only.
- Have counsel review limitation of liability, indemnity, governing law, PDPO wording, and cross-border transfer wording.
