# End-to-end Pipeline ver 1.0 - Side-by-side results

Pipeline: channel -> privacy -> intent -> KB -> rules -> backend mock -> model route -> draft -> safety -> outbound/staff inbox.

| Case | Expected | Actual |
|---|---|---|
| restaurant hours goes ready_to_send | {"finalStatus":"ready_to_send","action":"auto_send","promotion":""} | {"finalStatus":"ready_to_send","action":"auto_send","safety":"pass","promotion":"","outbound":"ready_to_send","staffItemId":null} |
| beauty pricing goes staff review | {"finalStatus":"staff_review","action":"staff_review","promotion":""} | {"finalStatus":"staff_review","action":"staff_review","safety":"revise","promotion":"beauty_may_small_face_trial","outbound":"held","staffItemId":"staff_0001"} |
| beauty small-face promo is read before staff draft | {"finalStatus":"staff_review","action":"staff_review","promotion":"beauty_may_small_face_trial"} | {"finalStatus":"staff_review","action":"staff_review","safety":"revise","promotion":"beauty_may_small_face_trial","outbound":"held","staffItemId":"staff_0002"} |
| restaurant parking clarify can send | {"finalStatus":"ready_to_send","action":"clarify","promotion":""} | {"finalStatus":"ready_to_send","action":"clarify","safety":"pass","promotion":"","outbound":"ready_to_send","staffItemId":null} |
| complaint goes staff review handoff | {"finalStatus":"staff_review","action":"handoff","promotion":""} | {"finalStatus":"staff_review","action":"handoff","safety":"revise","promotion":"","outbound":"held","staffItemId":"staff_0003"} |
