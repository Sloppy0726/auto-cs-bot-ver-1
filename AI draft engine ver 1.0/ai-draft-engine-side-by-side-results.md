# AI Draft Engine ver 1.0 - Readable Side-by-side Results

Each case compares the business-rules decision with the draft branch, tone, citations, and LLM usage.

Generated at: 2026-05-09T13:31:08.405Z
Total rows: 100
Passed: 100
Failed: 0

## Quick Index

| # | Status | Case | Key result |
|---:|---|---|---|
| 1 | PASS | restaurant hours auto_send returns approved KB answer | auto_send / llm=false |
| 2 | PASS | beauty pricing staff_review calls injected LLM with KB-only source | staff_review / llm=true |
| 3 | PASS | restaurant parking clarify returns deterministic clarification | clarify / llm=false |
| 4 | PASS | education child data handoff produces staff-facing summary | handoff / llm=true |
| 5 | PASS | privacy block returns null draft and quarantine note | block / llm=false |
| 6 | PASS | restaurant hours deterministic auto-send: draft branch coverage 1 | auto_send / llm=false |
| 7 | PASS | restaurant hours deterministic auto-send: draft branch coverage 2 | auto_send / llm=false |
| 8 | PASS | restaurant hours deterministic auto-send: draft branch coverage 3 | auto_send / llm=false |
| 9 | PASS | restaurant hours deterministic auto-send: draft branch coverage 4 | auto_send / llm=false |
| 10 | PASS | beauty pricing staff review draft: draft branch coverage 5 | staff_review / llm=true |
| 11 | PASS | beauty pricing staff review draft: draft branch coverage 6 | staff_review / llm=true |
| 12 | PASS | beauty pricing staff review draft: draft branch coverage 7 | staff_review / llm=true |
| 13 | PASS | beauty pricing staff review draft: draft branch coverage 8 | staff_review / llm=true |
| 14 | PASS | beauty booking staff review draft: draft branch coverage 9 | staff_review / llm=true |
| 15 | PASS | beauty booking staff review draft: draft branch coverage 10 | staff_review / llm=true |
| 16 | PASS | beauty booking staff review draft: draft branch coverage 11 | staff_review / llm=true |
| 17 | PASS | beauty booking staff review draft: draft branch coverage 12 | staff_review / llm=true |
| 18 | PASS | restaurant clarification deterministic: draft branch coverage 13 | clarify / llm=false |
| 19 | PASS | restaurant clarification deterministic: draft branch coverage 14 | clarify / llm=false |
| 20 | PASS | restaurant clarification deterministic: draft branch coverage 15 | clarify / llm=false |
| 21 | PASS | restaurant clarification deterministic: draft branch coverage 16 | clarify / llm=false |
| 22 | PASS | complaint staff-only handoff: draft branch coverage 17 | handoff / llm=true |
| 23 | PASS | complaint staff-only handoff: draft branch coverage 18 | handoff / llm=true |
| 24 | PASS | complaint staff-only handoff: draft branch coverage 19 | handoff / llm=true |
| 25 | PASS | complaint staff-only handoff: draft branch coverage 20 | handoff / llm=true |
| 26 | PASS | privacy block quarantine: draft branch coverage 21 | block / llm=false |
| 27 | PASS | privacy block quarantine: draft branch coverage 22 | block / llm=false |
| 28 | PASS | privacy block quarantine: draft branch coverage 23 | block / llm=false |
| 29 | PASS | restaurant hours deterministic auto-send: draft branch coverage 24 | auto_send / llm=false |
| 30 | PASS | restaurant hours deterministic auto-send: draft branch coverage 25 | auto_send / llm=false |
| 31 | PASS | restaurant hours deterministic auto-send: draft branch coverage 26 | auto_send / llm=false |
| 32 | PASS | restaurant hours deterministic auto-send: draft branch coverage 27 | auto_send / llm=false |
| 33 | PASS | beauty pricing staff review draft: draft branch coverage 28 | staff_review / llm=true |
| 34 | PASS | beauty pricing staff review draft: draft branch coverage 29 | staff_review / llm=true |
| 35 | PASS | beauty pricing staff review draft: draft branch coverage 30 | staff_review / llm=true |
| 36 | PASS | beauty pricing staff review draft: draft branch coverage 31 | staff_review / llm=true |
| 37 | PASS | beauty booking staff review draft: draft branch coverage 32 | staff_review / llm=true |
| 38 | PASS | beauty booking staff review draft: draft branch coverage 33 | staff_review / llm=true |
| 39 | PASS | beauty booking staff review draft: draft branch coverage 34 | staff_review / llm=true |
| 40 | PASS | beauty booking staff review draft: draft branch coverage 35 | staff_review / llm=true |
| 41 | PASS | restaurant clarification deterministic: draft branch coverage 36 | clarify / llm=false |
| 42 | PASS | restaurant clarification deterministic: draft branch coverage 37 | clarify / llm=false |
| 43 | PASS | restaurant clarification deterministic: draft branch coverage 38 | clarify / llm=false |
| 44 | PASS | restaurant clarification deterministic: draft branch coverage 39 | clarify / llm=false |
| 45 | PASS | complaint staff-only handoff: draft branch coverage 40 | handoff / llm=true |
| 46 | PASS | complaint staff-only handoff: draft branch coverage 41 | handoff / llm=true |
| 47 | PASS | complaint staff-only handoff: draft branch coverage 42 | handoff / llm=true |
| 48 | PASS | complaint staff-only handoff: draft branch coverage 43 | handoff / llm=true |
| 49 | PASS | privacy block quarantine: draft branch coverage 44 | block / llm=false |
| 50 | PASS | privacy block quarantine: draft branch coverage 45 | block / llm=false |
| 51 | PASS | privacy block quarantine: draft branch coverage 46 | block / llm=false |
| 52 | PASS | restaurant hours deterministic auto-send: draft branch coverage 47 | auto_send / llm=false |
| 53 | PASS | restaurant hours deterministic auto-send: draft branch coverage 48 | auto_send / llm=false |
| 54 | PASS | restaurant hours deterministic auto-send: draft branch coverage 49 | auto_send / llm=false |
| 55 | PASS | restaurant hours deterministic auto-send: draft branch coverage 50 | auto_send / llm=false |
| 56 | PASS | beauty pricing staff review draft: draft branch coverage 51 | staff_review / llm=true |
| 57 | PASS | beauty pricing staff review draft: draft branch coverage 52 | staff_review / llm=true |
| 58 | PASS | beauty pricing staff review draft: draft branch coverage 53 | staff_review / llm=true |
| 59 | PASS | beauty pricing staff review draft: draft branch coverage 54 | staff_review / llm=true |
| 60 | PASS | beauty booking staff review draft: draft branch coverage 55 | staff_review / llm=true |
| 61 | PASS | beauty booking staff review draft: draft branch coverage 56 | staff_review / llm=true |
| 62 | PASS | beauty booking staff review draft: draft branch coverage 57 | staff_review / llm=true |
| 63 | PASS | beauty booking staff review draft: draft branch coverage 58 | staff_review / llm=true |
| 64 | PASS | restaurant clarification deterministic: draft branch coverage 59 | clarify / llm=false |
| 65 | PASS | restaurant clarification deterministic: draft branch coverage 60 | clarify / llm=false |
| 66 | PASS | restaurant clarification deterministic: draft branch coverage 61 | clarify / llm=false |
| 67 | PASS | restaurant clarification deterministic: draft branch coverage 62 | clarify / llm=false |
| 68 | PASS | complaint staff-only handoff: draft branch coverage 63 | handoff / llm=true |
| 69 | PASS | complaint staff-only handoff: draft branch coverage 64 | handoff / llm=true |
| 70 | PASS | complaint staff-only handoff: draft branch coverage 65 | handoff / llm=true |
| 71 | PASS | complaint staff-only handoff: draft branch coverage 66 | handoff / llm=true |
| 72 | PASS | privacy block quarantine: draft branch coverage 67 | block / llm=false |
| 73 | PASS | privacy block quarantine: draft branch coverage 68 | block / llm=false |
| 74 | PASS | privacy block quarantine: draft branch coverage 69 | block / llm=false |
| 75 | PASS | restaurant hours deterministic auto-send: draft branch coverage 70 | auto_send / llm=false |
| 76 | PASS | restaurant hours deterministic auto-send: draft branch coverage 71 | auto_send / llm=false |
| 77 | PASS | restaurant hours deterministic auto-send: draft branch coverage 72 | auto_send / llm=false |
| 78 | PASS | restaurant hours deterministic auto-send: draft branch coverage 73 | auto_send / llm=false |
| 79 | PASS | beauty pricing staff review draft: draft branch coverage 74 | staff_review / llm=true |
| 80 | PASS | beauty pricing staff review draft: draft branch coverage 75 | staff_review / llm=true |
| 81 | PASS | beauty pricing staff review draft: draft branch coverage 76 | staff_review / llm=true |
| 82 | PASS | beauty pricing staff review draft: draft branch coverage 77 | staff_review / llm=true |
| 83 | PASS | beauty booking staff review draft: draft branch coverage 78 | staff_review / llm=true |
| 84 | PASS | beauty booking staff review draft: draft branch coverage 79 | staff_review / llm=true |
| 85 | PASS | beauty booking staff review draft: draft branch coverage 80 | staff_review / llm=true |
| 86 | PASS | beauty booking staff review draft: draft branch coverage 81 | staff_review / llm=true |
| 87 | PASS | restaurant clarification deterministic: draft branch coverage 82 | clarify / llm=false |
| 88 | PASS | restaurant clarification deterministic: draft branch coverage 83 | clarify / llm=false |
| 89 | PASS | restaurant clarification deterministic: draft branch coverage 84 | clarify / llm=false |
| 90 | PASS | restaurant clarification deterministic: draft branch coverage 85 | clarify / llm=false |
| 91 | PASS | complaint staff-only handoff: draft branch coverage 86 | handoff / llm=true |
| 92 | PASS | complaint staff-only handoff: draft branch coverage 87 | handoff / llm=true |
| 93 | PASS | complaint staff-only handoff: draft branch coverage 88 | handoff / llm=true |
| 94 | PASS | complaint staff-only handoff: draft branch coverage 89 | handoff / llm=true |
| 95 | PASS | privacy block quarantine: draft branch coverage 90 | block / llm=false |
| 96 | PASS | privacy block quarantine: draft branch coverage 91 | block / llm=false |
| 97 | PASS | privacy block quarantine: draft branch coverage 92 | block / llm=false |
| 98 | PASS | restaurant hours deterministic auto-send: draft branch coverage 93 | auto_send / llm=false |
| 99 | PASS | restaurant hours deterministic auto-send: draft branch coverage 94 | auto_send / llm=false |
| 100 | PASS | restaurant hours deterministic auto-send: draft branch coverage 95 | auto_send / llm=false |

## Details

### 001 PASS - restaurant hours auto_send returns approved KB answer

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 002 PASS - beauty pricing staff_review calls injected LLM with KB-only source

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 003 PASS - restaurant parking clarify returns deterministic clarification

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋有冇泊車優惠？",
  "decision": "clarify",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可以講多少少你想了解邊個服務嘅價錢？",
  "reasons": [
    "kb.gap=true",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 004 PASS - education child data handoff produces staff-facing summary

Context:
```json
{
  "businessId": "edu_demo",
  "input": "我個小朋友幼稚園叫XXX，出生日期係...",
  "decision": "handoff",
  "intent": "child_data"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "education",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "education",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：child_data\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=child_data",
    "gateway high risk",
    "handoff: generated staff-facing summary"
  ]
}
```

### 005 PASS - privacy block returns null draft and quarantine note

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 006 PASS - restaurant hours deterministic auto-send: draft branch coverage 1

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 007 PASS - restaurant hours deterministic auto-send: draft branch coverage 2

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 008 PASS - restaurant hours deterministic auto-send: draft branch coverage 3

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 009 PASS - restaurant hours deterministic auto-send: draft branch coverage 4

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 010 PASS - beauty pricing staff review draft: draft branch coverage 5

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 011 PASS - beauty pricing staff review draft: draft branch coverage 6

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想問面部護理價錢",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 012 PASS - beauty pricing staff review draft: draft branch coverage 7

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Signature facial price?",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 013 PASS - beauty pricing staff review draft: draft branch coverage 8

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "首次體驗facial幾錢",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 014 PASS - beauty booking staff review draft: draft branch coverage 9

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 015 PASS - beauty booking staff review draft: draft branch coverage 10

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 016 PASS - beauty booking staff review draft: draft branch coverage 11

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 017 PASS - beauty booking staff review draft: draft branch coverage 12

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 018 PASS - restaurant clarification deterministic: draft branch coverage 13

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋有冇泊車優惠？",
  "decision": "clarify",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可以講多少少你想了解邊個服務嘅價錢？",
  "reasons": [
    "kb.gap=true",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 019 PASS - restaurant clarification deterministic: draft branch coverage 14

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "可唔可以帶狗？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 020 PASS - restaurant clarification deterministic: draft branch coverage 15

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇karaoke房？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 021 PASS - restaurant clarification deterministic: draft branch coverage 16

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇露台位？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 022 PASS - complaint staff-only handoff: draft branch coverage 17

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "你哋搞錯我個booking，我要退錢。",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk",
    "handoff: generated staff-facing summary"
  ]
}
```

### 023 PASS - complaint staff-only handoff: draft branch coverage 18

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要投訴",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "handoff: generated staff-facing summary"
  ]
}
```

### 024 PASS - complaint staff-only handoff: draft branch coverage 19

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "refund please, I am angry",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk",
    "handoff: generated staff-facing summary"
  ]
}
```

### 025 PASS - complaint staff-only handoff: draft branch coverage 20

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "好嬲，點解收多咗錢？",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "handoff: generated staff-facing summary"
  ]
}
```

### 026 PASS - privacy block quarantine: draft branch coverage 21

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 027 PASS - privacy block quarantine: draft branch coverage 22

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 028 PASS - privacy block quarantine: draft branch coverage 23

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 029 PASS - restaurant hours deterministic auto-send: draft branch coverage 24

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 030 PASS - restaurant hours deterministic auto-send: draft branch coverage 25

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 031 PASS - restaurant hours deterministic auto-send: draft branch coverage 26

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 032 PASS - restaurant hours deterministic auto-send: draft branch coverage 27

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 033 PASS - beauty pricing staff review draft: draft branch coverage 28

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 034 PASS - beauty pricing staff review draft: draft branch coverage 29

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想問面部護理價錢",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 035 PASS - beauty pricing staff review draft: draft branch coverage 30

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Signature facial price?",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 036 PASS - beauty pricing staff review draft: draft branch coverage 31

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "首次體驗facial幾錢",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 037 PASS - beauty booking staff review draft: draft branch coverage 32

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 038 PASS - beauty booking staff review draft: draft branch coverage 33

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 039 PASS - beauty booking staff review draft: draft branch coverage 34

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 040 PASS - beauty booking staff review draft: draft branch coverage 35

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 041 PASS - restaurant clarification deterministic: draft branch coverage 36

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋有冇泊車優惠？",
  "decision": "clarify",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可以講多少少你想了解邊個服務嘅價錢？",
  "reasons": [
    "kb.gap=true",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 042 PASS - restaurant clarification deterministic: draft branch coverage 37

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "可唔可以帶狗？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 043 PASS - restaurant clarification deterministic: draft branch coverage 38

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇karaoke房？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 044 PASS - restaurant clarification deterministic: draft branch coverage 39

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇露台位？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 045 PASS - complaint staff-only handoff: draft branch coverage 40

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "你哋搞錯我個booking，我要退錢。",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk",
    "handoff: generated staff-facing summary"
  ]
}
```

### 046 PASS - complaint staff-only handoff: draft branch coverage 41

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要投訴",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "handoff: generated staff-facing summary"
  ]
}
```

### 047 PASS - complaint staff-only handoff: draft branch coverage 42

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "refund please, I am angry",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk",
    "handoff: generated staff-facing summary"
  ]
}
```

### 048 PASS - complaint staff-only handoff: draft branch coverage 43

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "好嬲，點解收多咗錢？",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "handoff: generated staff-facing summary"
  ]
}
```

### 049 PASS - privacy block quarantine: draft branch coverage 44

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 050 PASS - privacy block quarantine: draft branch coverage 45

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 051 PASS - privacy block quarantine: draft branch coverage 46

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 052 PASS - restaurant hours deterministic auto-send: draft branch coverage 47

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 053 PASS - restaurant hours deterministic auto-send: draft branch coverage 48

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 054 PASS - restaurant hours deterministic auto-send: draft branch coverage 49

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 055 PASS - restaurant hours deterministic auto-send: draft branch coverage 50

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 056 PASS - beauty pricing staff review draft: draft branch coverage 51

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 057 PASS - beauty pricing staff review draft: draft branch coverage 52

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想問面部護理價錢",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 058 PASS - beauty pricing staff review draft: draft branch coverage 53

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Signature facial price?",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 059 PASS - beauty pricing staff review draft: draft branch coverage 54

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "首次體驗facial幾錢",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 060 PASS - beauty booking staff review draft: draft branch coverage 55

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 061 PASS - beauty booking staff review draft: draft branch coverage 56

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 062 PASS - beauty booking staff review draft: draft branch coverage 57

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 063 PASS - beauty booking staff review draft: draft branch coverage 58

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 064 PASS - restaurant clarification deterministic: draft branch coverage 59

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋有冇泊車優惠？",
  "decision": "clarify",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可以講多少少你想了解邊個服務嘅價錢？",
  "reasons": [
    "kb.gap=true",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 065 PASS - restaurant clarification deterministic: draft branch coverage 60

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "可唔可以帶狗？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 066 PASS - restaurant clarification deterministic: draft branch coverage 61

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇karaoke房？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 067 PASS - restaurant clarification deterministic: draft branch coverage 62

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇露台位？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 068 PASS - complaint staff-only handoff: draft branch coverage 63

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "你哋搞錯我個booking，我要退錢。",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk",
    "handoff: generated staff-facing summary"
  ]
}
```

### 069 PASS - complaint staff-only handoff: draft branch coverage 64

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要投訴",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "handoff: generated staff-facing summary"
  ]
}
```

### 070 PASS - complaint staff-only handoff: draft branch coverage 65

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "refund please, I am angry",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk",
    "handoff: generated staff-facing summary"
  ]
}
```

### 071 PASS - complaint staff-only handoff: draft branch coverage 66

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "好嬲，點解收多咗錢？",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "handoff: generated staff-facing summary"
  ]
}
```

### 072 PASS - privacy block quarantine: draft branch coverage 67

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 073 PASS - privacy block quarantine: draft branch coverage 68

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 074 PASS - privacy block quarantine: draft branch coverage 69

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 075 PASS - restaurant hours deterministic auto-send: draft branch coverage 70

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 076 PASS - restaurant hours deterministic auto-send: draft branch coverage 71

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 077 PASS - restaurant hours deterministic auto-send: draft branch coverage 72

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 078 PASS - restaurant hours deterministic auto-send: draft branch coverage 73

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 079 PASS - beauty pricing staff review draft: draft branch coverage 74

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 080 PASS - beauty pricing staff review draft: draft branch coverage 75

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想問面部護理價錢",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 081 PASS - beauty pricing staff review draft: draft branch coverage 76

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Signature facial price?",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 082 PASS - beauty pricing staff review draft: draft branch coverage 77

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "首次體驗facial幾錢",
  "decision": "staff_review",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "config.reviewIntents includes pricing",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 083 PASS - beauty booking staff review draft: draft branch coverage 78

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 084 PASS - beauty booking staff review draft: draft branch coverage 79

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 085 PASS - beauty booking staff review draft: draft branch coverage 80

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 086 PASS - beauty booking staff review draft: draft branch coverage 81

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "decision": "staff_review",
  "intent": "booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "staff_review",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "staffNote": "Draft candidate for staff review only.",
  "textPreview": "草稿一：按已核准資料回覆，並由同事覆核後再發出。",
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required",
    "staff_review: generated 1-2 Cantonese draft candidates"
  ]
}
```

### 087 PASS - restaurant clarification deterministic: draft branch coverage 82

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋有冇泊車優惠？",
  "decision": "clarify",
  "intent": "pricing"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可以講多少少你想了解邊個服務嘅價錢？",
  "reasons": [
    "kb.gap=true",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 088 PASS - restaurant clarification deterministic: draft branch coverage 83

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "可唔可以帶狗？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 089 PASS - restaurant clarification deterministic: draft branch coverage 84

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇karaoke房？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 090 PASS - restaurant clarification deterministic: draft branch coverage 85

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇露台位？",
  "decision": "clarify",
  "intent": "general"
}
```

Expected:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "clarify",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [],
  "staffNote": null,
  "textPreview": "唔好意思，可唔可以講多少少你想問咩？",
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5",
    "clarify: returned deterministic clarification text verbatim"
  ]
}
```

### 091 PASS - complaint staff-only handoff: draft branch coverage 86

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "你哋搞錯我個booking，我要退錢。",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk",
    "handoff: generated staff-facing summary"
  ]
}
```

### 092 PASS - complaint staff-only handoff: draft branch coverage 87

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要投訴",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "handoff: generated staff-facing summary"
  ]
}
```

### 093 PASS - complaint staff-only handoff: draft branch coverage 88

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "refund please, I am angry",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk",
    "handoff: generated staff-facing summary"
  ]
}
```

### 094 PASS - complaint staff-only handoff: draft branch coverage 89

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "好嬲，點解收多咗錢？",
  "decision": "handoff",
  "intent": "complaint"
}
```

Expected:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true
}
```

Actual:
```json
{
  "action": "handoff",
  "tone": "luxury_beauty",
  "llmUsed": true,
  "citations": [],
  "staffNote": "Staff-only handoff summary. Do not send to customer.",
  "textPreview": "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。",
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "handoff: generated staff-facing summary"
  ]
}
```

### 095 PASS - privacy block quarantine: draft branch coverage 90

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 096 PASS - privacy block quarantine: draft branch coverage 91

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 097 PASS - privacy block quarantine: draft branch coverage 92

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "decision": "block",
  "intent": "payment"
}
```

Expected:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "block",
  "tone": "luxury_beauty",
  "llmUsed": false,
  "citations": [],
  "staffNote": "Quarantine: privacy gateway blocked this message. Review only inside controlled staff tools; do not send it to any LLM.",
  "textPreview": null,
  "reasons": [
    "gateway.route=block_and_handoff",
    "block: no draft generated"
  ]
}
```

### 098 PASS - restaurant hours deterministic auto-send: draft branch coverage 93

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 099 PASS - restaurant hours deterministic auto-send: draft branch coverage 94

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

### 100 PASS - restaurant hours deterministic auto-send: draft branch coverage 95

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "decision": "auto_send",
  "intent": "hours_location"
}
```

Expected:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false
}
```

Actual:
```json
{
  "action": "auto_send",
  "tone": "friendly_local",
  "llmUsed": false,
  "citations": [
    "restaurant_hours"
  ],
  "staffNote": null,
  "textPreview": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location",
    "auto_send: returned approved KB answer verbatim"
  ]
}
```

