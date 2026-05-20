"use strict";

const { execFile } = require("node:child_process");
const { stitchText } = require("../../conversation context ver 1.0/src/conversationContext");
const { createHandoffState, DEFAULT_TTL_MS } = require("./handoffState");

const BOT_URL = process.env.BOT_URL || "http://127.0.0.1:3000/webhook";
const BUSINESS_ID = process.env.WA_BRIDGE_BUSINESS_ID || "restaurant_demo";
const POLL_MS = Number(process.env.WA_BRIDGE_POLL_MS || 2500);
const DRAFT_REPLIES = process.env.WA_BRIDGE_DRAFT_REPLIES !== "false";
const SEND_REPLIES = process.env.WA_BRIDGE_SEND_REPLIES === "true";
const SEND_HELD_DRAFTS = process.env.WA_BRIDGE_SEND_HELD_DRAFTS === "true";
const REPLY_LATEST_ON_START = process.env.WA_BRIDGE_REPLY_LATEST_ON_START === "true";
const HANDOFF_PAUSE_ENABLED = process.env.WA_BRIDGE_HANDOFF_PAUSE !== "false";
const HANDOFF_PAUSE_TTL_MS = Number(process.env.WA_BRIDGE_HANDOFF_PAUSE_TTL_HOURS || 24) * 60 * 60 * 1000 || DEFAULT_TTL_MS;
const HANDOFF_PAUSE_INTENTS = new Set(
  String(process.env.WA_BRIDGE_HANDOFF_PAUSE_INTENTS || "booking,reschedule,complaint,sensitive_health,human_request,payment,order_status")
    .split(",")
    .map((intent) => intent.trim())
    .filter(Boolean)
);
const HANDOFF_STATE_FILE = process.env.WA_BRIDGE_HANDOFF_STATE_FILE;
const handoffState = createHandoffState({
  enabled: HANDOFF_PAUSE_ENABLED,
  ttlMs: HANDOFF_PAUSE_TTL_MS,
  filePath: HANDOFF_STATE_FILE
});

let lastFingerprint = null;
let lastDraftedFingerprint = null;
let lastOpenedUnreadPreview = null;
let timer = null;
let tickInFlight = false;

main().catch((error) => {
  console.error("[wa-bridge] fatal:", error.message);
  process.exitCode = 1;
});

async function main() {
  const snapshot = await readWhatsAppSnapshot();
  lastFingerprint = REPLY_LATEST_ON_START ? null : latestIncoming(snapshot)?.fingerprint || null;
  console.log(`[wa-bridge] watching Safari WhatsApp Web chat`);
  console.log(`[wa-bridge] bot=${BOT_URL} businessId=${BUSINESS_ID} draftReplies=${DRAFT_REPLIES} sendReplies=${SEND_REPLIES} sendHeldDrafts=${SEND_HELD_DRAFTS}`);
  console.log(`[wa-bridge] handoffPause=${HANDOFF_PAUSE_ENABLED} ttlHours=${Math.round(HANDOFF_PAUSE_TTL_MS / 60 / 60 / 1000)} intents=${Array.from(HANDOFF_PAUSE_INTENTS).join(",")}`);
  console.log(`[wa-bridge] currentChat=${snapshot.chatTitle || "unknown"} existingLast=${lastFingerprint || "none"}`);
  console.log("[wa-bridge] waiting for the next incoming message...");

  await tick();
  timer = setInterval(() => {
    if (tickInFlight) return;
    tickInFlight = true;
    tick()
      .catch((error) => console.error("[wa-bridge] tick:", error.message))
      .finally(() => {
        tickInFlight = false;
      });
  }, POLL_MS);
  await new Promise(() => {});
}

async function tick() {
  let snapshot = await readWhatsAppSnapshot();
  syncStaffReplyForSnapshot(snapshot);
  let incoming = latestIncoming(snapshot);
  if (incoming && incoming.fingerprint === lastFingerprint) return;
  if (!incoming || incoming.fingerprint === lastFingerprint) {
    const unread = await openLatestUnreadChat(lastOpenedUnreadPreview);
    if (unread.opened) {
      lastOpenedUnreadPreview = unread.preview || null;
      console.log(`[wa-bridge] opened unread chat: ${unread.preview || "unknown"}`);
      await sleep(1200);
      snapshot = await readWhatsAppSnapshot();
      syncStaffReplyForSnapshot(snapshot);
      incoming = latestIncoming(snapshot);
    }
  }
  if (!incoming || incoming.fingerprint === lastFingerprint) return;

  lastFingerprint = incoming.fingerprint;
  lastOpenedUnreadPreview = null;
  console.log(`[wa-bridge] incoming from ${incoming.sender || "unknown"}: ${incoming.text}`);
  const chatKey = chatKeyFor(incoming, snapshot);
  const activeHandoff = handoffState.active(chatKey);
  if (activeHandoff) {
    const afterStaff = activeHandoff.stage === "staff_replied" || activeHandoff.staffReplyAt;
    if (afterStaff && isCustomerAcknowledgement(incoming.text)) {
      handoffState.release(chatKey);
      console.log(`[wa-bridge] customer acknowledged staff reply in paused chat=${chatKey}; bot stayed silent and auto-resumed.`);
      return;
    }
    if (afterStaff) {
      handoffState.release(chatKey);
      console.log(`[wa-bridge] customer sent a new substantive message after staff reply in chat=${chatKey}; auto-resumed bot.`);
    } else {
      console.log(`[wa-bridge] paused for staff handoff chat=${chatKey} intent=${activeHandoff.intent || "unknown"} until=${activeHandoff.pauseUntil}; bot did not reply.`);
      return;
    }
  }

  const textForBot = contextualizeIncoming(incoming, snapshot);
  if (textForBot !== incoming.text) {
    console.log(`[wa-bridge] contextualized message: ${textForBot}`);
  }

  const botResponse = await callBot({
    channel: "whatsapp",
    businessId: BUSINESS_ID,
    from: incoming.sender || snapshot.chatTitle || "whatsapp_web_sender",
    senderId: incoming.sender || snapshot.chatTitle || "whatsapp_web_sender",
    messageId: incoming.fingerprint,
    text: textForBot,
    debug: true
  });

  const replyText = customerReplyText(botResponse);
  console.log(`[wa-bridge] bot action=${botResponse.action} status=${botResponse.finalStatus}`);

  if (!replyText) {
    const draftText = botResponse?.debug?.draft?.text || "";
    if (SEND_HELD_DRAFTS) {
      const noticeText = staffReviewNotice(botResponse);
      await draftIntoComposer(noticeText);
      if (SEND_REPLIES) {
        await sleep(500);
        await clickSendButton();
        console.log(`[wa-bridge] sent staff-review handoff notice. staffItemId=${botResponse.staffItemId || "none"}`);
        if (draftText) console.log(`[wa-bridge] staff draft: ${draftText}`);
        pauseIfHandoffNeeded({ incoming, snapshot, botResponse, noticeText });
        return;
      }
      console.log(`[wa-bridge] drafted staff-review handoff notice. staffItemId=${botResponse.staffItemId || "none"}`);
      if (draftText) console.log(`[wa-bridge] staff draft: ${draftText}`);
      pauseIfHandoffNeeded({ incoming, snapshot, botResponse, noticeText });
      return;
    }

    console.log(`[wa-bridge] held for staff review; not drafting into WhatsApp. staffItemId=${botResponse.staffItemId || "none"}`);
    if (draftText) console.log(`[wa-bridge] staff draft: ${draftText}`);
    pauseIfHandoffNeeded({ incoming, snapshot, botResponse, noticeText: null });
    return;
  }

  if (!DRAFT_REPLIES) {
    console.log(`[wa-bridge] customer-safe reply: ${replyText}`);
    return;
  }

  if (lastDraftedFingerprint === incoming.fingerprint) return;
  await draftIntoComposer(replyText);
  lastDraftedFingerprint = incoming.fingerprint;
  if (SEND_REPLIES) {
    await sleep(500);
    await clickSendButton();
    console.log("[wa-bridge] sent reply through WhatsApp Web.");
    return;
  }
  console.log("[wa-bridge] drafted reply into WhatsApp Web message box; review it and press Send manually.");
}

async function callBot(payload) {
  const response = await fetch(BOT_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`bot returned ${response.status}: ${JSON.stringify(body)}`);
  return body;
}

function latestIncoming(snapshot) {
  return [...(snapshot.messages || [])].reverse().find((message) => message.incoming && message.text);
}

function chatKeyFor(incoming, snapshot) {
  return incoming.sender || snapshot.chatTitle || "whatsapp_web_sender";
}

function pauseIfHandoffNeeded({ incoming, snapshot, botResponse, noticeText }) {
  if (!shouldPauseForHandoff(botResponse)) return;
  const intent = botResponse?.debug?.intent?.primaryIntent || "general";
  const record = handoffState.pause(chatKeyFor(incoming, snapshot), {
    reason: "staff_review",
    intent,
    staffItemId: botResponse?.staffItemId || null,
    lastCustomerText: incoming.text || null,
    botHandoffText: noticeText || null
  });
  if (record) {
    console.log(`[wa-bridge] paused chat for staff handoff chat=${record.chatKey} intent=${intent} until=${record.pauseUntil}`);
  }
}

function shouldPauseForHandoff(botResponse) {
  const intent = botResponse?.debug?.intent?.primaryIntent || "general";
  const action = botResponse?.action || botResponse?.debug?.decision?.action || "";
  if (action === "handoff") return true;
  return botResponse?.finalStatus === "staff_review" && HANDOFF_PAUSE_INTENTS.has(intent);
}

function syncStaffReplyForSnapshot(snapshot) {
  const incoming = latestIncoming(snapshot);
  const chatKey = chatKeyFor(incoming || {}, snapshot);
  const activeHandoff = handoffState.active(chatKey);
  if (!activeHandoff || activeHandoff.staffReplyAt) return;
  const outgoing = latestOutgoing(snapshot);
  if (!outgoing?.text) return;
  if (outgoing.fingerprint === activeHandoff.botHandoffFingerprint) return;
  if (outgoing.text === activeHandoff.botHandoffText) return;
  if (looksLikeBridgeAuthored(outgoing.text)) return;

  const record = handoffState.markStaffReply(chatKey, {
    text: outgoing.text,
    fingerprint: outgoing.fingerprint
  });
  if (record) {
    console.log(`[wa-bridge] detected staff reply in handoff chat=${chatKey}; next acknowledgement will stay silent, then bot resumes.`);
  }
}

function latestOutgoing(snapshot) {
  return [...(snapshot.messages || [])].reverse().find((message) => message.outgoing && message.text);
}

function isCustomerAcknowledgement(text) {
  return /^(ok|okay|k|yes|yep|thanks?|thank you|thx|好|好的|好呀|可以|得|得呀|收到|明白|唔該|謝謝|多謝|🙏|👍)[\s!.。！?？🙏👍]*$/i.test(String(text || "").trim());
}

function looksLikeBridgeAuthored(text) {
  const value = String(text || "");
  return /跟進編號：staff_|交俾同事跟進|真人同事|留位費|以上只係一般參考|以下係目前測試資料|後台草稿：|我幫你睇咗/.test(value);
}

function contextualizeIncoming(incoming, snapshot) {
  const messages = snapshot.messages || [];
  const incomingIndex = messages.findIndex((message) => message.fingerprint === incoming.fingerprint);
  const history = (incomingIndex >= 0 ? messages.slice(0, incomingIndex) : messages.slice(0, -1))
    .map((message) => ({
      incoming: message.incoming,
      text: message.text
    }));
  return stitchText({ text: incoming.text || "", history }).text;
}

function customerReplyText(botResponse) {
  const payload = botResponse?.outbound?.payload;
  if (!payload) return null;
  if (typeof payload.text === "string") return payload.text;
  if (payload.text?.body) return payload.text.body;
  if (payload.message?.text) return payload.message.text;
  return null;
}

function staffReviewNotice(botResponse) {
  const intent = botResponse?.debug?.intent?.primaryIntent || "general";
  if (intent === "pricing") return pricingReviewNotice(botResponse);
  if (intent === "booking" || intent === "reschedule") return bookingReviewNotice(botResponse);
  if (intent === "service_info" || intent === "aftercare") return serviceInfoReviewNotice(botResponse);

  const reason = customerFacingReason(intent, botResponse);
  const staffItemId = botResponse?.staffItemId ? `\n跟進編號：${botResponse.staffItemId}` : "";
  return [
    "多謝你查詢，我會將呢個問題交俾真人同事跟進。",
    `原因：${reason}`,
    "同事會睇返你嘅訊息同後台資料，再用最準確嘅資料回覆你。" + staffItemId
  ].join("\n");
}

function serviceInfoReviewNotice(botResponse) {
  const draftText = botResponse?.debug?.draft?.text || botResponse?.debug?.knowledge?.bestMatchAnswer || "";
  const staffItemId = botResponse?.staffItemId ? `\n跟進編號：${botResponse.staffItemId}` : "";
  if (draftText) {
    return [
      draftText,
      "以上只係一般參考，實際適合邊個療程要視乎皮膚狀態；同事可以再幫你做最後確認。" + staffItemId
    ].join("\n\n");
  }

  return [
    "我會交俾真人同事幫你確認邊個療程比較適合。",
    "原因：療程推介要視乎皮膚狀態，避免直接答錯或講到保證效果。" + staffItemId
  ].join("\n");
}

function pricingReviewNotice(botResponse) {
  const plans = pricingPlans(botResponse?.debug?.backendFacts);
  const language = botResponse?.debug?.intent?.language || "zh-HK";
  const english = language === "en";
  const staffItemId = botResponse?.staffItemId ? `\n跟進編號：${botResponse.staffItemId}` : "";

  if (plans.length > 0) {
    if (english) {
      return [
        "Here are the current test pricing details:",
        plans.map((plan) => formatPricingPlan(plan, language)).join("\n"),
        "The most suitable option depends on your skin condition and the latest shop arrangement. If you would like to book, I can hand this to staff for confirmation." + staffItemId
      ].join("\n\n");
    }

    return [
      "以下係目前測試資料入面嘅價目參考：",
      plans.map((plan) => formatPricingPlan(plan, language)).join("\n"),
      "實際適合邊個方案，要視乎皮膚狀態同店內最新安排；如你想預約，我可以再交俾同事幫你確認。" + staffItemId
    ].join("\n\n");
  }

  if (english) {
    return [
      "I could not find matching pricing details yet.",
      "I will hand this to staff to confirm the latest plans and fees for you." + staffItemId
    ].join("\n");
  }

  return [
    "我暫時未搵到相符嘅價目資料。",
    "我會交俾真人同事幫你確認最新方案同收費，再回覆你。" + staffItemId
  ].join("\n");
}

function bookingReviewNotice(botResponse) {
  const facts = factsObject(botResponse?.debug?.backendFacts);
  const staffItemId = botResponse?.staffItemId ? `\n跟進編號：${botResponse.staffItemId}` : "";
  const service = formatService(facts.service);
  const dateTime = [facts.date, facts.time].filter(Boolean).join(" ");
  const slot = [dateTime, facts.partySize ? `${facts.partySize}位` : null, service].filter(Boolean).join(" ");
  const availableSlots = Array.isArray(facts.availableSlots) ? facts.availableSlots : null;

  if (botResponse?.debug?.backendFacts?.found && availableSlots) {
    if (availableSlots.length > 0) {
      return [
        `我幫你睇咗，${[facts.date, service].filter(Boolean).join(" ") || "你查詢嘅日期"}暫時見到以下時段：${availableSlots.join("、")}。`,
        "你想揀邊個時間？我會交俾真人同事做最後確認同處理留位安排。",
        "一般預約需要先付HK$200留位費，療程當日可扣返。" + staffItemId
      ].join("\n");
    }

    return [
      `我幫你睇咗，${[facts.date, service].filter(Boolean).join(" ") || "你查詢嘅日期"}暫時未見到可預約時段。`,
      "我會交俾真人同事幫你睇最近可選時段，再回覆你可以點安排。" + staffItemId
    ].join("\n");
  }

  if (botResponse?.debug?.backendFacts?.found && facts.available === true) {
    return [
      `我幫你睇咗，${slot || "你查詢嘅時段"}暫時見到有位。`,
      "我會交俾真人同事做最後確認同處理留位安排；未收到同事確認前，呢個預約未算正式確認。",
      "一般預約需要先付HK$200留位費，療程當日可扣返。" + staffItemId
    ].join("\n");
  }

  if (botResponse?.debug?.backendFacts?.found && facts.available === false) {
    return [
      `我幫你睇咗，${slot || "你查詢嘅時段"}暫時未見到有位。`,
      "我會交俾真人同事幫你睇最近可選時段，再回覆你可以點安排。" + staffItemId
    ].join("\n");
  }

  const reason = botResponse?.debug?.backendFacts?.reason || "";
  if (/Missing required availability field/i.test(reason)) {
    const missing = missingAvailabilityFields(reason);
    const missingText = missing.length > 0 ? missing.join("、") : "日期、時間同療程項目";
    return [
      "可以呀，我可以幫你交俾同事跟進預約。",
      `為咗幫你更快確認，麻煩補充：${missingText}。`,
      "同事收到後會核對實際空位同留位費安排。" + staffItemId
    ].join("\n");
  }

  return [
    `我會將你嘅預約查詢交俾真人同事跟進。`,
    "原因：預約需要核對實際空位、留位費同店內安排，避免直接答錯或誤作確認。",
    "同事會睇返你嘅訊息同後台資料，再回覆你。" + staffItemId
  ].join("\n");
}

function customerFacingReason(intent, botResponse) {
  if (intent === "pricing") {
    return "呢個查詢涉及價目、套票或優惠資料，需要同事確認最新方案同適合你嘅選項。";
  }
  if (intent === "booking" || intent === "reschedule") {
    return "呢個查詢涉及預約時段，需要同事確認實際空位、留位費同預約安排。";
  }
  if (intent === "payment") {
    return "呢個查詢涉及付款紀錄，需要同事核對後台資料，避免答錯。";
  }
  if (intent === "order_status") {
    return "呢個查詢涉及訂單或物流狀態，需要同事核對後台資料。";
  }
  if (intent === "sensitive_health") {
    return "呢個查詢可能涉及皮膚狀況或健康相關資料，需要真人同事小心跟進。";
  }
  if (intent === "complaint") {
    return "呢個查詢涉及投訴、退款或不滿情況，需要真人同事親自處理。";
  }
  if (intent === "human_request") {
    return "你想搵真人同事，所以我會直接交俾同事跟進。";
  }

  const rawReason = botResponse?.debug?.decision?.reason || "";
  if (/backend/i.test(rawReason)) return "呢個查詢需要同事核對後台資料。";
  if (/policy/i.test(rawReason)) return "呢個查詢受店舖政策限制，需要真人同事確認。";
  return "呢個查詢需要真人同事確認，確保回覆準確。";
}

function factsObject(backendFacts = {}) {
  return Object.fromEntries((backendFacts.facts || []).map((fact) => [fact.key, fact.value]));
}

function pricingPlans(backendFacts = {}) {
  const plans = [];
  let current = null;
  for (const fact of backendFacts.facts || []) {
    if (fact.key === "planId") {
      current = { planId: fact.value };
      plans.push(current);
      continue;
    }
    if (current) current[fact.key] = fact.value;
  }
  return plans;
}

function formatPricingPlan(plan, language = "zh-HK") {
  if (language === "en") {
    const original = plan.originalPriceHkd ? ` (original HK$${plan.originalPriceHkd})` : "";
    const sessions = plan.sessions ? `${plan.sessions} session${plan.sessions > 1 ? "s" : ""}` : "";
    const duration = plan.durationMinutes ? `around ${plan.durationMinutes} minutes` : "";
    const detail = [sessions, duration].filter(Boolean).join(", ");
    const deposit = plan.depositHkd ? `; booking deposit HK$${plan.depositHkd}` : "";
    const notes = plan.notesEn ? `\n  Notes: ${plan.notesEn}` : "";
    return `• ${plan.planNameEn || plan.planNameZh || plan.planId}: HK$${plan.priceHkd}${original}${detail ? `, ${detail}` : ""}${deposit}${notes}`;
  }

  const original = plan.originalPriceHkd ? `（原價HK$${plan.originalPriceHkd}）` : "";
  const sessions = plan.sessions ? `${plan.sessions}次` : "";
  const duration = plan.durationMinutes ? `約${plan.durationMinutes}分鐘` : "";
  const detail = [sessions, duration].filter(Boolean).join("，");
  const deposit = plan.depositHkd ? `；留位費HK$${plan.depositHkd}` : "";
  const notes = plan.notesZh ? `\n  備註：${plan.notesZh}` : "";
  return `• ${plan.planNameZh || plan.planNameEn || plan.planId}: HK$${plan.priceHkd}${original}${detail ? `，${detail}` : ""}${deposit}${notes}`;
}

function formatService(service) {
  if (service === "facial") return "面部護理";
  if (service === "laser") return "脫毛";
  if (service === "assessment") return "評估";
  return service || null;
}

function missingAvailabilityFields(reason) {
  const match = String(reason || "").match(/Missing required availability field\(s\):\s*(.+)\./i);
  if (!match) return [];
  return match[1].split(/\s*,\s*/).map((field) => {
    if (field === "date") return "日期";
    if (field === "time") return "時間";
    if (field === "service") return "療程項目";
    if (field === "partySize") return "人數";
    return field;
  });
}

async function readWhatsAppSnapshot() {
  return JSON.parse(await safariJs(`(() => {
    const headerTitle = document.querySelector('header span[title]')?.getAttribute('title') || null;
    const messages = [...document.querySelectorAll('[data-pre-plain-text]')]
      .map((el, index) => {
        const pre = el.getAttribute('data-pre-plain-text') || '';
        const match = pre.match(/^\\[(.*?)\\]\\s([^:]+):\\s?$/);
        const text = (el.innerText || '').replace(/\\n+$/g, '').trim();
        return {
          index,
          pre,
          timestamp: match ? match[1] : null,
          sender: match ? match[2] : null,
          text,
          incoming: Boolean(el.closest('.message-in')),
          outgoing: Boolean(el.closest('.message-out')),
          fingerprint: [pre, text].join('|')
        };
      })
      .filter((message) => message.text)
      .slice(-30);
    return JSON.stringify({
      url: location.href,
      title: document.title,
      chatTitle: headerTitle,
      messages
    });
  })()`));
}

async function draftIntoComposer(text) {
  const result = JSON.parse(await safariJs(`(() => {
    const composer = [...document.querySelectorAll('[contenteditable="true"][role="textbox"]')]
      .find((el) => {
        const label = el.getAttribute('aria-label') || '';
        return !/search|搜尋/i.test(label) && (/message|訊息|輸入/i.test(label) || el.closest('footer'));
      });
    if (!composer) return JSON.stringify({ ok: false, reason: 'composer_not_found' });

    composer.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(composer);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('insertText', false, ${JSON.stringify(text)});
    return JSON.stringify({ ok: true });
  })()`));
  if (!result.ok) throw new Error(result.reason || "draft_failed");
}

async function clickSendButton() {
  const result = JSON.parse(await safariJs(`(() => {
    const explicitIcon = document.querySelector('[data-icon="wds-ic-send-filled"], [data-icon="send"]');
    const explicitButton = explicitIcon?.closest('button,[role="button"]');
    if (explicitButton) {
      explicitButton.click();
      return JSON.stringify({ ok: true, method: 'data-icon' });
    }

    const buttons = [...document.querySelectorAll('footer button, footer [role="button"], button,[role="button"]')];
    const sendButton = buttons.find((button) => {
      const aria = button.getAttribute('aria-label') || '';
      const title = button.getAttribute('title') || '';
      const dataIcon = button.querySelector('[data-icon]')?.getAttribute('data-icon') || '';
      return /send|傳送|发送/i.test(aria + ' ' + title + ' ' + dataIcon);
    });
    if (!sendButton) {
      const composer = [...document.querySelectorAll('[contenteditable="true"][role="textbox"]')]
        .find((el) => {
          const label = el.getAttribute('aria-label') || '';
          return !/search|搜尋/i.test(label) && (/message|訊息|輸入/i.test(label) || el.closest('footer'));
        });
      if (!composer) return JSON.stringify({ ok: false, reason: 'send_button_not_found' });
      composer.focus();
      const enter = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      composer.dispatchEvent(enter);
      return JSON.stringify({ ok: true, method: 'keyboard-enter' });
    }
    sendButton.click();
    return JSON.stringify({ ok: true });
  })()`));
  if (!result.ok) throw new Error(result.reason || "send_failed");
}

async function openLatestUnreadChat(cooldownPreview = null) {
  return JSON.parse(await safariJs(`(() => {
    const cooldownPreview = ${JSON.stringify(cooldownPreview)};
    const rows = [...document.querySelectorAll('[role="row"]')];
    const unreadRow = rows.find((row) => {
      const text = row.innerText || '';
      const aria = [
        row.getAttribute('aria-label') || '',
        ...[...row.querySelectorAll('[aria-label]')].map((el) => el.getAttribute('aria-label') || '')
      ].join(' ');
      const hasUnread = /未讀|未读|unread/i.test(text + ' ' + aria);
      const looksLikeChat = /上午|下午|AM|PM|\\d{1,2}:\\d{2}/i.test(text);
      return hasUnread && looksLikeChat;
    });
    if (!unreadRow) return JSON.stringify({ opened: false });
    const preview = (unreadRow.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 140);
    if (cooldownPreview && preview === cooldownPreview) {
      return JSON.stringify({ opened: false, skipped: true, preview });
    }
    unreadRow.scrollIntoView({ block: 'center' });
    const rect = unreadRow.getBoundingClientRect();
    const x = rect.left + Math.min(rect.width - 8, Math.max(8, rect.width / 2));
    const y = rect.top + Math.min(rect.height - 8, Math.max(8, rect.height / 2));
    const target = document.elementFromPoint(x, y) || unreadRow;
    for (const type of ['mouseover', 'mousemove', 'mousedown', 'mouseup', 'click']) {
      target.dispatchEvent(new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0
      }));
    }
    return JSON.stringify({ opened: true, preview });
  })()`));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safariJs(source) {
  return new Promise((resolve, reject) => {
    const command = `tell application "Safari" to do JavaScript ${JSON.stringify(source)} in front document`;
    execFile("osascript", ["-e", command], { timeout: 10000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error((stderr || error.message).trim()));
        return;
      }
      resolve(stdout.trim());
    });
  });
}
