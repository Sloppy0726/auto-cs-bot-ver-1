# Channel Adapter ver 1.0 - Readable Side-by-side Results

Each case compares the raw channel payload with the normalized inbound shape used by the pipeline.

Generated at: 2026-05-09T13:31:08.528Z
Total rows: 100
Passed: 100
Failed: 0

## Quick Index

| # | Status | Case | Key result |
|---:|---|---|---|
| 1 | PASS | beauty appointment WhatsApp from Meta shape | whatsapp / 85261234567 |
| 2 | PASS | IG shop stock question from story reply | instagram / ig_user_stock |
| 3 | PASS | Facebook restaurant hours question | facebook / fb_user_hours |
| 4 | PASS | Website education fee question | website / session-edu-fee |
| 5 | PASS | WhatsApp beauty_demo booking 1 | whatsapp / 8526000001 |
| 6 | PASS | WhatsApp beauty_demo hours 2 | whatsapp / 8526000002 |
| 7 | PASS | WhatsApp beauty_demo stock-shipping 3 | whatsapp / 8526000003 |
| 8 | PASS | WhatsApp beauty_demo pricing 4 | whatsapp / 8526000004 |
| 9 | PASS | WhatsApp beauty_demo booking 5 | whatsapp / 8526000005 |
| 10 | PASS | WhatsApp beauty_demo general 6 | whatsapp / 8526000006 |
| 11 | PASS | WhatsApp restaurant_demo booking 7 | whatsapp / 8526000007 |
| 12 | PASS | WhatsApp restaurant_demo hours 8 | whatsapp / 8526000008 |
| 13 | PASS | WhatsApp restaurant_demo stock-shipping 9 | whatsapp / 8526000009 |
| 14 | PASS | WhatsApp restaurant_demo pricing 10 | whatsapp / 8526000010 |
| 15 | PASS | WhatsApp restaurant_demo booking 11 | whatsapp / 8526000011 |
| 16 | PASS | WhatsApp restaurant_demo general 12 | whatsapp / 8526000012 |
| 17 | PASS | WhatsApp igshop_demo booking 13 | whatsapp / 8526000013 |
| 18 | PASS | WhatsApp igshop_demo hours 14 | whatsapp / 8526000014 |
| 19 | PASS | WhatsApp igshop_demo stock-shipping 15 | whatsapp / 8526000015 |
| 20 | PASS | WhatsApp igshop_demo pricing 16 | whatsapp / 8526000016 |
| 21 | PASS | WhatsApp igshop_demo booking 17 | whatsapp / 8526000017 |
| 22 | PASS | WhatsApp igshop_demo general 18 | whatsapp / 8526000018 |
| 23 | PASS | WhatsApp edu_demo booking 19 | whatsapp / 8526000019 |
| 24 | PASS | WhatsApp edu_demo hours 20 | whatsapp / 8526000020 |
| 25 | PASS | WhatsApp edu_demo stock-shipping 21 | whatsapp / 8526000021 |
| 26 | PASS | WhatsApp edu_demo pricing 22 | whatsapp / 8526000022 |
| 27 | PASS | WhatsApp edu_demo booking 23 | whatsapp / 8526000023 |
| 28 | PASS | WhatsApp edu_demo general 24 | whatsapp / 8526000024 |
| 29 | PASS | Instagram igshop_demo stock-shipping 25 | instagram / ig_sender_25 |
| 30 | PASS | Instagram igshop_demo pricing 26 | instagram / ig_sender_26 |
| 31 | PASS | Instagram igshop_demo stock-shipping 27 | instagram / ig_sender_27 |
| 32 | PASS | Instagram igshop_demo general 28 | instagram / ig_sender_28 |
| 33 | PASS | Instagram igshop_demo hours 29 | instagram / ig_sender_29 |
| 34 | PASS | Instagram beauty_demo stock-shipping 30 | instagram / ig_sender_30 |
| 35 | PASS | Instagram beauty_demo pricing 31 | instagram / ig_sender_31 |
| 36 | PASS | Instagram beauty_demo stock-shipping 32 | instagram / ig_sender_32 |
| 37 | PASS | Instagram beauty_demo general 33 | instagram / ig_sender_33 |
| 38 | PASS | Instagram beauty_demo hours 34 | instagram / ig_sender_34 |
| 39 | PASS | Facebook restaurant_demo booking 35 | facebook / fb_sender_35 |
| 40 | PASS | Facebook restaurant_demo general 36 | facebook / fb_sender_36 |
| 41 | PASS | Facebook restaurant_demo hours 37 | facebook / fb_sender_37 |
| 42 | PASS | Facebook restaurant_demo complaint 38 | facebook / fb_sender_38 |
| 43 | PASS | Facebook restaurant_demo general 39 | facebook / fb_sender_39 |
| 44 | PASS | Facebook edu_demo booking 40 | facebook / fb_sender_40 |
| 45 | PASS | Facebook edu_demo general 41 | facebook / fb_sender_41 |
| 46 | PASS | Facebook edu_demo hours 42 | facebook / fb_sender_42 |
| 47 | PASS | Facebook edu_demo complaint 43 | facebook / fb_sender_43 |
| 48 | PASS | Facebook edu_demo general 44 | facebook / fb_sender_44 |
| 49 | PASS | Facebook beauty_demo booking 45 | facebook / fb_sender_45 |
| 50 | PASS | Facebook beauty_demo general 46 | facebook / fb_sender_46 |
| 51 | PASS | Facebook beauty_demo hours 47 | facebook / fb_sender_47 |
| 52 | PASS | Facebook beauty_demo complaint 48 | facebook / fb_sender_48 |
| 53 | PASS | Facebook beauty_demo general 49 | facebook / fb_sender_49 |
| 54 | PASS | Website restaurant_demo general 50 | website / web-session-50 |
| 55 | PASS | Website restaurant_demo general 51 | website / web-session-51 |
| 56 | PASS | Website restaurant_demo pricing 52 | website / web-session-52 |
| 57 | PASS | Website restaurant_demo general 53 | website / web-session-53 |
| 58 | PASS | Website restaurant_demo complaint 54 | website / web-session-54 |
| 59 | PASS | Website edu_demo general 55 | website / web-session-55 |
| 60 | PASS | Website edu_demo general 56 | website / web-session-56 |
| 61 | PASS | Website edu_demo pricing 57 | website / web-session-57 |
| 62 | PASS | Website edu_demo general 58 | website / web-session-58 |
| 63 | PASS | Website edu_demo complaint 59 | website / web-session-59 |
| 64 | PASS | Website beauty_demo general 60 | website / web-session-60 |
| 65 | PASS | Website beauty_demo general 61 | website / web-session-61 |
| 66 | PASS | Website beauty_demo pricing 62 | website / web-session-62 |
| 67 | PASS | Website beauty_demo general 63 | website / web-session-63 |
| 68 | PASS | Website beauty_demo complaint 64 | website / web-session-64 |
| 69 | PASS | Website unknown_business general 65 | website / web-session-65 |
| 70 | PASS | Website unknown_business general 66 | website / web-session-66 |
| 71 | PASS | Website unknown_business pricing 67 | website / web-session-67 |
| 72 | PASS | Website unknown_business general 68 | website / web-session-68 |
| 73 | PASS | Website unknown_business complaint 69 | website / web-session-69 |
| 74 | PASS | WhatsApp beauty_demo booking 70 | whatsapp / 8526000070 |
| 75 | PASS | WhatsApp beauty_demo hours 71 | whatsapp / 8526000071 |
| 76 | PASS | WhatsApp beauty_demo stock-shipping 72 | whatsapp / 8526000072 |
| 77 | PASS | WhatsApp beauty_demo pricing 73 | whatsapp / 8526000073 |
| 78 | PASS | WhatsApp beauty_demo booking 74 | whatsapp / 8526000074 |
| 79 | PASS | WhatsApp beauty_demo general 75 | whatsapp / 8526000075 |
| 80 | PASS | WhatsApp restaurant_demo booking 76 | whatsapp / 8526000076 |
| 81 | PASS | WhatsApp restaurant_demo hours 77 | whatsapp / 8526000077 |
| 82 | PASS | WhatsApp restaurant_demo stock-shipping 78 | whatsapp / 8526000078 |
| 83 | PASS | WhatsApp restaurant_demo pricing 79 | whatsapp / 8526000079 |
| 84 | PASS | WhatsApp restaurant_demo booking 80 | whatsapp / 8526000080 |
| 85 | PASS | WhatsApp restaurant_demo general 81 | whatsapp / 8526000081 |
| 86 | PASS | WhatsApp igshop_demo booking 82 | whatsapp / 8526000082 |
| 87 | PASS | WhatsApp igshop_demo hours 83 | whatsapp / 8526000083 |
| 88 | PASS | WhatsApp igshop_demo stock-shipping 84 | whatsapp / 8526000084 |
| 89 | PASS | WhatsApp igshop_demo pricing 85 | whatsapp / 8526000085 |
| 90 | PASS | WhatsApp igshop_demo booking 86 | whatsapp / 8526000086 |
| 91 | PASS | WhatsApp igshop_demo general 87 | whatsapp / 8526000087 |
| 92 | PASS | WhatsApp edu_demo booking 88 | whatsapp / 8526000088 |
| 93 | PASS | WhatsApp edu_demo hours 89 | whatsapp / 8526000089 |
| 94 | PASS | WhatsApp edu_demo stock-shipping 90 | whatsapp / 8526000090 |
| 95 | PASS | WhatsApp edu_demo pricing 91 | whatsapp / 8526000091 |
| 96 | PASS | WhatsApp edu_demo booking 92 | whatsapp / 8526000092 |
| 97 | PASS | WhatsApp edu_demo general 93 | whatsapp / 8526000093 |
| 98 | PASS | website missing text reports missing_text | website / missing-text-session |
| 99 | PASS | generic unknown channel preserves channel name | line / line-user-1 |
| 100 | PASS | generic payload missing sender reports missing_sender | website / unknown_sender |

## Details

### 001 PASS - beauty appointment WhatsApp from Meta shape

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.beauty.001",
        "from": "85261234567",
        "timestamp": "1778284800",
        "text": {
          "body": "想book今晚"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "85261234567",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "85261234567",
  "errors": [],
  "replyToken": "wamid.beauty.001"
}
```

### 002 PASS - IG shop stock question from story reply

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "igshop_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_user_stock"
            },
            "recipient": {
              "id": "ig_page_shop"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_user_stock.mid",
              "text": "有冇現貨"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "有冇現貨",
  "sender": "ig_user_stock",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "有冇現貨",
  "sender": "ig_user_stock",
  "errors": [],
  "replyToken": "ig_user_stock"
}
```

### 003 PASS - Facebook restaurant hours question

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "restaurant_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_user_hours"
            },
            "recipient": {
              "id": "fb_page_restaurant"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_user_hours.mid",
              "text": "今晚幾點開門"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "今晚幾點開門",
  "sender": "fb_user_hours",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "今晚幾點開門",
  "sender": "fb_user_hours",
  "errors": [],
  "replyToken": "fb_user_hours"
}
```

### 004 PASS - Website education fee question

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "edu_demo",
    "sessionId": "session-edu-fee",
    "text": "P3英文班幾錢？",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "P3英文班幾錢？",
  "sender": "session-edu-fee",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "P3英文班幾錢？",
  "sender": "session-edu-fee",
  "errors": [],
  "replyToken": "session-edu-fee"
}
```

### 005 PASS - WhatsApp beauty_demo booking 1

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.1",
        "from": "8526000001",
        "timestamp": "1778284800",
        "text": {
          "body": "想book今晚"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000001",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000001",
  "errors": [],
  "replyToken": "wamid.matrix.1"
}
```

### 006 PASS - WhatsApp beauty_demo hours 2

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.2",
        "from": "8526000002",
        "timestamp": "1778284800",
        "text": {
          "body": "幾點開門？"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000002",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000002",
  "errors": [],
  "replyToken": "wamid.matrix.2"
}
```

### 007 PASS - WhatsApp beauty_demo stock-shipping 3

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.3",
        "from": "8526000003",
        "timestamp": "1778284800",
        "text": {
          "body": "有冇現貨"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000003",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000003",
  "errors": [],
  "replyToken": "wamid.matrix.3"
}
```

### 008 PASS - WhatsApp beauty_demo pricing 4

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.4",
        "from": "8526000004",
        "timestamp": "1778284800",
        "text": {
          "body": "想問收費"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000004",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000004",
  "errors": [],
  "replyToken": "wamid.matrix.4"
}
```

### 009 PASS - WhatsApp beauty_demo booking 5

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.5",
        "from": "8526000005",
        "timestamp": "1778284800",
        "text": {
          "body": "我要改期"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000005",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000005",
  "errors": [],
  "replyToken": "wamid.matrix.5"
}
```

### 010 PASS - WhatsApp beauty_demo general 6

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.6",
        "from": "8526000006",
        "timestamp": "1778284800",
        "text": {
          "body": "可以搵真人嗎"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000006",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000006",
  "errors": [],
  "replyToken": "wamid.matrix.6"
}
```

### 011 PASS - WhatsApp restaurant_demo booking 7

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.7",
        "from": "8526000007",
        "timestamp": "1778284800",
        "text": {
          "body": "想book今晚"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000007",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000007",
  "errors": [],
  "replyToken": "wamid.matrix.7"
}
```

### 012 PASS - WhatsApp restaurant_demo hours 8

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.8",
        "from": "8526000008",
        "timestamp": "1778284800",
        "text": {
          "body": "幾點開門？"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000008",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000008",
  "errors": [],
  "replyToken": "wamid.matrix.8"
}
```

### 013 PASS - WhatsApp restaurant_demo stock-shipping 9

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.9",
        "from": "8526000009",
        "timestamp": "1778284800",
        "text": {
          "body": "有冇現貨"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000009",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000009",
  "errors": [],
  "replyToken": "wamid.matrix.9"
}
```

### 014 PASS - WhatsApp restaurant_demo pricing 10

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.10",
        "from": "8526000010",
        "timestamp": "1778284800",
        "text": {
          "body": "想問收費"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000010",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000010",
  "errors": [],
  "replyToken": "wamid.matrix.10"
}
```

### 015 PASS - WhatsApp restaurant_demo booking 11

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.11",
        "from": "8526000011",
        "timestamp": "1778284800",
        "text": {
          "body": "我要改期"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000011",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000011",
  "errors": [],
  "replyToken": "wamid.matrix.11"
}
```

### 016 PASS - WhatsApp restaurant_demo general 12

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.12",
        "from": "8526000012",
        "timestamp": "1778284800",
        "text": {
          "body": "可以搵真人嗎"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000012",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000012",
  "errors": [],
  "replyToken": "wamid.matrix.12"
}
```

### 017 PASS - WhatsApp igshop_demo booking 13

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.13",
        "from": "8526000013",
        "timestamp": "1778284800",
        "text": {
          "body": "想book今晚"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000013",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000013",
  "errors": [],
  "replyToken": "wamid.matrix.13"
}
```

### 018 PASS - WhatsApp igshop_demo hours 14

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.14",
        "from": "8526000014",
        "timestamp": "1778284800",
        "text": {
          "body": "幾點開門？"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000014",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000014",
  "errors": [],
  "replyToken": "wamid.matrix.14"
}
```

### 019 PASS - WhatsApp igshop_demo stock-shipping 15

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.15",
        "from": "8526000015",
        "timestamp": "1778284800",
        "text": {
          "body": "有冇現貨"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000015",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000015",
  "errors": [],
  "replyToken": "wamid.matrix.15"
}
```

### 020 PASS - WhatsApp igshop_demo pricing 16

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.16",
        "from": "8526000016",
        "timestamp": "1778284800",
        "text": {
          "body": "想問收費"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000016",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000016",
  "errors": [],
  "replyToken": "wamid.matrix.16"
}
```

### 021 PASS - WhatsApp igshop_demo booking 17

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.17",
        "from": "8526000017",
        "timestamp": "1778284800",
        "text": {
          "body": "我要改期"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000017",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000017",
  "errors": [],
  "replyToken": "wamid.matrix.17"
}
```

### 022 PASS - WhatsApp igshop_demo general 18

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.18",
        "from": "8526000018",
        "timestamp": "1778284800",
        "text": {
          "body": "可以搵真人嗎"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000018",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000018",
  "errors": [],
  "replyToken": "wamid.matrix.18"
}
```

### 023 PASS - WhatsApp edu_demo booking 19

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.19",
        "from": "8526000019",
        "timestamp": "1778284800",
        "text": {
          "body": "想book今晚"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000019",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000019",
  "errors": [],
  "replyToken": "wamid.matrix.19"
}
```

### 024 PASS - WhatsApp edu_demo hours 20

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.20",
        "from": "8526000020",
        "timestamp": "1778284800",
        "text": {
          "body": "幾點開門？"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000020",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000020",
  "errors": [],
  "replyToken": "wamid.matrix.20"
}
```

### 025 PASS - WhatsApp edu_demo stock-shipping 21

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.21",
        "from": "8526000021",
        "timestamp": "1778284800",
        "text": {
          "body": "有冇現貨"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000021",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000021",
  "errors": [],
  "replyToken": "wamid.matrix.21"
}
```

### 026 PASS - WhatsApp edu_demo pricing 22

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.22",
        "from": "8526000022",
        "timestamp": "1778284800",
        "text": {
          "body": "想問收費"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000022",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000022",
  "errors": [],
  "replyToken": "wamid.matrix.22"
}
```

### 027 PASS - WhatsApp edu_demo booking 23

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.23",
        "from": "8526000023",
        "timestamp": "1778284800",
        "text": {
          "body": "我要改期"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000023",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000023",
  "errors": [],
  "replyToken": "wamid.matrix.23"
}
```

### 028 PASS - WhatsApp edu_demo general 24

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.24",
        "from": "8526000024",
        "timestamp": "1778284800",
        "text": {
          "body": "可以搵真人嗎"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000024",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000024",
  "errors": [],
  "replyToken": "wamid.matrix.24"
}
```

### 029 PASS - Instagram igshop_demo stock-shipping 25

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "igshop_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_sender_25"
            },
            "recipient": {
              "id": "ig_page_igshop_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_sender_25.mid",
              "text": "呢件包唔包順豐？"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "呢件包唔包順豐？",
  "sender": "ig_sender_25",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "呢件包唔包順豐？",
  "sender": "ig_sender_25",
  "errors": [],
  "replyToken": "ig_sender_25"
}
```

### 030 PASS - Instagram igshop_demo pricing 26

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "igshop_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_sender_26"
            },
            "recipient": {
              "id": "ig_page_igshop_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_sender_26.mid",
              "text": "小顏項目幾錢"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "小顏項目幾錢",
  "sender": "ig_sender_26",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "小顏項目幾錢",
  "sender": "ig_sender_26",
  "errors": [],
  "replyToken": "ig_sender_26"
}
```

### 031 PASS - Instagram igshop_demo stock-shipping 27

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "igshop_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_sender_27"
            },
            "recipient": {
              "id": "ig_page_igshop_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_sender_27.mid",
              "text": "有冇貨呀"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "有冇貨呀",
  "sender": "ig_sender_27",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "有冇貨呀",
  "sender": "ig_sender_27",
  "errors": [],
  "replyToken": "ig_sender_27"
}
```

### 032 PASS - Instagram igshop_demo general 28

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "igshop_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_sender_28"
            },
            "recipient": {
              "id": "ig_page_igshop_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_sender_28.mid",
              "text": "想睇package"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "想睇package",
  "sender": "ig_sender_28",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "想睇package",
  "sender": "ig_sender_28",
  "errors": [],
  "replyToken": "ig_sender_28"
}
```

### 033 PASS - Instagram igshop_demo hours 29

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "igshop_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_sender_29"
            },
            "recipient": {
              "id": "ig_page_igshop_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_sender_29.mid",
              "text": "幾時開門"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "幾時開門",
  "sender": "ig_sender_29",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "幾時開門",
  "sender": "ig_sender_29",
  "errors": [],
  "replyToken": "ig_sender_29"
}
```

### 034 PASS - Instagram beauty_demo stock-shipping 30

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "beauty_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_sender_30"
            },
            "recipient": {
              "id": "ig_page_beauty_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_sender_30.mid",
              "text": "呢件包唔包順豐？"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "呢件包唔包順豐？",
  "sender": "ig_sender_30",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "呢件包唔包順豐？",
  "sender": "ig_sender_30",
  "errors": [],
  "replyToken": "ig_sender_30"
}
```

### 035 PASS - Instagram beauty_demo pricing 31

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "beauty_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_sender_31"
            },
            "recipient": {
              "id": "ig_page_beauty_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_sender_31.mid",
              "text": "小顏項目幾錢"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "小顏項目幾錢",
  "sender": "ig_sender_31",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "小顏項目幾錢",
  "sender": "ig_sender_31",
  "errors": [],
  "replyToken": "ig_sender_31"
}
```

### 036 PASS - Instagram beauty_demo stock-shipping 32

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "beauty_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_sender_32"
            },
            "recipient": {
              "id": "ig_page_beauty_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_sender_32.mid",
              "text": "有冇貨呀"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "有冇貨呀",
  "sender": "ig_sender_32",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "有冇貨呀",
  "sender": "ig_sender_32",
  "errors": [],
  "replyToken": "ig_sender_32"
}
```

### 037 PASS - Instagram beauty_demo general 33

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "beauty_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_sender_33"
            },
            "recipient": {
              "id": "ig_page_beauty_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_sender_33.mid",
              "text": "想睇package"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "想睇package",
  "sender": "ig_sender_33",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "想睇package",
  "sender": "ig_sender_33",
  "errors": [],
  "replyToken": "ig_sender_33"
}
```

### 038 PASS - Instagram beauty_demo hours 34

Context:
```json
{
  "input": {
    "object": "instagram",
    "businessId": "beauty_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "ig_sender_34"
            },
            "recipient": {
              "id": "ig_page_beauty_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "ig_sender_34.mid",
              "text": "幾時開門"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "instagram",
  "text": "幾時開門",
  "sender": "ig_sender_34",
  "errors": []
}
```

Actual:
```json
{
  "channel": "instagram",
  "text": "幾時開門",
  "sender": "ig_sender_34",
  "errors": [],
  "replyToken": "ig_sender_34"
}
```

### 039 PASS - Facebook restaurant_demo booking 35

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "restaurant_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_35"
            },
            "recipient": {
              "id": "fb_page_restaurant_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_35.mid",
              "text": "今晚8點有冇位？"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "今晚8點有冇位？",
  "sender": "fb_sender_35",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "今晚8點有冇位？",
  "sender": "fb_sender_35",
  "errors": [],
  "replyToken": "fb_sender_35"
}
```

### 040 PASS - Facebook restaurant_demo general 36

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "restaurant_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_36"
            },
            "recipient": {
              "id": "fb_page_restaurant_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_36.mid",
              "text": "P3英文有咩班？"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "P3英文有咩班？",
  "sender": "fb_sender_36",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "P3英文有咩班？",
  "sender": "fb_sender_36",
  "errors": [],
  "replyToken": "fb_sender_36"
}
```

### 041 PASS - Facebook restaurant_demo hours 37

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "restaurant_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_37"
            },
            "recipient": {
              "id": "fb_page_restaurant_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_37.mid",
              "text": "地址喺邊"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "地址喺邊",
  "sender": "fb_sender_37",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "地址喺邊",
  "sender": "fb_sender_37",
  "errors": [],
  "replyToken": "fb_sender_37"
}
```

### 042 PASS - Facebook restaurant_demo complaint 38

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "restaurant_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_38"
            },
            "recipient": {
              "id": "fb_page_restaurant_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_38.mid",
              "text": "想投訴"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "想投訴",
  "sender": "fb_sender_38",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "想投訴",
  "sender": "fb_sender_38",
  "errors": [],
  "replyToken": "fb_sender_38"
}
```

### 043 PASS - Facebook restaurant_demo general 39

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "restaurant_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_39"
            },
            "recipient": {
              "id": "fb_page_restaurant_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_39.mid",
              "text": "星期日開唔開"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "星期日開唔開",
  "sender": "fb_sender_39",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "星期日開唔開",
  "sender": "fb_sender_39",
  "errors": [],
  "replyToken": "fb_sender_39"
}
```

### 044 PASS - Facebook edu_demo booking 40

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "edu_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_40"
            },
            "recipient": {
              "id": "fb_page_edu_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_40.mid",
              "text": "今晚8點有冇位？"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "今晚8點有冇位？",
  "sender": "fb_sender_40",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "今晚8點有冇位？",
  "sender": "fb_sender_40",
  "errors": [],
  "replyToken": "fb_sender_40"
}
```

### 045 PASS - Facebook edu_demo general 41

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "edu_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_41"
            },
            "recipient": {
              "id": "fb_page_edu_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_41.mid",
              "text": "P3英文有咩班？"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "P3英文有咩班？",
  "sender": "fb_sender_41",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "P3英文有咩班？",
  "sender": "fb_sender_41",
  "errors": [],
  "replyToken": "fb_sender_41"
}
```

### 046 PASS - Facebook edu_demo hours 42

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "edu_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_42"
            },
            "recipient": {
              "id": "fb_page_edu_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_42.mid",
              "text": "地址喺邊"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "地址喺邊",
  "sender": "fb_sender_42",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "地址喺邊",
  "sender": "fb_sender_42",
  "errors": [],
  "replyToken": "fb_sender_42"
}
```

### 047 PASS - Facebook edu_demo complaint 43

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "edu_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_43"
            },
            "recipient": {
              "id": "fb_page_edu_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_43.mid",
              "text": "想投訴"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "想投訴",
  "sender": "fb_sender_43",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "想投訴",
  "sender": "fb_sender_43",
  "errors": [],
  "replyToken": "fb_sender_43"
}
```

### 048 PASS - Facebook edu_demo general 44

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "edu_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_44"
            },
            "recipient": {
              "id": "fb_page_edu_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_44.mid",
              "text": "星期日開唔開"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "星期日開唔開",
  "sender": "fb_sender_44",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "星期日開唔開",
  "sender": "fb_sender_44",
  "errors": [],
  "replyToken": "fb_sender_44"
}
```

### 049 PASS - Facebook beauty_demo booking 45

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "beauty_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_45"
            },
            "recipient": {
              "id": "fb_page_beauty_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_45.mid",
              "text": "今晚8點有冇位？"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "今晚8點有冇位？",
  "sender": "fb_sender_45",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "今晚8點有冇位？",
  "sender": "fb_sender_45",
  "errors": [],
  "replyToken": "fb_sender_45"
}
```

### 050 PASS - Facebook beauty_demo general 46

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "beauty_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_46"
            },
            "recipient": {
              "id": "fb_page_beauty_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_46.mid",
              "text": "P3英文有咩班？"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "P3英文有咩班？",
  "sender": "fb_sender_46",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "P3英文有咩班？",
  "sender": "fb_sender_46",
  "errors": [],
  "replyToken": "fb_sender_46"
}
```

### 051 PASS - Facebook beauty_demo hours 47

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "beauty_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_47"
            },
            "recipient": {
              "id": "fb_page_beauty_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_47.mid",
              "text": "地址喺邊"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "地址喺邊",
  "sender": "fb_sender_47",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "地址喺邊",
  "sender": "fb_sender_47",
  "errors": [],
  "replyToken": "fb_sender_47"
}
```

### 052 PASS - Facebook beauty_demo complaint 48

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "beauty_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_48"
            },
            "recipient": {
              "id": "fb_page_beauty_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_48.mid",
              "text": "想投訴"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "想投訴",
  "sender": "fb_sender_48",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "想投訴",
  "sender": "fb_sender_48",
  "errors": [],
  "replyToken": "fb_sender_48"
}
```

### 053 PASS - Facebook beauty_demo general 49

Context:
```json
{
  "input": {
    "object": "page",
    "businessId": "beauty_demo",
    "entry": [
      {
        "messaging": [
          {
            "sender": {
              "id": "fb_sender_49"
            },
            "recipient": {
              "id": "fb_page_beauty_demo"
            },
            "timestamp": 1778284800000,
            "message": {
              "mid": "fb_sender_49.mid",
              "text": "星期日開唔開"
            }
          }
        ]
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "facebook",
  "text": "星期日開唔開",
  "sender": "fb_sender_49",
  "errors": []
}
```

Actual:
```json
{
  "channel": "facebook",
  "text": "星期日開唔開",
  "sender": "fb_sender_49",
  "errors": [],
  "replyToken": "fb_sender_49"
}
```

### 054 PASS - Website restaurant_demo general 50

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "web-session-50",
    "text": "你哋有冇泊車優惠？",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "你哋有冇泊車優惠？",
  "sender": "web-session-50",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "你哋有冇泊車優惠？",
  "sender": "web-session-50",
  "errors": [],
  "replyToken": "web-session-50"
}
```

### 055 PASS - Website restaurant_demo general 51

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "web-session-51",
    "text": "hello, any trial class?",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "hello, any trial class?",
  "sender": "web-session-51",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "hello, any trial class?",
  "sender": "web-session-51",
  "errors": [],
  "replyToken": "web-session-51"
}
```

### 056 PASS - Website restaurant_demo pricing 52

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "web-session-52",
    "text": "facial price please",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "facial price please",
  "sender": "web-session-52",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "facial price please",
  "sender": "web-session-52",
  "errors": [],
  "replyToken": "web-session-52"
}
```

### 057 PASS - Website restaurant_demo general 53

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "web-session-53",
    "text": "想了解服務",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "想了解服務",
  "sender": "web-session-53",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "想了解服務",
  "sender": "web-session-53",
  "errors": [],
  "replyToken": "web-session-53"
}
```

### 058 PASS - Website restaurant_demo complaint 54

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "restaurant_demo",
    "sessionId": "web-session-54",
    "text": "退錢點處理",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "退錢點處理",
  "sender": "web-session-54",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "退錢點處理",
  "sender": "web-session-54",
  "errors": [],
  "replyToken": "web-session-54"
}
```

### 059 PASS - Website edu_demo general 55

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "edu_demo",
    "sessionId": "web-session-55",
    "text": "你哋有冇泊車優惠？",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "你哋有冇泊車優惠？",
  "sender": "web-session-55",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "你哋有冇泊車優惠？",
  "sender": "web-session-55",
  "errors": [],
  "replyToken": "web-session-55"
}
```

### 060 PASS - Website edu_demo general 56

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "edu_demo",
    "sessionId": "web-session-56",
    "text": "hello, any trial class?",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "hello, any trial class?",
  "sender": "web-session-56",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "hello, any trial class?",
  "sender": "web-session-56",
  "errors": [],
  "replyToken": "web-session-56"
}
```

### 061 PASS - Website edu_demo pricing 57

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "edu_demo",
    "sessionId": "web-session-57",
    "text": "facial price please",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "facial price please",
  "sender": "web-session-57",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "facial price please",
  "sender": "web-session-57",
  "errors": [],
  "replyToken": "web-session-57"
}
```

### 062 PASS - Website edu_demo general 58

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "edu_demo",
    "sessionId": "web-session-58",
    "text": "想了解服務",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "想了解服務",
  "sender": "web-session-58",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "想了解服務",
  "sender": "web-session-58",
  "errors": [],
  "replyToken": "web-session-58"
}
```

### 063 PASS - Website edu_demo complaint 59

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "edu_demo",
    "sessionId": "web-session-59",
    "text": "退錢點處理",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "退錢點處理",
  "sender": "web-session-59",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "退錢點處理",
  "sender": "web-session-59",
  "errors": [],
  "replyToken": "web-session-59"
}
```

### 064 PASS - Website beauty_demo general 60

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "web-session-60",
    "text": "你哋有冇泊車優惠？",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "你哋有冇泊車優惠？",
  "sender": "web-session-60",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "你哋有冇泊車優惠？",
  "sender": "web-session-60",
  "errors": [],
  "replyToken": "web-session-60"
}
```

### 065 PASS - Website beauty_demo general 61

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "web-session-61",
    "text": "hello, any trial class?",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "hello, any trial class?",
  "sender": "web-session-61",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "hello, any trial class?",
  "sender": "web-session-61",
  "errors": [],
  "replyToken": "web-session-61"
}
```

### 066 PASS - Website beauty_demo pricing 62

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "web-session-62",
    "text": "facial price please",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "facial price please",
  "sender": "web-session-62",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "facial price please",
  "sender": "web-session-62",
  "errors": [],
  "replyToken": "web-session-62"
}
```

### 067 PASS - Website beauty_demo general 63

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "web-session-63",
    "text": "想了解服務",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "想了解服務",
  "sender": "web-session-63",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "想了解服務",
  "sender": "web-session-63",
  "errors": [],
  "replyToken": "web-session-63"
}
```

### 068 PASS - Website beauty_demo complaint 64

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "web-session-64",
    "text": "退錢點處理",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "退錢點處理",
  "sender": "web-session-64",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "退錢點處理",
  "sender": "web-session-64",
  "errors": [],
  "replyToken": "web-session-64"
}
```

### 069 PASS - Website unknown_business general 65

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "unknown_business",
    "sessionId": "web-session-65",
    "text": "你哋有冇泊車優惠？",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "你哋有冇泊車優惠？",
  "sender": "web-session-65",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "你哋有冇泊車優惠？",
  "sender": "web-session-65",
  "errors": [],
  "replyToken": "web-session-65"
}
```

### 070 PASS - Website unknown_business general 66

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "unknown_business",
    "sessionId": "web-session-66",
    "text": "hello, any trial class?",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "hello, any trial class?",
  "sender": "web-session-66",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "hello, any trial class?",
  "sender": "web-session-66",
  "errors": [],
  "replyToken": "web-session-66"
}
```

### 071 PASS - Website unknown_business pricing 67

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "unknown_business",
    "sessionId": "web-session-67",
    "text": "facial price please",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "facial price please",
  "sender": "web-session-67",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "facial price please",
  "sender": "web-session-67",
  "errors": [],
  "replyToken": "web-session-67"
}
```

### 072 PASS - Website unknown_business general 68

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "unknown_business",
    "sessionId": "web-session-68",
    "text": "想了解服務",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "想了解服務",
  "sender": "web-session-68",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "想了解服務",
  "sender": "web-session-68",
  "errors": [],
  "replyToken": "web-session-68"
}
```

### 073 PASS - Website unknown_business complaint 69

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "unknown_business",
    "sessionId": "web-session-69",
    "text": "退錢點處理",
    "url": "https://example.hk/chat"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "退錢點處理",
  "sender": "web-session-69",
  "errors": []
}
```

Actual:
```json
{
  "channel": "website",
  "text": "退錢點處理",
  "sender": "web-session-69",
  "errors": [],
  "replyToken": "web-session-69"
}
```

### 074 PASS - WhatsApp beauty_demo booking 70

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.70",
        "from": "8526000070",
        "timestamp": "1778284800",
        "text": {
          "body": "想book今晚"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000070",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000070",
  "errors": [],
  "replyToken": "wamid.matrix.70"
}
```

### 075 PASS - WhatsApp beauty_demo hours 71

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.71",
        "from": "8526000071",
        "timestamp": "1778284800",
        "text": {
          "body": "幾點開門？"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000071",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000071",
  "errors": [],
  "replyToken": "wamid.matrix.71"
}
```

### 076 PASS - WhatsApp beauty_demo stock-shipping 72

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.72",
        "from": "8526000072",
        "timestamp": "1778284800",
        "text": {
          "body": "有冇現貨"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000072",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000072",
  "errors": [],
  "replyToken": "wamid.matrix.72"
}
```

### 077 PASS - WhatsApp beauty_demo pricing 73

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.73",
        "from": "8526000073",
        "timestamp": "1778284800",
        "text": {
          "body": "想問收費"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000073",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000073",
  "errors": [],
  "replyToken": "wamid.matrix.73"
}
```

### 078 PASS - WhatsApp beauty_demo booking 74

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.74",
        "from": "8526000074",
        "timestamp": "1778284800",
        "text": {
          "body": "我要改期"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000074",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000074",
  "errors": [],
  "replyToken": "wamid.matrix.74"
}
```

### 079 PASS - WhatsApp beauty_demo general 75

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "beauty_demo",
    "messages": [
      {
        "id": "wamid.matrix.75",
        "from": "8526000075",
        "timestamp": "1778284800",
        "text": {
          "body": "可以搵真人嗎"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000075",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000075",
  "errors": [],
  "replyToken": "wamid.matrix.75"
}
```

### 080 PASS - WhatsApp restaurant_demo booking 76

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.76",
        "from": "8526000076",
        "timestamp": "1778284800",
        "text": {
          "body": "想book今晚"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000076",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000076",
  "errors": [],
  "replyToken": "wamid.matrix.76"
}
```

### 081 PASS - WhatsApp restaurant_demo hours 77

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.77",
        "from": "8526000077",
        "timestamp": "1778284800",
        "text": {
          "body": "幾點開門？"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000077",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000077",
  "errors": [],
  "replyToken": "wamid.matrix.77"
}
```

### 082 PASS - WhatsApp restaurant_demo stock-shipping 78

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.78",
        "from": "8526000078",
        "timestamp": "1778284800",
        "text": {
          "body": "有冇現貨"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000078",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000078",
  "errors": [],
  "replyToken": "wamid.matrix.78"
}
```

### 083 PASS - WhatsApp restaurant_demo pricing 79

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.79",
        "from": "8526000079",
        "timestamp": "1778284800",
        "text": {
          "body": "想問收費"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000079",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000079",
  "errors": [],
  "replyToken": "wamid.matrix.79"
}
```

### 084 PASS - WhatsApp restaurant_demo booking 80

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.80",
        "from": "8526000080",
        "timestamp": "1778284800",
        "text": {
          "body": "我要改期"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000080",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000080",
  "errors": [],
  "replyToken": "wamid.matrix.80"
}
```

### 085 PASS - WhatsApp restaurant_demo general 81

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "restaurant_demo",
    "messages": [
      {
        "id": "wamid.matrix.81",
        "from": "8526000081",
        "timestamp": "1778284800",
        "text": {
          "body": "可以搵真人嗎"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000081",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000081",
  "errors": [],
  "replyToken": "wamid.matrix.81"
}
```

### 086 PASS - WhatsApp igshop_demo booking 82

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.82",
        "from": "8526000082",
        "timestamp": "1778284800",
        "text": {
          "body": "想book今晚"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000082",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000082",
  "errors": [],
  "replyToken": "wamid.matrix.82"
}
```

### 087 PASS - WhatsApp igshop_demo hours 83

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.83",
        "from": "8526000083",
        "timestamp": "1778284800",
        "text": {
          "body": "幾點開門？"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000083",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000083",
  "errors": [],
  "replyToken": "wamid.matrix.83"
}
```

### 088 PASS - WhatsApp igshop_demo stock-shipping 84

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.84",
        "from": "8526000084",
        "timestamp": "1778284800",
        "text": {
          "body": "有冇現貨"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000084",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000084",
  "errors": [],
  "replyToken": "wamid.matrix.84"
}
```

### 089 PASS - WhatsApp igshop_demo pricing 85

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.85",
        "from": "8526000085",
        "timestamp": "1778284800",
        "text": {
          "body": "想問收費"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000085",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000085",
  "errors": [],
  "replyToken": "wamid.matrix.85"
}
```

### 090 PASS - WhatsApp igshop_demo booking 86

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.86",
        "from": "8526000086",
        "timestamp": "1778284800",
        "text": {
          "body": "我要改期"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000086",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000086",
  "errors": [],
  "replyToken": "wamid.matrix.86"
}
```

### 091 PASS - WhatsApp igshop_demo general 87

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "igshop_demo",
    "messages": [
      {
        "id": "wamid.matrix.87",
        "from": "8526000087",
        "timestamp": "1778284800",
        "text": {
          "body": "可以搵真人嗎"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000087",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000087",
  "errors": [],
  "replyToken": "wamid.matrix.87"
}
```

### 092 PASS - WhatsApp edu_demo booking 88

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.88",
        "from": "8526000088",
        "timestamp": "1778284800",
        "text": {
          "body": "想book今晚"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000088",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想book今晚",
  "sender": "8526000088",
  "errors": [],
  "replyToken": "wamid.matrix.88"
}
```

### 093 PASS - WhatsApp edu_demo hours 89

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.89",
        "from": "8526000089",
        "timestamp": "1778284800",
        "text": {
          "body": "幾點開門？"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000089",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "幾點開門？",
  "sender": "8526000089",
  "errors": [],
  "replyToken": "wamid.matrix.89"
}
```

### 094 PASS - WhatsApp edu_demo stock-shipping 90

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.90",
        "from": "8526000090",
        "timestamp": "1778284800",
        "text": {
          "body": "有冇現貨"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000090",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "有冇現貨",
  "sender": "8526000090",
  "errors": [],
  "replyToken": "wamid.matrix.90"
}
```

### 095 PASS - WhatsApp edu_demo pricing 91

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.91",
        "from": "8526000091",
        "timestamp": "1778284800",
        "text": {
          "body": "想問收費"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000091",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "想問收費",
  "sender": "8526000091",
  "errors": [],
  "replyToken": "wamid.matrix.91"
}
```

### 096 PASS - WhatsApp edu_demo booking 92

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.92",
        "from": "8526000092",
        "timestamp": "1778284800",
        "text": {
          "body": "我要改期"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000092",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "我要改期",
  "sender": "8526000092",
  "errors": [],
  "replyToken": "wamid.matrix.92"
}
```

### 097 PASS - WhatsApp edu_demo general 93

Context:
```json
{
  "input": {
    "channel": "whatsapp",
    "businessId": "edu_demo",
    "messages": [
      {
        "id": "wamid.matrix.93",
        "from": "8526000093",
        "timestamp": "1778284800",
        "text": {
          "body": "可以搵真人嗎"
        }
      }
    ]
  }
}
```

Expected:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000093",
  "errors": []
}
```

Actual:
```json
{
  "channel": "whatsapp",
  "text": "可以搵真人嗎",
  "sender": "8526000093",
  "errors": [],
  "replyToken": "wamid.matrix.93"
}
```

### 098 PASS - website missing text reports missing_text

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "beauty_demo",
    "sessionId": "missing-text-session"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "",
  "sender": "missing-text-session",
  "errors": [
    "missing_text"
  ]
}
```

Actual:
```json
{
  "channel": "website",
  "text": "",
  "sender": "missing-text-session",
  "errors": [
    "missing_text"
  ],
  "replyToken": "missing-text-session"
}
```

### 099 PASS - generic unknown channel preserves channel name

Context:
```json
{
  "input": {
    "channel": "line",
    "businessId": "restaurant_demo",
    "senderId": "line-user-1",
    "text": "幾點開門"
  }
}
```

Expected:
```json
{
  "channel": "line",
  "text": "幾點開門",
  "sender": "line-user-1",
  "errors": []
}
```

Actual:
```json
{
  "channel": "line",
  "text": "幾點開門",
  "sender": "line-user-1",
  "errors": [],
  "replyToken": null
}
```

### 100 PASS - generic payload missing sender reports missing_sender

Context:
```json
{
  "input": {
    "channel": "website",
    "businessId": "edu_demo",
    "text": "想問P3英文"
  }
}
```

Expected:
```json
{
  "channel": "website",
  "text": "想問P3英文",
  "sender": "unknown_sender",
  "errors": [
    "missing_sender"
  ]
}
```

Actual:
```json
{
  "channel": "website",
  "text": "想問P3英文",
  "sender": "unknown_sender",
  "errors": [
    "missing_sender"
  ],
  "replyToken": null
}
```

