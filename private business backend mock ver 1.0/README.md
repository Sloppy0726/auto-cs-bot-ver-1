# Private Business Backend Mock ver 1.0

Local mock for controlled business systems: bookings, restaurant table availability, IG shop stock/orders, and payments.

The mock returns minimal sanitized facts only. It does not expose raw customer records to the AI response flow.

## Main API

```js
const { createBusinessBackend } = require("./src/businessBackendMock");

const backend = createBusinessBackend();
backend.checkAvailability({ businessId, date, time, service });
backend.lookupOrder({ businessId, orderId, senderId });
backend.getStock({ businessId, sku });
backend.lookupPayment({ businessId, reference, senderId });
backend.getMinimalFacts({ businessId, intent, query });
```

Order and payment records can be bound to `customerExternalId`. When a record is bound, `lookupOrder()` and `lookupPayment()` only return facts if the query `senderId` matches that customer binding. This keeps stock and availability checks easy to demo while preventing ID-only order/payment lookups from exposing another customer record.

## Run

```bash
node "private business backend mock ver 1.0/test/businessBackendMock.test.js"
node "private business backend mock ver 1.0/scripts/writeSideBySideResults.js"
```
