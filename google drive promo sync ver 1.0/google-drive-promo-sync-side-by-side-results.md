# Google Drive Promo Sync ver 1.0 - Readable Side-by-side Results

Each case compares promotion lookup expectations with active offers after UTC+8 locale time expiry checks.

Generated at: 2026-05-09T13:31:08.318Z
Total rows: 100
Passed: 100
Failed: 0

## Quick Index

| # | Status | Case | Key result |
|---:|---|---|---|
| 1 | PASS | active small-face promotion matches in locale time | 小顏管理五月體驗優惠 @ 2026-05-09 |
| 2 | PASS | expired promotion does not match after locale expiry | no match @ 2026-06-01 |
| 3 | PASS | wrong business does not match beauty promotion | no match @ 2026-05-09 |
| 4 | PASS | IG shop SF locker promotion matches shipping words | 五月順豐智能櫃免運 @ 2026-05-09 |
| 5 | PASS | beauty promo before locale May promo start: 小顏項目有冇優惠？ | no match @ 2026-04-30 |
| 6 | PASS | beauty promo exact locale May start boundary: 小顏項目有冇優惠？ | 小顏管理五月體驗優惠 @ 2026-05-01 |
| 7 | PASS | beauty promo mid campaign: 小顏項目有冇優惠？ | 小顏管理五月體驗優惠 @ 2026-05-15 |
| 8 | PASS | beauty promo last locale campaign second: 小顏項目有冇優惠？ | 小顏管理五月體驗優惠 @ 2026-05-31 |
| 9 | PASS | beauty promo after locale campaign expiry: 小顏項目有冇優惠？ | no match @ 2026-06-01 |
| 10 | PASS | beauty promo before locale May promo start: 面部輪廓收費點計？ | no match @ 2026-04-30 |
| 11 | PASS | beauty promo exact locale May start boundary: 面部輪廓收費點計？ | 小顏管理五月體驗優惠 @ 2026-05-01 |
| 12 | PASS | beauty promo mid campaign: 面部輪廓收費點計？ | 小顏管理五月體驗優惠 @ 2026-05-15 |
| 13 | PASS | beauty promo last locale campaign second: 面部輪廓收費點計？ | 小顏管理五月體驗優惠 @ 2026-05-31 |
| 14 | PASS | beauty promo after locale campaign expiry: 面部輪廓收費點計？ | no match @ 2026-06-01 |
| 15 | PASS | beauty promo before locale May promo start: 五月小顏管理幾錢？ | no match @ 2026-04-30 |
| 16 | PASS | beauty promo exact locale May start boundary: 五月小顏管理幾錢？ | 小顏管理五月體驗優惠 @ 2026-05-01 |
| 17 | PASS | beauty promo mid campaign: 五月小顏管理幾錢？ | 小顏管理五月體驗優惠 @ 2026-05-15 |
| 18 | PASS | beauty promo last locale campaign second: 五月小顏管理幾錢？ | 小顏管理五月體驗優惠 @ 2026-05-31 |
| 19 | PASS | beauty promo after locale campaign expiry: 五月小顏管理幾錢？ | no match @ 2026-06-01 |
| 20 | PASS | beauty promo before locale May promo start: 浮腫護理有trial嗎？ | no match @ 2026-04-30 |
| 21 | PASS | beauty promo exact locale May start boundary: 浮腫護理有trial嗎？ | 小顏管理五月體驗優惠 @ 2026-05-01 |
| 22 | PASS | beauty promo mid campaign: 浮腫護理有trial嗎？ | 小顏管理五月體驗優惠 @ 2026-05-15 |
| 23 | PASS | beauty promo last locale campaign second: 浮腫護理有trial嗎？ | 小顏管理五月體驗優惠 @ 2026-05-31 |
| 24 | PASS | beauty promo after locale campaign expiry: 浮腫護理有trial嗎？ | no match @ 2026-06-01 |
| 25 | PASS | beauty promo before locale May promo start: 想問小顏優惠詳情 | no match @ 2026-04-30 |
| 26 | PASS | beauty promo exact locale May start boundary: 想問小顏優惠詳情 | 小顏管理五月體驗優惠 @ 2026-05-01 |
| 27 | PASS | beauty promo mid campaign: 想問小顏優惠詳情 | 小顏管理五月體驗優惠 @ 2026-05-15 |
| 28 | PASS | beauty promo last locale campaign second: 想問小顏優惠詳情 | 小顏管理五月體驗優惠 @ 2026-05-31 |
| 29 | PASS | beauty promo after locale campaign expiry: 想問小顏優惠詳情 | no match @ 2026-06-01 |
| 30 | PASS | igshop promo before locale May promo start: 順豐包郵嗎？ | no match @ 2026-04-30 |
| 31 | PASS | igshop promo exact locale May start boundary: 順豐包郵嗎？ | 五月順豐智能櫃免運 @ 2026-05-01 |
| 32 | PASS | igshop promo mid campaign: 順豐包郵嗎？ | 五月順豐智能櫃免運 @ 2026-05-15 |
| 33 | PASS | igshop promo last locale campaign second: 順豐包郵嗎？ | 五月順豐智能櫃免運 @ 2026-05-31 |
| 34 | PASS | igshop promo after locale campaign expiry: 順豐包郵嗎？ | no match @ 2026-06-01 |
| 35 | PASS | igshop promo before locale May promo start: 運費點計？ | no match @ 2026-04-30 |
| 36 | PASS | igshop promo exact locale May start boundary: 運費點計？ | 五月順豐智能櫃免運 @ 2026-05-01 |
| 37 | PASS | igshop promo mid campaign: 運費點計？ | 五月順豐智能櫃免運 @ 2026-05-15 |
| 38 | PASS | igshop promo last locale campaign second: 運費點計？ | 五月順豐智能櫃免運 @ 2026-05-31 |
| 39 | PASS | igshop promo after locale campaign expiry: 運費點計？ | no match @ 2026-06-01 |
| 40 | PASS | igshop promo before locale May promo start: sf locker free shipping? | no match @ 2026-04-30 |
| 41 | PASS | igshop promo exact locale May start boundary: sf locker free shipping? | 五月順豐智能櫃免運 @ 2026-05-01 |
| 42 | PASS | igshop promo mid campaign: sf locker free shipping? | 五月順豐智能櫃免運 @ 2026-05-15 |
| 43 | PASS | igshop promo last locale campaign second: sf locker free shipping? | 五月順豐智能櫃免運 @ 2026-05-31 |
| 44 | PASS | igshop promo after locale campaign expiry: sf locker free shipping? | no match @ 2026-06-01 |
| 45 | PASS | igshop promo before locale May promo start: 五月免運有冇？ | no match @ 2026-04-30 |
| 46 | PASS | igshop promo exact locale May start boundary: 五月免運有冇？ | 五月順豐智能櫃免運 @ 2026-05-01 |
| 47 | PASS | igshop promo mid campaign: 五月免運有冇？ | 五月順豐智能櫃免運 @ 2026-05-15 |
| 48 | PASS | igshop promo last locale campaign second: 五月免運有冇？ | 五月順豐智能櫃免運 @ 2026-05-31 |
| 49 | PASS | igshop promo after locale campaign expiry: 五月免運有冇？ | no match @ 2026-06-01 |
| 50 | PASS | igshop promo before locale May promo start: 買滿幾多包順豐？ | no match @ 2026-04-30 |
| 51 | PASS | igshop promo exact locale May start boundary: 買滿幾多包順豐？ | 五月順豐智能櫃免運 @ 2026-05-01 |
| 52 | PASS | igshop promo mid campaign: 買滿幾多包順豐？ | 五月順豐智能櫃免運 @ 2026-05-15 |
| 53 | PASS | igshop promo last locale campaign second: 買滿幾多包順豐？ | 五月順豐智能櫃免運 @ 2026-05-31 |
| 54 | PASS | igshop promo after locale campaign expiry: 買滿幾多包順豐？ | no match @ 2026-06-01 |
| 55 | PASS | non-matching promo context beauty_demo: 幾點開門？ at 2026-04-30T15:30:00.000Z | no match @ 2026-04-30 |
| 56 | PASS | non-matching promo context beauty_demo: 幾點開門？ at 2026-04-30T16:00:00.000Z | no match @ 2026-05-01 |
| 57 | PASS | non-matching promo context beauty_demo: 幾點開門？ at 2026-05-15T04:00:00.000Z | no match @ 2026-05-15 |
| 58 | PASS | non-matching promo context beauty_demo: 幾點開門？ at 2026-05-31T15:59:59.000Z | no match @ 2026-05-31 |
| 59 | PASS | non-matching promo context beauty_demo: 幾點開門？ at 2026-05-31T16:00:00.000Z | no match @ 2026-06-01 |
| 60 | PASS | non-matching promo context beauty_demo: 我要投訴 at 2026-04-30T15:30:00.000Z | no match @ 2026-04-30 |
| 61 | PASS | non-matching promo context beauty_demo: 我要投訴 at 2026-04-30T16:00:00.000Z | no match @ 2026-05-01 |
| 62 | PASS | non-matching promo context beauty_demo: 我要投訴 at 2026-05-15T04:00:00.000Z | no match @ 2026-05-15 |
| 63 | PASS | non-matching promo context beauty_demo: 我要投訴 at 2026-05-31T15:59:59.000Z | no match @ 2026-05-31 |
| 64 | PASS | non-matching promo context beauty_demo: 我要投訴 at 2026-05-31T16:00:00.000Z | no match @ 2026-06-01 |
| 65 | PASS | non-matching promo context igshop_demo: 訂單IG9999去到邊？ at 2026-04-30T15:30:00.000Z | no match @ 2026-04-30 |
| 66 | PASS | non-matching promo context igshop_demo: 訂單IG9999去到邊？ at 2026-04-30T16:00:00.000Z | no match @ 2026-05-01 |
| 67 | PASS | non-matching promo context igshop_demo: 訂單IG9999去到邊？ at 2026-05-15T04:00:00.000Z | no match @ 2026-05-15 |
| 68 | PASS | non-matching promo context igshop_demo: 訂單IG9999去到邊？ at 2026-05-31T15:59:59.000Z | no match @ 2026-05-31 |
| 69 | PASS | non-matching promo context igshop_demo: 訂單IG9999去到邊？ at 2026-05-31T16:00:00.000Z | no match @ 2026-06-01 |
| 70 | PASS | non-matching promo context restaurant_demo: 順豐包郵嗎？ at 2026-04-30T15:30:00.000Z | no match @ 2026-04-30 |
| 71 | PASS | non-matching promo context restaurant_demo: 順豐包郵嗎？ at 2026-04-30T16:00:00.000Z | no match @ 2026-05-01 |
| 72 | PASS | non-matching promo context restaurant_demo: 順豐包郵嗎？ at 2026-05-15T04:00:00.000Z | no match @ 2026-05-15 |
| 73 | PASS | non-matching promo context restaurant_demo: 順豐包郵嗎？ at 2026-05-31T15:59:59.000Z | no match @ 2026-05-31 |
| 74 | PASS | non-matching promo context restaurant_demo: 順豐包郵嗎？ at 2026-05-31T16:00:00.000Z | no match @ 2026-06-01 |
| 75 | PASS | non-matching promo context edu_demo: 小顏優惠 at 2026-04-30T15:30:00.000Z | no match @ 2026-04-30 |
| 76 | PASS | non-matching promo context edu_demo: 小顏優惠 at 2026-04-30T16:00:00.000Z | no match @ 2026-05-01 |
| 77 | PASS | non-matching promo context edu_demo: 小顏優惠 at 2026-05-15T04:00:00.000Z | no match @ 2026-05-15 |
| 78 | PASS | non-matching promo context edu_demo: 小顏優惠 at 2026-05-31T15:59:59.000Z | no match @ 2026-05-31 |
| 79 | PASS | non-matching promo context edu_demo: 小顏優惠 at 2026-05-31T16:00:00.000Z | no match @ 2026-06-01 |
| 80 | PASS | matrix active igshop promo keyword coverage 1 | 五月順豐智能櫃免運 @ 2026-05-20 |
| 81 | PASS | matrix active beauty promo keyword coverage 2 | 小顏管理五月體驗優惠 @ 2026-05-20 |
| 82 | PASS | matrix active igshop promo keyword coverage 3 | 五月順豐智能櫃免運 @ 2026-05-20 |
| 83 | PASS | matrix active beauty promo keyword coverage 4 | 小顏管理五月體驗優惠 @ 2026-05-20 |
| 84 | PASS | matrix active igshop promo keyword coverage 5 | 五月順豐智能櫃免運 @ 2026-05-20 |
| 85 | PASS | matrix active beauty promo keyword coverage 6 | 小顏管理五月體驗優惠 @ 2026-05-20 |
| 86 | PASS | matrix active igshop promo keyword coverage 7 | 五月順豐智能櫃免運 @ 2026-05-20 |
| 87 | PASS | matrix active beauty promo keyword coverage 8 | 小顏管理五月體驗優惠 @ 2026-05-20 |
| 88 | PASS | matrix active igshop promo keyword coverage 9 | 五月順豐智能櫃免運 @ 2026-05-20 |
| 89 | PASS | matrix active beauty promo keyword coverage 10 | 小顏管理五月體驗優惠 @ 2026-05-20 |
| 90 | PASS | matrix active igshop promo keyword coverage 11 | 五月順豐智能櫃免運 @ 2026-05-20 |
| 91 | PASS | matrix active beauty promo keyword coverage 12 | 小顏管理五月體驗優惠 @ 2026-05-20 |
| 92 | PASS | matrix active igshop promo keyword coverage 13 | 五月順豐智能櫃免運 @ 2026-05-20 |
| 93 | PASS | matrix active beauty promo keyword coverage 14 | 小顏管理五月體驗優惠 @ 2026-05-20 |
| 94 | PASS | matrix active igshop promo keyword coverage 15 | 五月順豐智能櫃免運 @ 2026-05-20 |
| 95 | PASS | matrix active beauty promo keyword coverage 16 | 小顏管理五月體驗優惠 @ 2026-05-20 |
| 96 | PASS | matrix active igshop promo keyword coverage 17 | 五月順豐智能櫃免運 @ 2026-05-20 |
| 97 | PASS | matrix active beauty promo keyword coverage 18 | 小顏管理五月體驗優惠 @ 2026-05-20 |
| 98 | PASS | matrix active igshop promo keyword coverage 19 | 五月順豐智能櫃免運 @ 2026-05-20 |
| 99 | PASS | matrix active beauty promo keyword coverage 20 | 小顏管理五月體驗優惠 @ 2026-05-20 |
| 100 | PASS | matrix active igshop promo keyword coverage 21 | 五月順豐智能櫃免運 @ 2026-05-20 |

## Details

### 001 PASS - active small-face promotion matches in locale time

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "想了解小顏項目同點收費",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-09T03:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-09",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 002 PASS - expired promotion does not match after locale expiry

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "想了解小顏項目同點收費",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-06-01T00:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 003 PASS - wrong business does not match beauty promotion

Context:
```json
{
  "businessId": "restaurant_demo",
  "text": "想了解小顏項目同點收費",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-09T03:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-09",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 004 PASS - IG shop SF locker promotion matches shipping words

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "包唔包順豐智能櫃？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-09T03:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-09",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 005 PASS - beauty promo before locale May promo start: 小顏項目有冇優惠？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "小顏項目有冇優惠？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 006 PASS - beauty promo exact locale May start boundary: 小顏項目有冇優惠？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "小顏項目有冇優惠？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-01",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 007 PASS - beauty promo mid campaign: 小顏項目有冇優惠？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "小顏項目有冇優惠？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-15",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 008 PASS - beauty promo last locale campaign second: 小顏項目有冇優惠？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "小顏項目有冇優惠？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-31",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 009 PASS - beauty promo after locale campaign expiry: 小顏項目有冇優惠？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "小顏項目有冇優惠？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 010 PASS - beauty promo before locale May promo start: 面部輪廓收費點計？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "面部輪廓收費點計？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 011 PASS - beauty promo exact locale May start boundary: 面部輪廓收費點計？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "面部輪廓收費點計？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-01",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 012 PASS - beauty promo mid campaign: 面部輪廓收費點計？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "面部輪廓收費點計？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-15",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 013 PASS - beauty promo last locale campaign second: 面部輪廓收費點計？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "面部輪廓收費點計？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-31",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 014 PASS - beauty promo after locale campaign expiry: 面部輪廓收費點計？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "面部輪廓收費點計？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 015 PASS - beauty promo before locale May promo start: 五月小顏管理幾錢？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "五月小顏管理幾錢？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 016 PASS - beauty promo exact locale May start boundary: 五月小顏管理幾錢？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "五月小顏管理幾錢？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-01",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 017 PASS - beauty promo mid campaign: 五月小顏管理幾錢？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "五月小顏管理幾錢？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-15",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 018 PASS - beauty promo last locale campaign second: 五月小顏管理幾錢？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "五月小顏管理幾錢？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-31",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 019 PASS - beauty promo after locale campaign expiry: 五月小顏管理幾錢？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "五月小顏管理幾錢？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 020 PASS - beauty promo before locale May promo start: 浮腫護理有trial嗎？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "浮腫護理有trial嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 021 PASS - beauty promo exact locale May start boundary: 浮腫護理有trial嗎？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "浮腫護理有trial嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-01",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 0.9)"
  ]
}
```

### 022 PASS - beauty promo mid campaign: 浮腫護理有trial嗎？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "浮腫護理有trial嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-15",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 0.9)"
  ]
}
```

### 023 PASS - beauty promo last locale campaign second: 浮腫護理有trial嗎？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "浮腫護理有trial嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-31",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 0.9)"
  ]
}
```

### 024 PASS - beauty promo after locale campaign expiry: 浮腫護理有trial嗎？

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "浮腫護理有trial嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 025 PASS - beauty promo before locale May promo start: 想問小顏優惠詳情

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "想問小顏優惠詳情",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 026 PASS - beauty promo exact locale May start boundary: 想問小顏優惠詳情

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "想問小顏優惠詳情",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-01",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 027 PASS - beauty promo mid campaign: 想問小顏優惠詳情

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "想問小顏優惠詳情",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-15",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 028 PASS - beauty promo last locale campaign second: 想問小顏優惠詳情

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "想問小顏優惠詳情",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-31",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 029 PASS - beauty promo after locale campaign expiry: 想問小顏優惠詳情

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "想問小顏優惠詳情",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 030 PASS - igshop promo before locale May promo start: 順豐包郵嗎？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 031 PASS - igshop promo exact locale May start boundary: 順豐包郵嗎？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-01",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 1.3)"
  ]
}
```

### 032 PASS - igshop promo mid campaign: 順豐包郵嗎？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-15",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 1.3)"
  ]
}
```

### 033 PASS - igshop promo last locale campaign second: 順豐包郵嗎？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-31",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 1.3)"
  ]
}
```

### 034 PASS - igshop promo after locale campaign expiry: 順豐包郵嗎？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 035 PASS - igshop promo before locale May promo start: 運費點計？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "運費點計？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 036 PASS - igshop promo exact locale May start boundary: 運費點計？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "運費點計？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-01",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 037 PASS - igshop promo mid campaign: 運費點計？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "運費點計？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-15",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 038 PASS - igshop promo last locale campaign second: 運費點計？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "運費點計？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-31",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 039 PASS - igshop promo after locale campaign expiry: 運費點計？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "運費點計？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 040 PASS - igshop promo before locale May promo start: sf locker free shipping?

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "sf locker free shipping?",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 041 PASS - igshop promo exact locale May start boundary: sf locker free shipping?

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "sf locker free shipping?",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-01",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 042 PASS - igshop promo mid campaign: sf locker free shipping?

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "sf locker free shipping?",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-15",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 043 PASS - igshop promo last locale campaign second: sf locker free shipping?

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "sf locker free shipping?",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-31",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 044 PASS - igshop promo after locale campaign expiry: sf locker free shipping?

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "sf locker free shipping?",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 045 PASS - igshop promo before locale May promo start: 五月免運有冇？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "五月免運有冇？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 046 PASS - igshop promo exact locale May start boundary: 五月免運有冇？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "五月免運有冇？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-01",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 047 PASS - igshop promo mid campaign: 五月免運有冇？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "五月免運有冇？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-15",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 048 PASS - igshop promo last locale campaign second: 五月免運有冇？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "五月免運有冇？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-31",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 049 PASS - igshop promo after locale campaign expiry: 五月免運有冇？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "五月免運有冇？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 050 PASS - igshop promo before locale May promo start: 買滿幾多包順豐？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "買滿幾多包順豐？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 051 PASS - igshop promo exact locale May start boundary: 買滿幾多包順豐？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "買滿幾多包順豐？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-01",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 052 PASS - igshop promo mid campaign: 買滿幾多包順豐？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "買滿幾多包順豐？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-15",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 053 PASS - igshop promo last locale campaign second: 買滿幾多包順豐？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "買滿幾多包順豐？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-31",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 054 PASS - igshop promo after locale campaign expiry: 買滿幾多包順豐？

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "買滿幾多包順豐？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 055 PASS - non-matching promo context beauty_demo: 幾點開門？ at 2026-04-30T15:30:00.000Z

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "幾點開門？",
  "intent": {
    "primaryIntent": "hours_location"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 056 PASS - non-matching promo context beauty_demo: 幾點開門？ at 2026-04-30T16:00:00.000Z

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "幾點開門？",
  "intent": {
    "primaryIntent": "hours_location"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 057 PASS - non-matching promo context beauty_demo: 幾點開門？ at 2026-05-15T04:00:00.000Z

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "幾點開門？",
  "intent": {
    "primaryIntent": "hours_location"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-15",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 058 PASS - non-matching promo context beauty_demo: 幾點開門？ at 2026-05-31T15:59:59.000Z

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "幾點開門？",
  "intent": {
    "primaryIntent": "hours_location"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-31",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 059 PASS - non-matching promo context beauty_demo: 幾點開門？ at 2026-05-31T16:00:00.000Z

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "幾點開門？",
  "intent": {
    "primaryIntent": "hours_location"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 060 PASS - non-matching promo context beauty_demo: 我要投訴 at 2026-04-30T15:30:00.000Z

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "我要投訴",
  "intent": {
    "primaryIntent": "complaint"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 061 PASS - non-matching promo context beauty_demo: 我要投訴 at 2026-04-30T16:00:00.000Z

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "我要投訴",
  "intent": {
    "primaryIntent": "complaint"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 062 PASS - non-matching promo context beauty_demo: 我要投訴 at 2026-05-15T04:00:00.000Z

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "我要投訴",
  "intent": {
    "primaryIntent": "complaint"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-15",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 063 PASS - non-matching promo context beauty_demo: 我要投訴 at 2026-05-31T15:59:59.000Z

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "我要投訴",
  "intent": {
    "primaryIntent": "complaint"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-31",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 064 PASS - non-matching promo context beauty_demo: 我要投訴 at 2026-05-31T16:00:00.000Z

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "我要投訴",
  "intent": {
    "primaryIntent": "complaint"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 065 PASS - non-matching promo context igshop_demo: 訂單IG9999去到邊？ at 2026-04-30T15:30:00.000Z

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "訂單IG9999去到邊？",
  "intent": {
    "primaryIntent": "order_status"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 066 PASS - non-matching promo context igshop_demo: 訂單IG9999去到邊？ at 2026-04-30T16:00:00.000Z

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "訂單IG9999去到邊？",
  "intent": {
    "primaryIntent": "order_status"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 067 PASS - non-matching promo context igshop_demo: 訂單IG9999去到邊？ at 2026-05-15T04:00:00.000Z

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "訂單IG9999去到邊？",
  "intent": {
    "primaryIntent": "order_status"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-15",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 068 PASS - non-matching promo context igshop_demo: 訂單IG9999去到邊？ at 2026-05-31T15:59:59.000Z

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "訂單IG9999去到邊？",
  "intent": {
    "primaryIntent": "order_status"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-31",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 069 PASS - non-matching promo context igshop_demo: 訂單IG9999去到邊？ at 2026-05-31T16:00:00.000Z

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "訂單IG9999去到邊？",
  "intent": {
    "primaryIntent": "order_status"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 070 PASS - non-matching promo context restaurant_demo: 順豐包郵嗎？ at 2026-04-30T15:30:00.000Z

Context:
```json
{
  "businessId": "restaurant_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 071 PASS - non-matching promo context restaurant_demo: 順豐包郵嗎？ at 2026-04-30T16:00:00.000Z

Context:
```json
{
  "businessId": "restaurant_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 072 PASS - non-matching promo context restaurant_demo: 順豐包郵嗎？ at 2026-05-15T04:00:00.000Z

Context:
```json
{
  "businessId": "restaurant_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-15",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 073 PASS - non-matching promo context restaurant_demo: 順豐包郵嗎？ at 2026-05-31T15:59:59.000Z

Context:
```json
{
  "businessId": "restaurant_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-31",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 074 PASS - non-matching promo context restaurant_demo: 順豐包郵嗎？ at 2026-05-31T16:00:00.000Z

Context:
```json
{
  "businessId": "restaurant_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 075 PASS - non-matching promo context edu_demo: 小顏優惠 at 2026-04-30T15:30:00.000Z

Context:
```json
{
  "businessId": "edu_demo",
  "text": "小顏優惠",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-04-30T15:30:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-04-30",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 076 PASS - non-matching promo context edu_demo: 小顏優惠 at 2026-04-30T16:00:00.000Z

Context:
```json
{
  "businessId": "edu_demo",
  "text": "小顏優惠",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-04-30T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 077 PASS - non-matching promo context edu_demo: 小顏優惠 at 2026-05-15T04:00:00.000Z

Context:
```json
{
  "businessId": "edu_demo",
  "text": "小顏優惠",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-15T04:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-15",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 078 PASS - non-matching promo context edu_demo: 小顏優惠 at 2026-05-31T15:59:59.000Z

Context:
```json
{
  "businessId": "edu_demo",
  "text": "小顏優惠",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-31T15:59:59.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-05-31",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 079 PASS - non-matching promo context edu_demo: 小顏優惠 at 2026-05-31T16:00:00.000Z

Context:
```json
{
  "businessId": "edu_demo",
  "text": "小顏優惠",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-31T16:00:00.000Z"
}
```

Expected:
```json
{
  "match": false,
  "title": ""
}
```

Actual:
```json
{
  "match": false,
  "title": "",
  "checkedDateHk": "2026-06-01",
  "grounding": [],
  "reasons": [
    "No active approved promotion matched in UTC+8 locale time."
  ]
}
```

### 080 PASS - matrix active igshop promo keyword coverage 1

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "運費點計？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 081 PASS - matrix active beauty promo keyword coverage 2

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "五月小顏管理幾錢？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 082 PASS - matrix active igshop promo keyword coverage 3

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "五月免運有冇？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 083 PASS - matrix active beauty promo keyword coverage 4

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "想問小顏優惠詳情",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 084 PASS - matrix active igshop promo keyword coverage 5

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 1.3)"
  ]
}
```

### 085 PASS - matrix active beauty promo keyword coverage 6

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "面部輪廓收費點計？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 086 PASS - matrix active igshop promo keyword coverage 7

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "sf locker free shipping?",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 087 PASS - matrix active beauty promo keyword coverage 8

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "浮腫護理有trial嗎？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 0.9)"
  ]
}
```

### 088 PASS - matrix active igshop promo keyword coverage 9

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "買滿幾多包順豐？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 089 PASS - matrix active beauty promo keyword coverage 10

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "小顏項目有冇優惠？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 090 PASS - matrix active igshop promo keyword coverage 11

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "運費點計？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 091 PASS - matrix active beauty promo keyword coverage 12

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "五月小顏管理幾錢？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 092 PASS - matrix active igshop promo keyword coverage 13

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "五月免運有冇？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 093 PASS - matrix active beauty promo keyword coverage 14

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "想問小顏優惠詳情",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 094 PASS - matrix active igshop promo keyword coverage 15

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "順豐包郵嗎？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 1.3)"
  ]
}
```

### 095 PASS - matrix active beauty promo keyword coverage 16

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "面部輪廓收費點計？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 096 PASS - matrix active igshop promo keyword coverage 17

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "sf locker free shipping?",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 097 PASS - matrix active beauty promo keyword coverage 18

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "浮腫護理有trial嗎？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 0.9)"
  ]
}
```

### 098 PASS - matrix active igshop promo keyword coverage 19

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "買滿幾多包順豐？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

### 099 PASS - matrix active beauty promo keyword coverage 20

Context:
```json
{
  "businessId": "beauty_demo",
  "text": "小顏項目有冇優惠？",
  "intent": {
    "primaryIntent": "service_info"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠"
}
```

Actual:
```json
{
  "match": true,
  "title": "小顏管理五月體驗優惠",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "beauty_may_small_face_trial"
  ],
  "reasons": [
    "Matched promotion beauty_may_small_face_trial (score 1.3)"
  ]
}
```

### 100 PASS - matrix active igshop promo keyword coverage 21

Context:
```json
{
  "businessId": "igshop_demo",
  "text": "運費點計？",
  "intent": {
    "primaryIntent": "pricing"
  },
  "now": "2026-05-20T08:00:00.000Z"
}
```

Expected:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運"
}
```

Actual:
```json
{
  "match": true,
  "title": "五月順豐智能櫃免運",
  "checkedDateHk": "2026-05-20",
  "grounding": [
    "igshop_sf_locker_may"
  ],
  "reasons": [
    "Matched promotion igshop_sf_locker_may (score 0.9)"
  ]
}
```

