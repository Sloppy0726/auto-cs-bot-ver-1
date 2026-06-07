# Owner Console ver 1.0

讓**老闆**喺 WhatsApp / Telegram 用簡單指令叫起 [小生意工具箱](../small%20business%20toolkit%20ver%201.0/)。
bot 認得老闆個電話 = 老闆權限,其他人照走正常客服流程。

## 點運作

```
inbound message (senderId 電話 + text)
   │
   ├─ 1. 認電話   isOwner(senderId, OWNER_PHONES)  → 唔係老闆就 { handled:false }
   │
   ├─ 2. 認指令（三階梯）
   │      A. 快捷詞   「追數」「今日生意」「客戶」      → 即時,免 LLM
   │      B. 選單     「?」/「選單」→ 1️⃣2️⃣3️⃣;老闆答數字
   │      C. 自然語言  「睇下公司近排點」→ 本地 LLM 揀 tool
   │                  （未駁 LLM 時 fallback 去 smb-router 關鍵字）
   │
   ├─ 3. 敏感動作（出 email 等)先問「確認 / 取消」
   │
   └─ 4. 跑工具箱 dispatch() → 用中文短訊回老闆
```

## 檔案

```
src/
  ownerRegistry.js    OWNER_PHONES 解析 + isOwner（支援帶/唔帶國碼）
  aliases.js          快捷詞、選單、會寫入嘅工具、工具中文名
  commandResolver.js  text → menu / tool / nl
  format.js           工具結果 → 中文 WhatsApp 短訊
  ownerConsole.js     主流程（認人 → 解指令 → 確認 → 執行 → 回覆）
  index.js
test/
  ownerConsole.test.js            單元
  pipeline.integration.test.js    經真 pipeline 跑老闆快線
```

## 設定

`.env` 加老闆電話(逗號分隔,帶唔帶國碼都得):

```
OWNER_PHONES=85261112222,85298765432
```

冇設定 → 整個功能係 no-op,客服流程完全唔受影響。

## 接本地 LLM

`createOwnerConsole({ toolRouter })`:`toolRouter(text)` 回 `{ tool, args }` 就會優先用你嘅本地 LLM 揀工具;回 `null` 或唔提供就 fallback 去 `smb-router`。之後換 Claude 只係換呢個 function。

## 落咗 pipeline 邊度

`end-to-end pipeline ver 1.0/src/pipeline.js` 嘅 `runMessage`:`normalizeInbound` 成功之後加咗一個老闆快線分支。`createPipeline` 預設會建 owner console(讀 `OWNER_PHONES`);`config.ownerConsole` 可注入或設 `false` 關閉。

## 仲未做

- 確認狀態而家係 in-memory(同一 process 有效);要持久化可駁 `conversation context` store。
- 回覆係通用中文;逐個工具嘅靚 format(例:追數列出每張單金額)可以再加。
- 工具描述未繁中化,自然語言 fallback 行 `smb-router` 關鍵字;駁本地 LLM 後會準好多。
