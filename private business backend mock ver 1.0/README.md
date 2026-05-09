# Private Business Backend Mock ver 1.0

Local mock for controlled business systems: bookings, restaurant table availability, IG shop stock/orders, and payments.

The mock returns minimal sanitized facts only. It does not expose raw customer records to the AI response flow.

## Main API

```js
const { createBusinessBackend } = require("./src/businessBackendMock");

const backend = createBusinessBackend();
backend.checkAvailability({ businessId, date, time, service });
backend.lookupOrder({ businessId, orderId });
backend.getStock({ businessId, sku });
backend.lookupPayment({ businessId, reference });
backend.getMinimalFacts({ businessId, intent, query });
```

## Run

```bash
node "private business backend mock ver 1.0/test/businessBackendMock.test.js"
node "private business backend mock ver 1.0/scripts/writeSideBySideResults.js"
```
