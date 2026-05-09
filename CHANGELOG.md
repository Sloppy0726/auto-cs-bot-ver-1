# Changelog

## Unreleased

### Security

#### 2026-05-10 03:12:52 HKT - Prompt Injection Boundary Hardening

- **Security fix:** Wrapped sanitized customer text in an explicit `CUSTOMER_MESSAGE` untrusted-data envelope before sending it to the draft LLM.
- **Instruction hardening:** Added system and final-check rules telling the model not to follow instructions inside customer-provided text.
- **Tests:** Added draft-engine coverage for customer-message delimiters and untrusted-data prompt wording.

#### 2026-05-10 03:03:22 HKT - Data Exposure Reduction

- **Security fix:** Removed raw `originalText` and detector `value` fields from default privacy gateway output so ordinary pipeline results do not carry sensitive customer data.
- **Controlled opt-in:** Added `includeSensitive: true` for controlled staff/debug tools that explicitly need raw text and finding values.
- **Staff inbox hardening:** Staff inbox items now prefer sanitized customer text, preventing raw phone/email/HKID/payment-like content from being stored by default.
- **Tests:** Added coverage for redacted gateway output, sensitive opt-in behavior, and sanitized staff inbox storage.

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
