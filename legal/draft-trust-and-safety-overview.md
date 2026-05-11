# Draft Trust and Safety Overview

Last updated: 2026-05-12

Draft status: This is a working product and trust draft for internal review and pilot discussions. It is not final legal wording and should not be published as final customer terms without review.

This page explains how the Hong Kong AI Customer Support SaaS is designed to help small businesses answer routine customer enquiries while reducing privacy and AI-output risk.

This is a plain-English overview, not a replacement for the Terms of Service, Privacy Policy, or Data Processing Addendum.

## What the Product Does

The product is a Cantonese AI receptionist for Hong Kong SMEs. It helps businesses respond to repetitive customer enquiries from channels such as WhatsApp, Instagram, Facebook Messenger, and website chat.

The system is designed for routine customer support, such as:

- Opening hours and location.
- Approved service or product information.
- Basic pricing information when the business has approved it.
- Simple booking, order, stock, or payment enquiries for staff review.
- Lead capture and human handoff.
- Cantonese, Traditional Chinese, English, and mixed-language enquiries.

## What Makes It Safer Than a Direct Chatbot

The product is built around a controlled reply pipeline:

1. Customer messages are normalized by channel.
2. The privacy filter detects and redacts sensitive values before AI drafting where possible.
3. The privacy gateway decides whether the message can be sent to AI, needs review first, or must be blocked and handed to staff.
4. The intent classifier identifies the type of enquiry.
5. The knowledge base only uses approved business answers.
6. Business rules decide what the system is allowed and forbidden to do.
7. The AI draft engine follows those rules and generates only a draft when needed.
8. The safety checker re-validates the reply before anything can be sent.
9. Risky cases go to the staff inbox instead of being automatically sent.

## Privacy Approach

The product is designed to avoid sending unnecessary personal customer data to AI providers.

The privacy layer detects and redacts common sensitive data such as:

- Hong Kong phone numbers.
- Email addresses.
- HKID-like values.
- Credit card-like values.
- FPS or payment references.
- Order and booking references.
- Hong Kong address hints.
- Medical, child-data, address, and payment-dispute risk hints.

Where redaction applies, the AI receives placeholders instead of the raw sensitive value. Some messages may still require staff review or a privacy block.

## Approved Knowledge Only

The bot should not invent prices, opening hours, treatment claims, policies, booking slots, refunds, or business facts.

Automatic replies must come from approved knowledge or approved clarification text. If the system cannot find a safe approved answer, it should ask a clarification question or send the case to staff.

## Staff Review Cases

The system is conservative by design. Staff review is required for higher-risk cases, including:

- Complaints or angry customers.
- Refunds, chargebacks, or payment disputes.
- Booking, rescheduling, order status, shipment, and payment confirmations.
- Medical, treatment, beauty-clinic, or child-data sensitive topics.
- Questions where the approved knowledge is missing or unclear.
- Replies that include pricing or promises for conservative business types.
- Any draft that fails the safety checker.

## What the Product Does Not Promise

The product does not promise that AI output is always correct, complete, lawful, or suitable for every situation.

The product does not:

- Replace trained staff.
- Give legal, medical, financial, or professional advice.
- Decide refunds, complaints, or disputes.
- Confirm bookings, shipments, payments, treatment outcomes, or stock unless the relevant integration and business rules allow it.
- Guarantee that every item of personal data will be detected in every message.
- Guarantee uninterrupted availability of third-party channels, AI providers, Google Drive, hosting, or messaging platforms.

## Customer Responsibilities

Each business customer is responsible for:

- Uploading accurate and approved business information.
- Reviewing staff-review items before sending.
- Keeping pricing, promotions, opening hours, and policies current.
- Making sure its own staff, customers, and channel use comply with applicable law and platform rules.
- Avoiding use of the product for illegal, deceptive, harmful, or high-risk advice.

## Security Measures in the Current Architecture

The v1.0 architecture includes:

- Privacy filtering before LLM calls.
- Deterministic business rules outside the prompt.
- Approved knowledge grounding.
- Safety checks before channel send.
- Staff inbox for risky cases.
- Webhook signatures, replay protection, body-size checks, and tenant-bound authorization.
- Minimal backend facts for order and payment lookups.

Production deployment must still confirm hosting, database storage, access control, monitoring, audit logging, backup, and deletion processes.
