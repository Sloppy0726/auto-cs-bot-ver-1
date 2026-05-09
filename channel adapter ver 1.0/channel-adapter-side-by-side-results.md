# Channel Adapter ver 1.0 - Side-by-side results

| Case | Expected | Actual |
|---|---|---|
| WhatsApp payload normalizes text | {"channel":"whatsapp","text":"想book今晚","sender":"85261234567"} | {"channel":"whatsapp","text":"想book今晚","sender":"85261234567","errors":[]} |
| Instagram payload normalizes text | {"channel":"instagram","text":"有冇現貨","sender":"ig_user"} | {"channel":"instagram","text":"有冇現貨","sender":"ig_user","errors":[]} |
| Website payload normalizes text | {"channel":"website","text":"幾點開門","sender":"s1"} | {"channel":"website","text":"幾點開門","sender":"s1","errors":[]} |
