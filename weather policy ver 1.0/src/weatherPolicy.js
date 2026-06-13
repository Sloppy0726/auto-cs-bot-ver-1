"use strict";

// Weather Policy ver 1.0  (打風自動制)
// HK Observatory tropical-cyclone / rainstorm signals deterministically flip the
// pipeline into "weather mode": closure banners on hours/booking replies and an
// auto-waive-deposit flag. A pure state machine — works even with shouldCallLLM=false.
//
// Sweep finding: not Bistrochat, inline, Fresha, SleekFlow nor Omnichat offers any
// HKO-signal-triggered workflow, despite HK getting multiple T8s a year. Signals are
// structured codes, never untrusted text, so nothing here touches an LLM.
//
// Default-safe: an unset store reports signal "none" and lookup() returns inactive,
// so the pipeline behaves byte-for-byte as today until a signal is set (by the owner
// console, a poller, or a test). No network calls unless fetchHkoSignal() is invoked.

const https = require("node:https");

const LEVELS = Object.freeze({
  NONE: "none",
  TC1: "tc1",
  TC3: "tc3",
  TC8: "tc8",
  TC9: "tc9",
  TC10: "tc10",
  RAIN_AMBER: "rain_amber",
  RAIN_RED: "rain_red",
  RAIN_BLACK: "rain_black"
});

// Levels under which a typical HK SME suspends operations (Labour Dept "extreme
// conditions" convention). Per-business overrides are possible via businessConfig.
const CLOSURE_LEVELS = Object.freeze(new Set([LEVELS.TC8, LEVELS.TC9, LEVELS.TC10, LEVELS.RAIN_BLACK]));

const SIGNAL_NAMES = Object.freeze({
  [LEVELS.TC1]: { zh: "一號戒備信號", en: "Standby Signal No. 1" },
  [LEVELS.TC3]: { zh: "三號強風信號", en: "Strong Wind Signal No. 3" },
  [LEVELS.TC8]: { zh: "八號烈風或暴風信號", en: "Gale or Storm Signal No. 8" },
  [LEVELS.TC9]: { zh: "九號烈風或暴風增強信號", en: "Increasing Gale or Storm Signal No. 9" },
  [LEVELS.TC10]: { zh: "十號颶風信號", en: "Hurricane Signal No. 10" },
  [LEVELS.RAIN_AMBER]: { zh: "黃色暴雨警告", en: "Amber Rainstorm Warning" },
  [LEVELS.RAIN_RED]: { zh: "紅色暴雨警告", en: "Red Rainstorm Warning" },
  [LEVELS.RAIN_BLACK]: { zh: "黑色暴雨警告", en: "Black Rainstorm Warning" }
});

const DEFAULT_REOPEN_RULE = {
  zh: "風球或警告除下後，本店會盡快（一般兩小時內）恢復營業，並以本店公布為準。",
  en: "We will reopen as soon as possible (usually within 2 hours) after the signal is lowered; our own announcement prevails."
};

function createWeatherStore(config = {}) {
  let state = normalizeState(config.signal ? config : { signal: LEVELS.NONE });
  const nowFn = config.nowFn || (() => new Date());

  return {
    setSignal(input) {
      state = normalizeState(typeof input === "string" ? { signal: input } : input, { nowFn });
      return this.snapshot();
    },
    clear() {
      state = normalizeState({ signal: LEVELS.NONE }, { nowFn });
      return this.snapshot();
    },
    getSignal() {
      return state.signal;
    },
    snapshot() {
      return { ...state };
    },
    lookup(input = {}) {
      return lookupWeather(state, input);
    }
  };
}

function normalizeState(raw = {}, deps = {}) {
  const nowFn = deps.nowFn || (() => new Date());
  const signal = normalizeLevel(raw.signal);
  return {
    signal,
    source: raw.source || "manual",
    since: raw.since || nowFn().toISOString()
  };
}

function normalizeLevel(value) {
  const v = String(value || "").toLowerCase().trim();
  if (!v || v === "none") return LEVELS.NONE;
  if (Object.values(LEVELS).includes(v)) return v;
  // tolerate human/owner aliases
  if (/(^|[^0-9])10|十號|颶風/.test(v)) return LEVELS.TC10;
  if (/(^|[^0-9])9|九號/.test(v)) return LEVELS.TC9;
  if (/(^|[^0-9])8|八號|t8/.test(v)) return LEVELS.TC8;
  if (/(^|[^0-9])3|三號|t3/.test(v)) return LEVELS.TC3;
  if (/(^|[^0-9])1|一號|t1/.test(v)) return LEVELS.TC1;
  if (/black|黑色|黑雨/.test(v)) return LEVELS.RAIN_BLACK;
  if (/red|紅色|紅雨/.test(v)) return LEVELS.RAIN_RED;
  if (/amber|黃色|黃雨/.test(v)) return LEVELS.RAIN_AMBER;
  return LEVELS.NONE;
}

// Map an HKO warnsum open-data payload to a single normalized level (highest impact
// wins). Tolerant: scans every entry's `code` string so a shape change won't throw.
function normalizeWarnsum(payload) {
  let codes = [];
  try {
    const obj = typeof payload === "string" ? JSON.parse(payload) : (payload || {});
    for (const key of Object.keys(obj)) {
      const entry = obj[key];
      if (entry && typeof entry.code === "string") codes.push(entry.code.toUpperCase());
    }
  } catch (_e) {
    return LEVELS.NONE;
  }
  const has = (re) => codes.some((c) => re.test(c));
  if (has(/TC10/)) return LEVELS.TC10;
  if (has(/TC9/)) return LEVELS.TC9;
  if (has(/TC8/)) return LEVELS.TC8;
  if (has(/WRAINB/)) return LEVELS.RAIN_BLACK;
  if (has(/TC3/)) return LEVELS.TC3;
  if (has(/WRAINR/)) return LEVELS.RAIN_RED;
  if (has(/WRAINA/)) return LEVELS.RAIN_AMBER;
  if (has(/TC1/)) return LEVELS.TC1;
  return LEVELS.NONE;
}

function policyForLevel(level, businessConfig = {}) {
  const overrides = (businessConfig.weatherPolicy && businessConfig.weatherPolicy[level]) || null;
  const closed = overrides?.closed ?? CLOSURE_LEVELS.has(level);
  return {
    level,
    closed,
    depositWaiver: overrides?.depositWaiver ?? closed,
    reopenRule: overrides?.reopenRule || DEFAULT_REOPEN_RULE
  };
}

function lookupWeather(state, input = {}) {
  const level = state.signal || LEVELS.NONE;
  if (level === LEVELS.NONE) {
    return { active: false, signal: LEVELS.NONE, closed: false, depositWaiver: false, banner: null, grounding: [], reasons: ["no active weather signal"] };
  }
  const policy = policyForLevel(level, input.businessConfig || {});
  const name = SIGNAL_NAMES[level] || { zh: level, en: level };
  const grounding = [`weather:${level}`];
  return {
    active: true,
    signal: level,
    signalName: name,
    closed: policy.closed,
    depositWaiver: policy.depositWaiver,
    reopenRule: policy.reopenRule,
    since: state.since,
    source: state.source,
    banner: buildBanner({ name, policy, language: input.language }),
    grounding,
    reasons: [`weather signal ${level} active`, policy.closed ? "closure policy applies" : "caution only"]
  };
}

function buildBanner({ name, policy, language }) {
  const en = language === "en";
  if (policy.closed) {
    return en
      ? `⚠️ ${name.en} is in force. For staff safety we are temporarily closed today. Existing bookings and deposits are automatically held — nothing will be forfeited. ${policy.reopenRule.en}`
      : `⚠️ ${name.zh}生效，為咗同事安全，本店今日暫停營業。你已有嘅預約同訂金會自動保留，唔會扣數或當失約。${policy.reopenRule.zh}`;
  }
  return en
    ? `Note: ${name.en} is in force. We are still open but please stay safe; opening hours may change at short notice.`
    : `提提你：${name.zh}生效，本店暫時照常營業，但請注意安全，營業時間有機會臨時調整。`;
}

// Optional HKO open-data fetch. NOT called by the pipeline — wire it into a poller/cron
// if you want live signals. httpsClient is injectable for tests (no real network).
function fetchHkoSignal(options = {}) {
  const url = options.url || "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en";
  const client = options.httpsClient || https;
  return new Promise((resolve, reject) => {
    const req = client.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        resolve({ level: normalizeWarnsum(body), raw: body, fetchedAt: new Date().toISOString() });
      });
    });
    req.on("error", reject);
    if (req.setTimeout) req.setTimeout(options.timeoutMs || 8000, () => req.destroy(new Error("hko_fetch_timeout")));
  });
}

// Deterministic weather response for the requiredClarification chain. Returns a
// closure/caution reply for hours / booking / reschedule intents while a signal is
// active, or null otherwise (so normal flow is untouched). For bookings during a
// closure it appends the next open dates from the backend, when available.
function inferWeatherResponse({ weather, intent, normalizedMessage, backend, businessConfig, language }) {
  if (!weather || !weather.active) return null;
  const handled = ["hours_location", "booking", "reschedule"];
  if (!handled.includes(intent?.primaryIntent)) return null;

  // Caution-only signals don't pre-empt a normal booking reply — let it proceed.
  if (!weather.closed) {
    if (intent.primaryIntent !== "hours_location") return null;
    return { reason: `weather_caution_${weather.signal}`, text: weather.banner };
  }

  const en = language === "en";
  let text = weather.banner;
  if (intent.primaryIntent !== "hours_location" && typeof backend?.findNextAvailableDates === "function") {
    const suggestions = backend.findNextAvailableDates({
      businessId: normalizedMessage?.businessId,
      fromDate: null,
      maxDays: 7,
      maxResults: 3
    }) || [];
    if (suggestions.length > 0) {
      const list = suggestions.map((s) => en ? `${s.date} (from ${s.firstSlot.time})` : `${s.date}（最早 ${s.firstSlot.time}）`).join(en ? ", " : "、");
      text += en
        ? ` When the signal is lowered, the next available dates are: ${list}. Which day would you like to move to?`
        : ` 風球除下後，最近有位嘅日期：${list}。請問你想改去邊一日？`;
    } else {
      text += en ? " Which day would you like to rebook once we reopen?" : " 等我哋復業後，請問你想改去邊一日？";
    }
  }
  return { reason: `weather_closure_${weather.signal}`, text };
}

module.exports = {
  LEVELS,
  CLOSURE_LEVELS,
  SIGNAL_NAMES,
  createWeatherStore,
  lookupWeather,
  normalizeWarnsum,
  normalizeLevel,
  policyForLevel,
  fetchHkoSignal,
  inferWeatherResponse,
  _internal: { buildBanner, normalizeState }
};
