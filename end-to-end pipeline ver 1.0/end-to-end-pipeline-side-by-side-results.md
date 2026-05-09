# End-to-end Pipeline ver 1.0 - Readable Side-by-side Results

Each case compares the expected final route with every major pipeline checkpoint: privacy, intent, KB, rules, safety, outbound, and staff inbox.

Generated at: 2026-05-09T13:31:08.757Z
Total rows: 100
Passed: 100
Failed: 0

## Quick Index

| # | Status | Case | Key result |
|---:|---|---|---|
| 1 | PASS | restaurant hours goes ready_to_send | ready_to_send / auto_send |
| 2 | PASS | beauty pricing goes staff review | staff_review / staff_review |
| 3 | PASS | beauty small-face promo is read before staff draft | staff_review / staff_review |
| 4 | PASS | restaurant parking clarify can send | ready_to_send / clarify |
| 5 | PASS | complaint goes staff review handoff | staff_review / handoff |
| 6 | PASS | restaurant hours ready to send: full pipeline scenario 1 | ready_to_send / auto_send |
| 7 | PASS | restaurant hours ready to send: full pipeline scenario 2 | ready_to_send / auto_send |
| 8 | PASS | restaurant hours ready to send: full pipeline scenario 3 | ready_to_send / auto_send |
| 9 | PASS | beauty pricing held for staff: full pipeline scenario 4 | staff_review / staff_review |
| 10 | PASS | beauty pricing held for staff: full pipeline scenario 5 | staff_review / staff_review |
| 11 | PASS | beauty pricing held for staff: full pipeline scenario 6 | staff_review / staff_review |
| 12 | PASS | beauty active promo held for staff review: full pipeline scenario 7 | staff_review / staff_review |
| 13 | PASS | beauty active promo held for staff review: full pipeline scenario 8 | staff_review / staff_review |
| 14 | PASS | beauty active promo held for staff review: full pipeline scenario 9 | staff_review / staff_review |
| 15 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 10 | ready_to_send / clarify |
| 16 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 11 | ready_to_send / clarify |
| 17 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 12 | ready_to_send / clarify |
| 18 | PASS | complaint and escalation held for handoff: full pipeline scenario 13 | staff_review / handoff |
| 19 | PASS | complaint and escalation held for handoff: full pipeline scenario 14 | staff_review / handoff |
| 20 | PASS | complaint and escalation held for handoff: full pipeline scenario 15 | staff_review / handoff |
| 21 | PASS | restaurant hours ready to send: full pipeline scenario 16 | ready_to_send / auto_send |
| 22 | PASS | restaurant hours ready to send: full pipeline scenario 17 | ready_to_send / auto_send |
| 23 | PASS | restaurant hours ready to send: full pipeline scenario 18 | ready_to_send / auto_send |
| 24 | PASS | beauty pricing held for staff: full pipeline scenario 19 | staff_review / staff_review |
| 25 | PASS | beauty pricing held for staff: full pipeline scenario 20 | staff_review / staff_review |
| 26 | PASS | beauty pricing held for staff: full pipeline scenario 21 | staff_review / staff_review |
| 27 | PASS | beauty active promo held for staff review: full pipeline scenario 22 | staff_review / staff_review |
| 28 | PASS | beauty active promo held for staff review: full pipeline scenario 23 | staff_review / staff_review |
| 29 | PASS | beauty active promo held for staff review: full pipeline scenario 24 | staff_review / staff_review |
| 30 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 25 | ready_to_send / clarify |
| 31 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 26 | ready_to_send / clarify |
| 32 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 27 | ready_to_send / clarify |
| 33 | PASS | complaint and escalation held for handoff: full pipeline scenario 28 | staff_review / handoff |
| 34 | PASS | complaint and escalation held for handoff: full pipeline scenario 29 | staff_review / handoff |
| 35 | PASS | complaint and escalation held for handoff: full pipeline scenario 30 | staff_review / handoff |
| 36 | PASS | restaurant hours ready to send: full pipeline scenario 31 | ready_to_send / auto_send |
| 37 | PASS | restaurant hours ready to send: full pipeline scenario 32 | ready_to_send / auto_send |
| 38 | PASS | restaurant hours ready to send: full pipeline scenario 33 | ready_to_send / auto_send |
| 39 | PASS | beauty pricing held for staff: full pipeline scenario 34 | staff_review / staff_review |
| 40 | PASS | beauty pricing held for staff: full pipeline scenario 35 | staff_review / staff_review |
| 41 | PASS | beauty pricing held for staff: full pipeline scenario 36 | staff_review / staff_review |
| 42 | PASS | beauty active promo held for staff review: full pipeline scenario 37 | staff_review / staff_review |
| 43 | PASS | beauty active promo held for staff review: full pipeline scenario 38 | staff_review / staff_review |
| 44 | PASS | beauty active promo held for staff review: full pipeline scenario 39 | staff_review / staff_review |
| 45 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 40 | ready_to_send / clarify |
| 46 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 41 | ready_to_send / clarify |
| 47 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 42 | ready_to_send / clarify |
| 48 | PASS | complaint and escalation held for handoff: full pipeline scenario 43 | staff_review / handoff |
| 49 | PASS | complaint and escalation held for handoff: full pipeline scenario 44 | staff_review / handoff |
| 50 | PASS | complaint and escalation held for handoff: full pipeline scenario 45 | staff_review / handoff |
| 51 | PASS | restaurant hours ready to send: full pipeline scenario 46 | ready_to_send / auto_send |
| 52 | PASS | restaurant hours ready to send: full pipeline scenario 47 | ready_to_send / auto_send |
| 53 | PASS | restaurant hours ready to send: full pipeline scenario 48 | ready_to_send / auto_send |
| 54 | PASS | beauty pricing held for staff: full pipeline scenario 49 | staff_review / staff_review |
| 55 | PASS | beauty pricing held for staff: full pipeline scenario 50 | staff_review / staff_review |
| 56 | PASS | beauty pricing held for staff: full pipeline scenario 51 | staff_review / staff_review |
| 57 | PASS | beauty active promo held for staff review: full pipeline scenario 52 | staff_review / staff_review |
| 58 | PASS | beauty active promo held for staff review: full pipeline scenario 53 | staff_review / staff_review |
| 59 | PASS | beauty active promo held for staff review: full pipeline scenario 54 | staff_review / staff_review |
| 60 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 55 | ready_to_send / clarify |
| 61 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 56 | ready_to_send / clarify |
| 62 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 57 | ready_to_send / clarify |
| 63 | PASS | complaint and escalation held for handoff: full pipeline scenario 58 | staff_review / handoff |
| 64 | PASS | complaint and escalation held for handoff: full pipeline scenario 59 | staff_review / handoff |
| 65 | PASS | complaint and escalation held for handoff: full pipeline scenario 60 | staff_review / handoff |
| 66 | PASS | restaurant hours ready to send: full pipeline scenario 61 | ready_to_send / auto_send |
| 67 | PASS | restaurant hours ready to send: full pipeline scenario 62 | ready_to_send / auto_send |
| 68 | PASS | restaurant hours ready to send: full pipeline scenario 63 | ready_to_send / auto_send |
| 69 | PASS | beauty pricing held for staff: full pipeline scenario 64 | staff_review / staff_review |
| 70 | PASS | beauty pricing held for staff: full pipeline scenario 65 | staff_review / staff_review |
| 71 | PASS | beauty pricing held for staff: full pipeline scenario 66 | staff_review / staff_review |
| 72 | PASS | beauty active promo held for staff review: full pipeline scenario 67 | staff_review / staff_review |
| 73 | PASS | beauty active promo held for staff review: full pipeline scenario 68 | staff_review / staff_review |
| 74 | PASS | beauty active promo held for staff review: full pipeline scenario 69 | staff_review / staff_review |
| 75 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 70 | ready_to_send / clarify |
| 76 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 71 | ready_to_send / clarify |
| 77 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 72 | ready_to_send / clarify |
| 78 | PASS | complaint and escalation held for handoff: full pipeline scenario 73 | staff_review / handoff |
| 79 | PASS | complaint and escalation held for handoff: full pipeline scenario 74 | staff_review / handoff |
| 80 | PASS | complaint and escalation held for handoff: full pipeline scenario 75 | staff_review / handoff |
| 81 | PASS | restaurant hours ready to send: full pipeline scenario 76 | ready_to_send / auto_send |
| 82 | PASS | restaurant hours ready to send: full pipeline scenario 77 | ready_to_send / auto_send |
| 83 | PASS | restaurant hours ready to send: full pipeline scenario 78 | ready_to_send / auto_send |
| 84 | PASS | beauty pricing held for staff: full pipeline scenario 79 | staff_review / staff_review |
| 85 | PASS | beauty pricing held for staff: full pipeline scenario 80 | staff_review / staff_review |
| 86 | PASS | beauty pricing held for staff: full pipeline scenario 81 | staff_review / staff_review |
| 87 | PASS | beauty active promo held for staff review: full pipeline scenario 82 | staff_review / staff_review |
| 88 | PASS | beauty active promo held for staff review: full pipeline scenario 83 | staff_review / staff_review |
| 89 | PASS | beauty active promo held for staff review: full pipeline scenario 84 | staff_review / staff_review |
| 90 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 85 | ready_to_send / clarify |
| 91 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 86 | ready_to_send / clarify |
| 92 | PASS | restaurant unknown info sends deterministic clarification: full pipeline scenario 87 | ready_to_send / clarify |
| 93 | PASS | complaint and escalation held for handoff: full pipeline scenario 88 | staff_review / handoff |
| 94 | PASS | complaint and escalation held for handoff: full pipeline scenario 89 | staff_review / handoff |
| 95 | PASS | complaint and escalation held for handoff: full pipeline scenario 90 | staff_review / handoff |
| 96 | PASS | restaurant hours ready to send: full pipeline scenario 91 | ready_to_send / auto_send |
| 97 | PASS | restaurant hours ready to send: full pipeline scenario 92 | ready_to_send / auto_send |
| 98 | PASS | restaurant hours ready to send: full pipeline scenario 93 | ready_to_send / auto_send |
| 99 | PASS | beauty pricing held for staff: full pipeline scenario 94 | staff_review / staff_review |
| 100 | PASS | beauty pricing held for staff: full pipeline scenario 95 | staff_review / staff_review |

## Details

### 001 PASS - restaurant hours goes ready_to_send

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "s1",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 002 PASS - beauty pricing goes staff review

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "s2",
    "text": "facial幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0001"
}
```

### 003 PASS - beauty small-face promo is read before staff draft

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "u-small-face",
    "text": "想了解小顏項目同點收費"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0002"
}
```

### 004 PASS - restaurant parking clarify can send

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "s3",
    "text": "你哋有冇泊車優惠？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 005 PASS - complaint goes staff review handoff

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "s4",
    "text": "你哋搞錯我個booking，我要退錢。"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "review_before_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0003"
}
```

### 006 PASS - restaurant hours ready to send: full pipeline scenario 1

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-hours-web-1",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 007 PASS - restaurant hours ready to send: full pipeline scenario 2

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "fb-hours-2",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 008 PASS - restaurant hours ready to send: full pipeline scenario 3

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-monday-3",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 009 PASS - beauty pricing held for staff: full pipeline scenario 4

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "beauty-price-web-4",
    "text": "facial幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0004"
}
```

### 010 PASS - beauty pricing held for staff: full pipeline scenario 5

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "beauty-price-wa-5",
    "text": "想問面部護理價錢"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0005"
}
```

### 011 PASS - beauty pricing held for staff: full pipeline scenario 6

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "beauty-price-ig-6",
    "text": "Signature facial price?"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0006"
}
```

### 012 PASS - beauty active promo held for staff review: full pipeline scenario 7

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "promo-small-face-wa-7",
    "text": "想了解小顏項目同點收費"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0007"
}
```

### 013 PASS - beauty active promo held for staff review: full pipeline scenario 8

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "promo-small-face-web-8",
    "text": "小顏管理五月優惠幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0008"
}
```

### 014 PASS - beauty active promo held for staff review: full pipeline scenario 9

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "promo-small-face-ig-9",
    "text": "面部輪廓優惠詳情"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0009"
}
```

### 015 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 10

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-parking-10",
    "text": "你哋有冇泊車優惠？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 016 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 11

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-dog-11",
    "text": "可唔可以帶狗？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 017 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 12

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "restaurant-karaoke-12",
    "text": "有冇karaoke房？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 018 PASS - complaint and escalation held for handoff: full pipeline scenario 13

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "complaint-refund-13",
    "text": "你哋搞錯我個booking，我要退錢。"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "review_before_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0010"
}
```

### 019 PASS - complaint and escalation held for handoff: full pipeline scenario 14

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "complaint-angry-14",
    "text": "好嬲，點解收多咗錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0011"
}
```

### 020 PASS - complaint and escalation held for handoff: full pipeline scenario 15

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "human-request-15",
    "text": "我要搵真人傾"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "human_request",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0012"
}
```

### 021 PASS - restaurant hours ready to send: full pipeline scenario 16

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-hours-web-16",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 022 PASS - restaurant hours ready to send: full pipeline scenario 17

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "fb-hours-17",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 023 PASS - restaurant hours ready to send: full pipeline scenario 18

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-monday-18",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 024 PASS - beauty pricing held for staff: full pipeline scenario 19

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "beauty-price-web-19",
    "text": "facial幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0013"
}
```

### 025 PASS - beauty pricing held for staff: full pipeline scenario 20

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "beauty-price-wa-20",
    "text": "想問面部護理價錢"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0014"
}
```

### 026 PASS - beauty pricing held for staff: full pipeline scenario 21

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "beauty-price-ig-21",
    "text": "Signature facial price?"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0015"
}
```

### 027 PASS - beauty active promo held for staff review: full pipeline scenario 22

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "promo-small-face-wa-22",
    "text": "想了解小顏項目同點收費"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0016"
}
```

### 028 PASS - beauty active promo held for staff review: full pipeline scenario 23

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "promo-small-face-web-23",
    "text": "小顏管理五月優惠幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0017"
}
```

### 029 PASS - beauty active promo held for staff review: full pipeline scenario 24

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "promo-small-face-ig-24",
    "text": "面部輪廓優惠詳情"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0018"
}
```

### 030 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 25

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-parking-25",
    "text": "你哋有冇泊車優惠？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 031 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 26

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-dog-26",
    "text": "可唔可以帶狗？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 032 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 27

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "restaurant-karaoke-27",
    "text": "有冇karaoke房？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 033 PASS - complaint and escalation held for handoff: full pipeline scenario 28

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "complaint-refund-28",
    "text": "你哋搞錯我個booking，我要退錢。"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "review_before_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0019"
}
```

### 034 PASS - complaint and escalation held for handoff: full pipeline scenario 29

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "complaint-angry-29",
    "text": "好嬲，點解收多咗錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0020"
}
```

### 035 PASS - complaint and escalation held for handoff: full pipeline scenario 30

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "human-request-30",
    "text": "我要搵真人傾"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "human_request",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0021"
}
```

### 036 PASS - restaurant hours ready to send: full pipeline scenario 31

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-hours-web-31",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 037 PASS - restaurant hours ready to send: full pipeline scenario 32

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "fb-hours-32",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 038 PASS - restaurant hours ready to send: full pipeline scenario 33

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-monday-33",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 039 PASS - beauty pricing held for staff: full pipeline scenario 34

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "beauty-price-web-34",
    "text": "facial幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0022"
}
```

### 040 PASS - beauty pricing held for staff: full pipeline scenario 35

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "beauty-price-wa-35",
    "text": "想問面部護理價錢"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0023"
}
```

### 041 PASS - beauty pricing held for staff: full pipeline scenario 36

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "beauty-price-ig-36",
    "text": "Signature facial price?"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0024"
}
```

### 042 PASS - beauty active promo held for staff review: full pipeline scenario 37

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "promo-small-face-wa-37",
    "text": "想了解小顏項目同點收費"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0025"
}
```

### 043 PASS - beauty active promo held for staff review: full pipeline scenario 38

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "promo-small-face-web-38",
    "text": "小顏管理五月優惠幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0026"
}
```

### 044 PASS - beauty active promo held for staff review: full pipeline scenario 39

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "promo-small-face-ig-39",
    "text": "面部輪廓優惠詳情"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0027"
}
```

### 045 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 40

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-parking-40",
    "text": "你哋有冇泊車優惠？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 046 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 41

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-dog-41",
    "text": "可唔可以帶狗？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 047 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 42

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "restaurant-karaoke-42",
    "text": "有冇karaoke房？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 048 PASS - complaint and escalation held for handoff: full pipeline scenario 43

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "complaint-refund-43",
    "text": "你哋搞錯我個booking，我要退錢。"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "review_before_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0028"
}
```

### 049 PASS - complaint and escalation held for handoff: full pipeline scenario 44

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "complaint-angry-44",
    "text": "好嬲，點解收多咗錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0029"
}
```

### 050 PASS - complaint and escalation held for handoff: full pipeline scenario 45

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "human-request-45",
    "text": "我要搵真人傾"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "human_request",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0030"
}
```

### 051 PASS - restaurant hours ready to send: full pipeline scenario 46

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-hours-web-46",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 052 PASS - restaurant hours ready to send: full pipeline scenario 47

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "fb-hours-47",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 053 PASS - restaurant hours ready to send: full pipeline scenario 48

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-monday-48",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 054 PASS - beauty pricing held for staff: full pipeline scenario 49

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "beauty-price-web-49",
    "text": "facial幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0031"
}
```

### 055 PASS - beauty pricing held for staff: full pipeline scenario 50

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "beauty-price-wa-50",
    "text": "想問面部護理價錢"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0032"
}
```

### 056 PASS - beauty pricing held for staff: full pipeline scenario 51

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "beauty-price-ig-51",
    "text": "Signature facial price?"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0033"
}
```

### 057 PASS - beauty active promo held for staff review: full pipeline scenario 52

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "promo-small-face-wa-52",
    "text": "想了解小顏項目同點收費"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0034"
}
```

### 058 PASS - beauty active promo held for staff review: full pipeline scenario 53

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "promo-small-face-web-53",
    "text": "小顏管理五月優惠幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0035"
}
```

### 059 PASS - beauty active promo held for staff review: full pipeline scenario 54

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "promo-small-face-ig-54",
    "text": "面部輪廓優惠詳情"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0036"
}
```

### 060 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 55

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-parking-55",
    "text": "你哋有冇泊車優惠？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 061 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 56

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-dog-56",
    "text": "可唔可以帶狗？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 062 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 57

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "restaurant-karaoke-57",
    "text": "有冇karaoke房？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 063 PASS - complaint and escalation held for handoff: full pipeline scenario 58

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "complaint-refund-58",
    "text": "你哋搞錯我個booking，我要退錢。"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "review_before_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0037"
}
```

### 064 PASS - complaint and escalation held for handoff: full pipeline scenario 59

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "complaint-angry-59",
    "text": "好嬲，點解收多咗錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0038"
}
```

### 065 PASS - complaint and escalation held for handoff: full pipeline scenario 60

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "human-request-60",
    "text": "我要搵真人傾"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "human_request",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0039"
}
```

### 066 PASS - restaurant hours ready to send: full pipeline scenario 61

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-hours-web-61",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 067 PASS - restaurant hours ready to send: full pipeline scenario 62

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "fb-hours-62",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 068 PASS - restaurant hours ready to send: full pipeline scenario 63

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-monday-63",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 069 PASS - beauty pricing held for staff: full pipeline scenario 64

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "beauty-price-web-64",
    "text": "facial幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0040"
}
```

### 070 PASS - beauty pricing held for staff: full pipeline scenario 65

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "beauty-price-wa-65",
    "text": "想問面部護理價錢"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0041"
}
```

### 071 PASS - beauty pricing held for staff: full pipeline scenario 66

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "beauty-price-ig-66",
    "text": "Signature facial price?"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0042"
}
```

### 072 PASS - beauty active promo held for staff review: full pipeline scenario 67

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "promo-small-face-wa-67",
    "text": "想了解小顏項目同點收費"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0043"
}
```

### 073 PASS - beauty active promo held for staff review: full pipeline scenario 68

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "promo-small-face-web-68",
    "text": "小顏管理五月優惠幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0044"
}
```

### 074 PASS - beauty active promo held for staff review: full pipeline scenario 69

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "promo-small-face-ig-69",
    "text": "面部輪廓優惠詳情"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0045"
}
```

### 075 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 70

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-parking-70",
    "text": "你哋有冇泊車優惠？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 076 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 71

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-dog-71",
    "text": "可唔可以帶狗？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 077 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 72

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "restaurant-karaoke-72",
    "text": "有冇karaoke房？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 078 PASS - complaint and escalation held for handoff: full pipeline scenario 73

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "complaint-refund-73",
    "text": "你哋搞錯我個booking，我要退錢。"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "review_before_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0046"
}
```

### 079 PASS - complaint and escalation held for handoff: full pipeline scenario 74

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "complaint-angry-74",
    "text": "好嬲，點解收多咗錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0047"
}
```

### 080 PASS - complaint and escalation held for handoff: full pipeline scenario 75

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "human-request-75",
    "text": "我要搵真人傾"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "human_request",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0048"
}
```

### 081 PASS - restaurant hours ready to send: full pipeline scenario 76

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-hours-web-76",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 082 PASS - restaurant hours ready to send: full pipeline scenario 77

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "fb-hours-77",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 083 PASS - restaurant hours ready to send: full pipeline scenario 78

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-monday-78",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 084 PASS - beauty pricing held for staff: full pipeline scenario 79

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "beauty-price-web-79",
    "text": "facial幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0049"
}
```

### 085 PASS - beauty pricing held for staff: full pipeline scenario 80

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "beauty-price-wa-80",
    "text": "想問面部護理價錢"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0050"
}
```

### 086 PASS - beauty pricing held for staff: full pipeline scenario 81

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "beauty-price-ig-81",
    "text": "Signature facial price?"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0051"
}
```

### 087 PASS - beauty active promo held for staff review: full pipeline scenario 82

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "promo-small-face-wa-82",
    "text": "想了解小顏項目同點收費"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0052"
}
```

### 088 PASS - beauty active promo held for staff review: full pipeline scenario 83

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "promo-small-face-web-83",
    "text": "小顏管理五月優惠幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0053"
}
```

### 089 PASS - beauty active promo held for staff review: full pipeline scenario 84

Context:
```json
{
  "input": {
    "channel": "instagram",
    "businessId": "beauty_demo",
    "senderId": "promo-small-face-ig-84",
    "text": "面部輪廓優惠詳情"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": "beauty_may_small_face_trial"
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0054"
}
```

### 090 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 85

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-parking-85",
    "text": "你哋有冇泊車優惠？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 091 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 86

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-dog-86",
    "text": "可唔可以帶狗？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 092 PASS - restaurant unknown info sends deterministic clarification: full pipeline scenario 87

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "restaurant-karaoke-87",
    "text": "有冇karaoke房？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "clarify",
  "route": "send_to_llm",
  "intent": "general",
  "kb": null,
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 093 PASS - complaint and escalation held for handoff: full pipeline scenario 88

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "complaint-refund-88",
    "text": "你哋搞錯我個booking，我要退錢。"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "review_before_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0055"
}
```

### 094 PASS - complaint and escalation held for handoff: full pipeline scenario 89

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "complaint-angry-89",
    "text": "好嬲，點解收多咗錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "complaint",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0056"
}
```

### 095 PASS - complaint and escalation held for handoff: full pipeline scenario 90

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "human-request-90",
    "text": "我要搵真人傾"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "handoff",
  "route": "send_to_llm",
  "intent": "human_request",
  "kb": null,
  "safety": "revise",
  "safeToSend": false,
  "promotion": "",
  "outbound": "held",
  "staffItemId": "staff_0057"
}
```

### 096 PASS - restaurant hours ready to send: full pipeline scenario 91

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-hours-web-91",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 097 PASS - restaurant hours ready to send: full pipeline scenario 92

Context:
```json
{
  "input": {
    "channel": "facebook",
    "businessId": "restaurant_demo",
    "senderId": "fb-hours-92",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 098 PASS - restaurant hours ready to send: full pipeline scenario 93

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "restaurant-monday-93",
    "text": "你哋幾點開門？"
  }
}
```

Expected:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "ready_to_send",
  "action": "auto_send",
  "route": "send_to_llm",
  "intent": "hours_location",
  "kb": "restaurant_hours",
  "safety": "pass",
  "safeToSend": true,
  "promotion": "",
  "outbound": "ready_to_send",
  "staffItemId": null
}
```

### 099 PASS - beauty pricing held for staff: full pipeline scenario 94

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "beauty-price-web-94",
    "text": "facial幾錢？"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0058"
}
```

### 100 PASS - beauty pricing held for staff: full pipeline scenario 95

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "from": "beauty-price-wa-95",
    "text": "想問面部護理價錢"
  }
}
```

Expected:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "promotion": ""
}
```

Actual:
```json
{
  "finalStatus": "staff_review",
  "action": "staff_review",
  "route": "send_to_llm",
  "intent": "pricing",
  "kb": "beauty_pricing_facial",
  "safety": "revise",
  "safeToSend": false,
  "promotion": "beauty_may_small_face_trial",
  "outbound": "held",
  "staffItemId": "staff_0059"
}
```

