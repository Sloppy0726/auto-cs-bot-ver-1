# Usage Tracker ver 0.1

Small utility for estimating and recording token usage per chat turn.

It writes JSONL records with:

- business ID
- channel
- chat ID
- message ID
- final pipeline status
- intent/action
- estimated input/output tokens
- actual provider usage when available

The estimator is deliberately simple and should be treated as planning data, not billing truth. Real billing should use usage returned by the LLM provider.

## Test

```bash
node "usage tracker ver 0.1/test/tokenUsage.test.js"
```
