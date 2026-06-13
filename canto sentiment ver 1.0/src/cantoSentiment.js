"use strict";

// Canto Sentiment ver 1.0
// A deterministic Cantonese anger / review-threat ladder. No LLM.
//
// Two things no competitor ships: (1) a Cantonese-native profanity & anger lexicon
// (粗口/連登式用語, romanised + leet variants), and (2) detection of the distinctly
// Hong Kong move of threatening a review pile-on ("上OpenRice俾你一星", "出po去Threads",
// "投訴去消委會"). Sentiment APIs are English-keyword or enterprise-only; the review-
// threat pattern is unreachable via any API, so early in-chat detection is the only
// possible defence.
//
// Output feeds the business-rules gate (severity>=2 or a threat forces handoff) and
// suppresses promotions — never dangle a discount at a furious customer.

// Tier 3: severe profanity / direct insult. Escalate.
const TIER3 = [
  "仆街", "撲街", "仆你個", "屌", "𨳒", "𨳊", "冚家", "冚家鏟", "on9", "on九", "戇鳩", "戇九",
  "戇居", "黐線", "痴線", "癡線", "黐筋", "收皮", "死開", "pk仔", "廢柴", "垃圾公司", "黑店", "死蠢"
];

// Tier 2: clear anger / dispute / accusation. Escalate.
const TIER2 = [
  "好嬲", "嬲爆", "激嬲", "好激氣", "玩嘢", "玩野", "呃錢", "呃人", "呃緊", "揾笨", "搵笨", "搞錯",
  "亂收費", "亂咁收", "唔合理", "態度差", "態度好差", "服務態度", "好差勁", "差勁", "好失望",
  "好過分", "太過分", "無王管", "騙", "詐", "唔誠實", "投訴你"
];

// Tier 1: mild dissatisfaction / impatience. Suppress promo, do not force handoff.
const TIER1 = [
  "好慢", "等咗好耐", "等咗成", "等咗半", "仲未覆", "仲未回", "幾時先", "幾時得", "唔掂", "唔得掂",
  "唔滿意", "失望", "唔開心", "點解仲", "催"
];

// Where a customer threatens to post — including escalation-to-authority targets.
const THREAT_TARGETS = [
  "openrice", "open rice", "開飯喇", "google", "谷歌", "小紅書", "xhs", "threads", "連登", "lihkg",
  "討論區", "facebook", "fb", "ig", "instagram", "youtube", "tiktok", "新聞", "記者", "傳媒",
  "消委會", "消費者委員會", "海關", "投訴熱線", "1823"
];

// The action of going public / leaving a bad review.
const THREAT_ACTIONS = [
  "1星", "一星", "1分", "負評", "劣評", "差評", "比個差", "畀個差", "寫評論", "出po", "出帖", "出pos",
  "放上網", "爆上網", "爆你", "公開", "曝光", "po上", "share上", "分享出去", "擺上網", "擺上",
  "叫人唔好幫襯", "叫人唔好嚟", "叫大家唔好", "投訴去", "投訴到", "搵記者", "報導", "踢爆"
];

function scoreAnger(sanitizedText, history = []) {
  const text = String(sanitizedText || "").toLowerCase();

  const tier3Hits = TIER3.filter((w) => text.includes(w.toLowerCase()));
  const tier2Hits = TIER2.filter((w) => text.includes(w.toLowerCase()));
  const tier1Hits = TIER1.filter((w) => text.includes(w.toLowerCase()));

  let severity = 0;
  if (tier3Hits.length) severity = 3;
  else if (tier2Hits.length) severity = 2;
  else if (tier1Hits.length) severity = 1;

  const hasTarget = THREAT_TARGETS.some((w) => text.includes(w.toLowerCase()));
  const hasAction = THREAT_ACTIONS.some((w) => text.includes(w.toLowerCase()));
  const reputationThreat = hasTarget && hasAction;

  const velocity = scoreVelocity(text, history);
  // A repeated unanswered question or a burst of messages is itself an anger signal.
  if (velocity.repeated || velocity.burst) severity = Math.max(severity, 2);

  const escalate = severity >= 2 || reputationThreat;
  const suppressPromo = severity >= 1 || reputationThreat;
  const label = reputationThreat ? "reputation_risk" : (severity >= 2 ? "angry_customer" : null);

  return {
    severity,
    escalate,
    suppressPromo,
    reputationThreat,
    label,
    tier3Hits,
    tier2Hits,
    tier1Hits,
    velocity,
    hits: [...tier3Hits, ...tier2Hits, ...tier1Hits]
  };
}

// Velocity signals from prior turns. history items may be plain strings or objects
// like { text, direction }. Outgoing/staff/bot messages are ignored.
function scoreVelocity(currentText, history) {
  const inbound = (Array.isArray(history) ? history : [])
    .map(normalizeHistoryItem)
    .filter((m) => m && m.direction !== "outgoing");

  const recent = inbound.slice(-5);
  const normalizedCurrent = normalizeForCompare(currentText);
  const repeated = normalizedCurrent.length > 0
    && recent.some((m) => normalizeForCompare(m.text) === normalizedCurrent);
  const burst = recent.length >= 3;

  return { repeated, burst, recentInboundCount: recent.length };
}

function normalizeHistoryItem(item) {
  if (item == null) return null;
  if (typeof item === "string") return { text: item, direction: "incoming" };
  return { text: String(item.text || ""), direction: item.direction || "incoming" };
}

function normalizeForCompare(text) {
  return String(text || "").toLowerCase().replace(/[\s\p{P}]+/gu, "");
}

module.exports = {
  scoreAnger,
  _internal: { scoreVelocity, TIER1, TIER2, TIER3, THREAT_TARGETS, THREAT_ACTIONS }
};
