# Conversation Context ver 1.0

Shared lightweight context stitching for fragmented customer messages.

This module is used by:

- the webhook/API server before messages enter the normal pipeline
- the WhatsApp Web test bridge before it POSTs messages to the local webhook

The goal is to make these two flows behave the same for common short follow-ups:

```text
Customer: 想book位
Customer: 今晚四點
Stitched: 想book 今晚四點
```

```text
Customer: 預約首次 你聽日有咩時間？
Customer: 做脫毛
Stitched: 想book 聽日 laser 做脫毛
```

## Scope

This is intentionally small and deterministic. It only stitches booking-style follow-ups when the current message has a date/time or known service and recent history contains booking context.

It does not call an LLM and does not decide whether a message is safe to send. The normal privacy gateway, intent classifier, business rules, backend lookup, draft engine, and safety checker still run after stitching.

## Storage

The webhook/API server uses an in-memory per-conversation store keyed by:

```text
businessId:channel:senderId
```

By default it keeps the latest 30 messages and looks back 8 recent messages for service/date carry-over. This is enough for local/API parity testing. A production deployment should back this with a real tenant-scoped conversation store.

## Tests

```bash
node "conversation context ver 1.0/test/conversationContext.test.js"
```
