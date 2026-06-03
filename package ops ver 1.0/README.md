# Package Ops ver 1.0

Read-only prepaid package entitlement lookup for the Traditional Chinese AI Customer Support Safety Framework.

This module is the first vertical wedge for beauty and medical-beauty shops: when a customer asks on WhatsApp or IG how many prepaid sessions remain or when a package expires, the system can answer from verified package facts instead of letting staff guess.

## Why this matters

Generic chatbots answer FAQs. Package Ops handles a more expensive locale service-business problem: prepaid package disputes. Beauty, fitness, and education businesses often need to track remaining sessions, expiry dates, usage history, refund/extension requests, and what staff are allowed to promise.

## Main API

```js
const { createPackageStore } = require("./src/packageOps");

const store = createPackageStore({ entries });
const facts = store.lookup({
  businessId: "beauty_demo",
  senderId: "85261112222",
  sanitizedText: "我想問個package仲有幾多次",
  now: new Date("2026-05-10T00:00:00.000Z")
});
```

Output:

```js
{
  found: true,
  verifiedSender: true,
  autoSendEligible: true,
  approvedReplyText: "May，你而家剩餘 3 次保濕 facial，套票到期日係 2026-07-31。",
  bestPackage: { id: "pkg_may_hydrafacial_active", ... },
  riskFlags: [],
  grounding: ["pkg_may_hydrafacial_active"]
}
```

## Safety rules

- Package facts are sender-bound. A mismatched or missing sender never exposes package details.
- Active verified packages can produce deterministic replies.
- Expired, disputed, or unverified records require staff review.
- Refund, extension, transfer, and treatment-result promises are forbidden downstream by business rules and safety checks.

## Integration

```
channel adapter
  -> privacy gateway
  -> intent classifier package_status
  -> package ops
  -> business rules
  -> AI draft engine
  -> safety checker
  -> outbound or staff inbox
```

The module stays separate from the private backend mock because prepaid package records have their own entitlement and dispute logic.

## Run

```bash
node "package ops ver 1.0/test/packageOps.test.js"
node "package ops ver 1.0/scripts/writeSideBySideResults.js"
```

## Roadmap

- v1.1: usage receipt generation after staff marks a session used.
- v1.2: Google Sheet import for existing package records.
- v1.3: expiry reminder drafts for staff approval.
- v2.0: package terms snapshots and boss approval workflow for refunds, extensions, and transfers.
