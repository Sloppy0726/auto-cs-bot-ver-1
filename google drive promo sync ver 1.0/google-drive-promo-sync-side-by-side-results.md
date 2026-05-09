# Google Drive Promo Sync ver 1.0 - Side-by-side results

All date checks use Hong Kong time (`Asia/Hong_Kong`, UTC+8).

| Case | Expected | Actual |
|---|---|---|
| active small-face promotion matches in HK time | {"match":true,"title":"小顏管理五月體驗優惠"} | {"match":true,"title":"小顏管理五月體驗優惠","checkedDateHk":"2026-05-09","grounding":["beauty_may_small_face_trial"]} |
| expired promotion does not match after HK expiry | {"match":false,"title":""} | {"match":false,"title":"","checkedDateHk":"2026-06-01","grounding":[]} |
| wrong business does not match | {"match":false,"title":""} | {"match":false,"title":"","checkedDateHk":"2026-05-09","grounding":[]} |
