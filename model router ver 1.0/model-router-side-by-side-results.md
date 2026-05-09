# Model Router ver 1.0 - Side-by-side results

| Case | Expected | Actual |
|---|---|---|
| auto_send uses no LLM | {"model":"no_llm","shouldCallLLM":false} | {"provider":"none","model":"no_llm","shouldCallLLM":false,"promptCache":false,"maxTokens":0,"reasons":["action auto_send is deterministic"]} |
| staff_review simple uses Haiku | {"model":"claude-haiku-4-5-20251001","shouldCallLLM":true} | {"provider":"anthropic","model":"claude-haiku-4-5-20251001","shouldCallLLM":true,"promptCache":true,"maxTokens":700,"reasons":["action staff_review can use low-cost draft model"]} |
| handoff uses Sonnet | {"model":"claude-sonnet-4-6","shouldCallLLM":true} | {"provider":"anthropic","model":"claude-sonnet-4-6","shouldCallLLM":true,"promptCache":true,"maxTokens":500,"reasons":["handoff summary needs stronger reasoning","riskLevel=high","complex intent=complaint"]} |
| payment review uses Sonnet | {"model":"claude-sonnet-4-6","shouldCallLLM":true} | {"provider":"anthropic","model":"claude-sonnet-4-6","shouldCallLLM":true,"promptCache":true,"maxTokens":700,"reasons":["complex intent=payment"]} |
