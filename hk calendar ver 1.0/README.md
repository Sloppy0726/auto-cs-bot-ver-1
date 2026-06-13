# HK Calendar ver 1.0

Deterministic resolver for the way Hong Kong customers actually name dates: `年初二有冇位？`, `平安夜book枱`, `冬至嗰日開唔開？`, `中秋翌日呢？`.

## Why this is unique

Every competitor delegates date parsing to the LLM, which routinely fumbles lunar conversions (the Yue-Benchmark work documents the Cantonese gap). `年初二`, `除夕`, `冬至`, `中秋翌日`, `佛誕` are exactly how HK customers reference peak booking days — and a static, gazette-sourced table makes resolving them **100% reliable where every prompt-based competitor is probabilistic**. Determinism IS the feature.

## Behaviour

`resolveCulturalDate(text, now)` returns the **next upcoming** occurrence relative to `now`, or `null` when no cultural term is present (so the existing `聽日 / M月D號 / ISO` parser handles it unchanged).

- **Fixed-Gregorian** festivals (平安夜, 聖誕, 元旦, 勞動節, 國慶, 情人節) — reliable every year, no table needed.
- **Lunar** festivals (年初一/二/三, 除夕, 清明, 佛誕, 端午, 中秋, 重陽, 冬至) — read from `seed/hkHolidays.js`, verified against the official GovHK gazette through **2027**.
- **Computed** (母親節, 父親節) — nth-weekday arithmetic.
- **Ambiguous spans** (過年, 新年假) — returns `dateKey: null, ambiguous: true`; the bot asks which day instead of guessing.
- **Beyond the verified table** — returns `provisional: true`; the bot defers to staff rather than fabricating a lunar date.

It is wired into the pipeline's `inferRequestedDate`, so a festival booking flows straight into the existing availability / closed-period machinery — `年初二` becomes `2027-02-07` and the backend decides if that day is open. `isHkPublicHoliday(dateKey)` supports holiday-hours replies.

## Maintenance

The government gazettes lunar holiday dates ~2 years ahead. Each year, extend `FESTIVALS_BY_YEAR` and bump `TABLE_VERIFIED_THROUGH`. Until then, out-of-range years degrade safely to `provisional`.

## Tests

```bash
node "hk calendar ver 1.0/test/hkCalendar.test.js"
```

Covers the LNY cluster with year-rollover, fixed/lunar/computed kinds, longest-match (聖誕翌日 vs 聖誕), ambiguous spans, provisional out-of-table years, statutory-holiday lookups, and the critical false-positive guard that `十一點半` never trips a festival match.
