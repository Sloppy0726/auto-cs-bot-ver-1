"use strict";

const assert = require("node:assert/strict");
const { isCustomerAcknowledgement, looksLikeBridgeAuthored } = require("../src/messageHeuristics");

for (const text of [
  "Ok",
  "Ok thanks",
  "okay thank you",
  "thanks!",
  "收到 thanks",
  "好呀唔該",
  "👍",
  "🙏"
]) {
  assert.equal(isCustomerAcknowledgement(text), true, `${text} should be treated as an acknowledgement`);
}

for (const text of [
  "Ok, can I also change to facial?",
  "thanks, what time do you close?",
  "我想改聽日八點",
  "可以book laser嗎"
]) {
  assert.equal(isCustomerAcknowledgement(text), false, `${text} should remain substantive`);
}

assert.equal(looksLikeBridgeAuthored("跟進編號：staff_0001"), true);
assert.equal(looksLikeBridgeAuthored("已幫你confirm聽日6點"), false);

console.log("messageHeuristics: 14 tests passed");
