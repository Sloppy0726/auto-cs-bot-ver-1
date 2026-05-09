# Changelog

## Unreleased

### Security

#### 2026-05-10 02:45:32 HKT - Tenant-Bound Webhook Authorization

- **Security fix:** Bound signed webhook credentials to an authorized `businessId` so request bodies can no longer choose another tenant/business context.
- **Authorization guard:** Added `webhookSecrets` support for per-business webhook secrets and reject mismatched payload `businessId` values with `business_id_not_authorized` before the pipeline runs.
- **Tenant derivation:** Payloads without `businessId` now inherit the verified credential businessId when the credential is tenant-bound.
- **Tests:** Added server coverage for credential-to-business binding, derived business IDs, and signed cross-business impersonation attempts.

#### 2026-05-10 02:26:31 HKT - Webhook Authentication Hardening

- **Security fix:** Hardened the end-to-end webhook server so `POST /webhook` verifies an HMAC-SHA256 signature over the raw body and timestamp before parsing JSON or calling the pipeline.
- **Replay protection:** Added timestamp freshness checks for webhook requests, with a default 5-minute replay window.
- **Timing hardening:** Added constant-time signature comparison for webhook signatures.
- **Data exposure reduction:** Replaced unexpected 500 error details with a generic `internal_server_error` response to avoid leaking server internals.
- **Tests:** Added server coverage for valid signatures, tampered bodies, stale timestamps, missing signatures, and ensuring unsigned requests never reach the pipeline.
