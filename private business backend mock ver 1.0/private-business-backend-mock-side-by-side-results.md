# Private Business Backend Mock ver 1.0 - Readable Side-by-side Results

Each case compares a controlled backend lookup with the minimal sanitized facts exposed to the AI workflow.

Generated at: 2026-05-09T13:31:08.635Z
Total rows: 100
Passed: 100
Failed: 0

## Quick Index

| # | Status | Case | Key result |
|---:|---|---|---|
| 1 | PASS | beauty available facial slot | checkAvailability: found=true available=true |
| 2 | PASS | beauty unavailable facial slot | checkAvailability: found=true available=false |
| 3 | PASS | restaurant available early dinner table | checkAvailability: found=true available=true |
| 4 | PASS | restaurant unavailable peak dinner table | checkAvailability: found=true available=false |
| 5 | PASS | ig shop black tee has stock | getStock: found=true available=true |
| 6 | PASS | ig shop cream tote is sold out | getStock: found=true available=false |
| 7 | PASS | ig shop paid order lookup | lookupOrder: found=true |
| 8 | PASS | ig shop shipped order lookup | lookupOrder: found=true |
| 9 | PASS | ig shop FPS payment received | lookupPayment: found=true |
| 10 | PASS | beauty wrong date has no facial slot | checkAvailability: found=false available=null |
| 11 | PASS | beauty wrong service has no laser slot | checkAvailability: found=false available=null |
| 12 | PASS | restaurant wrong party size has no table | checkAvailability: found=false available=null |
| 13 | PASS | education assessment slot is available | checkAvailability: found=true available=true |
| 14 | PASS | education evening assessment not in mock backend | checkAvailability: found=false available=null |
| 15 | PASS | unknown business booking lookup is empty | checkAvailability: found=false available=null |
| 16 | PASS | stock lookup by product name finds black tee | getStock: found=true available=true |
| 17 | PASS | stock lookup by lowercase sku finds black tee | getStock: found=true available=true |
| 18 | PASS | stock lookup missing sku returns not found | getStock: found=false available=null |
| 19 | PASS | restaurant has no retail stock records | getStock: found=false available=null |
| 20 | PASS | beauty has no product stock records | getStock: found=false available=null |
| 21 | PASS | unknown IG order is not found | lookupOrder: found=false |
| 22 | PASS | restaurant order lookup stays private and empty | lookupOrder: found=false |
| 23 | PASS | beauty order lookup stays empty | lookupOrder: found=false |
| 24 | PASS | unknown FPS payment is not found | lookupPayment: found=false |
| 25 | PASS | beauty payment lookup does not expose IG payment | lookupPayment: found=false |
| 26 | PASS | restaurant payment lookup is empty | lookupPayment: found=false |
| 27 | PASS | minimal facts booking routes to availability | getMinimalFacts: found=true available=true |
| 28 | PASS | minimal facts reschedule routes to availability | getMinimalFacts: found=true available=true |
| 29 | PASS | minimal facts order status routes to order lookup | getMinimalFacts: found=true |
| 30 | PASS | minimal facts payment routes to payment lookup | getMinimalFacts: found=true |
| 31 | PASS | minimal facts service info routes to stock lookup | getMinimalFacts: found=true available=true |
| 32 | PASS | minimal facts general skips backend lookup | getMinimalFacts: found=false |
| 33 | PASS | matrix stock restaurant_demo BAG-CREAM 1 | getStock: found=false available=null |
| 34 | PASS | matrix order igshop_demo IG3002 2 | lookupOrder: found=false |
| 35 | PASS | matrix payment edu_demo FPS-MOCK-3 3 | lookupPayment: found=false |
| 36 | PASS | matrix availability unknown_business future empty slot 4 | checkAvailability: found=false available=null |
| 37 | PASS | matrix stock beauty_demo TEE-BLK-M 5 | getStock: found=false available=null |
| 38 | PASS | matrix order restaurant_demo IG1002 6 | lookupOrder: found=false |
| 39 | PASS | matrix payment igshop_demo FPS-MOCK-7 7 | lookupPayment: found=false |
| 40 | PASS | matrix availability edu_demo future empty slot 8 | checkAvailability: found=false available=null |
| 41 | PASS | matrix stock unknown_business COURSE-P3 9 | getStock: found=false available=null |
| 42 | PASS | matrix order beauty_demo IG3010 10 | lookupOrder: found=false |
| 43 | PASS | matrix payment restaurant_demo FPS-MOCK-11 11 | lookupPayment: found=false |
| 44 | PASS | matrix availability igshop_demo future empty slot 12 | checkAvailability: found=false available=null |
| 45 | PASS | matrix stock edu_demo SERUM-001 13 | getStock: found=false available=null |
| 46 | PASS | matrix order unknown_business IG3014 14 | lookupOrder: found=false |
| 47 | PASS | matrix payment beauty_demo FPS-IG1001 15 | lookupPayment: found=false |
| 48 | PASS | matrix availability restaurant_demo future empty slot 16 | checkAvailability: found=false available=null |
| 49 | PASS | matrix stock igshop_demo TEE-WHT-S 17 | getStock: found=false available=null |
| 50 | PASS | matrix order edu_demo IG1002 18 | lookupOrder: found=false |
| 51 | PASS | matrix payment unknown_business FPS-MOCK-19 19 | lookupPayment: found=false |
| 52 | PASS | matrix availability beauty_demo future empty slot 20 | checkAvailability: found=false available=null |
| 53 | PASS | matrix stock restaurant_demo BAG-CREAM 21 | getStock: found=false available=null |
| 54 | PASS | matrix order igshop_demo IG3022 22 | lookupOrder: found=false |
| 55 | PASS | matrix payment edu_demo FPS-MOCK-23 23 | lookupPayment: found=false |
| 56 | PASS | matrix availability unknown_business future empty slot 24 | checkAvailability: found=false available=null |
| 57 | PASS | matrix stock beauty_demo TEE-BLK-M 25 | getStock: found=false available=null |
| 58 | PASS | matrix order restaurant_demo IG3026 26 | lookupOrder: found=false |
| 59 | PASS | matrix payment igshop_demo FPS-MOCK-27 27 | lookupPayment: found=false |
| 60 | PASS | matrix availability edu_demo future empty slot 28 | checkAvailability: found=false available=null |
| 61 | PASS | matrix stock unknown_business COURSE-P3 29 | getStock: found=false available=null |
| 62 | PASS | matrix order beauty_demo IG1002 30 | lookupOrder: found=false |
| 63 | PASS | matrix payment restaurant_demo FPS-MOCK-31 31 | lookupPayment: found=false |
| 64 | PASS | matrix availability igshop_demo future empty slot 32 | checkAvailability: found=false available=null |
| 65 | PASS | matrix stock edu_demo SERUM-001 33 | getStock: found=false available=null |
| 66 | PASS | matrix order unknown_business IG3034 34 | lookupOrder: found=false |
| 67 | PASS | matrix payment beauty_demo FPS-IG1001 35 | lookupPayment: found=false |
| 68 | PASS | matrix availability restaurant_demo future empty slot 36 | checkAvailability: found=false available=null |
| 69 | PASS | matrix stock igshop_demo TEE-WHT-S 37 | getStock: found=false available=null |
| 70 | PASS | matrix order edu_demo IG3038 38 | lookupOrder: found=false |
| 71 | PASS | matrix payment unknown_business FPS-MOCK-39 39 | lookupPayment: found=false |
| 72 | PASS | matrix availability beauty_demo future empty slot 40 | checkAvailability: found=false available=null |
| 73 | PASS | matrix stock restaurant_demo BAG-CREAM 41 | getStock: found=false available=null |
| 74 | PASS | matrix order igshop_demo IG1002 42 | lookupOrder: found=true |
| 75 | PASS | matrix payment edu_demo FPS-MOCK-43 43 | lookupPayment: found=false |
| 76 | PASS | matrix availability unknown_business future empty slot 44 | checkAvailability: found=false available=null |
| 77 | PASS | matrix stock beauty_demo TEE-BLK-M 45 | getStock: found=false available=null |
| 78 | PASS | matrix order restaurant_demo IG3046 46 | lookupOrder: found=false |
| 79 | PASS | matrix payment igshop_demo FPS-MOCK-47 47 | lookupPayment: found=false |
| 80 | PASS | matrix availability edu_demo future empty slot 48 | checkAvailability: found=false available=null |
| 81 | PASS | matrix stock unknown_business COURSE-P3 49 | getStock: found=false available=null |
| 82 | PASS | matrix order beauty_demo IG3050 50 | lookupOrder: found=false |
| 83 | PASS | matrix payment restaurant_demo FPS-MOCK-51 51 | lookupPayment: found=false |
| 84 | PASS | matrix availability igshop_demo future empty slot 52 | checkAvailability: found=false available=null |
| 85 | PASS | matrix stock edu_demo SERUM-001 53 | getStock: found=false available=null |
| 86 | PASS | matrix order unknown_business IG1002 54 | lookupOrder: found=false |
| 87 | PASS | matrix payment beauty_demo FPS-IG1001 55 | lookupPayment: found=false |
| 88 | PASS | matrix availability restaurant_demo future empty slot 56 | checkAvailability: found=false available=null |
| 89 | PASS | matrix stock igshop_demo TEE-WHT-S 57 | getStock: found=false available=null |
| 90 | PASS | matrix order edu_demo IG3058 58 | lookupOrder: found=false |
| 91 | PASS | matrix payment unknown_business FPS-MOCK-59 59 | lookupPayment: found=false |
| 92 | PASS | matrix availability beauty_demo future empty slot 60 | checkAvailability: found=false available=null |
| 93 | PASS | matrix stock restaurant_demo BAG-CREAM 61 | getStock: found=false available=null |
| 94 | PASS | matrix order igshop_demo IG3062 62 | lookupOrder: found=false |
| 95 | PASS | matrix payment edu_demo FPS-MOCK-63 63 | lookupPayment: found=false |
| 96 | PASS | matrix availability unknown_business future empty slot 64 | checkAvailability: found=false available=null |
| 97 | PASS | matrix stock beauty_demo TEE-BLK-M 65 | getStock: found=false available=null |
| 98 | PASS | matrix order restaurant_demo IG1002 66 | lookupOrder: found=false |
| 99 | PASS | matrix payment igshop_demo FPS-MOCK-67 67 | lookupPayment: found=false |
| 100 | PASS | matrix availability edu_demo future empty slot 68 | checkAvailability: found=false available=null |

## Details

### 001 PASS - beauty available facial slot

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "beauty_demo",
    "date": "2026-05-09",
    "time": "19:00",
    "service": "facial"
  }
}
```

Expected:
```json
{
  "found": true,
  "available": true
}
```

Actual:
```json
{
  "found": true,
  "available": true,
  "facts": [
    {
      "key": "date",
      "value": "2026-05-09"
    },
    {
      "key": "time",
      "value": "19:00"
    },
    {
      "key": "service",
      "value": "facial"
    },
    {
      "key": "available",
      "value": true
    }
  ],
  "reason": "Mock backend has an available slot/table."
}
```

### 002 PASS - beauty unavailable facial slot

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "beauty_demo",
    "date": "2026-05-09",
    "time": "20:00",
    "service": "facial"
  }
}
```

Expected:
```json
{
  "found": true,
  "available": false
}
```

Actual:
```json
{
  "found": true,
  "available": false,
  "facts": [
    {
      "key": "date",
      "value": "2026-05-09"
    },
    {
      "key": "time",
      "value": "20:00"
    },
    {
      "key": "service",
      "value": "facial"
    },
    {
      "key": "available",
      "value": false
    }
  ],
  "reason": "Mock backend record is unavailable."
}
```

### 003 PASS - restaurant available early dinner table

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "restaurant_demo",
    "date": "2026-05-09",
    "time": "18:30",
    "partySize": 2
  }
}
```

Expected:
```json
{
  "found": true,
  "available": true
}
```

Actual:
```json
{
  "found": true,
  "available": true,
  "facts": [
    {
      "key": "date",
      "value": "2026-05-09"
    },
    {
      "key": "time",
      "value": "18:30"
    },
    {
      "key": "partySize",
      "value": 2
    },
    {
      "key": "available",
      "value": true
    }
  ],
  "reason": "Mock backend has an available slot/table."
}
```

### 004 PASS - restaurant unavailable peak dinner table

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "restaurant_demo",
    "date": "2026-05-09",
    "time": "20:00",
    "partySize": 4
  }
}
```

Expected:
```json
{
  "found": true,
  "available": false
}
```

Actual:
```json
{
  "found": true,
  "available": false,
  "facts": [
    {
      "key": "date",
      "value": "2026-05-09"
    },
    {
      "key": "time",
      "value": "20:00"
    },
    {
      "key": "partySize",
      "value": 4
    },
    {
      "key": "available",
      "value": false
    }
  ],
  "reason": "Mock backend record is unavailable."
}
```

### 005 PASS - ig shop black tee has stock

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "igshop_demo",
    "sku": "TEE-BLK-M"
  }
}
```

Expected:
```json
{
  "found": true,
  "available": true
}
```

Actual:
```json
{
  "found": true,
  "available": true,
  "facts": [
    {
      "key": "sku",
      "value": "TEE-BLK-M"
    },
    {
      "key": "name",
      "value": "Black tee M"
    },
    {
      "key": "available",
      "value": true
    },
    {
      "key": "quantity",
      "value": 8
    }
  ],
  "reason": "Stock is available in mock backend."
}
```

### 006 PASS - ig shop cream tote is sold out

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "igshop_demo",
    "sku": "BAG-CREAM"
  }
}
```

Expected:
```json
{
  "found": true,
  "available": false
}
```

Actual:
```json
{
  "found": true,
  "available": false,
  "facts": [
    {
      "key": "sku",
      "value": "BAG-CREAM"
    },
    {
      "key": "name",
      "value": "Cream tote bag"
    },
    {
      "key": "available",
      "value": false
    },
    {
      "key": "quantity",
      "value": 0
    }
  ],
  "reason": "Stock is unavailable in mock backend."
}
```

### 007 PASS - ig shop paid order lookup

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "igshop_demo",
    "orderId": "IG1001"
  }
}
```

Expected:
```json
{
  "found": true
}
```

Actual:
```json
{
  "found": true,
  "facts": [
    {
      "key": "orderId",
      "value": "IG1001"
    },
    {
      "key": "status",
      "value": "paid"
    },
    {
      "key": "shipmentStatus",
      "value": "pending"
    },
    {
      "key": "courier",
      "value": "SF Express"
    }
  ],
  "reason": "Order found in mock backend."
}
```

### 008 PASS - ig shop shipped order lookup

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "igshop_demo",
    "orderId": "IG1002"
  }
}
```

Expected:
```json
{
  "found": true
}
```

Actual:
```json
{
  "found": true,
  "facts": [
    {
      "key": "orderId",
      "value": "IG1002"
    },
    {
      "key": "status",
      "value": "shipped"
    },
    {
      "key": "shipmentStatus",
      "value": "in_transit"
    },
    {
      "key": "courier",
      "value": "SF Express"
    }
  ],
  "reason": "Order found in mock backend."
}
```

### 009 PASS - ig shop FPS payment received

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "igshop_demo",
    "reference": "FPS-IG1001"
  }
}
```

Expected:
```json
{
  "found": true
}
```

Actual:
```json
{
  "found": true,
  "facts": [
    {
      "key": "reference",
      "value": "FPS-IG1001"
    },
    {
      "key": "status",
      "value": "received"
    },
    {
      "key": "amount",
      "value": 500
    }
  ],
  "reason": "Payment found in mock backend."
}
```

### 010 PASS - beauty wrong date has no facial slot

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "beauty_demo",
    "date": "2026-05-10",
    "time": "19:00",
    "service": "facial"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 011 PASS - beauty wrong service has no laser slot

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "beauty_demo",
    "date": "2026-05-09",
    "time": "19:00",
    "service": "laser"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 012 PASS - restaurant wrong party size has no table

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "restaurant_demo",
    "date": "2026-05-09",
    "time": "18:30",
    "partySize": 5
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 013 PASS - education assessment slot is available

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "edu_demo",
    "date": "2026-05-10",
    "time": "14:00",
    "service": "assessment"
  }
}
```

Expected:
```json
{
  "found": true,
  "available": true
}
```

Actual:
```json
{
  "found": true,
  "available": true,
  "facts": [
    {
      "key": "date",
      "value": "2026-05-10"
    },
    {
      "key": "time",
      "value": "14:00"
    },
    {
      "key": "service",
      "value": "assessment"
    },
    {
      "key": "available",
      "value": true
    }
  ],
  "reason": "Mock backend has an available slot/table."
}
```

### 014 PASS - education evening assessment not in mock backend

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "edu_demo",
    "date": "2026-05-10",
    "time": "19:00",
    "service": "assessment"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 015 PASS - unknown business booking lookup is empty

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "unknown_business",
    "date": "2026-05-09",
    "time": "19:00",
    "service": "facial"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 016 PASS - stock lookup by product name finds black tee

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "igshop_demo",
    "name": "black tee"
  }
}
```

Expected:
```json
{
  "found": true,
  "available": true
}
```

Actual:
```json
{
  "found": true,
  "available": true,
  "facts": [
    {
      "key": "sku",
      "value": "TEE-BLK-M"
    },
    {
      "key": "name",
      "value": "Black tee M"
    },
    {
      "key": "available",
      "value": true
    },
    {
      "key": "quantity",
      "value": 8
    }
  ],
  "reason": "Stock is available in mock backend."
}
```

### 017 PASS - stock lookup by lowercase sku finds black tee

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "igshop_demo",
    "sku": "tee-blk-m"
  }
}
```

Expected:
```json
{
  "found": true,
  "available": true
}
```

Actual:
```json
{
  "found": true,
  "available": true,
  "facts": [
    {
      "key": "sku",
      "value": "TEE-BLK-M"
    },
    {
      "key": "name",
      "value": "Black tee M"
    },
    {
      "key": "available",
      "value": true
    },
    {
      "key": "quantity",
      "value": 8
    }
  ],
  "reason": "Stock is available in mock backend."
}
```

### 018 PASS - stock lookup missing sku returns not found

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "igshop_demo",
    "sku": "TEE-WHT-S"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 019 PASS - restaurant has no retail stock records

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "restaurant_demo",
    "sku": "TEE-BLK-M"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 020 PASS - beauty has no product stock records

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "beauty_demo",
    "sku": "SERUM-001"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 021 PASS - unknown IG order is not found

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "igshop_demo",
    "orderId": "IG9999"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 022 PASS - restaurant order lookup stays private and empty

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "restaurant_demo",
    "orderId": "IG1001"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 023 PASS - beauty order lookup stays empty

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "beauty_demo",
    "orderId": "IG1002"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 024 PASS - unknown FPS payment is not found

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "igshop_demo",
    "reference": "FPS-MISSING"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 025 PASS - beauty payment lookup does not expose IG payment

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "beauty_demo",
    "reference": "FPS-IG1001"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 026 PASS - restaurant payment lookup is empty

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "restaurant_demo",
    "reference": "FPS-IG1001"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 027 PASS - minimal facts booking routes to availability

Context:
```json
{
  "fn": "getMinimalFacts",
  "query": {
    "businessId": "beauty_demo",
    "intent": {
      "primaryIntent": "booking"
    },
    "query": {
      "businessId": "beauty_demo",
      "date": "2026-05-09",
      "time": "19:00",
      "service": "facial"
    }
  }
}
```

Expected:
```json
{
  "found": true
}
```

Actual:
```json
{
  "found": true,
  "available": true,
  "facts": [
    {
      "key": "date",
      "value": "2026-05-09"
    },
    {
      "key": "time",
      "value": "19:00"
    },
    {
      "key": "service",
      "value": "facial"
    },
    {
      "key": "available",
      "value": true
    }
  ],
  "reason": "Mock backend has an available slot/table."
}
```

### 028 PASS - minimal facts reschedule routes to availability

Context:
```json
{
  "fn": "getMinimalFacts",
  "query": {
    "businessId": "restaurant_demo",
    "intent": {
      "primaryIntent": "reschedule"
    },
    "query": {
      "businessId": "restaurant_demo",
      "date": "2026-05-09",
      "time": "18:30",
      "partySize": 2
    }
  }
}
```

Expected:
```json
{
  "found": true
}
```

Actual:
```json
{
  "found": true,
  "available": true,
  "facts": [
    {
      "key": "date",
      "value": "2026-05-09"
    },
    {
      "key": "time",
      "value": "18:30"
    },
    {
      "key": "partySize",
      "value": 2
    },
    {
      "key": "available",
      "value": true
    }
  ],
  "reason": "Mock backend has an available slot/table."
}
```

### 029 PASS - minimal facts order status routes to order lookup

Context:
```json
{
  "fn": "getMinimalFacts",
  "query": {
    "businessId": "igshop_demo",
    "intent": {
      "primaryIntent": "order_status"
    },
    "query": {
      "businessId": "igshop_demo",
      "orderId": "IG1001"
    }
  }
}
```

Expected:
```json
{
  "found": true
}
```

Actual:
```json
{
  "found": true,
  "facts": [
    {
      "key": "orderId",
      "value": "IG1001"
    },
    {
      "key": "status",
      "value": "paid"
    },
    {
      "key": "shipmentStatus",
      "value": "pending"
    },
    {
      "key": "courier",
      "value": "SF Express"
    }
  ],
  "reason": "Order found in mock backend."
}
```

### 030 PASS - minimal facts payment routes to payment lookup

Context:
```json
{
  "fn": "getMinimalFacts",
  "query": {
    "businessId": "igshop_demo",
    "intent": {
      "primaryIntent": "payment"
    },
    "query": {
      "businessId": "igshop_demo",
      "reference": "FPS-IG1001"
    }
  }
}
```

Expected:
```json
{
  "found": true
}
```

Actual:
```json
{
  "found": true,
  "facts": [
    {
      "key": "reference",
      "value": "FPS-IG1001"
    },
    {
      "key": "status",
      "value": "received"
    },
    {
      "key": "amount",
      "value": 500
    }
  ],
  "reason": "Payment found in mock backend."
}
```

### 031 PASS - minimal facts service info routes to stock lookup

Context:
```json
{
  "fn": "getMinimalFacts",
  "query": {
    "businessId": "igshop_demo",
    "intent": {
      "primaryIntent": "service_info"
    },
    "query": {
      "businessId": "igshop_demo",
      "sku": "TEE-BLK-M"
    }
  }
}
```

Expected:
```json
{
  "found": true
}
```

Actual:
```json
{
  "found": true,
  "available": true,
  "facts": [
    {
      "key": "sku",
      "value": "TEE-BLK-M"
    },
    {
      "key": "name",
      "value": "Black tee M"
    },
    {
      "key": "available",
      "value": true
    },
    {
      "key": "quantity",
      "value": 8
    }
  ],
  "reason": "Stock is available in mock backend."
}
```

### 032 PASS - minimal facts general skips backend lookup

Context:
```json
{
  "fn": "getMinimalFacts",
  "query": {
    "businessId": "igshop_demo",
    "intent": {
      "primaryIntent": "general"
    },
    "query": {
      "businessId": "igshop_demo",
      "sku": "TEE-BLK-M"
    }
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Intent does not require backend lookup."
}
```

### 033 PASS - matrix stock restaurant_demo BAG-CREAM 1

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "restaurant_demo",
    "sku": "BAG-CREAM"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 034 PASS - matrix order igshop_demo IG3002 2

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "igshop_demo",
    "orderId": "IG3002"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 035 PASS - matrix payment edu_demo FPS-MOCK-3 3

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "edu_demo",
    "reference": "FPS-MOCK-3"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 036 PASS - matrix availability unknown_business future empty slot 4

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "unknown_business",
    "date": "2027-01-01",
    "time": "20:00"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 037 PASS - matrix stock beauty_demo TEE-BLK-M 5

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "beauty_demo",
    "sku": "TEE-BLK-M"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 038 PASS - matrix order restaurant_demo IG1002 6

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "restaurant_demo",
    "orderId": "IG1002"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 039 PASS - matrix payment igshop_demo FPS-MOCK-7 7

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "igshop_demo",
    "reference": "FPS-MOCK-7"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 040 PASS - matrix availability edu_demo future empty slot 8

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "edu_demo",
    "date": "2027-01-01",
    "time": "18:30"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 041 PASS - matrix stock unknown_business COURSE-P3 9

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "unknown_business",
    "sku": "COURSE-P3"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 042 PASS - matrix order beauty_demo IG3010 10

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "beauty_demo",
    "orderId": "IG3010"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 043 PASS - matrix payment restaurant_demo FPS-MOCK-11 11

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "restaurant_demo",
    "reference": "FPS-MOCK-11"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 044 PASS - matrix availability igshop_demo future empty slot 12

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "igshop_demo",
    "date": "2027-01-01",
    "time": "11:00",
    "partySize": 4
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 045 PASS - matrix stock edu_demo SERUM-001 13

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "edu_demo",
    "sku": "SERUM-001"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 046 PASS - matrix order unknown_business IG3014 14

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "unknown_business",
    "orderId": "IG3014"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 047 PASS - matrix payment beauty_demo FPS-IG1001 15

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "beauty_demo",
    "reference": "FPS-IG1001"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 048 PASS - matrix availability restaurant_demo future empty slot 16

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "restaurant_demo",
    "date": "2027-01-01",
    "time": "20:00"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 049 PASS - matrix stock igshop_demo TEE-WHT-S 17

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "igshop_demo",
    "sku": "TEE-WHT-S"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 050 PASS - matrix order edu_demo IG1002 18

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "edu_demo",
    "orderId": "IG1002"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 051 PASS - matrix payment unknown_business FPS-MOCK-19 19

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "unknown_business",
    "reference": "FPS-MOCK-19"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 052 PASS - matrix availability beauty_demo future empty slot 20

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "beauty_demo",
    "date": "2027-01-01",
    "time": "18:30"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 053 PASS - matrix stock restaurant_demo BAG-CREAM 21

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "restaurant_demo",
    "sku": "BAG-CREAM"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 054 PASS - matrix order igshop_demo IG3022 22

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "igshop_demo",
    "orderId": "IG3022"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 055 PASS - matrix payment edu_demo FPS-MOCK-23 23

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "edu_demo",
    "reference": "FPS-MOCK-23"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 056 PASS - matrix availability unknown_business future empty slot 24

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "unknown_business",
    "date": "2027-01-01",
    "time": "11:00",
    "partySize": 4
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 057 PASS - matrix stock beauty_demo TEE-BLK-M 25

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "beauty_demo",
    "sku": "TEE-BLK-M"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 058 PASS - matrix order restaurant_demo IG3026 26

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "restaurant_demo",
    "orderId": "IG3026"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 059 PASS - matrix payment igshop_demo FPS-MOCK-27 27

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "igshop_demo",
    "reference": "FPS-MOCK-27"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 060 PASS - matrix availability edu_demo future empty slot 28

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "edu_demo",
    "date": "2027-01-01",
    "time": "20:00"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 061 PASS - matrix stock unknown_business COURSE-P3 29

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "unknown_business",
    "sku": "COURSE-P3"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 062 PASS - matrix order beauty_demo IG1002 30

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "beauty_demo",
    "orderId": "IG1002"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 063 PASS - matrix payment restaurant_demo FPS-MOCK-31 31

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "restaurant_demo",
    "reference": "FPS-MOCK-31"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 064 PASS - matrix availability igshop_demo future empty slot 32

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "igshop_demo",
    "date": "2027-01-01",
    "time": "18:30"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 065 PASS - matrix stock edu_demo SERUM-001 33

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "edu_demo",
    "sku": "SERUM-001"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 066 PASS - matrix order unknown_business IG3034 34

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "unknown_business",
    "orderId": "IG3034"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 067 PASS - matrix payment beauty_demo FPS-IG1001 35

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "beauty_demo",
    "reference": "FPS-IG1001"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 068 PASS - matrix availability restaurant_demo future empty slot 36

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "restaurant_demo",
    "date": "2027-01-01",
    "time": "11:00",
    "partySize": 4
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 069 PASS - matrix stock igshop_demo TEE-WHT-S 37

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "igshop_demo",
    "sku": "TEE-WHT-S"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 070 PASS - matrix order edu_demo IG3038 38

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "edu_demo",
    "orderId": "IG3038"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 071 PASS - matrix payment unknown_business FPS-MOCK-39 39

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "unknown_business",
    "reference": "FPS-MOCK-39"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 072 PASS - matrix availability beauty_demo future empty slot 40

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "beauty_demo",
    "date": "2027-01-01",
    "time": "20:00"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 073 PASS - matrix stock restaurant_demo BAG-CREAM 41

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "restaurant_demo",
    "sku": "BAG-CREAM"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 074 PASS - matrix order igshop_demo IG1002 42

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "igshop_demo",
    "orderId": "IG1002"
  }
}
```

Expected:
```json
{
  "found": true
}
```

Actual:
```json
{
  "found": true,
  "facts": [
    {
      "key": "orderId",
      "value": "IG1002"
    },
    {
      "key": "status",
      "value": "shipped"
    },
    {
      "key": "shipmentStatus",
      "value": "in_transit"
    },
    {
      "key": "courier",
      "value": "SF Express"
    }
  ],
  "reason": "Order found in mock backend."
}
```

### 075 PASS - matrix payment edu_demo FPS-MOCK-43 43

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "edu_demo",
    "reference": "FPS-MOCK-43"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 076 PASS - matrix availability unknown_business future empty slot 44

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "unknown_business",
    "date": "2027-01-01",
    "time": "18:30"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 077 PASS - matrix stock beauty_demo TEE-BLK-M 45

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "beauty_demo",
    "sku": "TEE-BLK-M"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 078 PASS - matrix order restaurant_demo IG3046 46

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "restaurant_demo",
    "orderId": "IG3046"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 079 PASS - matrix payment igshop_demo FPS-MOCK-47 47

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "igshop_demo",
    "reference": "FPS-MOCK-47"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 080 PASS - matrix availability edu_demo future empty slot 48

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "edu_demo",
    "date": "2027-01-01",
    "time": "11:00",
    "partySize": 4
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 081 PASS - matrix stock unknown_business COURSE-P3 49

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "unknown_business",
    "sku": "COURSE-P3"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 082 PASS - matrix order beauty_demo IG3050 50

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "beauty_demo",
    "orderId": "IG3050"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 083 PASS - matrix payment restaurant_demo FPS-MOCK-51 51

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "restaurant_demo",
    "reference": "FPS-MOCK-51"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 084 PASS - matrix availability igshop_demo future empty slot 52

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "igshop_demo",
    "date": "2027-01-01",
    "time": "20:00"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 085 PASS - matrix stock edu_demo SERUM-001 53

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "edu_demo",
    "sku": "SERUM-001"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 086 PASS - matrix order unknown_business IG1002 54

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "unknown_business",
    "orderId": "IG1002"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 087 PASS - matrix payment beauty_demo FPS-IG1001 55

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "beauty_demo",
    "reference": "FPS-IG1001"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 088 PASS - matrix availability restaurant_demo future empty slot 56

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "restaurant_demo",
    "date": "2027-01-01",
    "time": "18:30"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 089 PASS - matrix stock igshop_demo TEE-WHT-S 57

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "igshop_demo",
    "sku": "TEE-WHT-S"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 090 PASS - matrix order edu_demo IG3058 58

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "edu_demo",
    "orderId": "IG3058"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 091 PASS - matrix payment unknown_business FPS-MOCK-59 59

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "unknown_business",
    "reference": "FPS-MOCK-59"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 092 PASS - matrix availability beauty_demo future empty slot 60

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "beauty_demo",
    "date": "2027-01-01",
    "time": "11:00",
    "partySize": 4
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 093 PASS - matrix stock restaurant_demo BAG-CREAM 61

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "restaurant_demo",
    "sku": "BAG-CREAM"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 094 PASS - matrix order igshop_demo IG3062 62

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "igshop_demo",
    "orderId": "IG3062"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 095 PASS - matrix payment edu_demo FPS-MOCK-63 63

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "edu_demo",
    "reference": "FPS-MOCK-63"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 096 PASS - matrix availability unknown_business future empty slot 64

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "unknown_business",
    "date": "2027-01-01",
    "time": "20:00"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

### 097 PASS - matrix stock beauty_demo TEE-BLK-M 65

Context:
```json
{
  "fn": "getStock",
  "query": {
    "businessId": "beauty_demo",
    "sku": "TEE-BLK-M"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "Stock item not found in mock backend."
}
```

### 098 PASS - matrix order restaurant_demo IG1002 66

Context:
```json
{
  "fn": "lookupOrder",
  "query": {
    "businessId": "restaurant_demo",
    "orderId": "IG1002"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Order not found in mock backend."
}
```

### 099 PASS - matrix payment igshop_demo FPS-MOCK-67 67

Context:
```json
{
  "fn": "lookupPayment",
  "query": {
    "businessId": "igshop_demo",
    "reference": "FPS-MOCK-67"
  }
}
```

Expected:
```json
{
  "found": false
}
```

Actual:
```json
{
  "found": false,
  "facts": [],
  "reason": "Payment not found in mock backend."
}
```

### 100 PASS - matrix availability edu_demo future empty slot 68

Context:
```json
{
  "fn": "checkAvailability",
  "query": {
    "businessId": "edu_demo",
    "date": "2027-01-01",
    "time": "18:30"
  }
}
```

Expected:
```json
{
  "found": false,
  "available": null
}
```

Actual:
```json
{
  "found": false,
  "available": null,
  "facts": [],
  "reason": "No matching availability record in mock backend."
}
```

