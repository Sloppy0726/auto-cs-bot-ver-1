# Security Policy

## Supported versions

This repository is currently pre-1.0. Security fixes target the latest `main` branch unless a release branch is created later.

## Reporting a vulnerability

Please do not post exploit details, real customer data, or secrets in a public issue.

If GitHub private vulnerability reporting is enabled for this repository, use that first. Otherwise, open a minimal public issue that says a security report is available, without sensitive details, and the maintainer will coordinate a private channel.

## Sensitive data rules

This project should never contain real customer data. Reports, fixtures, tests, screenshots, logs, and demo files must use fake data only.

Examples of data that must not be committed:

- real names, phone numbers, emails, addresses, order IDs, payment records, booking records, message screenshots, API keys, OAuth tokens, cookies, or session files.

## LLM boundary expectations

Security-sensitive changes should preserve these boundaries:

- privacy filtering before any LLM call;
- no inherited API keys or access tokens leaked into child processes;
- approved-knowledge grounding for auto-send replies;
- staff review for risky or uncertain messages;
- deterministic blocks for medical, legal, financial, payment, refund, booking, delivery, and privacy violations.
