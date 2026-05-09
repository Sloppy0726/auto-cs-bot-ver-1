# Staff Inbox ver 1.0

In-memory staff queue for messages that cannot be sent automatically: staff review drafts, human handoff, and privacy blocks.

## Main API

```js
const { createStaffInbox } = require("./src/staffInbox");

const inbox = createStaffInbox();
const item = inbox.submit({ decision, draft, safety, normalizedMessage });
inbox.list({ status: "open" });
inbox.approve(item.id, "staff_name");
inbox.edit(item.id, "edited draft", "staff_name");
inbox.reject(item.id, "reason", "staff_name");
inbox.takeOver(item.id, "staff_name");
```

## Priorities

| Input | Priority |
|---|---|
| privacy block / safety block | `critical` |
| handoff / escalation label | `high` |
| staff review | `medium` |
| other | `low` |

## Run

```bash
node "staff inbox ver 1.0/test/staffInbox.test.js"
node "staff inbox ver 1.0/scripts/writeSideBySideResults.js"
```
