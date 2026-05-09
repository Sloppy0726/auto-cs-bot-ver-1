# Safety Checker ver 1.0 - Side-by-side results

| Case | Expected | Actual |
|---|---|---|
| auto_send approved answer passes | {"verdict":"pass","safeToSend":true} | {"verdict":"pass","safeToSend":true,"violations":[],"reasons":["checked action=auto_send","violations=0"]} |
| auto_send edited answer blocks | {"verdict":"block"} | {"verdict":"block","safeToSend":false,"violations":["auto_send_not_verbatim"],"reasons":["checked action=auto_send","violations=1"]} |
| booking confirmation surface blocks | {"verdict":"block"} | {"verdict":"block","safeToSend":false,"violations":["forbidden_capability_surface"],"reasons":["checked action=staff_review","violations=1"]} |
| clarify exact text passes | {"verdict":"pass","safeToSend":true} | {"verdict":"pass","safeToSend":true,"violations":[],"reasons":["checked action=clarify","violations=0"]} |
| handoff staff summary is revise not send | {"verdict":"revise","safeToSend":false} | {"verdict":"revise","safeToSend":false,"violations":[],"reasons":["checked action=handoff","violations=0"]} |
| privacy block with no text blocks safely | {"verdict":"block","safeToSend":false} | {"verdict":"block","safeToSend":false,"violations":[],"reasons":["block action never safe to send"]} |
