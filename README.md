# Auto CS Bot Ver 1

Auto CS Bot Ver 1 is the first working project for a Hong Kong-focused AI customer support bot.

The product goal is to help local SMEs reply faster to repetitive customer inquiries while keeping sensitive customer data away from the LLM wherever possible.

Initial target use case:

- Cantonese and English customer support
- WhatsApp / Instagram / website inquiry handling
- FAQ, pricing, booking, and policy replies
- Human handoff for risky or sensitive cases
- Privacy filtering before any AI model call

## Core Principle

The LLM should write helpful replies, but it should not be the system of record and it should not receive unnecessary personal data.

The intended message flow is:

```text
Customer message
-> Privacy filter
-> Risk classification
-> Business rules / backend lookup
-> Sanitized LLM draft, if allowed
-> Staff review or direct reply
-> Conversation log
```

## Current Project Structure

```text
auto cs bot ver 1/
├── README.md
├── privacy gateway ver 1.0/
│   ├── README.md
│   ├── src/
│   │   └── privacyGateway.js
│   └── test/
│       └── privacyGateway.test.js
└── privacy filter ver 1.0/
    ├── README.md
    ├── privacy-filter-side-by-side-results.md
    ├── scripts/
    │   └── writeSideBySideResults.js
    ├── src/
    │   └── privacyFilter.js
    └── test/
        ├── privacyFilter.cases.js
        └── privacyFilter.test.js
```

## Components

### Privacy Gateway Ver 1.0

The privacy gateway is the routing layer that decides what should happen to each inbound message after privacy filtering.

Current routing decisions:

- `send_to_llm`: sanitized message can be used for an AI draft
- `review_before_llm`: sanitized message can be shown for staff review before any AI reply
- `block_and_handoff`: message should not be sent to the LLM

The gateway wraps the privacy filter rather than duplicating detection logic.

### Privacy Filter Ver 1.0

The privacy filter is the first component of the bot.

It is deterministic code, not an LLM prompt. It detects sensitive values, replaces them with placeholders, and returns structured metadata that the backend can store privately.

Current coverage:

- Hong Kong phone numbers
- Email addresses
- HKID-like values
- Credit-card-like values
- FPS / PayMe / payment references
- Order references
- Booking references
- Address-risk hints
- Medical-risk hints
- Child-data hints
- Payment dispute hints

Important behavior:

- Normal phone numbers can be redacted and still sent to the LLM as placeholders.
- HKID-like values require human review.
- Credit-card-like values block sending to the LLM.
- Medical, child-data, and payment dispute hints trigger human review.
- Order references are preserved by default because the backend may need them for lookup, but they can be redacted by configuration.

## How To Run The Privacy Filter Tests

From:

```bash
auto cs bot ver 1/privacy filter ver 1.0
```

Run:

```bash
node test/privacyFilter.test.js
```

Expected result:

```text
privacyFilter: 500 tests passed
```

For the 200-case edge suite, run:

```bash
node test/privacyFilter.edge.test.js
```

Expected result:

```text
privacyFilter edge: 200 tests passed
```

## How To Run The Privacy Gateway Tests

From:

```bash
auto cs bot ver 1/privacy gateway ver 1.0
```

Run:

```bash
node test/privacyGateway.test.js
```

Expected result:

```text
privacyGateway: 200 tests passed
```

## How To Generate The Side-by-Side Report

From:

```bash
auto cs bot ver 1/privacy filter ver 1.0
```

Run:

```bash
node scripts/writeSideBySideResults.js
```

This writes:

```text
privacy-filter-side-by-side-results.md
```

The report compares each test case side by side:

- Input
- Expected sanitized output
- Actual sanitized output
- Expected detected types
- Actual detected types
- Expected risk hints
- Actual risk hints
- Whether the message should be sent to the LLM
- Whether human review is needed

## Planned Next Components

Future components should live inside this main project folder as separate modules.

Likely next pieces:

- `knowledge base ver 1.0`: approved business FAQ, price list, branch info, policies, and retrieval
- `ai draft engine ver 1.0`: creates Cantonese / English replies from sanitized input and approved knowledge
- `conversation inbox ver 1.0`: staff review, approval, handoff, tagging, and status tracking
- `channel adapter ver 1.0`: future WhatsApp, Instagram, and website integrations

## Development Notes

- Keep privacy filtering before any LLM call.
- Keep business decisions in backend code, not in the model.
- Use deterministic checks for sensitive data whenever possible.
- Treat high-risk categories as human-review cases.
- Add tests before expanding detector behavior.
- Keep each component small enough to test independently.
