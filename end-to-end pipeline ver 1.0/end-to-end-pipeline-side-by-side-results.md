# End-to-end Pipeline ver 1.0 - Side-by-side results

Pipeline: channel -> privacy -> intent -> KB -> rules -> backend mock -> model route -> draft -> safety -> outbound/staff inbox.

| Case | Expected | Actual |
|---|---|---|
| restaurant hours goes ready_to_send | {"finalStatus":"ready_to_send","action":"auto_send"} | {"finalStatus":"ready_to_send","action":"auto_send","safety":"pass","outbound":"ready_to_send","staffItemId":null} |
| beauty pricing goes staff review | {"finalStatus":"staff_review","action":"staff_review"} | {"finalStatus":"staff_review","action":"staff_review","safety":"revise","outbound":"held","staffItemId":"staff_0001"} |
| restaurant parking clarify can send | {"finalStatus":"ready_to_send","action":"clarify"} | {"finalStatus":"ready_to_send","action":"clarify","safety":"pass","outbound":"ready_to_send","staffItemId":null} |
| complaint goes staff review handoff | {"finalStatus":"staff_review","action":"handoff"} | {"finalStatus":"staff_review","action":"handoff","safety":"revise","outbound":"held","staffItemId":"staff_0002"} |
