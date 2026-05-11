# End-to-end Pipeline Changelog

## Unreleased

### Security

#### 2026-05-12 HKT - Webhook Request Envelope Hardening

- **Security hardening:** Webhook requests now reject unsupported content types and oversized declared bodies before signature parsing or pipeline execution.
- **Availability hardening:** Body reads now enforce a configurable timeout with `bodyTimeoutMs`.
- **Tests:** Added server coverage for unsupported content type, declared oversize body rejection, and timeout status mapping.

#### 2026-05-12 HKT - Sender-Bound Backend Lookups

- **Security hardening:** Pipeline backend queries now carry the normalized `senderId`.
- **Data exposure reduction:** Customer-bound order/payment records are no longer returned on `businessId + reference` alone.
- **Tests:** Added backend coverage for mismatched/missing sender checks while keeping stock and availability flows unchanged.

#### 2026-05-10 03:35:13 HKT - Webhook Tenant Binding and Error Masking

- **Security fix:** Single-secret webhook mode now rejects tenant-scoped payloads unless `webhookBusinessId` binds the credential to a server-side business.
- **Authentication hardening:** Production unsigned-webhook mode is rejected even if `allowUnsignedWebhooks` is set.
- **Error handling:** Public 401 and 400 responses now return generic `unauthorized` and `bad_request` messages instead of exposing signature, timestamp, tenant, or JSON parser details.
- **Tests:** Added server coverage for unbound single-secret tenant rejection, production unsigned-mode rejection, and masked auth/bad-request responses.
