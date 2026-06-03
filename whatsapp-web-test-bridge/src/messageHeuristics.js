"use strict";

function isCustomerAcknowledgement(text) {
  if (/^[\s!.。！?？🙏👍,，]+$/.test(String(text || ""))) return true;
  const value = String(text || "")
    .trim()
    .replace(/[!.。！?？🙏👍,，]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (!value) return false;

  const compact = value.replace(/\s+/g, "");
  if (/^(好|好的|好呀|可以|得|得呀|收到|明白|唔該|謝謝|多謝)+$/.test(compact)) return true;

  const tokens = value.split(" ");
  const ackTokens = new Set(["ok", "okay", "k", "yes", "yep", "thanks", "thank", "you", "thx", "received", "noted"]);
  const zhAckTokens = new Set(["好", "好的", "好呀", "可以", "得", "得呀", "收到", "明白", "唔該", "謝謝", "多謝"]);
  return tokens.length <= 4 && tokens.every((token) => ackTokens.has(token) || zhAckTokens.has(token));
}

function looksLikeBridgeAuthored(text) {
  const value = String(text || "");
  return /跟進編號：staff_\d+|交俾同事跟進|交俾真人同事|以上只係一般參考|以下係目前測試資料|後台草稿：|我幫你睇咗/.test(value);
}

module.exports = {
  isCustomerAcknowledgement,
  looksLikeBridgeAuthored
};
