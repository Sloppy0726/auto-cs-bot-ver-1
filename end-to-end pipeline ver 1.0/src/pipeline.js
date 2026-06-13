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
const { createPackageStore } = require("../../package ops ver 1.0/src/packageOps");
const packageSeed = require("../../package ops ver 1.0/seed/packageSeed");
const { createOwnerConsole } = require("../../owner console ver 1.0/src/ownerConsole");
const { createActionJournal } = require("../../action journal ver 1.0/src/actionJournal");
const { resolveCulturalDate } = require("../../hk calendar ver 1.0/src/hkCalendar");
const { scoreAnger } = require("../../canto sentiment ver 1.0/src/cantoSentiment");
const { createWeatherStore, inferWeatherResponse } = require("../../weather policy ver 1.0/src/weatherPolicy");
const { evaluateDepositPolicy, depositInstructionText, claimAcknowledgementText, normalizeCode } = require("../../deposit ledger ver 1.0/src/depositLedger");

function createPipeline(config = {}) {
  const kb = config.knowledgeBase || createKnowledgeBase({ entries: config.seed || seed });
  const backend = config.backend || createBusinessBackend();
  const inbox = config.staffInbox || createStaffInbox();
  const promotionStore = config.promotionStore || createPromotionStore({ entries: config.promotionEntries || promoSeed });
  const packageStore = config.packageStore || createPackageStore({ entries: config.packageEntries || packageSeed });
  const llmAdapter = config.llmAdapter;
  const llmIntentAnalyzer = config.llmIntentAnalyzer;
  const paraphraser = config.paraphraser;
  const nowFn = config.nowFn || (() => new Date());
  // Owner command console: no-op unless OWNER_PHONES (or config.ownerConsole) is set.
  const ownerConsole = config.ownerConsole === false
    ? null
    : (config.ownerConsole || createOwnerConsole({ env: config.env || process.env }));
  // Tamper-evident action journal: opt-in, like ownerConsole. Off unless a journal
  // instance is passed or ACTION_JOURNAL_PATH is set, so existing behaviour is
  // byte-for-byte unchanged when unconfigured.
  const journal = resolveJournal(config, nowFn);
  // HKO weather policy store. Defaults to signal "none" (a no-op), so the pipeline is
  // unchanged until a signal is set via the store, the owner console, or a poller.
  const weatherStore = config.weatherStore === false ? null : (config.weatherStore || createWeatherStore({ nowFn }));
  // FPS/PayMe deposit ledger. Opt-in: off unless a ledger instance is passed AND the
  // business config carries a depositPolicy, so existing behaviour is unchanged.
  const depositLedger = config.depositLedger || null;

  return {
    async runMessage(input) {
      return runMessage(input, { kb, backend, inbox, promotionStore, packageStore, ownerConsole, journal, weatherStore, depositLedger, llmAdapter, llmIntentAnalyzer, paraphraser, nowFn, config });
    },
    inbox,
    backend,
    kb,
    promotionStore,
    packageStore,
    journal,
    weatherStore,
    depositLedger
  };
}

function resolveJournal(config = {}, nowFn) {
  if (config.actionJournal === false) return null;
  if (config.actionJournal) return config.actionJournal;
  const filePath = (config.env || process.env).ACTION_JOURNAL_PATH;
  if (!filePath) return null;
  return createActionJournal({ filePath, nowFn });
}

// Append the turn to the journal (if enabled) and return it. Journaling never
// changes the returned result; a journal write failure must not break a reply.
function journaled(deps, payload) {
  const finalResult = result(payload);
  if (deps.journal) {
    try {
      // The journal copy carries requiredClarification (an evaluate() input) so the
      // decision can be replayed; the returned result keeps its existing shape.
      deps.journal.append({ result: { ...finalResult, requiredClarification: payload.requiredClarification || null } });
    } catch (_err) {
      // Best-effort recorder: a disk error must not deny a customer their reply.
    }
  }
  return finalResult;
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
    return journaled(deps, { normalizedMessage, staffItem, finalStatus: "staff_review", errors: normalizedMessage.errors });
  }

  // Owner fast-path: if the sender is a registered owner and their message maps
  // to a toolkit command, answer directly and skip the customer-support flow.
  if (deps.ownerConsole) {
    const ownerOutcome = await deps.ownerConsole.handle({
      senderId: normalizedMessage.senderId,
      text: normalizedMessage.rawText
    });
    if (ownerOutcome && ownerOutcome.handled) {
      const draft = { action: "auto_send", text: ownerOutcome.text };
      const outbound = buildOutboundMessage({ normalizedMessage, draft, safety: { safeToSend: true } });
      return journaled(deps, {
        normalizedMessage,
        draft,
        outbound,
        finalStatus: outbound.status === "ready_to_send" ? "ready_to_send" : "staff_review",
        errors: []
      });
    }
  }

  const gateway = routeMessage(normalizedMessage.rawText);
  const intent = await classifyIntent(gateway, intentClassifierOptions(deps));

  // Deposit reconciliation fast-path: a customer's "過咗數 DEP-7K3Q" (or a lone
  // payment-proof message) flips the held deposit to `claimed` and routes a one-tap
  // verify task to staff. The bot acknowledges receipt only — it never confirms money.
  const depositClaim = tryDepositClaim(deps, normalizedMessage, gateway, intent);
  if (depositClaim) {
    return journaled(deps, depositClaim);
  }
  const knowledge = deps.kb.lookup({ businessId: normalizedMessage.businessId, sanitizedText: gateway.sanitizedText, intent });
  const packageFacts = deps.packageStore && shouldLookupPackageFacts(gateway.sanitizedText, intent)
    ? deps.packageStore.lookup({
      businessId: normalizedMessage.businessId,
      senderId: normalizedMessage.senderId,
      sanitizedText: gateway.sanitizedText,
      intent,
      now: deps.nowFn()
    })
    : null;
  const promotions = deps.promotionStore.lookup({
    businessId: normalizedMessage.businessId,
    sanitizedText: gateway.sanitizedText,
    intent,
    now: deps.nowFn()
  });
  // Cantonese anger / review-threat ladder. Runs on sanitized text (never raw PII).
  const sentiment = scoreAnger(gateway.sanitizedText, normalizedMessage.history || []);
  // Never dangle a promotion at an annoyed or furious customer.
  const promotionsForDraft = sentiment.suppressPromo ? null : promotions;
  const businessConfig = getConfig(normalizedMessage.businessId);
  const backendQuery = inferBackendQuery({ normalizedMessage, intent, now: deps.nowFn(), backend: deps.backend });
  const backendFacts = deps.backend.getMinimalFacts({
    businessId: normalizedMessage.businessId,
    intent,
    query: backendQuery
  });
  // Weather mode (打風自動制): a live HKO signal pre-empts hours/booking replies with a
  // deterministic closure or caution banner. Inactive by default (signal "none").
  const weather = deps.weatherStore
    ? deps.weatherStore.lookup({ businessConfig, language: knowledge.language || intent.language })
    : { active: false };
  const requiredClarification = inferWeatherResponse({
    weather,
    intent,
    normalizedMessage,
    backend: deps.backend,
    businessConfig,
    language: knowledge.language || intent.language
  }) || requiredClarificationForBackendIntent({
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
  }) || inferDepositRequest({
    deps,
    intent,
    query: backendQuery,
    normalizedMessage,
    businessConfig,
    weather,
    language: knowledge.language || intent.language
  });
  const decision = evaluate({ gateway, intent, knowledge, packageFacts, businessConfig, requiredClarification, sentiment });
  const modelRoute = routeModel({ decision, intent, gateway });
  const draft = await generateDraft({ decision, knowledge, packageFacts, intent, gateway, promotions: promotionsForDraft, backendFacts, modelRoute }, { llmAdapter: deps.llmAdapter, paraphraser: deps.paraphraser, modelRoute });
  const safety = checkDraft({ draft, decision, knowledge, packageFacts, intent, gateway });

  const bookingDraft = inferBookingDraft({ intent, query: backendQuery, normalizedMessage, backend: deps.backend });

  let staffItem = null;
  if (!safety.safeToSend || !["auto_send", "clarify"].includes(draft.action)) {
    staffItem = deps.inbox.submit({ decision, draft, safety, normalizedMessage, customerText: gateway.sanitizedText, backendFacts, promotions, packageFacts, bookingDraft });
  }

  const outbound = buildOutboundMessage({ normalizedMessage, draft, safety, staffItem });
  const finalStatus = outbound.status === "ready_to_send" ? "ready_to_send" : "staff_review";

  return journaled(deps, {
    normalizedMessage,
    gateway,
    intent,
    knowledge,
    packageFacts,
    promotions,
    decision,
    backendFacts,
    modelRoute,
    draft,
    safety,
    staffItem,
    outbound,
    finalStatus,
    requiredClarification,
    errors: []
  });
}

function shouldLookupPackageFacts(text, intent = {}) {
  return intent.primaryIntent === "package_status" || /package|套票|剩幾多次|仲有幾多次|到期|expiry|remaining sessions?/i.test(String(text || ""));
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

  const businessId = normalizedMessage.businessId;
  const resourceNamesById = shouldNameResources(businessId, query)
    ? buildResourceNameMap(backend, businessId)
    : null;

  return {
    reason: "availability_check_with_slots",
    text: availabilityResponseText({ language, facts, slots, sessions, query, resourceNamesById })
  };
}

// Per-business policy: do we name which staff/table is free next to each slot
// in the customer-facing reply? Yes for businesses with named, customer-relevant
// resources (stylists, instructors). No for snooker — 12 near-identical tables
// where "any table" is the default expectation and naming would be noisy.
// Also no whenever the customer pinned a resource — they already picked.
function shouldNameResources(businessId, query) {
  if (query && query.resourceId) return false;
  return businessId === "beauty_demo" || businessId === "edu_demo";
}

function buildResourceNameMap(backend, businessId) {
  if (typeof backend?.listResources !== "function") return null;
  const list = backend.listResources(businessId, { includeInactive: false }) || [];
  if (list.length === 0) return null;
  const map = {};
  for (const r of list) {
    if (r && r.id && typeof r.name === "string") map[r.id] = r.name;
  }
  return map;
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

function availabilityResponseText({ language, facts, slots, sessions, query, resourceNamesById }) {
  const english = language === "en";
  const date = facts.date || query.date;
  const service = facts.service || query.service;
  const partySize = facts.partySize || query.partySize;
  const slotDisplay = formatSlotsForDisplay(slots, sessions, { resourceNamesById, english });

  if (english) {
    const headParts = [date, formatServiceEn(service), partySize ? `for ${partySize}` : null].filter(Boolean);
    const head = headParts.join(" ") || "your requested date";
    return `For ${head}, currently available slots: ${slotDisplay.join(", ")}. Which time would you like? Staff will confirm before we hold the slot for you.`;
  }

  const headParts = [date, formatServiceZh(service), partySize ? `${partySize}位` : null].filter(Boolean);
  const head = headParts.join(" ") || "你查詢嘅日期";
  return `我幫你睇咗，${head} 暫時見到以下時段：${slotDisplay.join("、")}。請問你想揀邊個時間？我哋會由真人同事再次確認後正式幫你留位。`;
}

function formatSlotsForDisplay(slots, sessions, opts = {}) {
  if (!Array.isArray(sessions) || sessions.length !== slots.length) return slots;
  const { resourceNamesById, english } = opts;
  const totalActive = resourceNamesById ? Object.keys(resourceNamesById).length : 0;
  return sessions.map((session, index) => {
    const base = session && session.endTime ? `${session.time}–${session.endTime}` : slots[index];
    if (!resourceNamesById || !session || !Array.isArray(session.availableResources)) return base;
    // When every active resource is free at this slot, omit the name list — "(...)" reads
    // as a constraint, so adding it when no constraint exists is just noise. Only annotate
    // slots where the free set is a proper subset.
    if (session.availableResources.length >= totalActive) return base;
    const names = session.availableResources
      .map((id) => resourceNamesById[id])
      .filter((n) => typeof n === "string" && n.length > 0);
    if (names.length === 0) return base;
    return english ? `${base} (${names.join(", ")})` : `${base}（${names.join("、")}）`;
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

// Deposit reconciliation: turn a customer "過咗數 DEP-7K3Q" (or a lone payment-proof
// message when they have exactly one pending deposit) into a claimed deposit + a
// staff verify task. Returns a journaled-result payload, or null to continue normally.
// The bot acknowledges receipt only; money is confirmed solely by a human verify.
function tryDepositClaim(deps, normalizedMessage, gateway, intent) {
  if (!deps.depositLedger) return null;
  const businessId = normalizedMessage.businessId;
  const senderId = normalizedMessage.senderId;
  const rawText = normalizedMessage.rawText || "";
  const code = normalizeCode(rawText);
  const proofHint = /過咗?數|過左數|入咗?數|入左數|轉咗?數|轉左數|過數|轉帳|轉賬|已付|付咗款|paid|payme|fps|截圖|收據|receipt/i.test(rawText);
  if (!code && !proofHint) return null;

  let claim = null;
  if (code) {
    claim = deps.depositLedger.claimByReference({ businessId, senderId, reference: code });
  }
  if ((!claim || !claim.ok) && proofHint) {
    claim = deps.depositLedger.claimBySenderProof({ businessId, senderId });
  }
  if (!claim || !claim.ok) return null;

  const record = claim.record;
  const language = intent.language || "zh-HK";
  const draft = { action: "clarify", text: claimAcknowledgementText(record, { language }) };
  const safety = checkDraft({
    draft,
    decision: { action: "clarify", forbiddenCapabilities: ["confirm_payment_received", "decide_refund"] },
    knowledge: {}, intent, gateway
  });

  const d = record.bookingDraft || {};
  const detail = [d.date, d.time, d.partySize ? `${d.partySize}位` : null, d.service].filter(Boolean).join(" ");
  const staffItem = deps.inbox.submit({
    decision: { action: "staff_review", businessId, escalationLabel: "deposit_claim", reasons: [`deposit ${record.code} claimed; verify bank receipt then confirm`] },
    draft: { action: "staff_review", text: `客聲稱已過數 ${record.code}（${detail || "預約"}）。請核對銀行/PayMe 入賬後，一鍵確認收訂（depositLedger.verify("${record.id}")）。` },
    safety: { verdict: "pass", safeToSend: false, reasons: ["deposit awaiting human verification"] },
    normalizedMessage,
    customerText: gateway.sanitizedText
  });

  const outbound = buildOutboundMessage({ normalizedMessage, draft, safety, staffItem });
  return {
    normalizedMessage,
    gateway,
    intent,
    draft,
    safety,
    staffItem,
    outbound,
    finalStatus: outbound.status === "ready_to_send" ? "ready_to_send" : "staff_review",
    errors: []
  };
}

// When a booking is complete and the business's deposit policy applies, hold the slot
// in the deposit ledger and reply with FPS/PayMe instructions + the DEP code, instead
// of sending the booking straight to staff. Idempotent on retries. Returns a
// requiredClarification-shaped {reason, text}, or null to continue normally.
function inferDepositRequest({ deps, intent, query, normalizedMessage, businessConfig, weather, language }) {
  if (!deps || !deps.depositLedger) return null;
  if (!["booking", "reschedule"].includes(intent?.primaryIntent)) return null;
  if (weather && weather.active && weather.closed) return null; // closure already handled; no deposit during a typhoon
  if (!businessConfig || !businessConfig.depositPolicy) return null;

  const bookingDraft = inferBookingDraft({ intent, query, normalizedMessage, backend: deps.backend });
  if (!bookingDraft) return null;

  const now = deps.nowFn ? deps.nowFn() : new Date();
  const policy = evaluateDepositPolicy(bookingDraft, businessConfig, now);
  if (!policy.required) return null;

  // Idempotency: reuse an existing pending deposit for the same slot rather than
  // issuing a new code every time the customer repeats the request.
  const existing = deps.depositLedger
    .listActive({ businessId: normalizedMessage.businessId, senderId: normalizedMessage.senderId })
    .find((r) => r.bookingDraft && r.bookingDraft.date === bookingDraft.date && r.bookingDraft.time === bookingDraft.time);
  const record = existing || deps.depositLedger.request({
    businessId: normalizedMessage.businessId,
    senderId: normalizedMessage.senderId,
    bookingDraft,
    amount: policy.amount,
    currency: policy.currency,
    ttlMinutes: policy.ttlMinutes,
    now
  });

  return {
    reason: `deposit_required_${policy.amount}`,
    text: depositInstructionText(record, { rails: policy.rails, language })
  };
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
  // HK cultural date words (年初二, 平安夜, 中秋翌日…) resolve first and deterministically.
  // Ambiguous spans (過年) or years beyond the verified table return no dateKey, so we
  // fall through to "ask for the date" rather than guessing.
  const cultural = resolveCulturalDate(text, now || new Date());
  if (cultural && cultural.dateKey) return cultural.dateKey;

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
    packageFacts: payload.packageFacts || null,
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
