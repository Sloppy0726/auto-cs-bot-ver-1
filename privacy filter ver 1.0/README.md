# Privacy Filter Ver 1.0

This project starts with the privacy layer for a Hong Kong Cantonese/English AI customer support bot.

The privacy filter is intentionally deterministic and language-aware for Cantonese, English, and mixed messages and runs before any LLM call.
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

- Hong Kong phone numbers
- Email addresses
- HKID-like values
- Credit card-like values
- FPS/payment references
- Order and booking references
- Hong Kong address hints
- Cantonese and English medical, child-data, address, and payment-dispute risk hints

The filter does not call an LLM.
