"use strict";

const { LEVELS } = require("../src/weatherPolicy");

// normalizeLevel alias cases
const levelAliases = [
  ["tc8", LEVELS.TC8],
  ["T8", LEVELS.TC8],
  ["八號", LEVELS.TC8],
  ["8", LEVELS.TC8],
  ["十號", LEVELS.TC10],
  ["黑雨", LEVELS.RAIN_BLACK],
  ["black", LEVELS.RAIN_BLACK],
  ["紅雨", LEVELS.RAIN_RED],
  ["黃色", LEVELS.RAIN_AMBER],
  ["", LEVELS.NONE],
  ["none", LEVELS.NONE],
  ["garbage", LEVELS.NONE]
];

// HKO warnsum payloads -> normalized level (highest impact wins)
const warnsumCases = [
  { name: "T8 NE", payload: { WTCSGNL: { code: "TC8NE", type: "TC" } }, expect: LEVELS.TC8 },
  { name: "black rain", payload: { WRAIN: { code: "WRAINB" } }, expect: LEVELS.RAIN_BLACK },
  { name: "T10 beats amber", payload: { WTCSGNL: { code: "TC10" }, WRAIN: { code: "WRAINA" } }, expect: LEVELS.TC10 },
  { name: "amber only", payload: { WRAIN: { code: "WRAINA" } }, expect: LEVELS.RAIN_AMBER },
  { name: "empty payload", payload: {}, expect: LEVELS.NONE },
  { name: "garbage string", payload: "not json", expect: LEVELS.NONE },
  { name: "string JSON T3", payload: JSON.stringify({ WTCSGNL: { code: "TC3" } }), expect: LEVELS.TC3 }
];

module.exports = { levelAliases, warnsumCases };
