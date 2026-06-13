"use strict";

const assert = require("node:assert/strict");
const {
  LEVELS,
  createWeatherStore,
  normalizeLevel,
  normalizeWarnsum,
  policyForLevel,
  inferWeatherResponse,
  fetchHkoSignal
} = require("../src/weatherPolicy");
const { levelAliases, warnsumCases } = require("./weatherPolicy.cases");

let passed = 0;
const fixedNow = () => new Date("2026-06-13T02:00:00.000Z");

for (const [input, expected] of levelAliases) {
  assert.equal(normalizeLevel(input), expected, `normalizeLevel(${JSON.stringify(input)})`);
  passed += 1;
}

for (const c of warnsumCases) {
  assert.equal(normalizeWarnsum(c.payload), c.expect, `normalizeWarnsum ${c.name}`);
  passed += 1;
}

// store lifecycle
const store = createWeatherStore({ nowFn: fixedNow });
assert.equal(store.getSignal(), LEVELS.NONE, "store defaults to none");
assert.equal(store.lookup({}).active, false, "none -> inactive lookup");
passed += 1;

store.setSignal("tc8");
const t8 = store.lookup({ language: "zh-HK" });
assert.equal(t8.active, true);
assert.equal(t8.closed, true, "T8 closes");
assert.equal(t8.depositWaiver, true, "T8 waives deposits");
assert.ok(t8.banner.includes("八號") && t8.banner.includes("暫停營業"), "banner names the signal and closure");
assert.deepEqual(t8.grounding, ["weather:tc8"]);
passed += 1;

store.setSignal("rain_black");
const black = store.lookup({});
assert.equal(black.closed, true, "black rain closes");
assert.equal(black.depositWaiver, true);
passed += 1;

store.setSignal("tc3");
const t3 = store.lookup({ language: "zh-HK" });
assert.equal(t3.active, true);
assert.equal(t3.closed, false, "T3 is caution, not closure");
assert.equal(t3.depositWaiver, false);
assert.ok(t3.banner.includes("照常營業"), "T3 banner says still open");
passed += 1;

store.clear();
assert.equal(store.lookup({}).active, false, "clear() returns to no-op");
passed += 1;

// per-business policy override: a 24h convenience store stays open in T8
const overrideConfig = { weatherPolicy: { [LEVELS.TC8]: { closed: false, depositWaiver: false } } };
const overridden = policyForLevel(LEVELS.TC8, overrideConfig);
assert.equal(overridden.closed, false, "business override keeps T8 open");
assert.equal(overridden.depositWaiver, false);
passed += 1;

// inferWeatherResponse behaviour
const backend = {
  findNextAvailableDates() {
    return [{ date: "2026-09-25", firstSlot: { time: "12:00" } }, { date: "2026-09-26", firstSlot: { time: "13:00" } }];
  }
};
const activeStore = createWeatherStore({ nowFn: fixedNow });
activeStore.setSignal("tc8");
const w = activeStore.lookup({ language: "zh-HK" });

assert.equal(inferWeatherResponse({ weather: { active: false }, intent: { primaryIntent: "booking" } }), null, "inactive weather -> null");
assert.equal(inferWeatherResponse({ weather: w, intent: { primaryIntent: "pricing" } }), null, "unrelated intent -> null");

const hoursResp = inferWeatherResponse({ weather: w, intent: { primaryIntent: "hours_location" }, language: "zh-HK" });
assert.ok(hoursResp && hoursResp.text.includes("暫停營業"), "hours during T8 -> closure banner");

const bookingResp = inferWeatherResponse({ weather: w, intent: { primaryIntent: "booking" }, normalizedMessage: { businessId: "restaurant_demo" }, backend, language: "zh-HK" });
assert.ok(bookingResp.text.includes("暫停營業"), "booking during T8 -> closure");
assert.ok(bookingResp.text.includes("2026-09-25") && bookingResp.text.includes("改去邊一日"), "booking closure offers next dates and asks to rebook");
passed += 1;

// caution-level: booking proceeds (null), hours gets the caution banner
const cautionStore = createWeatherStore({ nowFn: fixedNow });
cautionStore.setSignal("tc3");
const cautionW = cautionStore.lookup({ language: "zh-HK" });
assert.equal(inferWeatherResponse({ weather: cautionW, intent: { primaryIntent: "booking" }, normalizedMessage: {}, backend }), null, "T3 booking not pre-empted");
const cautionHours = inferWeatherResponse({ weather: cautionW, intent: { primaryIntent: "hours_location" }, language: "zh-HK" });
assert.ok(cautionHours.text.includes("照常營業"), "T3 hours -> caution banner");
passed += 1;

// English banner
const enResp = inferWeatherResponse({ weather: activeStore.lookup({ language: "en" }), intent: { primaryIntent: "hours_location" }, language: "en" });
assert.ok(/Signal No\. 8/.test(enResp.text) && /closed/i.test(enResp.text), "english closure banner");
passed += 1;

// fetchHkoSignal with an injected fake https client (no real network)
const fakeClient = {
  get(url, cb) {
    const res = {
      on(event, handler) {
        if (event === "data") handler(JSON.stringify({ WTCSGNL: { code: "TC8SW" } }));
        if (event === "end") handler();
        return res;
      }
    };
    cb(res);
    return { on() {}, setTimeout() {} };
  }
};
fetchHkoSignal({ httpsClient: fakeClient }).then((out) => {
  assert.equal(out.level, LEVELS.TC8, "fetchHkoSignal parses warnsum into a level");
  passed += 1;
  console.log(`weatherPolicy: ${passed} tests passed`);
}).catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
