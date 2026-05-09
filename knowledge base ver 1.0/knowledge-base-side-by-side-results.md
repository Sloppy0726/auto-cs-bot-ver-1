# Knowledge Base ver 1.0 - Readable Side-by-side Results

Each case compares sanitized customer text and classifier output with the approved KB match, gap, handoff, and backend-bound signals.

Generated at: 2026-05-09T13:31:08.187Z
Total rows: 100
Passed: 100
Failed: 0

## Quick Index

| # | Status | Case | Key result |
|---:|---|---|---|
| 1 | PASS | beauty: facial pricing in Cantonese | beauty_pricing_facial / pricing |
| 2 | PASS | beauty: opening hours in mixed | beauty_hours / hours_location |
| 3 | PASS | beauty: booking is backend-bound | beauty_booking_policy / booking |
| 4 | PASS | restaurant: tonight 8pm booking | restaurant_booking / booking |
| 5 | PASS | ig shop: stock + shipping | igshop_stock / general |
| 6 | PASS | education: P3 English | edu_p3_english / general |
| 7 | PASS | complaint must hand off (refund) | gap / complaint |
| 8 | PASS | sensitive health hands off (no medical claim) | gap / sensitive_health |
| 9 | PASS | gap: business has no entry for parking | gap / pricing |
| 10 | PASS | unknown business → gap with clarification | gap / pricing |
| 11 | PASS | beauty facial pricing: varied customer wording 1 | beauty_pricing_facial / pricing |
| 12 | PASS | beauty facial pricing: varied customer wording 2 | beauty_pricing_facial / pricing |
| 13 | PASS | beauty facial pricing: varied customer wording 3 | beauty_pricing_facial / pricing |
| 14 | PASS | beauty facial pricing: varied customer wording 4 | beauty_pricing_facial / pricing |
| 15 | PASS | beauty facial pricing: varied customer wording 5 | beauty_pricing_facial / pricing |
| 16 | PASS | beauty hours and branch time: varied customer wording 6 | beauty_hours / hours_location |
| 17 | PASS | beauty hours and branch time: varied customer wording 7 | beauty_hours / hours_location |
| 18 | PASS | beauty hours and branch time: varied customer wording 8 | beauty_hours / hours_location |
| 19 | PASS | beauty hours and branch time: varied customer wording 9 | beauty_hours / hours_location |
| 20 | PASS | beauty hours and branch time: varied customer wording 10 | beauty_hours / hours_location |
| 21 | PASS | beauty booking policy: varied customer wording 11 | beauty_booking_policy / booking |
| 22 | PASS | beauty booking policy: varied customer wording 12 | beauty_booking_policy / booking |
| 23 | PASS | beauty booking policy: varied customer wording 13 | beauty_booking_policy / booking |
| 24 | PASS | beauty booking policy: varied customer wording 14 | beauty_booking_policy / booking |
| 25 | PASS | beauty booking policy: varied customer wording 15 | beauty_booking_policy / booking |
| 26 | PASS | beauty no medical claim service info: varied customer wording 16 | beauty_no_medical_claim / aftercare |
| 27 | PASS | beauty no medical claim service info: varied customer wording 17 | beauty_no_medical_claim / general |
| 28 | PASS | beauty no medical claim service info: varied customer wording 18 | beauty_no_medical_claim / service_info |
| 29 | PASS | beauty no medical claim service info: varied customer wording 19 | beauty_no_medical_claim / general |
| 30 | PASS | beauty no medical claim service info: varied customer wording 20 | beauty_no_medical_claim / service_info |
| 31 | PASS | restaurant hours: varied customer wording 21 | restaurant_hours / hours_location |
| 32 | PASS | restaurant hours: varied customer wording 22 | restaurant_hours / hours_location |
| 33 | PASS | restaurant hours: varied customer wording 23 | restaurant_hours / hours_location |
| 34 | PASS | restaurant hours: varied customer wording 24 | restaurant_hours / hours_location |
| 35 | PASS | restaurant hours: varied customer wording 25 | restaurant_hours / hours_location |
| 36 | PASS | restaurant booking: varied customer wording 26 | restaurant_booking / booking |
| 37 | PASS | restaurant booking: varied customer wording 27 | restaurant_booking / booking |
| 38 | PASS | restaurant booking: varied customer wording 28 | restaurant_booking / booking |
| 39 | PASS | restaurant booking: varied customer wording 29 | restaurant_booking / booking |
| 40 | PASS | restaurant booking: varied customer wording 30 | restaurant_booking / booking |
| 41 | PASS | IG shop stock and shipping: varied customer wording 31 | igshop_stock / general |
| 42 | PASS | IG shop stock and shipping: varied customer wording 32 | igshop_shipping / general |
| 43 | PASS | IG shop stock and shipping: varied customer wording 33 | igshop_stock / general |
| 44 | PASS | IG shop stock and shipping: varied customer wording 34 | igshop_shipping / general |
| 45 | PASS | IG shop stock and shipping: varied customer wording 35 | igshop_shipping / pricing |
| 46 | PASS | education P3 English: varied customer wording 36 | edu_p3_english / general |
| 47 | PASS | education P3 English: varied customer wording 37 | edu_p3_english / general |
| 48 | PASS | education P3 English: varied customer wording 38 | edu_p3_english / general |
| 49 | PASS | education P3 English: varied customer wording 39 | edu_p3_english / general |
| 50 | PASS | education P3 English: varied customer wording 40 | edu_p3_english / general |
| 51 | PASS | education pricing: varied customer wording 41 | edu_pricing / pricing |
| 52 | PASS | education pricing: varied customer wording 42 | edu_pricing / general |
| 53 | PASS | education pricing: varied customer wording 43 | edu_pricing / pricing |
| 54 | PASS | education pricing: varied customer wording 44 | edu_pricing / pricing |
| 55 | PASS | education pricing: varied customer wording 45 | edu_pricing / pricing |
| 56 | PASS | mandatory handoff: varied customer wording 46 | gap / complaint |
| 57 | PASS | mandatory handoff: varied customer wording 47 | gap / complaint |
| 58 | PASS | mandatory handoff: varied customer wording 48 | gap / sensitive_health |
| 59 | PASS | mandatory handoff: varied customer wording 49 | gap / human_request |
| 60 | PASS | mandatory handoff: varied customer wording 50 | gap / child_data |
| 61 | PASS | knowledge gap: varied customer wording 51 | gap / pricing |
| 62 | PASS | knowledge gap: varied customer wording 52 | gap / general |
| 63 | PASS | knowledge gap: varied customer wording 53 | gap / general |
| 64 | PASS | knowledge gap: varied customer wording 54 | gap / general |
| 65 | PASS | knowledge gap: varied customer wording 55 | gap / general |
| 66 | PASS | beauty facial pricing: varied customer wording 56 | beauty_pricing_facial / pricing |
| 67 | PASS | beauty facial pricing: varied customer wording 57 | beauty_pricing_facial / pricing |
| 68 | PASS | beauty facial pricing: varied customer wording 58 | beauty_pricing_facial / pricing |
| 69 | PASS | beauty facial pricing: varied customer wording 59 | beauty_pricing_facial / pricing |
| 70 | PASS | beauty facial pricing: varied customer wording 60 | beauty_pricing_facial / pricing |
| 71 | PASS | beauty hours and branch time: varied customer wording 61 | beauty_hours / hours_location |
| 72 | PASS | beauty hours and branch time: varied customer wording 62 | beauty_hours / hours_location |
| 73 | PASS | beauty hours and branch time: varied customer wording 63 | beauty_hours / hours_location |
| 74 | PASS | beauty hours and branch time: varied customer wording 64 | beauty_hours / hours_location |
| 75 | PASS | beauty hours and branch time: varied customer wording 65 | beauty_hours / hours_location |
| 76 | PASS | beauty booking policy: varied customer wording 66 | beauty_booking_policy / booking |
| 77 | PASS | beauty booking policy: varied customer wording 67 | beauty_booking_policy / booking |
| 78 | PASS | beauty booking policy: varied customer wording 68 | beauty_booking_policy / booking |
| 79 | PASS | beauty booking policy: varied customer wording 69 | beauty_booking_policy / booking |
| 80 | PASS | beauty booking policy: varied customer wording 70 | beauty_booking_policy / booking |
| 81 | PASS | beauty no medical claim service info: varied customer wording 71 | beauty_no_medical_claim / aftercare |
| 82 | PASS | beauty no medical claim service info: varied customer wording 72 | beauty_no_medical_claim / general |
| 83 | PASS | beauty no medical claim service info: varied customer wording 73 | beauty_no_medical_claim / service_info |
| 84 | PASS | beauty no medical claim service info: varied customer wording 74 | beauty_no_medical_claim / general |
| 85 | PASS | beauty no medical claim service info: varied customer wording 75 | beauty_no_medical_claim / service_info |
| 86 | PASS | restaurant hours: varied customer wording 76 | restaurant_hours / hours_location |
| 87 | PASS | restaurant hours: varied customer wording 77 | restaurant_hours / hours_location |
| 88 | PASS | restaurant hours: varied customer wording 78 | restaurant_hours / hours_location |
| 89 | PASS | restaurant hours: varied customer wording 79 | restaurant_hours / hours_location |
| 90 | PASS | restaurant hours: varied customer wording 80 | restaurant_hours / hours_location |
| 91 | PASS | restaurant booking: varied customer wording 81 | restaurant_booking / booking |
| 92 | PASS | restaurant booking: varied customer wording 82 | restaurant_booking / booking |
| 93 | PASS | restaurant booking: varied customer wording 83 | restaurant_booking / booking |
| 94 | PASS | restaurant booking: varied customer wording 84 | restaurant_booking / booking |
| 95 | PASS | restaurant booking: varied customer wording 85 | restaurant_booking / booking |
| 96 | PASS | IG shop stock and shipping: varied customer wording 86 | igshop_stock / general |
| 97 | PASS | IG shop stock and shipping: varied customer wording 87 | igshop_shipping / general |
| 98 | PASS | IG shop stock and shipping: varied customer wording 88 | igshop_stock / general |
| 99 | PASS | IG shop stock and shipping: varied customer wording 89 | igshop_shipping / general |
| 100 | PASS | IG shop stock and shipping: varied customer wording 90 | igshop_shipping / pricing |

## Details

### 001 PASS - beauty: facial pricing in Cantonese

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "做完會唔會即刻見效？幾錢？有冇副作用？",
  "sanitizedText": "做完會唔會即刻見效？幾錢？有冇副作用？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial",
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 002 PASS - beauty: opening hours in mixed

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Causeway Bay店今晚幾點收工？",
  "sanitizedText": "Causeway Bay店今晚幾點收工？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 003 PASS - beauty: booking is backend-bound

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 004 PASS - restaurant: tonight 8pm booking

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "今晚8點有冇位？",
  "sanitizedText": "今晚8點有冇位？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1,
  "primaryIntent": "booking",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 005 PASS - ig shop: stock + shipping

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "呢件有冇現貨？包唔包順豐？",
  "sanitizedText": "呢件有冇現貨？包唔包順豐？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_stock",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "clarification": ""
}
```

### 006 PASS - education: P3 English

Context:
```json
{
  "businessId": "edu_demo",
  "input": "我個小朋友P3，英文好差，有咩班？",
  "sanitizedText": "我個小朋友P3，英文好差，有咩班？"
}
```

Expected:
```json
{
  "bestMatchId": "edu_p3_english",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_p3_english",
  "score": 0.6,
  "primaryIntent": "general",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_p3_english"
  ],
  "clarification": ""
}
```

### 007 PASS - complaint must hand off (refund)

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "你哋搞錯我個booking，我要退錢。",
  "sanitizedText": "你哋搞錯我個booking，我要退錢。"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": false,
  "handoff": true
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "complaint",
  "language": "mixed",
  "gap": false,
  "handoff": true,
  "backendBound": false,
  "grounding": [],
  "clarification": ""
}
```

### 008 PASS - sensitive health hands off (no medical claim)

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我懷孕緊，可唔可以做laser？",
  "sanitizedText": "我懷孕緊，可唔可以做laser？"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "handoff": true
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "sensitive_health",
  "language": "mixed",
  "gap": false,
  "handoff": true,
  "backendBound": false,
  "grounding": [],
  "clarification": ""
}
```

### 009 PASS - gap: business has no entry for parking

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋有冇泊車優惠？",
  "sanitizedText": "你哋有冇泊車優惠？"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": true,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": true,
  "handoff": false,
  "backendBound": false,
  "grounding": [],
  "clarification": "唔好意思，可以講多少少你想了解邊個服務嘅價錢？"
}
```

### 010 PASS - unknown business → gap with clarification

Context:
```json
{
  "businessId": "unknown_business",
  "input": "幾錢呀？",
  "sanitizedText": "幾錢呀？"
}
```

Expected:
```json
{
  "bestMatchId": "",
  "gap": true,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": true,
  "handoff": false,
  "backendBound": false,
  "grounding": [],
  "clarification": "唔好意思，可以講多少少你想了解邊個服務嘅價錢？"
}
```

### 011 PASS - beauty facial pricing: varied customer wording 1

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "sanitizedText": "facial幾錢？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 012 PASS - beauty facial pricing: varied customer wording 2

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想問面部護理價錢",
  "sanitizedText": "想問面部護理價錢"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 013 PASS - beauty facial pricing: varied customer wording 3

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Signature facial price?",
  "sanitizedText": "Signature facial price?"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "en",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 014 PASS - beauty facial pricing: varied customer wording 4

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "面部護理有冇套票？",
  "sanitizedText": "面部護理有冇套票？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 015 PASS - beauty facial pricing: varied customer wording 5

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "首次體驗facial幾錢",
  "sanitizedText": "首次體驗facial幾錢"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 016 PASS - beauty hours and branch time: varied customer wording 6

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "幾點開門？",
  "sanitizedText": "幾點開門？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 017 PASS - beauty hours and branch time: varied customer wording 7

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Causeway Bay店幾點收工？",
  "sanitizedText": "Causeway Bay店幾點收工？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 018 PASS - beauty hours and branch time: varied customer wording 8

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Sunday幾點close?",
  "sanitizedText": "Sunday幾點close?"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 019 PASS - beauty hours and branch time: varied customer wording 9

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "公眾假期幾點開門？",
  "sanitizedText": "公眾假期幾點開門？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 020 PASS - beauty hours and branch time: varied customer wording 10

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "營業時間幾點？",
  "sanitizedText": "營業時間幾點？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 021 PASS - beauty booking policy: varied customer wording 11

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 022 PASS - beauty booking policy: varied customer wording 12

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 023 PASS - beauty booking policy: varied customer wording 13

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 024 PASS - beauty booking policy: varied customer wording 14

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 025 PASS - beauty booking policy: varied customer wording 15

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 026 PASS - beauty no medical claim service info: varied customer wording 16

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "做完會唔會見效？",
  "sanitizedText": "做完會唔會見效？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "score": 0.4,
  "primaryIntent": "aftercare",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 027 PASS - beauty no medical claim service info: varied customer wording 17

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "有冇副作用？",
  "sanitizedText": "有冇副作用？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 028 PASS - beauty no medical claim service info: varied customer wording 18

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "效果好唔好？",
  "sanitizedText": "效果好唔好？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "score": 1.2,
  "primaryIntent": "service_info",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 029 PASS - beauty no medical claim service info: varied customer wording 19

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "見效快唔快？",
  "sanitizedText": "見效快唔快？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 030 PASS - beauty no medical claim service info: varied customer wording 20

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "療程效果因人而異嗎？",
  "sanitizedText": "療程效果因人而異嗎？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "score": 1,
  "primaryIntent": "service_info",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 031 PASS - restaurant hours: varied customer wording 21

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "sanitizedText": "你哋幾點開門？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "restaurant_hours"
  ],
  "clarification": ""
}
```

### 032 PASS - restaurant hours: varied customer wording 22

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "lunch幾點開始？",
  "sanitizedText": "lunch幾點開始？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_hours",
  "score": 1,
  "primaryIntent": "hours_location",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "restaurant_hours"
  ],
  "clarification": ""
}
```

### 033 PASS - restaurant hours: varied customer wording 23

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "星期一幾點開門？",
  "sanitizedText": "星期一幾點開門？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "restaurant_hours"
  ],
  "clarification": ""
}
```

### 034 PASS - restaurant hours: varied customer wording 24

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "dinner幾點open?",
  "sanitizedText": "dinner幾點open?"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "restaurant_hours"
  ],
  "clarification": ""
}
```

### 035 PASS - restaurant hours: varied customer wording 25

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "營業時間幾點？",
  "sanitizedText": "營業時間幾點？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "restaurant_hours"
  ],
  "clarification": ""
}
```

### 036 PASS - restaurant booking: varied customer wording 26

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "今晚8點有冇位？",
  "sanitizedText": "今晚8點有冇位？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1,
  "primaryIntent": "booking",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 037 PASS - restaurant booking: varied customer wording 27

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "想book table for 2",
  "sanitizedText": "想book table for 2"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 038 PASS - restaurant booking: varied customer wording 28

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "聽晚有冇位食飯？",
  "sanitizedText": "聽晚有冇位食飯？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1,
  "primaryIntent": "booking",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 039 PASS - restaurant booking: varied customer wording 29

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "reserve dinner table please",
  "sanitizedText": "reserve dinner table please"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "en",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 040 PASS - restaurant booking: varied customer wording 30

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "聽晚有冇位食飯？",
  "sanitizedText": "聽晚有冇位食飯？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1,
  "primaryIntent": "booking",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 041 PASS - IG shop stock and shipping: varied customer wording 31

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "呢件有冇現貨？",
  "sanitizedText": "呢件有冇現貨？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_stock",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_stock"
  ],
  "clarification": ""
}
```

### 042 PASS - IG shop stock and shipping: varied customer wording 32

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "包唔包順豐？",
  "sanitizedText": "包唔包順豐？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_shipping",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_shipping"
  ],
  "clarification": ""
}
```

### 043 PASS - IG shop stock and shipping: varied customer wording 33

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "有冇貨呀？",
  "sanitizedText": "有冇貨呀？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_stock",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_stock"
  ],
  "clarification": ""
}
```

### 044 PASS - IG shop stock and shipping: varied customer wording 34

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "SF locker shipping點計？",
  "sanitizedText": "SF locker shipping點計？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_shipping",
  "score": 0.6,
  "primaryIntent": "general",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_shipping"
  ],
  "clarification": ""
}
```

### 045 PASS - IG shop stock and shipping: varied customer wording 35

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "運費幾錢？",
  "sanitizedText": "運費幾錢？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_shipping",
  "score": 0.4,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_shipping"
  ],
  "clarification": ""
}
```

### 046 PASS - education P3 English: varied customer wording 36

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3英文有咩班？",
  "sanitizedText": "P3英文有咩班？"
}
```

Expected:
```json
{
  "bestMatchId": "edu_p3_english",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_p3_english",
  "score": 0.6,
  "primaryIntent": "general",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_p3_english"
  ],
  "clarification": ""
}
```

### 047 PASS - education P3 English: varied customer wording 37

Context:
```json
{
  "businessId": "edu_demo",
  "input": "小三英文班點上？",
  "sanitizedText": "小三英文班點上？"
}
```

Expected:
```json
{
  "bestMatchId": "edu_p3_english",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_p3_english",
  "score": 0.6,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_p3_english"
  ],
  "clarification": ""
}
```

### 048 PASS - education P3 English: varied customer wording 38

Context:
```json
{
  "businessId": "edu_demo",
  "input": "我個小朋友英文好差",
  "sanitizedText": "我個小朋友英文好差"
}
```

Expected:
```json
{
  "bestMatchId": "edu_p3_english",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_p3_english",
  "score": 0.6,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_p3_english"
  ],
  "clarification": ""
}
```

### 049 PASS - education P3 English: varied customer wording 39

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3 English class details",
  "sanitizedText": "P3 English class details"
}
```

Expected:
```json
{
  "bestMatchId": "edu_p3_english",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_p3_english",
  "score": 0.6,
  "primaryIntent": "general",
  "language": "en",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_p3_english"
  ],
  "clarification": ""
}
```

### 050 PASS - education P3 English: varied customer wording 40

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3英文有咩班？",
  "sanitizedText": "P3英文有咩班？"
}
```

Expected:
```json
{
  "bestMatchId": "edu_p3_english",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_p3_english",
  "score": 0.6,
  "primaryIntent": "general",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_p3_english"
  ],
  "clarification": ""
}
```

### 051 PASS - education pricing: varied customer wording 41

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3英文班幾錢？",
  "sanitizedText": "P3英文班幾錢？"
}
```

Expected:
```json
{
  "bestMatchId": "edu_pricing",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_pricing",
  "score": 1,
  "primaryIntent": "pricing",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_pricing",
    "edu_p3_english"
  ],
  "clarification": ""
}
```

### 052 PASS - education pricing: varied customer wording 42

Context:
```json
{
  "businessId": "edu_demo",
  "input": "學費點計？",
  "sanitizedText": "學費點計？"
}
```

Expected:
```json
{
  "bestMatchId": "edu_pricing",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_pricing",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_pricing"
  ],
  "clarification": ""
}
```

### 053 PASS - education pricing: varied customer wording 43

Context:
```json
{
  "businessId": "edu_demo",
  "input": "course fee please",
  "sanitizedText": "course fee please"
}
```

Expected:
```json
{
  "bestMatchId": "edu_pricing",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_pricing",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "en",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_pricing"
  ],
  "clarification": ""
}
```

### 054 PASS - education pricing: varied customer wording 44

Context:
```json
{
  "businessId": "edu_demo",
  "input": "10堂有冇優惠？",
  "sanitizedText": "10堂有冇優惠？"
}
```

Expected:
```json
{
  "bestMatchId": "edu_pricing",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_pricing",
  "score": 0.6,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_pricing"
  ],
  "clarification": ""
}
```

### 055 PASS - education pricing: varied customer wording 45

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3英文班幾錢？",
  "sanitizedText": "P3英文班幾錢？"
}
```

Expected:
```json
{
  "bestMatchId": "edu_pricing",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "edu_pricing",
  "score": 1,
  "primaryIntent": "pricing",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "edu_pricing",
    "edu_p3_english"
  ],
  "clarification": ""
}
```

### 056 PASS - mandatory handoff: varied customer wording 46

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "你哋搞錯我個booking，我要退錢。",
  "sanitizedText": "你哋搞錯我個booking，我要退錢。"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": false,
  "handoff": true
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "complaint",
  "language": "mixed",
  "gap": false,
  "handoff": true,
  "backendBound": false,
  "grounding": [],
  "clarification": ""
}
```

### 057 PASS - mandatory handoff: varied customer wording 47

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要投訴",
  "sanitizedText": "我要投訴"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": false,
  "handoff": true
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "complaint",
  "language": "zh-HK",
  "gap": false,
  "handoff": true,
  "backendBound": false,
  "grounding": [],
  "clarification": ""
}
```

### 058 PASS - mandatory handoff: varied customer wording 48

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我懷孕緊可唔可以做laser？",
  "sanitizedText": "我懷孕緊可唔可以做laser？"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": false,
  "handoff": true
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "sensitive_health",
  "language": "mixed",
  "gap": false,
  "handoff": true,
  "backendBound": false,
  "grounding": [],
  "clarification": ""
}
```

### 059 PASS - mandatory handoff: varied customer wording 49

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要搵真人傾",
  "sanitizedText": "我要搵真人傾"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": false,
  "handoff": true
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "human_request",
  "language": "zh-HK",
  "gap": false,
  "handoff": true,
  "backendBound": false,
  "grounding": [],
  "clarification": ""
}
```

### 060 PASS - mandatory handoff: varied customer wording 50

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "小朋友出生日期要畀你哋嗎？",
  "sanitizedText": "小朋友出生日期要畀你哋嗎？"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": false,
  "handoff": true
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "child_data",
  "language": "zh-HK",
  "gap": false,
  "handoff": true,
  "backendBound": false,
  "grounding": [],
  "clarification": ""
}
```

### 061 PASS - knowledge gap: varied customer wording 51

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋有冇泊車優惠？",
  "sanitizedText": "你哋有冇泊車優惠？"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": true,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": true,
  "handoff": false,
  "backendBound": false,
  "grounding": [],
  "clarification": "唔好意思，可以講多少少你想了解邊個服務嘅價錢？"
}
```

### 062 PASS - knowledge gap: varied customer wording 52

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "可唔可以帶狗？",
  "sanitizedText": "可唔可以帶狗？"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": true,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": true,
  "handoff": false,
  "backendBound": false,
  "grounding": [],
  "clarification": "唔好意思，可唔可以講多少少你想問咩？"
}
```

### 063 PASS - knowledge gap: varied customer wording 53

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇karaoke房？",
  "sanitizedText": "有冇karaoke房？"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": true,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "general",
  "language": "mixed",
  "gap": true,
  "handoff": false,
  "backendBound": false,
  "grounding": [],
  "clarification": "唔好意思，可唔可以講多少少你想問咩？"
}
```

### 064 PASS - knowledge gap: varied customer wording 54

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "可唔可以用消費券？",
  "sanitizedText": "可唔可以用消費券？"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": true,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": true,
  "handoff": false,
  "backendBound": false,
  "grounding": [],
  "clarification": "唔好意思，可唔可以講多少少你想問咩？"
}
```

### 065 PASS - knowledge gap: varied customer wording 55

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇露台位？",
  "sanitizedText": "有冇露台位？"
}
```

Expected:
```json
{
  "bestMatchId": null,
  "gap": true,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": null,
  "score": null,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": true,
  "handoff": false,
  "backendBound": false,
  "grounding": [],
  "clarification": "唔好意思，可唔可以講多少少你想問咩？"
}
```

### 066 PASS - beauty facial pricing: varied customer wording 56

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "sanitizedText": "facial幾錢？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 067 PASS - beauty facial pricing: varied customer wording 57

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想問面部護理價錢",
  "sanitizedText": "想問面部護理價錢"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 068 PASS - beauty facial pricing: varied customer wording 58

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Signature facial price?",
  "sanitizedText": "Signature facial price?"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "en",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 069 PASS - beauty facial pricing: varied customer wording 59

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "面部護理有冇套票？",
  "sanitizedText": "面部護理有冇套票？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 070 PASS - beauty facial pricing: varied customer wording 60

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "首次體驗facial幾錢",
  "sanitizedText": "首次體驗facial幾錢"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "gap": false,
  "handoff": false,
  "backendBound": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_pricing_facial",
  "score": 1.2,
  "primaryIntent": "pricing",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 071 PASS - beauty hours and branch time: varied customer wording 61

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "幾點開門？",
  "sanitizedText": "幾點開門？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 072 PASS - beauty hours and branch time: varied customer wording 62

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Causeway Bay店幾點收工？",
  "sanitizedText": "Causeway Bay店幾點收工？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 073 PASS - beauty hours and branch time: varied customer wording 63

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Sunday幾點close?",
  "sanitizedText": "Sunday幾點close?"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 074 PASS - beauty hours and branch time: varied customer wording 64

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "公眾假期幾點開門？",
  "sanitizedText": "公眾假期幾點開門？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 075 PASS - beauty hours and branch time: varied customer wording 65

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "營業時間幾點？",
  "sanitizedText": "營業時間幾點？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_hours"
  ],
  "clarification": ""
}
```

### 076 PASS - beauty booking policy: varied customer wording 66

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 077 PASS - beauty booking policy: varied customer wording 67

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 078 PASS - beauty booking policy: varied customer wording 68

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 079 PASS - beauty booking policy: varied customer wording 69

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 080 PASS - beauty booking policy: varied customer wording 70

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "sanitizedText": "想book今晚個facial有冇位"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "beauty_booking_policy",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "clarification": ""
}
```

### 081 PASS - beauty no medical claim service info: varied customer wording 71

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "做完會唔會見效？",
  "sanitizedText": "做完會唔會見效？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "score": 0.4,
  "primaryIntent": "aftercare",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 082 PASS - beauty no medical claim service info: varied customer wording 72

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "有冇副作用？",
  "sanitizedText": "有冇副作用？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 083 PASS - beauty no medical claim service info: varied customer wording 73

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "效果好唔好？",
  "sanitizedText": "效果好唔好？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "score": 1.2,
  "primaryIntent": "service_info",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 084 PASS - beauty no medical claim service info: varied customer wording 74

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "見效快唔快？",
  "sanitizedText": "見效快唔快？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 085 PASS - beauty no medical claim service info: varied customer wording 75

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "療程效果因人而異嗎？",
  "sanitizedText": "療程效果因人而異嗎？"
}
```

Expected:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "beauty_no_medical_claim",
  "score": 1,
  "primaryIntent": "service_info",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "beauty_no_medical_claim"
  ],
  "clarification": ""
}
```

### 086 PASS - restaurant hours: varied customer wording 76

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "sanitizedText": "你哋幾點開門？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "restaurant_hours"
  ],
  "clarification": ""
}
```

### 087 PASS - restaurant hours: varied customer wording 77

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "lunch幾點開始？",
  "sanitizedText": "lunch幾點開始？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_hours",
  "score": 1,
  "primaryIntent": "hours_location",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "restaurant_hours"
  ],
  "clarification": ""
}
```

### 088 PASS - restaurant hours: varied customer wording 78

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "星期一幾點開門？",
  "sanitizedText": "星期一幾點開門？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "restaurant_hours"
  ],
  "clarification": ""
}
```

### 089 PASS - restaurant hours: varied customer wording 79

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "dinner幾點open?",
  "sanitizedText": "dinner幾點open?"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "restaurant_hours"
  ],
  "clarification": ""
}
```

### 090 PASS - restaurant hours: varied customer wording 80

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "營業時間幾點？",
  "sanitizedText": "營業時間幾點？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_hours",
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_hours",
  "score": 1.2,
  "primaryIntent": "hours_location",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "restaurant_hours"
  ],
  "clarification": ""
}
```

### 091 PASS - restaurant booking: varied customer wording 81

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "今晚8點有冇位？",
  "sanitizedText": "今晚8點有冇位？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1,
  "primaryIntent": "booking",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 092 PASS - restaurant booking: varied customer wording 82

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "想book table for 2",
  "sanitizedText": "想book table for 2"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 093 PASS - restaurant booking: varied customer wording 83

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "聽晚有冇位食飯？",
  "sanitizedText": "聽晚有冇位食飯？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1,
  "primaryIntent": "booking",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 094 PASS - restaurant booking: varied customer wording 84

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "reserve dinner table please",
  "sanitizedText": "reserve dinner table please"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1.2,
  "primaryIntent": "booking",
  "language": "en",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 095 PASS - restaurant booking: varied customer wording 85

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "聽晚有冇位食飯？",
  "sanitizedText": "聽晚有冇位食飯？"
}
```

Expected:
```json
{
  "bestMatchId": "restaurant_booking",
  "gap": false,
  "handoff": false,
  "backendBound": true
}
```

Actual:
```json
{
  "bestMatchId": "restaurant_booking",
  "score": 1,
  "primaryIntent": "booking",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": true,
  "grounding": [
    "restaurant_booking"
  ],
  "clarification": ""
}
```

### 096 PASS - IG shop stock and shipping: varied customer wording 86

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "呢件有冇現貨？",
  "sanitizedText": "呢件有冇現貨？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_stock",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_stock"
  ],
  "clarification": ""
}
```

### 097 PASS - IG shop stock and shipping: varied customer wording 87

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "包唔包順豐？",
  "sanitizedText": "包唔包順豐？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_shipping",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_shipping"
  ],
  "clarification": ""
}
```

### 098 PASS - IG shop stock and shipping: varied customer wording 88

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "有冇貨呀？",
  "sanitizedText": "有冇貨呀？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_stock",
  "score": 0.4,
  "primaryIntent": "general",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_stock"
  ],
  "clarification": ""
}
```

### 099 PASS - IG shop stock and shipping: varied customer wording 89

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "SF locker shipping點計？",
  "sanitizedText": "SF locker shipping點計？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_shipping",
  "score": 0.6,
  "primaryIntent": "general",
  "language": "mixed",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_shipping"
  ],
  "clarification": ""
}
```

### 100 PASS - IG shop stock and shipping: varied customer wording 90

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "運費幾錢？",
  "sanitizedText": "運費幾錢？"
}
```

Expected:
```json
{
  "bestMatchId": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "gap": false,
  "handoff": false
}
```

Actual:
```json
{
  "bestMatchId": "igshop_shipping",
  "score": 0.4,
  "primaryIntent": "pricing",
  "language": "zh-HK",
  "gap": false,
  "handoff": false,
  "backendBound": false,
  "grounding": [
    "igshop_shipping"
  ],
  "clarification": ""
}
```

