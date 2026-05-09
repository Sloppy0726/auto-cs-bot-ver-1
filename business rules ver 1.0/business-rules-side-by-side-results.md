# Business Rules ver 1.0 - Readable Side-by-side Results

Each case compares the expected policy route with the actual deterministic decision and capability contract.

Generated at: 2026-05-09T13:31:08.251Z
Total rows: 100
Passed: 100
Failed: 0

## Quick Index

| # | Status | Case | Key result |
|---:|---|---|---|
| 1 | PASS | beauty hours: archetype allows hours_location auto_send (no $/digits in answer? — has 11:00, so trips ask-staff-before-promise → review) | staff_review |
| 2 | PASS | restaurant hours: archetype allows + no digit-trip mode → auto_send | auto_send |
| 3 | PASS | beauty pricing: askStaffBeforePromise + reviewIntents → staff_review | staff_review |
| 4 | PASS | beauty booking: backendBound → staff_review with confirm_booking forbidden | staff_review |
| 5 | PASS | restaurant booking: backendBound → staff_review | staff_review |
| 6 | PASS | complaint: angry refund → handoff with escalation | handoff / complaint |
| 7 | PASS | sensitive health: pregnancy + laser → handoff | handoff / sensitive_health |
| 8 | PASS | child data: school + birth date → handoff | handoff / child_data |
| 9 | PASS | human request → handoff | handoff / human_request |
| 10 | PASS | ig shop stock query: non-backend, score-driven, ask_clarification path or auto_send | clarify |
| 11 | PASS | ig shop unknown: parking has no KB entry → clarify | clarify |
| 12 | PASS | credit-card-like number → block | block / privacy_block |
| 13 | PASS | restaurant hours auto-send: varied wording 1 | auto_send |
| 14 | PASS | restaurant hours auto-send: varied wording 2 | auto_send |
| 15 | PASS | restaurant hours auto-send: varied wording 3 | auto_send |
| 16 | PASS | restaurant hours auto-send: varied wording 4 | auto_send |
| 17 | PASS | beauty pricing staff review: varied wording 5 | staff_review |
| 18 | PASS | beauty pricing staff review: varied wording 6 | staff_review |
| 19 | PASS | beauty pricing staff review: varied wording 7 | staff_review |
| 20 | PASS | beauty pricing staff review: varied wording 8 | staff_review |
| 21 | PASS | beauty booking backend staff review: varied wording 9 | staff_review |
| 22 | PASS | beauty booking backend staff review: varied wording 10 | staff_review |
| 23 | PASS | beauty booking backend staff review: varied wording 11 | staff_review |
| 24 | PASS | beauty booking backend staff review: varied wording 12 | staff_review |
| 25 | PASS | restaurant booking staff review: varied wording 13 | staff_review |
| 26 | PASS | restaurant booking staff review: varied wording 14 | staff_review |
| 27 | PASS | restaurant booking staff review: varied wording 15 | staff_review |
| 28 | PASS | restaurant booking staff review: varied wording 16 | staff_review |
| 29 | PASS | complaint handoff: varied wording 17 | handoff / complaint |
| 30 | PASS | complaint handoff: varied wording 18 | handoff / complaint |
| 31 | PASS | complaint handoff: varied wording 19 | handoff / complaint |
| 32 | PASS | complaint handoff: varied wording 20 | handoff / complaint |
| 33 | PASS | sensitive health handoff: varied wording 21 | handoff / sensitive_health |
| 34 | PASS | sensitive health handoff: varied wording 22 | handoff / sensitive_health |
| 35 | PASS | sensitive health handoff: varied wording 23 | handoff / sensitive_health |
| 36 | PASS | human request handoff: varied wording 24 | handoff / human_request |
| 37 | PASS | human request handoff: varied wording 25 | handoff / human_request |
| 38 | PASS | human request handoff: varied wording 26 | handoff / human_request |
| 39 | PASS | human request handoff: varied wording 27 | handoff / human_request |
| 40 | PASS | education pricing review: varied wording 28 | staff_review |
| 41 | PASS | education pricing review: varied wording 29 | staff_review |
| 42 | PASS | education pricing review: varied wording 30 | staff_review |
| 43 | PASS | IG shop service info conservative paths: varied wording 31 | clarify |
| 44 | PASS | IG shop service info conservative paths: varied wording 32 | clarify |
| 45 | PASS | IG shop service info conservative paths: varied wording 33 | clarify |
| 46 | PASS | IG shop service info conservative paths: varied wording 34 | clarify |
| 47 | PASS | restaurant unknown clarification: varied wording 35 | clarify |
| 48 | PASS | restaurant unknown clarification: varied wording 36 | clarify |
| 49 | PASS | restaurant unknown clarification: varied wording 37 | clarify |
| 50 | PASS | restaurant hours auto-send: varied wording 38 | auto_send |
| 51 | PASS | restaurant hours auto-send: varied wording 39 | auto_send |
| 52 | PASS | restaurant hours auto-send: varied wording 40 | auto_send |
| 53 | PASS | restaurant hours auto-send: varied wording 41 | auto_send |
| 54 | PASS | beauty pricing staff review: varied wording 42 | staff_review |
| 55 | PASS | beauty pricing staff review: varied wording 43 | staff_review |
| 56 | PASS | beauty pricing staff review: varied wording 44 | staff_review |
| 57 | PASS | beauty pricing staff review: varied wording 45 | staff_review |
| 58 | PASS | beauty booking backend staff review: varied wording 46 | staff_review |
| 59 | PASS | beauty booking backend staff review: varied wording 47 | staff_review |
| 60 | PASS | beauty booking backend staff review: varied wording 48 | staff_review |
| 61 | PASS | beauty booking backend staff review: varied wording 49 | staff_review |
| 62 | PASS | restaurant booking staff review: varied wording 50 | staff_review |
| 63 | PASS | restaurant booking staff review: varied wording 51 | staff_review |
| 64 | PASS | restaurant booking staff review: varied wording 52 | staff_review |
| 65 | PASS | restaurant booking staff review: varied wording 53 | staff_review |
| 66 | PASS | complaint handoff: varied wording 54 | handoff / complaint |
| 67 | PASS | complaint handoff: varied wording 55 | handoff / complaint |
| 68 | PASS | complaint handoff: varied wording 56 | handoff / complaint |
| 69 | PASS | complaint handoff: varied wording 57 | handoff / complaint |
| 70 | PASS | sensitive health handoff: varied wording 58 | handoff / sensitive_health |
| 71 | PASS | sensitive health handoff: varied wording 59 | handoff / sensitive_health |
| 72 | PASS | sensitive health handoff: varied wording 60 | handoff / sensitive_health |
| 73 | PASS | human request handoff: varied wording 61 | handoff / human_request |
| 74 | PASS | human request handoff: varied wording 62 | handoff / human_request |
| 75 | PASS | human request handoff: varied wording 63 | handoff / human_request |
| 76 | PASS | human request handoff: varied wording 64 | handoff / human_request |
| 77 | PASS | education pricing review: varied wording 65 | staff_review |
| 78 | PASS | education pricing review: varied wording 66 | staff_review |
| 79 | PASS | education pricing review: varied wording 67 | staff_review |
| 80 | PASS | IG shop service info conservative paths: varied wording 68 | clarify |
| 81 | PASS | IG shop service info conservative paths: varied wording 69 | clarify |
| 82 | PASS | IG shop service info conservative paths: varied wording 70 | clarify |
| 83 | PASS | IG shop service info conservative paths: varied wording 71 | clarify |
| 84 | PASS | restaurant unknown clarification: varied wording 72 | clarify |
| 85 | PASS | restaurant unknown clarification: varied wording 73 | clarify |
| 86 | PASS | restaurant unknown clarification: varied wording 74 | clarify |
| 87 | PASS | restaurant hours auto-send: varied wording 75 | auto_send |
| 88 | PASS | restaurant hours auto-send: varied wording 76 | auto_send |
| 89 | PASS | restaurant hours auto-send: varied wording 77 | auto_send |
| 90 | PASS | restaurant hours auto-send: varied wording 78 | auto_send |
| 91 | PASS | beauty pricing staff review: varied wording 79 | staff_review |
| 92 | PASS | beauty pricing staff review: varied wording 80 | staff_review |
| 93 | PASS | beauty pricing staff review: varied wording 81 | staff_review |
| 94 | PASS | beauty pricing staff review: varied wording 82 | staff_review |
| 95 | PASS | beauty booking backend staff review: varied wording 83 | staff_review |
| 96 | PASS | beauty booking backend staff review: varied wording 84 | staff_review |
| 97 | PASS | beauty booking backend staff review: varied wording 85 | staff_review |
| 98 | PASS | beauty booking backend staff review: varied wording 86 | staff_review |
| 99 | PASS | restaurant booking staff review: varied wording 87 | staff_review |
| 100 | PASS | restaurant booking staff review: varied wording 88 | staff_review |

## Details

### 001 PASS - beauty hours: archetype allows hours_location auto_send (no $/digits in answer? — has 11:00, so trips ask-staff-before-promise → review)

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Causeway Bay店今晚幾點收工？",
  "intent": "hours_location",
  "kb": "beauty_hours"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "invent_prices",
    "give_medical_advice",
    "promise_treatment_result"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_hours"
  ],
  "reasons": [
    "askStaffBeforePromise tripped on number/$ in answer"
  ]
}
```

### 002 PASS - restaurant hours: archetype allows + no digit-trip mode → auto_send

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 003 PASS - beauty pricing: askStaffBeforePromise + reviewIntents → staff_review

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 004 PASS - beauty booking: backendBound → staff_review with confirm_booking forbidden

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 005 PASS - restaurant booking: backendBound → staff_review

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "今晚8點有冇位？",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

### 006 PASS - complaint: angry refund → handoff with escalation

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "你哋搞錯我個booking，我要退錢。",
  "intent": "complaint",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "complaint",
    "angry_customer"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "complaint",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk"
  ]
}
```

### 007 PASS - sensitive health: pregnancy + laser → handoff

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我懷孕緊，可唔可以做laser？",
  "intent": "sensitive_health",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "sensitive_health"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "sensitive_health",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=sensitive_health",
    "gateway high risk"
  ]
}
```

### 008 PASS - child data: school + birth date → handoff

Context:
```json
{
  "businessId": "edu_demo",
  "input": "我個小朋友幼稚園叫XXX，出生日期係...",
  "intent": "child_data",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "child_data"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "child_data",
  "suggestedTone": "education",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=child_data",
    "gateway high risk"
  ]
}
```

### 009 PASS - human request → handoff

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要搵真人傾",
  "intent": "human_request",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "human_request"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "human_request",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=human_request"
  ]
}
```

### 010 PASS - ig shop stock query: non-backend, score-driven, ask_clarification path or auto_send

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "呢件有冇現貨？包唔包順豐？",
  "intent": "general",
  "kb": "igshop_stock"
}
```

Expected:
```json
{
  "action": [
    "auto_send",
    "staff_review",
    "clarify"
  ],
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "casual_ig",
  "allowedCapabilities": [
    "use_tone:casual_ig",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [
    "igshop_stock",
    "igshop_shipping"
  ],
  "reasons": [
    "intent.confidence<0.5"
  ]
}
```

### 011 PASS - ig shop unknown: parking has no KB entry → clarify

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋有冇泊車優惠？",
  "intent": "pricing",
  "kb": null
}
```

Expected:
```json
{
  "action": [
    "clarify",
    "staff_review"
  ],
  "escalation": "",
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [],
  "reasons": [
    "kb.gap=true"
  ]
}
```

### 012 PASS - credit-card-like number → block

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "信用卡 4111 1111 1111 1111 預留位",
  "intent": "payment",
  "kb": null
}
```

Expected:
```json
{
  "action": "block",
  "escalation": [
    "privacy_block"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "block",
  "escalation": "privacy_block",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "gateway.route=block_and_handoff"
  ]
}
```

### 013 PASS - restaurant hours auto-send: varied wording 1

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 014 PASS - restaurant hours auto-send: varied wording 2

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 015 PASS - restaurant hours auto-send: varied wording 3

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 016 PASS - restaurant hours auto-send: varied wording 4

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 017 PASS - beauty pricing staff review: varied wording 5

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 018 PASS - beauty pricing staff review: varied wording 6

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想問面部護理價錢",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 019 PASS - beauty pricing staff review: varied wording 7

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Signature facial price?",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 020 PASS - beauty pricing staff review: varied wording 8

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "首次體驗facial幾錢",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 021 PASS - beauty booking backend staff review: varied wording 9

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 022 PASS - beauty booking backend staff review: varied wording 10

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 023 PASS - beauty booking backend staff review: varied wording 11

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 024 PASS - beauty booking backend staff review: varied wording 12

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 025 PASS - restaurant booking staff review: varied wording 13

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "今晚8點有冇位？",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

### 026 PASS - restaurant booking staff review: varied wording 14

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "想book table for 2",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

### 027 PASS - restaurant booking staff review: varied wording 15

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "今晚8點有冇位？",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

### 028 PASS - restaurant booking staff review: varied wording 16

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "reserve dinner table please",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

### 029 PASS - complaint handoff: varied wording 17

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "你哋搞錯我個booking，我要退錢。",
  "intent": "complaint",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "complaint",
    "angry_customer"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "complaint",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk"
  ]
}
```

### 030 PASS - complaint handoff: varied wording 18

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要投訴",
  "intent": "complaint",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "complaint",
    "angry_customer"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "complaint",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text"
  ]
}
```

### 031 PASS - complaint handoff: varied wording 19

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "好嬲，點解收多咗錢？",
  "intent": "complaint",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "complaint",
    "angry_customer"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "complaint",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text"
  ]
}
```

### 032 PASS - complaint handoff: varied wording 20

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "refund please, I am angry",
  "intent": "complaint",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "complaint",
    "angry_customer"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "complaint",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk"
  ]
}
```

### 033 PASS - sensitive health handoff: varied wording 21

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我懷孕緊，可唔可以做laser？",
  "intent": "sensitive_health",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "sensitive_health"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "sensitive_health",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=sensitive_health",
    "gateway high risk"
  ]
}
```

### 034 PASS - sensitive health handoff: varied wording 22

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "皮膚敏感發炎可以做嗎？",
  "intent": "sensitive_health",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "sensitive_health"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "sensitive_health",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=sensitive_health",
    "gateway high risk"
  ]
}
```

### 035 PASS - sensitive health handoff: varied wording 23

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "食緊藥可唔可以做療程？",
  "intent": "sensitive_health",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "sensitive_health"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "sensitive_health",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=sensitive_health",
    "gateway high risk"
  ]
}
```

### 036 PASS - human request handoff: varied wording 24

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要搵真人傾",
  "intent": "human_request",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "human_request"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "human_request",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=human_request"
  ]
}
```

### 037 PASS - human request handoff: varied wording 25

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "can I talk to staff?",
  "intent": "human_request",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "human_request"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "human_request",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=human_request"
  ]
}
```

### 038 PASS - human request handoff: varied wording 26

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "請同事覆我",
  "intent": "human_request",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "human_request"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "human_request",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=human_request"
  ]
}
```

### 039 PASS - human request handoff: varied wording 27

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要搵真人傾",
  "intent": "human_request",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "human_request"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "human_request",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=human_request"
  ]
}
```

### 040 PASS - education pricing review: varied wording 28

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3英文班幾錢？",
  "intent": "pricing",
  "kb": "edu_pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "education",
  "allowedCapabilities": [
    "use_tone:education",
    "quote_kb_verbatim",
    "cite_entry:edu_pricing",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "edu_pricing",
    "edu_p3_english"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 041 PASS - education pricing review: varied wording 29

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3英文班幾錢？",
  "intent": "pricing",
  "kb": "edu_pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "education",
  "allowedCapabilities": [
    "use_tone:education",
    "quote_kb_verbatim",
    "cite_entry:edu_pricing",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "edu_pricing",
    "edu_p3_english"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 042 PASS - education pricing review: varied wording 30

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3英文班幾錢？",
  "intent": "pricing",
  "kb": "edu_pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "education",
  "allowedCapabilities": [
    "use_tone:education",
    "quote_kb_verbatim",
    "cite_entry:edu_pricing",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "edu_pricing",
    "edu_p3_english"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 043 PASS - IG shop service info conservative paths: varied wording 31

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "呢件有冇現貨？",
  "intent": "general",
  "kb": "igshop_stock"
}
```

Expected:
```json
{
  "action": [
    "auto_send",
    "staff_review",
    "clarify"
  ],
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "casual_ig",
  "allowedCapabilities": [
    "use_tone:casual_ig",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [
    "igshop_stock"
  ],
  "reasons": [
    "intent.confidence<0.5"
  ]
}
```

### 044 PASS - IG shop service info conservative paths: varied wording 32

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "包唔包順豐？",
  "intent": "general",
  "kb": "igshop_shipping"
}
```

Expected:
```json
{
  "action": [
    "auto_send",
    "staff_review",
    "clarify"
  ],
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "casual_ig",
  "allowedCapabilities": [
    "use_tone:casual_ig",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [
    "igshop_shipping"
  ],
  "reasons": [
    "intent.confidence<0.5"
  ]
}
```

### 045 PASS - IG shop service info conservative paths: varied wording 33

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "有冇貨呀？",
  "intent": "general",
  "kb": "igshop_stock"
}
```

Expected:
```json
{
  "action": [
    "auto_send",
    "staff_review",
    "clarify"
  ],
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "casual_ig",
  "allowedCapabilities": [
    "use_tone:casual_ig",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [
    "igshop_stock"
  ],
  "reasons": [
    "intent.confidence<0.5"
  ]
}
```

### 046 PASS - IG shop service info conservative paths: varied wording 34

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "運費點計？",
  "intent": "general",
  "kb": "igshop_shipping"
}
```

Expected:
```json
{
  "action": [
    "auto_send",
    "staff_review",
    "clarify"
  ],
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "casual_ig",
  "allowedCapabilities": [
    "use_tone:casual_ig",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [
    "igshop_shipping"
  ],
  "reasons": [
    "intent.confidence<0.5"
  ]
}
```

### 047 PASS - restaurant unknown clarification: varied wording 35

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋有冇泊車優惠？",
  "intent": "pricing",
  "kb": null
}
```

Expected:
```json
{
  "action": [
    "clarify",
    "staff_review"
  ],
  "escalation": "",
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [],
  "reasons": [
    "kb.gap=true"
  ]
}
```

### 048 PASS - restaurant unknown clarification: varied wording 36

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "可唔可以帶狗？",
  "intent": "general",
  "kb": null
}
```

Expected:
```json
{
  "action": [
    "clarify",
    "staff_review"
  ],
  "escalation": "",
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [],
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5"
  ]
}
```

### 049 PASS - restaurant unknown clarification: varied wording 37

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇karaoke房？",
  "intent": "general",
  "kb": null
}
```

Expected:
```json
{
  "action": [
    "clarify",
    "staff_review"
  ],
  "escalation": "",
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [],
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5"
  ]
}
```

### 050 PASS - restaurant hours auto-send: varied wording 38

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 051 PASS - restaurant hours auto-send: varied wording 39

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 052 PASS - restaurant hours auto-send: varied wording 40

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 053 PASS - restaurant hours auto-send: varied wording 41

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 054 PASS - beauty pricing staff review: varied wording 42

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 055 PASS - beauty pricing staff review: varied wording 43

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想問面部護理價錢",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 056 PASS - beauty pricing staff review: varied wording 44

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Signature facial price?",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 057 PASS - beauty pricing staff review: varied wording 45

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "首次體驗facial幾錢",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 058 PASS - beauty booking backend staff review: varied wording 46

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 059 PASS - beauty booking backend staff review: varied wording 47

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 060 PASS - beauty booking backend staff review: varied wording 48

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 061 PASS - beauty booking backend staff review: varied wording 49

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 062 PASS - restaurant booking staff review: varied wording 50

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "今晚8點有冇位？",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

### 063 PASS - restaurant booking staff review: varied wording 51

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "想book table for 2",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

### 064 PASS - restaurant booking staff review: varied wording 52

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "今晚8點有冇位？",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

### 065 PASS - restaurant booking staff review: varied wording 53

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "reserve dinner table please",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

### 066 PASS - complaint handoff: varied wording 54

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "你哋搞錯我個booking，我要退錢。",
  "intent": "complaint",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "complaint",
    "angry_customer"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "complaint",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk"
  ]
}
```

### 067 PASS - complaint handoff: varied wording 55

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要投訴",
  "intent": "complaint",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "complaint",
    "angry_customer"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "complaint",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text"
  ]
}
```

### 068 PASS - complaint handoff: varied wording 56

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "好嬲，點解收多咗錢？",
  "intent": "complaint",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "complaint",
    "angry_customer"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "complaint",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text"
  ]
}
```

### 069 PASS - complaint handoff: varied wording 57

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "refund please, I am angry",
  "intent": "complaint",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "complaint",
    "angry_customer"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "complaint",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=complaint",
    "angry/refund signal in text",
    "gateway high risk"
  ]
}
```

### 070 PASS - sensitive health handoff: varied wording 58

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我懷孕緊，可唔可以做laser？",
  "intent": "sensitive_health",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "sensitive_health"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "sensitive_health",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=sensitive_health",
    "gateway high risk"
  ]
}
```

### 071 PASS - sensitive health handoff: varied wording 59

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "皮膚敏感發炎可以做嗎？",
  "intent": "sensitive_health",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "sensitive_health"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "sensitive_health",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=sensitive_health",
    "gateway high risk"
  ]
}
```

### 072 PASS - sensitive health handoff: varied wording 60

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "食緊藥可唔可以做療程？",
  "intent": "sensitive_health",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "sensitive_health"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "sensitive_health",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=sensitive_health",
    "gateway high risk"
  ]
}
```

### 073 PASS - human request handoff: varied wording 61

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要搵真人傾",
  "intent": "human_request",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "human_request"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "human_request",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=human_request"
  ]
}
```

### 074 PASS - human request handoff: varied wording 62

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "can I talk to staff?",
  "intent": "human_request",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "human_request"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "human_request",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=human_request"
  ]
}
```

### 075 PASS - human request handoff: varied wording 63

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "請同事覆我",
  "intent": "human_request",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "human_request"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "human_request",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=human_request"
  ]
}
```

### 076 PASS - human request handoff: varied wording 64

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "我要搵真人傾",
  "intent": "human_request",
  "kb": null
}
```

Expected:
```json
{
  "action": "handoff",
  "escalation": [
    "human_request"
  ],
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "handoff",
  "escalation": "human_request",
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "write_handoff_summary_for_staff"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "send_to_customer",
    "promise_anything",
    "confirm_booking",
    "decide_refund",
    "give_medical_advice"
  ],
  "grounding": [],
  "reasons": [
    "kb.handoff=true",
    "intent=human_request"
  ]
}
```

### 077 PASS - education pricing review: varied wording 65

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3英文班幾錢？",
  "intent": "pricing",
  "kb": "edu_pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "education",
  "allowedCapabilities": [
    "use_tone:education",
    "quote_kb_verbatim",
    "cite_entry:edu_pricing",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "edu_pricing",
    "edu_p3_english"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 078 PASS - education pricing review: varied wording 66

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3英文班幾錢？",
  "intent": "pricing",
  "kb": "edu_pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "education",
  "allowedCapabilities": [
    "use_tone:education",
    "quote_kb_verbatim",
    "cite_entry:edu_pricing",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "edu_pricing",
    "edu_p3_english"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 079 PASS - education pricing review: varied wording 67

Context:
```json
{
  "businessId": "edu_demo",
  "input": "P3英文班幾錢？",
  "intent": "pricing",
  "kb": "edu_pricing"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "education",
  "allowedCapabilities": [
    "use_tone:education",
    "quote_kb_verbatim",
    "cite_entry:edu_pricing",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "edu_pricing",
    "edu_p3_english"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 080 PASS - IG shop service info conservative paths: varied wording 68

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "呢件有冇現貨？",
  "intent": "general",
  "kb": "igshop_stock"
}
```

Expected:
```json
{
  "action": [
    "auto_send",
    "staff_review",
    "clarify"
  ],
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "casual_ig",
  "allowedCapabilities": [
    "use_tone:casual_ig",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [
    "igshop_stock"
  ],
  "reasons": [
    "intent.confidence<0.5"
  ]
}
```

### 081 PASS - IG shop service info conservative paths: varied wording 69

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "包唔包順豐？",
  "intent": "general",
  "kb": "igshop_shipping"
}
```

Expected:
```json
{
  "action": [
    "auto_send",
    "staff_review",
    "clarify"
  ],
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "casual_ig",
  "allowedCapabilities": [
    "use_tone:casual_ig",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [
    "igshop_shipping"
  ],
  "reasons": [
    "intent.confidence<0.5"
  ]
}
```

### 082 PASS - IG shop service info conservative paths: varied wording 70

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "有冇貨呀？",
  "intent": "general",
  "kb": "igshop_stock"
}
```

Expected:
```json
{
  "action": [
    "auto_send",
    "staff_review",
    "clarify"
  ],
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "casual_ig",
  "allowedCapabilities": [
    "use_tone:casual_ig",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [
    "igshop_stock"
  ],
  "reasons": [
    "intent.confidence<0.5"
  ]
}
```

### 083 PASS - IG shop service info conservative paths: varied wording 71

Context:
```json
{
  "businessId": "igshop_demo",
  "input": "運費點計？",
  "intent": "general",
  "kb": "igshop_shipping"
}
```

Expected:
```json
{
  "action": [
    "auto_send",
    "staff_review",
    "clarify"
  ],
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "casual_ig",
  "allowedCapabilities": [
    "use_tone:casual_ig",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [
    "igshop_shipping"
  ],
  "reasons": [
    "intent.confidence<0.5"
  ]
}
```

### 084 PASS - restaurant unknown clarification: varied wording 72

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋有冇泊車優惠？",
  "intent": "pricing",
  "kb": null
}
```

Expected:
```json
{
  "action": [
    "clarify",
    "staff_review"
  ],
  "escalation": "",
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [],
  "reasons": [
    "kb.gap=true"
  ]
}
```

### 085 PASS - restaurant unknown clarification: varied wording 73

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "可唔可以帶狗？",
  "intent": "general",
  "kb": null
}
```

Expected:
```json
{
  "action": [
    "clarify",
    "staff_review"
  ],
  "escalation": "",
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [],
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5"
  ]
}
```

### 086 PASS - restaurant unknown clarification: varied wording 74

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "有冇karaoke房？",
  "intent": "general",
  "kb": null
}
```

Expected:
```json
{
  "action": [
    "clarify",
    "staff_review"
  ],
  "escalation": "",
  "mustForbid": [],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "clarify",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "provide_specific_facts",
    "quote_prices",
    "confirm_booking"
  ],
  "grounding": [],
  "reasons": [
    "kb.gap=true",
    "intent.confidence<0.5"
  ]
}
```

### 087 PASS - restaurant hours auto-send: varied wording 75

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 088 PASS - restaurant hours auto-send: varied wording 76

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 089 PASS - restaurant hours auto-send: varied wording 77

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 090 PASS - restaurant hours auto-send: varied wording 78

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "你哋幾點開門？",
  "intent": "hours_location",
  "kb": "restaurant_hours"
}
```

Expected:
```json
{
  "action": "auto_send",
  "escalation": "",
  "mustForbid": [
    "invent_prices"
  ],
  "mustAllow": [
    "quote_kb_verbatim"
  ]
}
```

Actual:
```json
{
  "action": "auto_send",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_hours",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "restaurant_hours"
  ],
  "reasons": [
    "bestScore=1.2",
    "intentConfidence=0.88",
    "autoSendIntents allows hours_location"
  ]
}
```

### 091 PASS - beauty pricing staff review: varied wording 79

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "facial幾錢？",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 092 PASS - beauty pricing staff review: varied wording 80

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想問面部護理價錢",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 093 PASS - beauty pricing staff review: varied wording 81

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "Signature facial price?",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 094 PASS - beauty pricing staff review: varied wording 82

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "首次體驗facial幾錢",
  "intent": "pricing",
  "kb": "beauty_pricing_facial"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "give_medical_advice",
    "invent_prices"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_pricing_facial",
    "ask_one_clarifying_question"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "waive_deposit",
    "promise_no_deposit",
    "decide_refund",
    "approve_chargeback"
  ],
  "grounding": [
    "beauty_pricing_facial"
  ],
  "reasons": [
    "config.reviewIntents includes pricing"
  ]
}
```

### 095 PASS - beauty booking backend staff review: varied wording 83

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 096 PASS - beauty booking backend staff review: varied wording 84

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 097 PASS - beauty booking backend staff review: varied wording 85

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 098 PASS - beauty booking backend staff review: varied wording 86

Context:
```json
{
  "businessId": "beauty_demo",
  "input": "想book今晚個facial有冇位",
  "intent": "booking",
  "kb": "beauty_booking_policy"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking",
    "give_medical_advice"
  ],
  "mustAllow": [
    "propose_options_for_staff_to_confirm"
  ]
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "luxury_beauty",
  "allowedCapabilities": [
    "use_tone:luxury_beauty",
    "quote_kb_verbatim",
    "cite_entry:beauty_booking_policy",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "waive_deposit",
    "promise_no_deposit",
    "give_medical_advice",
    "promise_treatment_result",
    "diagnose",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "beauty_booking_policy",
    "beauty_pricing_facial"
  ],
  "reasons": [
    "knowledge.backendBound=true",
    "policyRef=deposit_required"
  ]
}
```

### 099 PASS - restaurant booking staff review: varied wording 87

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "今晚8點有冇位？",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

### 100 PASS - restaurant booking staff review: varied wording 88

Context:
```json
{
  "businessId": "restaurant_demo",
  "input": "想book table for 2",
  "intent": "booking",
  "kb": "restaurant_booking"
}
```

Expected:
```json
{
  "action": "staff_review",
  "escalation": "",
  "mustForbid": [
    "confirm_booking"
  ],
  "mustAllow": []
}
```

Actual:
```json
{
  "action": "staff_review",
  "escalation": null,
  "suggestedTone": "friendly_local",
  "allowedCapabilities": [
    "use_tone:friendly_local",
    "quote_kb_verbatim",
    "cite_entry:restaurant_booking",
    "ask_one_clarifying_question",
    "propose_options_for_staff_to_confirm"
  ],
  "forbiddenCapabilities": [
    "invent_prices",
    "invent_business_facts",
    "give_legal_advice",
    "give_financial_advice",
    "leak_pii",
    "confirm_booking",
    "promise_slot_availability",
    "decide_refund",
    "approve_chargeback",
    "confirm_shipment",
    "confirm_payment_received"
  ],
  "grounding": [
    "restaurant_booking"
  ],
  "reasons": [
    "knowledge.backendBound=true"
  ]
}
```

