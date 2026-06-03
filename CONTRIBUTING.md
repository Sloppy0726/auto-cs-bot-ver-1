# Contributing

Thanks for helping improve this privacy-first customer-support safety framework.

## Development setup

This project intentionally uses plain Node.js stdlib and has no npm package dependencies.

```bash
npm test
```

## Contribution areas

Good first contributions include:

- New Traditional Chinese / English mixed-language test cases.
- More privacy-filter edge cases using fake data only.
- Safer business-rule examples for booking, payment, refund, delivery, medical, legal, or financial boundaries.
- Documentation improvements that make the pipeline easier to understand.
- Refactors that keep modules dependency-light and easy to run locally.

## Privacy and safety rules

Please follow these rules in every issue, PR, fixture, and test case:

1. Do not commit real customer messages, phone numbers, emails, names, addresses, order IDs, payment records, or screenshots.
2. Use clearly fake sample data such as `customer@example.com`, `+886900000000`, or `ORDER_TEST_001`.
3. Keep model prompts and examples grounded in approved knowledge; do not add examples where an LLM invents pricing, availability, refunds, medical claims, legal advice, or financial advice.
4. Prefer deterministic rules and tests over prompt-only behavior.
5. Route uncertain or risky replies to staff review.

## Pull request checklist

Before opening a PR:

- [ ] `npm test` passes locally.
- [ ] New behavior has tests.
- [ ] No real personal data or business data is included.
- [ ] Documentation is updated if public behavior changed.
- [ ] Any LLM adapter change keeps secrets out of logs and child-process environments.

## Commit style

Conventional commits are preferred:

- `docs: improve setup guide`
- `test: add privacy filter edge cases`
- `fix: block unsafe payment confirmation`
- `ci: add node test workflow`
