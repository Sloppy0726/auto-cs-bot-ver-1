# End-to-end Pipeline Changelog

## Unreleased

### Security

#### 2026-05-10 03:35:13 HKT - Webhook Tenant Binding and Error Masking

- **Security fix:** Single-secret webhook mode now rejects tenant-scoped payloads unless `webhookBusinessId` binds the credential to a server-side business.
- **Authentication hardening:** Production unsigned-webhook mode is rejected even if `allowUnsignedWebhooks` is set.
- **Error handling:** Public 401 and 400 responses now return generic `unauthorized` and `bad_request` messages instead of exposing signature, timestamp, tenant, or JSON parser details.
- **Tests:** Added server coverage for unbound single-secret tenant rejection, production unsigned-mode rejection, and masked auth/bad-request responses.
