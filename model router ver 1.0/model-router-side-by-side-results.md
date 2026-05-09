# Model Router ver 1.0 - Readable Side-by-side Results

Each case compares the deterministic model routing policy against the actual provider/model decision.

Generated at: 2026-05-09T13:31:08.582Z
Total rows: 100
Passed: 100
Failed: 0

## Quick Index

| # | Status | Case | Key result |
|---:|---|---|---|
| 1 | PASS | auto_send restaurant hours uses no LLM | no_llm / call=false |
| 2 | PASS | staff_review simple beauty pricing uses Haiku | claude-haiku-4-5-20251001 / call=true |
| 3 | PASS | handoff angry complaint uses Sonnet | claude-sonnet-4-6 / call=true |
| 4 | PASS | payment staff review uses Sonnet | claude-sonnet-4-6 / call=true |
| 5 | PASS | auto_send hours_location remains deterministic with no model call | no_llm / call=false |
| 6 | PASS | auto_send pricing remains deterministic with no model call | no_llm / call=false |
| 7 | PASS | auto_send service_info remains deterministic with no model call | no_llm / call=false |
| 8 | PASS | auto_send aftercare remains deterministic with no model call | no_llm / call=false |
| 9 | PASS | auto_send general remains deterministic with no model call | no_llm / call=false |
| 10 | PASS | auto_send complaint remains deterministic with no model call | no_llm / call=false |
| 11 | PASS | auto_send sensitive_health remains deterministic with no model call | no_llm / call=false |
| 12 | PASS | auto_send child_data remains deterministic with no model call | no_llm / call=false |
| 13 | PASS | auto_send human_request remains deterministic with no model call | no_llm / call=false |
| 14 | PASS | auto_send payment remains deterministic with no model call | no_llm / call=false |
| 15 | PASS | auto_send order_status remains deterministic with no model call | no_llm / call=false |
| 16 | PASS | auto_send reschedule remains deterministic with no model call | no_llm / call=false |
| 17 | PASS | clarify hours_location remains deterministic with no model call | no_llm / call=false |
| 18 | PASS | clarify pricing remains deterministic with no model call | no_llm / call=false |
| 19 | PASS | clarify service_info remains deterministic with no model call | no_llm / call=false |
| 20 | PASS | clarify aftercare remains deterministic with no model call | no_llm / call=false |
| 21 | PASS | clarify general remains deterministic with no model call | no_llm / call=false |
| 22 | PASS | clarify complaint remains deterministic with no model call | no_llm / call=false |
| 23 | PASS | clarify sensitive_health remains deterministic with no model call | no_llm / call=false |
| 24 | PASS | clarify child_data remains deterministic with no model call | no_llm / call=false |
| 25 | PASS | clarify human_request remains deterministic with no model call | no_llm / call=false |
| 26 | PASS | clarify payment remains deterministic with no model call | no_llm / call=false |
| 27 | PASS | clarify order_status remains deterministic with no model call | no_llm / call=false |
| 28 | PASS | clarify reschedule remains deterministic with no model call | no_llm / call=false |
| 29 | PASS | block hours_location remains deterministic with no model call | no_llm / call=false |
| 30 | PASS | block pricing remains deterministic with no model call | no_llm / call=false |
| 31 | PASS | block service_info remains deterministic with no model call | no_llm / call=false |
| 32 | PASS | block aftercare remains deterministic with no model call | no_llm / call=false |
| 33 | PASS | block general remains deterministic with no model call | no_llm / call=false |
| 34 | PASS | block complaint remains deterministic with no model call | no_llm / call=false |
| 35 | PASS | block sensitive_health remains deterministic with no model call | no_llm / call=false |
| 36 | PASS | block child_data remains deterministic with no model call | no_llm / call=false |
| 37 | PASS | block human_request remains deterministic with no model call | no_llm / call=false |
| 38 | PASS | block payment remains deterministic with no model call | no_llm / call=false |
| 39 | PASS | block order_status remains deterministic with no model call | no_llm / call=false |
| 40 | PASS | block reschedule remains deterministic with no model call | no_llm / call=false |
| 41 | PASS | staff_review hours_location with none risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 42 | PASS | staff_review hours_location with low risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 43 | PASS | staff_review hours_location with medium risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 44 | PASS | staff_review hours_location with high risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 45 | PASS | staff_review hours_location with blocked risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 46 | PASS | staff_review pricing with none risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 47 | PASS | staff_review pricing with low risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 48 | PASS | staff_review pricing with medium risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 49 | PASS | staff_review pricing with high risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 50 | PASS | staff_review pricing with blocked risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 51 | PASS | staff_review service_info with none risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 52 | PASS | staff_review service_info with low risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 53 | PASS | staff_review service_info with medium risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 54 | PASS | staff_review service_info with high risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 55 | PASS | staff_review service_info with blocked risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 56 | PASS | staff_review aftercare with none risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 57 | PASS | staff_review aftercare with low risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 58 | PASS | staff_review aftercare with medium risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 59 | PASS | staff_review aftercare with high risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 60 | PASS | staff_review aftercare with blocked risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 61 | PASS | staff_review general with none risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 62 | PASS | staff_review general with low risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 63 | PASS | staff_review general with medium risk routes to Haiku | claude-haiku-4-5-20251001 / call=true |
| 64 | PASS | staff_review general with high risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 65 | PASS | staff_review general with blocked risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 66 | PASS | staff_review complex complaint with none risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 67 | PASS | staff_review complex complaint with low risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 68 | PASS | staff_review complex complaint with medium risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 69 | PASS | staff_review complex sensitive_health with none risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 70 | PASS | staff_review complex sensitive_health with low risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 71 | PASS | staff_review complex sensitive_health with medium risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 72 | PASS | staff_review complex child_data with none risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 73 | PASS | staff_review complex child_data with low risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 74 | PASS | staff_review complex child_data with medium risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 75 | PASS | staff_review complex human_request with none risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 76 | PASS | staff_review complex human_request with low risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 77 | PASS | staff_review complex human_request with medium risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 78 | PASS | staff_review complex payment with none risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 79 | PASS | staff_review complex payment with low risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 80 | PASS | staff_review complex payment with medium risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 81 | PASS | staff_review complex order_status with none risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 82 | PASS | staff_review complex order_status with low risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 83 | PASS | staff_review complex order_status with medium risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 84 | PASS | staff_review complex reschedule with none risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 85 | PASS | staff_review complex reschedule with low risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 86 | PASS | staff_review complex reschedule with medium risk routes to Sonnet | claude-sonnet-4-6 / call=true |
| 87 | PASS | handoff hours_location always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 88 | PASS | handoff pricing always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 89 | PASS | handoff service_info always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 90 | PASS | handoff aftercare always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 91 | PASS | handoff general always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 92 | PASS | handoff complaint always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 93 | PASS | handoff sensitive_health always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 94 | PASS | handoff child_data always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 95 | PASS | handoff human_request always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 96 | PASS | handoff payment always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 97 | PASS | handoff order_status always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 98 | PASS | handoff reschedule always uses Sonnet staff summary path | claude-sonnet-4-6 / call=true |
| 99 | PASS | long sanitized context 1 upgrades staff_review general to Sonnet | claude-sonnet-4-6 / call=true |
| 100 | PASS | long sanitized context 2 upgrades staff_review general to Sonnet | claude-sonnet-4-6 / call=true |

## Details

### 001 PASS - auto_send restaurant hours uses no LLM

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "hours_location",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 002 PASS - staff_review simple beauty pricing uses Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "pricing",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 003 PASS - handoff angry complaint uses Sonnet

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "complaint",
    "riskLevel": "high"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning",
    "riskLevel=high",
    "complex intent=complaint"
  ]
}
```

### 004 PASS - payment staff review uses Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "payment",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=payment"
  ]
}
```

### 005 PASS - auto_send hours_location remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "hours_location",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 006 PASS - auto_send pricing remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "pricing",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 007 PASS - auto_send service_info remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "service_info",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 008 PASS - auto_send aftercare remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "aftercare",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 009 PASS - auto_send general remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 010 PASS - auto_send complaint remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "complaint",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 011 PASS - auto_send sensitive_health remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "sensitive_health",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 012 PASS - auto_send child_data remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "child_data",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 013 PASS - auto_send human_request remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "human_request",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 014 PASS - auto_send payment remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "payment",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 015 PASS - auto_send order_status remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "order_status",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 016 PASS - auto_send reschedule remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "auto_send"
  },
  "intent": {
    "primaryIntent": "reschedule",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action auto_send is deterministic"
  ]
}
```

### 017 PASS - clarify hours_location remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "hours_location",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 018 PASS - clarify pricing remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "pricing",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 019 PASS - clarify service_info remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "service_info",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 020 PASS - clarify aftercare remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "aftercare",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 021 PASS - clarify general remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 022 PASS - clarify complaint remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "complaint",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 023 PASS - clarify sensitive_health remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "sensitive_health",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 024 PASS - clarify child_data remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "child_data",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 025 PASS - clarify human_request remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "human_request",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 026 PASS - clarify payment remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "payment",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 027 PASS - clarify order_status remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "order_status",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 028 PASS - clarify reschedule remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "clarify"
  },
  "intent": {
    "primaryIntent": "reschedule",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action clarify is deterministic"
  ]
}
```

### 029 PASS - block hours_location remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "hours_location",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 030 PASS - block pricing remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "pricing",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 031 PASS - block service_info remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "service_info",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 032 PASS - block aftercare remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "aftercare",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 033 PASS - block general remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 034 PASS - block complaint remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "complaint",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 035 PASS - block sensitive_health remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "sensitive_health",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 036 PASS - block child_data remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "child_data",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 037 PASS - block human_request remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "human_request",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 038 PASS - block payment remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "payment",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 039 PASS - block order_status remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "order_status",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 040 PASS - block reschedule remains deterministic with no model call

Context:
```json
{
  "decision": {
    "action": "block"
  },
  "intent": {
    "primaryIntent": "reschedule",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "no_llm",
  "shouldCallLLM": false
}
```

Actual:
```json
{
  "provider": "none",
  "model": "no_llm",
  "shouldCallLLM": false,
  "promptCache": false,
  "maxTokens": 0,
  "reasons": [
    "action block is deterministic"
  ]
}
```

### 041 PASS - staff_review hours_location with none risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "hours_location",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 042 PASS - staff_review hours_location with low risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "hours_location",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 043 PASS - staff_review hours_location with medium risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "hours_location",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 044 PASS - staff_review hours_location with high risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "hours_location",
    "riskLevel": "high"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "riskLevel=high"
  ]
}
```

### 045 PASS - staff_review hours_location with blocked risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "hours_location",
    "riskLevel": "blocked"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "riskLevel=blocked"
  ]
}
```

### 046 PASS - staff_review pricing with none risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "pricing",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 047 PASS - staff_review pricing with low risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "pricing",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 048 PASS - staff_review pricing with medium risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "pricing",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 049 PASS - staff_review pricing with high risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "pricing",
    "riskLevel": "high"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "riskLevel=high"
  ]
}
```

### 050 PASS - staff_review pricing with blocked risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "pricing",
    "riskLevel": "blocked"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "riskLevel=blocked"
  ]
}
```

### 051 PASS - staff_review service_info with none risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "service_info",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 052 PASS - staff_review service_info with low risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "service_info",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 053 PASS - staff_review service_info with medium risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "service_info",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 054 PASS - staff_review service_info with high risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "service_info",
    "riskLevel": "high"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "riskLevel=high"
  ]
}
```

### 055 PASS - staff_review service_info with blocked risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "service_info",
    "riskLevel": "blocked"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "riskLevel=blocked"
  ]
}
```

### 056 PASS - staff_review aftercare with none risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "aftercare",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 057 PASS - staff_review aftercare with low risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "aftercare",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 058 PASS - staff_review aftercare with medium risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "aftercare",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 059 PASS - staff_review aftercare with high risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "aftercare",
    "riskLevel": "high"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "riskLevel=high"
  ]
}
```

### 060 PASS - staff_review aftercare with blocked risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "aftercare",
    "riskLevel": "blocked"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "riskLevel=blocked"
  ]
}
```

### 061 PASS - staff_review general with none risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 062 PASS - staff_review general with low risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 063 PASS - staff_review general with medium risk routes to Haiku

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "action staff_review can use low-cost draft model"
  ]
}
```

### 064 PASS - staff_review general with high risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "high"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "riskLevel=high"
  ]
}
```

### 065 PASS - staff_review general with blocked risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "blocked"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "riskLevel=blocked"
  ]
}
```

### 066 PASS - staff_review complex complaint with none risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "complaint",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=complaint"
  ]
}
```

### 067 PASS - staff_review complex complaint with low risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "complaint",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=complaint"
  ]
}
```

### 068 PASS - staff_review complex complaint with medium risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "complaint",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=complaint"
  ]
}
```

### 069 PASS - staff_review complex sensitive_health with none risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "sensitive_health",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=sensitive_health"
  ]
}
```

### 070 PASS - staff_review complex sensitive_health with low risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "sensitive_health",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=sensitive_health"
  ]
}
```

### 071 PASS - staff_review complex sensitive_health with medium risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "sensitive_health",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=sensitive_health"
  ]
}
```

### 072 PASS - staff_review complex child_data with none risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "child_data",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=child_data"
  ]
}
```

### 073 PASS - staff_review complex child_data with low risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "child_data",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=child_data"
  ]
}
```

### 074 PASS - staff_review complex child_data with medium risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "child_data",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=child_data"
  ]
}
```

### 075 PASS - staff_review complex human_request with none risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "human_request",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=human_request"
  ]
}
```

### 076 PASS - staff_review complex human_request with low risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "human_request",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=human_request"
  ]
}
```

### 077 PASS - staff_review complex human_request with medium risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "human_request",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=human_request"
  ]
}
```

### 078 PASS - staff_review complex payment with none risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "payment",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=payment"
  ]
}
```

### 079 PASS - staff_review complex payment with low risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "payment",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=payment"
  ]
}
```

### 080 PASS - staff_review complex payment with medium risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "payment",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=payment"
  ]
}
```

### 081 PASS - staff_review complex order_status with none risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "order_status",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=order_status"
  ]
}
```

### 082 PASS - staff_review complex order_status with low risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "order_status",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=order_status"
  ]
}
```

### 083 PASS - staff_review complex order_status with medium risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "order_status",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=order_status"
  ]
}
```

### 084 PASS - staff_review complex reschedule with none risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "reschedule",
    "riskLevel": "none"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=reschedule"
  ]
}
```

### 085 PASS - staff_review complex reschedule with low risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "reschedule",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=reschedule"
  ]
}
```

### 086 PASS - staff_review complex reschedule with medium risk routes to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "reschedule",
    "riskLevel": "medium"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "complex intent=reschedule"
  ]
}
```

### 087 PASS - handoff hours_location always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "hours_location",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning"
  ]
}
```

### 088 PASS - handoff pricing always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "pricing",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning"
  ]
}
```

### 089 PASS - handoff service_info always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "service_info",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning"
  ]
}
```

### 090 PASS - handoff aftercare always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "aftercare",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning"
  ]
}
```

### 091 PASS - handoff general always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning"
  ]
}
```

### 092 PASS - handoff complaint always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "complaint",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning",
    "complex intent=complaint"
  ]
}
```

### 093 PASS - handoff sensitive_health always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "sensitive_health",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning",
    "complex intent=sensitive_health"
  ]
}
```

### 094 PASS - handoff child_data always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "child_data",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning",
    "complex intent=child_data"
  ]
}
```

### 095 PASS - handoff human_request always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "human_request",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning",
    "complex intent=human_request"
  ]
}
```

### 096 PASS - handoff payment always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "payment",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning",
    "complex intent=payment"
  ]
}
```

### 097 PASS - handoff order_status always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "order_status",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning",
    "complex intent=order_status"
  ]
}
```

### 098 PASS - handoff reschedule always uses Sonnet staff summary path

Context:
```json
{
  "decision": {
    "action": "handoff"
  },
  "intent": {
    "primaryIntent": "reschedule",
    "riskLevel": "low"
  },
  "gateway": {}
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 500,
  "reasons": [
    "handoff summary needs stronger reasoning",
    "complex intent=reschedule"
  ]
}
```

### 099 PASS - long sanitized context 1 upgrades staff_review general to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "low"
  },
  "gateway": {
    "sanitizedText": "客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，"
  }
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "long customer context"
  ]
}
```

### 100 PASS - long sanitized context 2 upgrades staff_review general to Sonnet

Context:
```json
{
  "decision": {
    "action": "staff_review"
  },
  "intent": {
    "primaryIntent": "general",
    "riskLevel": "low"
  },
  "gateway": {
    "sanitizedText": "客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，客人補充好多背景，想問服務詳情同安排，"
  }
}
```

Expected:
```json
{
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true
}
```

Actual:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "shouldCallLLM": true,
  "promptCache": true,
  "maxTokens": 700,
  "reasons": [
    "long customer context"
  ]
}
```

