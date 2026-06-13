# Weather Policy ver 1.0  (打風自動制)

Hong Kong Observatory tropical-cyclone and rainstorm signals deterministically flip the pipeline into **weather mode**: closure banners on hours/booking replies and an auto-waive-deposit flag. A pure state machine — it works even with `shouldCallLLM=false`.

## Why this is unique

The research sweep found this whitespace is **uncontested**: not Bistrochat, inline, Fresha, SleekFlow, nor Omnichat offers any HKO-signal-triggered workflow — despite Hong Kong getting multiple T8s a year and its second-longest black rainstorm on record in 2025. It is a recurring, calendar-predictable crisis with zero software coverage, and it only makes sense in HK (signal codes, the "2 hours after signal down" reopening convention, deposit-waiver etiquette). Competitors would have to bolt weather state onto prompt-driven agents; here it is a deterministic table.

## Behaviour

A signal level (`none → tc1 → tc3 → tc8/tc9/tc10`, `rain_amber → rain_red → rain_black`) drives a policy:

- **Closure levels** (T8+, black rain) → `closed: true`, `depositWaiver: true`, a closure banner that reassures customers their bookings/deposits are held.
- **Caution levels** (T3, amber/red) → still open, a "stay safe, hours may change" banner.

`createWeatherStore().lookup({ businessConfig, language })` returns a citable weather fact (same shape as the promotion store). `inferWeatherResponse(...)` plugs into the pipeline's `requiredClarification` chain so a `今日開唔開？` or booking message during a T8 gets the deterministic closure banner — and a booking is offered the next open dates and asked which day to move to. Per-business overrides (`businessConfig.weatherPolicy[level]`) let a 24-hour shop stay open.

**Default-safe:** an unset store reports `none` and `lookup()` is inactive, so the pipeline is byte-for-byte unchanged until a signal is set. **No network calls** unless `fetchHkoSignal()` is explicitly wired into a poller.

## Setting the signal

```js
pipeline.weatherStore.setSignal("tc8");   // owner console, cron, or manual
pipeline.weatherStore.clear();            // 復業
```

`fetchHkoSignal({ httpsClient })` reads the official HKO open-data warnsum endpoint and `normalizeWarnsum()` maps it to a level (highest impact wins, tolerant of payload changes). Wire it into a cron to go fully automatic; it is intentionally not called inside the request path.

## Tests

```bash
node "weather policy ver 1.0/test/weatherPolicy.test.js"
```

Covers level-alias normalisation, HKO warnsum parsing (highest-wins, garbage-tolerant), store lifecycle, closure vs caution policy, per-business override, `inferWeatherResponse` across intents and languages, and `fetchHkoSignal` against an injected fake HTTPS client (no real network).
