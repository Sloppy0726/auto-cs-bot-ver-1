"use strict";

// Each case: text (+ optional history) -> expected sentiment fields.
const cases = [
  {
    name: "neutral enquiry is calm",
    text: "請問你哋幾點開門？",
    expect: { severity: 0, escalate: false, suppressPromo: false, reputationThreat: false, label: null }
  },
  {
    name: "tier-1 impatience suppresses promo but does not escalate",
    text: "等咗好耐都仲未覆，好慢喎",
    expect: { severity: 1, escalate: false, suppressPromo: true, label: null }
  },
  {
    name: "tier-2 service complaint escalates",
    text: "你哋服務態度好差，好失望",
    expect: { severity: 2, escalate: true, suppressPromo: true, label: "angry_customer" }
  },
  {
    name: "tier-3 profanity escalates",
    text: "你哋仆街呀，搞成咁",
    expect: { severity: 3, escalate: true, suppressPromo: true, label: "angry_customer" }
  },
  {
    name: "romanised on9 is caught",
    text: "your service is on9",
    expect: { severity: 3, escalate: true, reputationThreat: false }
  },
  {
    name: "review threat: OpenRice one-star",
    text: "再唔處理我上OpenRice俾你一星",
    expect: { escalate: true, reputationThreat: true, label: "reputation_risk" }
  },
  {
    name: "review threat: post to Threads about being scammed",
    text: "我出po去Threads話你哋呃錢",
    expect: { escalate: true, reputationThreat: true, label: "reputation_risk" }
  },
  {
    name: "escalation to authority is a reputation threat",
    text: "我會投訴去消委會同搵記者報導",
    expect: { escalate: true, reputationThreat: true, label: "reputation_risk" }
  },
  {
    name: "target without action is not a threat",
    text: "我平時都係睇OpenRice揀餐廳",
    expect: { reputationThreat: false, escalate: false }
  },
  {
    name: "velocity: repeated unanswered question escalates",
    text: "幾時得呀",
    history: ["幾時得呀", "幾時得呀"],
    expect: { severity: 2, escalate: true }
  },
  {
    name: "velocity: burst of messages escalates",
    text: "喂",
    history: ["你好", "請問", "仲喺度嗎"],
    expect: { escalate: true }
  },
  {
    name: "outgoing history is ignored for velocity",
    text: "唔該",
    history: [
      { text: "唔該", direction: "outgoing" },
      { text: "唔該", direction: "outgoing" }
    ],
    expect: { escalate: false, severity: 0 }
  }
];

module.exports = { cases };
