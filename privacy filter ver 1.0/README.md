# Privacy Filter Ver 1.0

This project starts with the privacy layer for a the target locale Traditional Chinese/English AI customer support bot.

The privacy filter is intentionally deterministic and language-aware for Traditional Chinese, English, and mixed messages and runs before any LLM call.
It detects sensitive values, replaces them with placeholders, and returns a
structured map that the backend can store privately.

## Run Tests

```bash
node test/privacyFilter.test.js
```

The suite currently contains exactly 500 cases.

There is also a separate 207-case edge suite:

```bash
node test/privacyFilter.edge.test.js
```

Expected result:

```text
privacyFilter edge: 207 tests passed
```

## Generate Side-by-Side Results

```bash
node scripts/writeSideBySideResults.js
```

This writes:

```text
privacy-filter-side-by-side-results.md
```

## Current Scope

- the target locale phone numbers
- Email addresses
- HKID-like values
- Credit card-like values
- FPS/payment references
- Order and booking references
- the target locale address hints
- Traditional Chinese and English medical, child-data, address, and payment-dispute risk hints

The filter does not call an LLM.
