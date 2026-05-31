"use strict";

// End-to-end Pipeline ver 1.0
// Orchestrates the workflow from channel payload to reply/staff item.

const { normalizeInbound, buildOutboundMessage } = require("../../channel adapter ver 1.0/src/channelAdapter");
const { routeMessage } = require("../../privacy gateway ver 1.0/src/privacyGateway");
const { classifyIntent } = require("../../intent classifier ver 1.0/src/intentClassifier");
const { createKnowledgeBase } = require("../../knowledge base ver 1.0/src/knowledgeBase");
const seed = require("../../knowledge base ver 1.0/seed/hkSmeSeed");
const { evaluate } = require("../../business rules ver 1.0/src/businessRules");
const { getConfig } = require("../../business rules ver 1.0/src/archetypes");
const { generateDraft } = require("../../AI draft engine ver 1.0/src/draftEngine");
const { routeModel } = require("../../model router ver 1.0/src/modelRouter");
const { checkDraft } = require("../../safety checker ver 1.0/src/safetyChecker");
const { createBusinessBackend } = require("../../private business backend mock ver 1.0/src/businessBackendMock");
const { createStaffInbox } = require("../../staff inbox ver 1.0/src/staffInbox");
const { createPromotionStore } = require("../../google drive promo sync ver 1.0/src/promoSync");
const { hkDateKey } = require("../../google drive promo sync ver 1.0/src/hkTime");
const promoSeed = require("../../google drive promo sync ver 1.0/seed/promoSeed");

function createPipeline(config = {}) {
  const kb = config.knowledgeBase || createKnowledgeBase({ entries: config.seed || seed });
  const backend = config.backend || createBusinessBackend();
  const inbox = config.staffInbox || createStaffInbox();
  const promotionStore = config.promotionStore || createPromotionStore({ entries: config.promotionEntries || promoSeed });
  const llmAdapter = config.llmAdapter;
  const llmIntentAnalyzer = config.llmIntentAnalyzer;
  const paraphraser = config.paraphraser;
  const nowFn = config.nowFn || (() => new Date());

  return {
    async runMessage(input) {
      return runMessage(input, { kb, backend, inbox, promotionStore, llmAdapter, llmIntentAnalyzer, paraphraser, nowFn, config });
    },
    inbox,
    backend,
    kb,
    promotionStore
  };
}

async function runMessage(input = {}, deps = {}) {
  const normalizedMessage = normalizeInbound(input);
  if (normalizedMessage.errors.length > 0) {
    const staffItem = deps.inbox?.submit({
      decision: { action: "handoff", businessId: normalizedMessage.businessId, escalationLabel: "channel_payload_error", reasons: normalizedMessage.errors },
      draft: { action: "handoff", text: null },
      safety: { verdict: "revise", safeToSend: false, reasons: normalizedMessage.errors },
      normalizedMessage
    }) || null;
    return result({ normalizedMessage, staffItem, finalStatus: "staff_review", errors: normalizedMessage.errors });
  }

  const gateway = routeMessage(normalizedMessage.rawText);
  const intent = await classifyIntent(gateway, intentClassifierOptions(deps));
  const knowledge = deps.kb.lookup({ businessId: normalizedMessage.businessId, sanitizedText: gateway.sanitizedText, intent });
  const promotions = deps.promotionStore.lookup({
    businessId: normalizedMessage.businessId,
    sanitizedText: gateway.sanitizedText,
    intent,
    now: deps.nowFn()
  });
  const businessConfig = getConfig(normalizedMessage.businessId);
  const backendQuery = inferBackendQuery({ normalizedMessage, intent, now: deps.nowFn(), backend: deps.backend });
  const backendFacts = deps.backend.getMinimalFacts({
    businessId: normalizedMessage.businessId,
    intent,
    query: backendQuery
  });
  const requiredClarification = requiredClarificationForBackendIntent({
    normalizedMessage,
    intent,
    query: backendQuery,
    language: knowledge.language || intent.language
  }) || inferAvailabilityResponse({
    normalizedMessage,
    intent,
    query: backendQuery,
    backendFacts,
    backend: deps.backend,
    language: knowledge.language || intent.language
  });
  const decision = evaluate({ gateway, intent, knowledge, businessConfig, requiredClarification });
  const modelRoute = routeModel({ decision, intent, gateway });
  const draft = await generateDraft({ decision, knowledge, intent, gateway, promotions, backendFacts, modelRoute }, { llmAdapter: deps.llmAdapter, paraphraser: deps.paraphraser, modelRoute });
  const safety = checkDraft({ draft, decision, knowledge, intent, gateway });

  const bookingDraft = inferBookingDraft({ intent, query: backendQuery, normalizedMessage, backend: deps.backend });

  let staffItem = null;
  if (!safety.safeToSend || !["auto_send", "clarify"].includes(draft.action)) {
    staffItem = deps.inbox.submit({ decision, draft, safety, normalizedMessage, customerText: gateway.sanitizedText, backendFacts, promotions, bookingDraft });
  }

  const outbound = buildOutboundMessage({ normalizedMessage, draft, safety, staffItem });
  const finalStatus = outbound.status === "ready_to_send" ? "ready_to_send" : "staff_review";

  return result({
    normalizedMessage,
    gateway,
    intent,
    knowledge,
    promotions,
    decision,
    backendFacts,
    modelRoute,
    draft,
    safety,
    staffItem,
    outbound,
    finalStatus,
    errors: []
  });
}

function intentClassifierOptions(deps = {}) {
  if (typeof deps.llmIntentAnalyzer !== "function") return {};
  const mode = deps.config?.llmIntentMode || process.env.LLM_INTENT_MODE || process.env.OPENAI_INTENT_MODE || "always";
  return {
    llmClassifier: deps.llmIntentAnalyzer,
    confidenceThreshold: mode === "always" ? 0.99 : undefined
  };
}

function inferBackendQuery({ normalizedMessage, intent, now, backend }) {
  const text = normalizedMessage.rawText || "";
  const query = {
    businessId: normalizedMessage.businessId,
    senderId: normalizedMessage.senderId
  };
  const date = inferRequestedDate(text, now || new Date());
  const openWindows = openWindowsForDate(backend, normalizedMessage.businessId, date);
  const timeDetails = inferRequestedTimeDetails(text, openWindows);
  const partySize = inferPartySize(text);
  if (date) query.date = date;
  if (partySize) query.partySize = partySize;
  if (timeDetails?.ambiguous) {
    query.ambiguousTime = true;
    query.ambiguousTimeText = timeDetails.text;
    query.ambiguousTimeHour = timeDetails.hour;
  } else if (timeDetails?.time) {
    query.time = timeDetails.time;
  }
  const resourceId = inferResourceId(text, backend, normalizedMessage.businessId);
  if (resourceId) query.resourceId = resourceId;
  if (/facial|面部|護理|首次|第一次|體驗|trial/i.test(text)) query.service = "facial";
  if (/assessment|評估/i.test(text)) query.service = "assessment";
  if (/p3|小三|english|英文/i.test(text)) query.service = "p3_english";
  if (/laser|脫毛|underarm|腋下/i.test(text)) query.service = "laser";
  const memberIdMatch = text.match(/(?:會員(?:號碼|編號)?|member(?:\s*id)?|membership)\D*(\d{8})|\b(0{7}[1-9]|0{6}10)\b/i);
  if (memberIdMatch) query.memberId = memberIdMatch[1] || memberIdMatch[2];
  const orderMatch = text.match(/\b(?:IG)?\d{4,}\b/i);
  const paymentRefMatch = text.match(/\b(?:FPS|PAYME|PM|DEP)-[A-Z0-9-]+\b/i);
  if (orderMatch) query.orderId = orderMatch[0].toUpperCase().startsWith("IG") ? orderMatch[0].toUpperCase() : `IG${orderMatch[0]}`;
  if (paymentRefMatch) query.reference = paymentRefMatch[0].toUpperCase();
  const skuMatch = text.match(/\b[A-Z]{2,}-[A-Z0-9-]+\b/i);
  if (skuMatch) query.sku = skuMatch[0].toUpperCase();
  if (intent.primaryIntent === "service_info" && /tee|t-shirt/i.test(text)) query.sku = query.sku || "TEE-BLK-M";
  return query;
}

function asksForAvailableTimes(text) {
  if (!text) return false;
  const value = String(text);
  if (/有咩時間|咩時間|有咩時段|咩時段|有冇時間|有冇時段|有冇位|仲有冇位|有冇空/.test(value)) return true;
  if (/\bavailable\s+(times?|slots?|openings?)\b/i.test(value)) return true;
  if (/\bwhat\s+(times?|slots?|openings?)\b/i.test(value)) return true;
  if (/\b(is|are)\s+there\s+(a\s+)?(slot|time|opening)/i.test(value)) return true;
  // "Any P3 English slots on …", "facial slots", "openings", "any times for …"
  if (/\b(any|which|open|free|all)\b[^.?!]{0,40}\b(slots?|openings?|availability|times?)\b/i.test(value)) return true;
  if (/\b(slots?|openings?|availability)\b/i.test(value)) return true;
  return false;
}

function requiredClarificationForBackendIntent({ normalizedMessage, intent, query, language }) {
  if (!["booking", "reschedule"].includes(intent.primaryIntent)) return null;

  const businessId = normalizedMessage.businessId;
  const text = normalizedMessage.rawText || "";
  const missing = [];
  const needsService = businessId === "beauty_demo" || businessId === "edu_demo";
  const wantsSlots = asksForAvailableTimes(text);

  if (needsService && !query.service) missing.push("service");
  if (!query.date) missing.push("date");
  if ((query.ambiguousTime || !query.time) && !wantsSlots) missing.push("time");

  if (missing.length === 0) return null;

  return {
    reason: `booking missing ${missing.join(",")}`,
    text: bookingClarificationText({ businessId, language, missing, query })
  };
}

function inferAvailabilityResponse({ normalizedMessage, intent, query, backendFacts, backend, language }) {
  if (!["booking", "reschedule"].includes(intent.primaryIntent)) return null;
  if (!backendFacts?.found) return null;
  if (query.time) return null;  // Customer already picked a time; route to staff_review for confirmation.
  if (!asksForAvailableTimes(normalizedMessage.rawText || "")) return null;

  const facts = factsObject(backendFacts);
  const slots = Array.isArray(facts.availableSlots) ? facts.availableSlots : null;
  const sessions = Array.isArray(facts.availableSessions) ? facts.availableSessions : null;

  if (!slots || slots.length === 0) {
    // Asked for slots on a date with zero availability (fully booked or closed day).
    // Try to surface the next 1-3 dates that DO have openings instead of going silent.
    const suggestions = typeof backend?.findNextAvailableDates === "function"
      ? (backend.findNextAvailableDates({
          businessId: normalizedMessage.businessId,
          fromDate: query.date,
          service: query.service,
          partySize: query.partySize,
          maxDays: 7,
          maxResults: 3
        }) || [])
      : [];
    if (suggestions.length === 0) return null;  // Nothing useful to offer; let staff_review handle it.
    return {
      reason: "availability_check_no_slots_with_suggestions",
      text: noSlotsResponseText({ language, query, suggestions })
    };
  }

  return {
    reason: "availability_check_with_slots",
    text: availabilityResponseText({ language, facts, slots, sessions, query })
  };
}

function noSlotsResponseText({ language, query, suggestions }) {
  const english = language === "en";
  const date = query.date;
  const service = query.service;
  const partySize = query.partySize;

  if (english) {
    const headParts = [date, formatServiceEn(service), partySize ? `for ${partySize}` : null].filter(Boolean);
    const head = headParts.join(" ") || "that date";
    const altList = suggestions.map((s) => `${s.date} (from ${s.firstSlot.time})`).join(", ");
    const plural = suggestions.length > 1 ? "s" : "";
    return `Sorry, ${head} is fully booked or outside opening hours. The next available date${plural}: ${altList}. Which one works for you?`;
  }

  const headParts = [date, formatServiceZh(service), partySize ? `${partySize}位` : null].filter(Boolean);
  const head = headParts.join(" ") || "你查詢嘅日期";
  const altList = suggestions.map((s) => `${s.date}（最早 ${s.firstSlot.time}）`).join("、");
  return `唔好意思，${head} 暫時冇位或者已過營業時間。最近有時段嘅日期：${altList}。請問你想揀邊一日？`;
}

function availabilityResponseText({ language, facts, slots, sessions, query }) {
  const english = language === "en";
  const date = facts.date || query.date;
  const service = facts.service || query.service;
  const partySize = facts.partySize || query.partySize;
  const slotDisplay = formatSlotsForDisplay(slots, sessions);

  if (english) {
    const headParts = [date, formatServiceEn(service), partySize ? `for ${partySize}` : null].filter(Boolean);
    const head = headParts.join(" ") || "your requested date";
    return `For ${head}, currently available slots: ${slotDisplay.join(", ")}. Which time would you like? Staff will confirm before we hold the slot for you.`;
  }

  const headParts = [date, formatServiceZh(service), partySize ? `${partySize}位` : null].filter(Boolean);
  const head = headParts.join(" ") || "你查詢嘅日期";
  return `我幫你睇咗，${head} 暫時見到以下時段：${slotDisplay.join("、")}。請問你想揀邊個時間？我哋會由真人同事再次確認後正式幫你留位。`;
}

function formatSlotsForDisplay(slots, sessions) {
  if (!Array.isArray(sessions) || sessions.length !== slots.length) return slots;
  return sessions.map((session, index) => {
    if (session && session.endTime) return `${session.time}–${session.endTime}`;
    return slots[index];
  });
}

function formatServiceZh(service) {
  if (!service) return null;
  const map = { facial: "facial", laser: "脫毛", assessment: "皮膚評估", p3_english: "P3 英文評估" };
  return map[service] || service;
}

function formatServiceEn(service) {
  if (!service) return null;
  const map = { facial: "facial", laser: "laser hair removal", assessment: "skin assessment", p3_english: "P3 English assessment" };
  return map[service] || service;
}

// Snapshot of the booking the customer is asking for, captured at staff_review time
// so an approve action can write it to the calendar without re-parsing the chat.
// Returns null when intent isn't a booking-shaped one or when essentials are missing
// (e.g. ambiguous time, no date). Staff can edit on the admin page before approving.
function inferBookingDraft({ intent, query, normalizedMessage, backend }) {
  if (!intent || !["booking", "reschedule"].includes(intent.primaryIntent)) return null;
  if (!query?.date || !query?.time) return null;
  if (query.ambiguousTime) return null;

  const businessId = normalizedMessage.businessId;
  const draft = {
    businessId,
    date: query.date,
    time: query.time,
    customer: normalizedMessage.senderDisplayName || normalizedMessage.senderId || null,
    senderId: normalizedMessage.senderId || null,
    channel: normalizedMessage.channel || null,
    notes: null
  };

  if (businessId === "restaurant_demo") {
    if (!query.partySize) return null;
    draft.partySize = Number(query.partySize);
  } else if (businessId === "beauty_demo" || businessId === "edu_demo") {
    if (!query.service) return null;
    draft.service = query.service;
  } else if (hasActiveResources(backend, businessId)) {
    // Resource-pinned business (e.g., snooker hall): the resource IS the booking unit;
    // no service/partySize needed. If the customer didn't pin a specific resource,
    // staff can pick on approve from the admin UI.
  } else {
    return null;
  }

  if (query.resourceId) draft.resourceId = query.resourceId;

  return draft;
}

// Detect a resource mention in the customer's text by matching active resource
// names. Longest name wins so "12號枱" beats "1號枱". Numeric-prefix names require
// a non-digit boundary on the left so "1號" doesn't fire inside "11號".
function inferResourceId(text, backend, businessId) {
  if (typeof backend?.listResources !== "function") return null;
  const resources = backend.listResources(businessId, { includeInactive: false }) || [];
  if (resources.length === 0) return null;
  const sorted = [...resources]
    .filter((r) => r && typeof r.name === "string" && r.name)
    .sort((a, b) => b.name.length - a.name.length);
  const lowerText = String(text || "").toLowerCase();
  for (const resource of sorted) {
    const name = resource.name;
    const lowerName = name.toLowerCase();
    const idx = lowerText.indexOf(lowerName);
    if (idx === -1) continue;
    if (/^\d/.test(name)) {
      const prev = idx === 0 ? "" : lowerText[idx - 1];
      if (/\d/.test(prev)) continue;
    }
    return resource.id;
  }
  return null;
}

function hasActiveResources(backend, businessId) {
  if (typeof backend?.listResources !== "function") return false;
  const resources = backend.listResources(businessId, { includeInactive: false }) || [];
  return resources.length > 0;
}

function factsObject(backendFacts = {}) {
  return Object.fromEntries((backendFacts.facts || []).map((fact) => [fact.key, fact.value]));
}

function bookingClarificationText({ businessId, language, missing, query }) {
  const english = language === "en";
  const hasAmbiguousTime = Boolean(query?.ambiguousTime);
  const needsService = missing.includes("service");
  const needsDate = missing.includes("date");
  const needsTime = missing.includes("time") && !hasAmbiguousTime;
  const ambiguousTimeText = query?.ambiguousTimeText || (english ? "that time" : "呢個時間");

  if (english) {
    const parts = [
      needsService && "treatment",
      needsDate && "date",
      needsTime && "time"
    ].filter(Boolean);
    if (hasAmbiguousTime) {
      const details = parts.length > 0 ? ` Please also share the ${joinEnglishList(parts)}.` : "";
      return `Just to confirm, does ${ambiguousTimeText} mean morning, afternoon, or evening?${details}`;
    }
    return `Sure. Please share the ${joinEnglishList(parts)} you would like to book.`;
  }
  const parts = [
    needsService && "療程",
    needsDate && "日期",
    needsTime && "時間"
  ].filter(Boolean);
  if (hasAmbiguousTime) {
    const details = parts.length > 0 ? `另外請問你想預約邊個${parts.join("、")}？` : "";
    return `可以呀，請問你講嘅${ambiguousTimeText}係上午、下午定晚上？${details}`;
  }
  return `可以呀，請問你想預約邊個${parts.join("、")}？`;
}

function joinEnglishList(parts) {
  if (parts.length <= 1) return parts[0] || "details";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

function inferRequestedDate(text, now) {
  if (/今晚|今日|today|tonight/i.test(text)) return hkDateKey(now);

  if (/聽日|明日|明天|tomorrow/i.test(text)) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() + 1);
    return hkDateKey(date);
  }

  if (/後日|後天|day after tomorrow/i.test(text)) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() + 2);
    return hkDateKey(date);
  }

  const isoDate = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoDate) return isoDate[1];

  // Chinese M月D號 / M月D日 / M月D号 / M月D
  const cnMonthDay = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日號号]?/);
  if (cnMonthDay) {
    return normalizeMonthDay(Number(cnMonthDay[1]), Number(cnMonthDay[2]), now);
  }

  // Slash form M/D (avoid matching the M/D inside "5/25 18:30" times — but HH:MM has colon, not slash, so safe)
  const slash = text.match(/(?:^|[^\d/])(\d{1,2})\/(\d{1,2})(?!\d)/);
  if (slash) {
    return normalizeMonthDay(Number(slash[1]), Number(slash[2]), now);
  }

  return null;
}

function normalizeMonthDay(month, day, now) {
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (!Number.isInteger(day) || day < 1 || day > 31) return null;
  const today = hkDateKey(now);
  const year = Number(today.slice(0, 4));
  let candidate = isoFromYmd(year, month, day);
  if (candidate < today) candidate = isoFromYmd(year + 1, month, day);
  return candidate;
}

function isoFromYmd(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function inferRequestedTime(text) {
  const details = inferRequestedTimeDetails(text);
  return details && !details.ambiguous ? details.time : null;
}

function inferRequestedTimeDetails(text, openWindows) {
  // HH:MM (explicit colon)
  const colonTime = text.match(/(?:^|[^\d])(\d{1,2}):(\d{2})\b/);
  if (colonTime) {
    const hour = normalizeHour(Number(colonTime[1]), text);
    return {
      time: `${String(hour).padStart(2, "0")}:${colonTime[2]}`,
      ambiguous: false,
      text: colonTime[0].trim()
    };
  }

  // HH[:MM] am/pm
  const ampmTime = text.match(/(?:^|[^\d])(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (ampmTime) {
    let hour = Number(ampmTime[1]);
    const minute = ampmTime[2] || "00";
    const isPm = /pm/i.test(ampmTime[3]);
    if (isPm && hour < 12) hour += 12;
    else if (!isPm && hour === 12) hour = 0;
    return {
      time: `${String(hour).padStart(2, "0")}:${minute}`,
      ambiguous: false,
      text: ampmTime[0].trim()
    };
  }

  // HH 點/時 (digit form, optional 半)
  const dotMarker = text.match(/(?:^|[^\d])(\d{1,2})\s*(?:點|時)(?:\s*(半))?/);
  if (dotMarker) {
    const rawHour = Number(dotMarker[1]);
    const minute = dotMarker[2] ? "30" : "00";
    return resolveBareHourDetails({ rawHour, minute, text, openWindows, matchText: dotMarker[0].trim() });
  }

  // Chinese-number 點/時 (optional 半)
  const chineseNumber = "一兩二三四五六七八九十";
  const chineseTime = text.match(new RegExp(`([${chineseNumber}])\\s*(?:點|時)(?:\\s*(半))?`));
  if (chineseTime) {
    const rawHour = chineseNumberValue(chineseTime[1]);
    const minute = chineseTime[2] ? "30" : "00";
    return resolveBareHourDetails({ rawHour, minute, text, openWindows, matchText: chineseTime[0].trim() });
  }

  return null;
}

function resolveBareHourDetails({ rawHour, minute, text, openWindows, matchText }) {
  // Explicit period (上午/下午/晚上/am/pm/etc) or out-of-ambiguous-range hours resolve directly.
  if (!isAmbiguousBareHour(rawHour, text)) {
    const hour = normalizeHour(rawHour, text);
    return {
      time: `${String(hour).padStart(2, "0")}:${minute}`,
      ambiguous: false,
      text: matchText
    };
  }
  // Opening hours can disambiguate: if exactly one of (AM, PM) falls inside an open
  // window on the requested date, treat the bare hour as that one. If both fit (e.g.,
  // 8 at a place open 8am-10pm) or neither fits, stay ambiguous and ask.
  const resolvedHour = disambiguateBareHourFromOpeningHours(rawHour, Number(minute), openWindows);
  if (resolvedHour != null) {
    return {
      time: `${String(resolvedHour).padStart(2, "0")}:${minute}`,
      ambiguous: false,
      text: matchText
    };
  }
  return {
    time: null,
    ambiguous: true,
    hour: rawHour,
    text: matchText
  };
}

function disambiguateBareHourFromOpeningHours(rawHour, minute, openWindows) {
  if (!Array.isArray(openWindows) || openWindows.length === 0) return null;
  const amMin = rawHour * 60 + (minute || 0);
  const pmMin = (rawHour + 12) * 60 + (minute || 0);
  const amFits = anyOpenWindowContains(openWindows, amMin);
  const pmFits = anyOpenWindowContains(openWindows, pmMin);
  if (amFits && !pmFits) return rawHour;
  if (pmFits && !amFits) return rawHour + 12;
  return null;
}

function anyOpenWindowContains(openWindows, minuteOfDay) {
  for (const w of openWindows) {
    const open = hhmmToMinutes(w?.open);
    const close = hhmmToMinutes(w?.close);
    if (open == null || close == null) continue;
    if (minuteOfDay >= open && minuteOfDay < close) return true;
  }
  return false;
}

function hhmmToMinutes(value) {
  if (typeof value !== "string") return null;
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function openWindowsForDate(backend, businessId, date) {
  if (!backend || typeof backend.getOpeningHours !== "function") return null;
  if (!businessId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const hours = backend.getOpeningHours(businessId);
  if (!hours) return null;
  const dow = new Date(`${date}T00:00:00`).getDay();
  const windows = hours[String(dow)];
  return Array.isArray(windows) ? windows : null;
}

function isAmbiguousBareHour(hour, text) {
  if (hour < 1 || hour > 11) return false;
  return !hasExplicitTimePeriod(text);
}

function hasExplicitTimePeriod(text) {
  return /凌晨|清晨|朝早|早上|上午|中午|下午|今晚|夜晚|晚上|\bam\b|\bpm\b/i.test(text);
}

function normalizeHour(hour, text) {
  if (hour < 1 || hour > 23) return hour;
  if (hour <= 11 && /今晚|夜晚|晚上|下午|pm/i.test(text)) return hour + 12;
  return hour;
}

function chineseNumberValue(value) {
  const chineseNumbers = {
    一: 1,
    兩: 2,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10
  };
  return chineseNumbers[value] || null;
}

function inferPartySize(text) {
  const digitMatch = text.match(/(\d{1,2})\s*(?:位|人|pax|people|persons|guests?)/i);
  if (digitMatch) return Number(digitMatch[1]);

  const chineseMatch = text.match(/([一兩二三四五六七八九十])\s*(?:位|人)/);
  return chineseMatch ? chineseNumberValue(chineseMatch[1]) : null;
}

function result(payload) {
  return {
    finalStatus: payload.finalStatus,
    normalizedMessage: payload.normalizedMessage || null,
    gateway: payload.gateway || null,
    intent: payload.intent || null,
    knowledge: payload.knowledge || null,
    promotions: payload.promotions || null,
    decision: payload.decision || null,
    backendFacts: payload.backendFacts || null,
    modelRoute: payload.modelRoute || null,
    draft: payload.draft || null,
    safety: payload.safety || null,
    staffItem: payload.staffItem || null,
    outbound: payload.outbound || null,
    errors: payload.errors || []
  };
}

module.exports = {
  createPipeline,
  runMessage,
  _internal: { inferBackendQuery, inferPartySize, inferRequestedDate, inferRequestedTime, inferRequestedTimeDetails, requiredClarificationForBackendIntent, inferAvailabilityResponse, intentClassifierOptions, inferResourceId, inferBookingDraft, hasActiveResources }
};
