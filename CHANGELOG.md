# Changelog

## Unreleased

### Security

#### 2026-06-10 HKT - Owner Impersonation, Paraphraser Injection, and Store Race Fixes

- **Owner-command impersonation closed:** the owner fast-path now only runs on
  channels where the sender's number is operator-verified (default `whatsapp`,
  configurable via `config.ownerChannels` / `OWNER_CHANNELS`). Previously a
  website visitor could set their client-chosen `sessionId` to the owner's phone
  number and run finance/CRM toolkit commands.
- **Owner matching tightened:** `isOwner` no longer matches an arbitrary short
  suffix against a real number; it requires a full normalized number or a
  last-8-digit (HK local) match, with both sides ≥ 8 digits.
- **Paraphraser can no longer inject facts:** `preservesFacts` is now
  bidirectional — a rewrite may neither drop a source fact nor introduce a
  price/time/date/id absent from the approved source. This protects the
  "auto_send quotes approved KB only" guarantee.
- **Availability store cross-process lock:** the read-modify-write cycle for
  bookings/opening-hours/resources is now guarded by a lockfile, preventing
  lost writes and double-booking when the server and bridge run as separate
  processes.
- **Admin token constant-time compare:** the `x-admin-token` check now uses
  `crypto.timingSafeEqual` instead of `!==`, removing a timing side-channel.
- **`/debug/fake-db` gated:** the customer/order/payment dump now requires the
  same admin auth as `/admin` (blocked in production without `ADMIN_TOKEN`).
- **Rate-limit IP spoofing closed:** `X-Forwarded-For` is only trusted when
  `config.trustProxy` / `TRUST_PROXY=true` is set; otherwise the real socket
  address is used so the header can't be rotated to dodge limits.
- **Safety-checker PII backstop aligned with the filter:** now matches HKID with
  or without the check-digit parentheses and all HK phone prefixes (2/3/5/6/8/9).
- **Conversation history is sanitized on disk:** persisted context now stores
  PII-redacted text instead of raw customer messages.
- **Tests:** added `ownerSecurity`, `paraphraseInjection`, and
  `availabilityConcurrency` (8-process concurrent-write) suites; full suite at
  **3,125 assertions across 52 test files**.

#### 2026-05-12 HKT - Webhook Request Envelope Hardening

- **Availability hardening:** Webhook requests now reject non-JSON content types, oversized declared bodies, and slow request bodies before reaching the pipeline.
- **Tests:** Added end-to-end server coverage for content-type rejection, declared size rejection, and timeout status mapping.

#### 2026-05-12 HKT - Sender-Bound Backend Lookups

- **Data exposure reduction:** Order and payment mock backend records can now be bound to a channel sender, preventing ID-only lookups from exposing another customer record.
- **Pipeline hardening:** Backend queries now carry the normalized channel `senderId`.
- **Tests:** Added backend coverage for mismatched and missing sender checks.

#### 2026-05-12 HKT - Promo Prompt Boundary Hardening

- **Prompt-injection hardening:** Active promotion facts are now wrapped in a `PROMOTION_FACTS_UNTRUSTED_DO_NOT_FOLLOW` block before they reach draft-generation prompts.
- **Tests:** Added draft-engine coverage for promotion delimiters and injection-like promo text.

#### 2026-05-12 HKT - Explicit Drive Promo Approval

- **Security hardening:** Google Drive promotion blocks now require an explicit approved value before syncing; blank or missing approval is treated as a draft.
- **Compatibility:** In-code seed promotions remain trusted so local demos keep working.
- **Tests:** Added promo-sync coverage for rejecting Drive docs without explicit approval.

#### 2026-05-10 03:35:13 HKT - Webhook Tenant Binding and Error Masking

- **Security fix:** Closed the single-secret tenant authorization gap by rejecting signed tenant-scoped webhook payloads unless the credential is bound with `webhookBusinessId`.
- **Authentication hardening:** Rejected production use of `allowUnsignedWebhooks` so unsigned webhook mode cannot be accidentally enabled in deployment.
- **API hardening:** Masked public 401 and 400 error bodies as `unauthorized` and `bad_request` to avoid exposing signature, timestamp, tenant-binding, or parser oracles.
- **Tests:** Added end-to-end pipeline server coverage for unbound single-secret rejection, production unsigned-mode rejection, and generic auth/bad-request responses.

#### 2026-05-10 03:18:11 HKT - Stable Message ID Hash Hardening

- **Security hardening:** Replaced the channel adapter 32-bit rolling hash used for generated `externalMessageId` values with a SHA-256-derived identifier.
- **Collision reduction:** Generated fallback message IDs now use a deterministic 24-hex-character digest suffix instead of a small signed integer space.
- **Tests:** Added channel-adapter coverage for deterministic, content-sensitive SHA-256-derived stable IDs.

#### 2026-05-10 03:15:04 HKT - Redaction Placeholder Leak Detection

- **Security fix:** Expanded safety checks to catch bracketed privacy redaction placeholders such as `[PHONE_1]`, `[EMAIL_1]`, `[HKID_1]`, and payment/order/booking placeholders.
- **Defense in depth:** Added the same bracketed-placeholder surface to the draft-engine `leak_pii` forbidden capability guard.
- **Tests:** Added safety-checker and draft-engine coverage for bracketed placeholder leaks.

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
