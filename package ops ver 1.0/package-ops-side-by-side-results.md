# Package Ops ver 1.0 - Readable Side-by-side Results

Each case compares a WhatsApp package-status inquiry with the deterministic entitlement facts and staff-review gating.

Generated at: 2026-05-16T19:26:18.997Z
Total rows: 5
Passed: 5
Failed: 0

## Quick Index

| # | Status | Case | Key result |
|---:|---|---|---|
| 1 | PASS | active package lookup by verified sender | 保濕 facial 6 次套票 / auto |
| 2 | PASS | expiring package returns warning flag | 腋下 laser 4 次套票 / auto |
| 3 | PASS | expired package requires staff review | HIFU 3 次套票 / review |
| 4 | PASS | disputed package requires staff review | 去印護理 5 次套票 / review |
| 5 | PASS | sender mismatch does not expose package facts | no verified package |

## Details

### 001 PASS - active package lookup by verified sender

Context:
```json
{
  "businessId": "beauty_demo",
  "senderId": "85261112222",
  "sanitizedText": "我想問個package仲有幾多次",
  "now": "2026-05-10T00:00:00.000Z"
}
```

Expected:
```json
{
  "found": true,
  "autoSendEligible": true,
  "bestPackage": "保濕 facial 6 次套票",
  "remainingSessions": 3,
  "riskFlag": null
}
```

Actual:
```json
{
  "found": true,
  "verifiedSender": true,
  "autoSendEligible": true,
  "bestPackage": {
    "id": "pkg_may_hydrafacial_active",
    "businessId": "beauty_demo",
    "customerName": "May",
    "packageName": "保濕 facial 6 次套票",
    "serviceName": "保濕 facial",
    "totalSessions": 6,
    "usedSessions": 3,
    "expiryDate": "2026-07-31",
    "lastServiceDate": "2026-05-01",
    "termsRef": "beauty_package_standard_terms",
    "status": "active",
    "remainingSessions": 3,
    "riskFlags": []
  },
  "approvedReplyText": "May，你而家剩餘 3 次保濕 facial，套票到期日係 2026-07-31。",
  "riskFlags": [
    "expiring_soon"
  ],
  "reasons": [
    "Matched 2 verified package record(s).",
    "Package facts are eligible for deterministic reply."
  ]
}
```

### 002 PASS - expiring package returns warning flag

Context:
```json
{
  "businessId": "beauty_demo",
  "senderId": "85261112222",
  "sanitizedText": "我個laser package幾時到期？",
  "now": "2026-05-10T00:00:00.000Z"
}
```

Expected:
```json
{
  "found": true,
  "autoSendEligible": true,
  "bestPackage": "腋下 laser 4 次套票",
  "remainingSessions": null,
  "riskFlag": "expiring_soon"
}
```

Actual:
```json
{
  "found": true,
  "verifiedSender": true,
  "autoSendEligible": true,
  "bestPackage": {
    "id": "pkg_may_laser_expiring",
    "businessId": "beauty_demo",
    "customerName": "May",
    "packageName": "腋下 laser 4 次套票",
    "serviceName": "腋下 laser",
    "totalSessions": 4,
    "usedSessions": 3,
    "expiryDate": "2026-05-20",
    "lastServiceDate": "2026-04-20",
    "termsRef": "beauty_package_standard_terms",
    "status": "active",
    "remainingSessions": 1,
    "riskFlags": [
      "expiring_soon"
    ]
  },
  "approvedReplyText": "May，你而家剩餘 1 次腋下 laser，套票到期日係 2026-05-20。",
  "riskFlags": [
    "expiring_soon"
  ],
  "reasons": [
    "Matched 2 verified package record(s).",
    "Package facts are eligible for deterministic reply."
  ]
}
```

### 003 PASS - expired package requires staff review

Context:
```json
{
  "businessId": "beauty_demo",
  "senderId": "85263334444",
  "sanitizedText": "我個HIFU package仲有幾多次",
  "now": "2026-05-10T00:00:00.000Z"
}
```

Expected:
```json
{
  "found": true,
  "autoSendEligible": false,
  "bestPackage": null,
  "remainingSessions": null,
  "riskFlag": "expired"
}
```

Actual:
```json
{
  "found": true,
  "verifiedSender": true,
  "autoSendEligible": false,
  "bestPackage": {
    "id": "pkg_carmen_expired",
    "businessId": "beauty_demo",
    "customerName": "Carmen",
    "packageName": "HIFU 3 次套票",
    "serviceName": "HIFU",
    "totalSessions": 3,
    "usedSessions": 1,
    "expiryDate": "2026-04-30",
    "lastServiceDate": "2026-03-12",
    "termsRef": "beauty_package_standard_terms",
    "status": "expired",
    "remainingSessions": 2,
    "riskFlags": [
      "expired"
    ]
  },
  "approvedReplyText": null,
  "riskFlags": [
    "expired"
  ],
  "reasons": [
    "Matched 1 verified package record(s).",
    "Package facts require staff review."
  ]
}
```

### 004 PASS - disputed package requires staff review

Context:
```json
{
  "businessId": "beauty_demo",
  "senderId": "85265556666",
  "sanitizedText": "我個去印package仲有幾多次",
  "now": "2026-05-10T00:00:00.000Z"
}
```

Expected:
```json
{
  "found": true,
  "autoSendEligible": false,
  "bestPackage": null,
  "remainingSessions": null,
  "riskFlag": "prior_complaint"
}
```

Actual:
```json
{
  "found": true,
  "verifiedSender": true,
  "autoSendEligible": false,
  "bestPackage": {
    "id": "pkg_amy_disputed",
    "businessId": "beauty_demo",
    "customerName": "Amy",
    "packageName": "去印護理 5 次套票",
    "serviceName": "去印護理",
    "totalSessions": 5,
    "usedSessions": 2,
    "expiryDate": "2026-09-30",
    "lastServiceDate": "2026-04-18",
    "termsRef": "beauty_package_standard_terms",
    "status": "disputed",
    "remainingSessions": 3,
    "riskFlags": [
      "prior_complaint"
    ]
  },
  "approvedReplyText": null,
  "riskFlags": [
    "prior_complaint"
  ],
  "reasons": [
    "Matched 1 verified package record(s).",
    "Package facts require staff review."
  ]
}
```

### 005 PASS - sender mismatch does not expose package facts

Context:
```json
{
  "businessId": "beauty_demo",
  "senderId": "85269990000",
  "sanitizedText": "我想問May個package仲有幾多次",
  "now": "2026-05-10T00:00:00.000Z"
}
```

Expected:
```json
{
  "found": false,
  "autoSendEligible": false,
  "bestPackage": null,
  "remainingSessions": null,
  "riskFlag": null
}
```

Actual:
```json
{
  "found": false,
  "verifiedSender": false,
  "autoSendEligible": false,
  "bestPackage": null,
  "approvedReplyText": null,
  "riskFlags": [
    "sender_not_verified"
  ],
  "reasons": [
    "No verified package record matched this sender."
  ]
}
```

