"use strict";

const VALID_INTENTS = new Set([
  "pricing",
  "booking",
  "reschedule",
  "hours_location",
  "service_info",
  "aftercare",
  "membership",
  "payment",
  "order_status",
  "complaint",
  "sensitive_health",
  "child_data",
  "human_request",
  "general"
]);

const DEFAULT_CONFIDENCE_THRESHOLD = 0.68;

const intentRules = [
  {
    intent: "pricing",
    confidence: 0.9,
    reason: "Matched pricing keyword",
    pattern: /幾錢|幾多錢|價錢|價目|收費|費用|方案|price|pricing|how much|cost|\bfees?\b|rate|rates|\bcharges?\b|plans?|trial|promotion|discount|offer|優惠|package|套票/i
  },
  {
    intent: "reschedule",
    confidence: 0.91,
    reason: "Matched reschedule keyword",
    pattern: /改期|改時間|改booking|reschedule|change.*booking|change.*appointment|move.*appointment|can.?t come|cannot come|臨時嚟唔到/i
  },
  {
    intent: "booking",
    confidence: 0.9,
    reason: "Matched booking keyword",
    pattern: /book|booking|預約|有冇位|有無位|有咩時間|咩時間|有咩時段|咩時段|hold|appointment|walk in|walk-in|availability|available|slot|reserve|schedule/i
  },
  {
    intent: "hours_location",
    confidence: 0.88,
    reason: "Matched hours or location keyword",
    pattern: /地址|邊度|位置|分店|旺角|銅鑼灣|尖沙咀|幾點開|幾點收|營業|開門|收工|邊間公司|邊間店|店名|公司名|間舖|間鋪|舖名|鋪名|叫咩|brand|business name|shop name|store name|hours|location|address|branch|open|close|closing|opening|directions|nearest mtr|where are you|地鐵|港鐵|出口|mtr/i
  },
  {
    intent: "aftercare",
    confidence: 0.86,
    reason: "Matched aftercare keyword",
    pattern: /做完|aftercare|護理|gym|exercise|workout|運動|桑拿|熱水浴|hot bath|曬太陽|sun exposure|exfoliation|sauna|post-treatment|after treatment/i
  },
  {
    intent: "membership",
    confidence: 0.88,
    reason: "Matched membership keyword",
    pattern: /會員|membership|member\s*id|會員號碼|會員編號|積分|\bpoints?\b|free treatment|免費療程|換療程|redeem/i
  },
  {
    intent: "payment",
    confidence: 0.84,
    reason: "Matched payment keyword",
    pattern: /PayMe|FPS|轉數快|付款|入數|未收到款|信用卡|credit card|visa|mastercard|cash|bank transfer|deposit|overcharged|charged twice|pay|payment|octopus|八達通/i
  },
  {
    intent: "order_status",
    confidence: 0.84,
    reason: "Matched order or status keyword",
    pattern: /訂單|單號|order|status|送貨|物流|出貨|幾時到|delivery|tracking|shipment|shipped|courier|parcel|sf express/i
  },
  {
    intent: "complaint",
    confidence: 0.94,
    reason: "Matched complaint keyword",
    pattern: /投訴|退款|退錢|唔滿意|嬲|屌|廢|垃圾|咁廢|bad bot|useless bot|chargeback|refund|complaint|angry|not happy|bad service|no reply|didn.?t reply|overcharged|payment not found|paid but you said|paid but.*not found/i
  },
  {
    intent: "sensitive_health",
    confidence: 0.95,
    reason: "Matched health-sensitive keyword",
    pattern: /濕疹|敏感|皮膚病|懷孕|傷口|紅腫|痛|藥|醫生|診斷|病歷|eczema|allergy|pregnant|pregnancy|wound|rash|swelling|side effects?|medical|medicine|medication|prescription|doctor|diagnosis|breastfeeding/i
  },
  {
    intent: "child_data",
    confidence: 0.95,
    reason: "Matched child-data keyword",
    pattern: /小朋友全名|學校|幼稚園|學生證|出生日期|child full name|child.?s full name|kid.?s full name|school name|kindergarten|student id|student number|birth date|date of birth/i
  },
  {
    intent: "human_request",
    confidence: 0.89,
    reason: "Matched human-staff request keyword",
    pattern: /真人|同事|職員|staff|human|agent|real person|customer service|representative|有人覆|搵人/i
  },
  {
    intent: "service_info",
    confidence: 0.76,
    reason: "Matched service information keyword",
    pattern: /療程|服務|做咩|包括|需時|效果|推介|推薦|建議|介紹|有冇list|有無list|list|menu|recommend|recommendation|underarm|腋下|laser|facial|HIFU|脫毛|nail|spa|service|treatment/i
  }
];

function classifyIntent(gatewayOutput, options = {}) {
  const normalizedInput = normalizeGatewayOutput(gatewayOutput);

  if (normalizedInput.route === "block_and_handoff" || normalizedInput.shouldCallLLM === false) {
    return normalizeIntent({
      primaryIntent: inferBlockedIntent(normalizedInput),
      confidence: 0.99,
      riskLevel: "blocked",
      needsHumanReview: true,
      language: detectLanguage(normalizedInput.sanitizedText),
      customerGoal: "Message is blocked by the privacy gateway and should be handled by staff.",
      entities: extractEntities(normalizedInput.sanitizedText),
      source: "privacy_gateway",
      reasons: [normalizedInput.reason || "Privacy gateway blocked this message"]
    });
  }

  const deterministicResult = classifyDeterministically(normalizedInput);
  const threshold = options.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;

  if (
    deterministicResult.confidence >= threshold ||
    normalizedInput.route !== "send_to_llm" ||
    typeof options.llmClassifier !== "function"
  ) {
    return deterministicResult;
  }

  return Promise.resolve(options.llmClassifier(buildLLMIntentInput(normalizedInput, deterministicResult)))
    .then((llmResult) => normalizeIntent({
      ...deterministicResult,
      ...llmResult,
      source: "llm",
      reasons: [
        ...deterministicResult.reasons,
        ...(Array.isArray(llmResult?.reasons) ? llmResult.reasons : ["LLM classifier used for ambiguous message"])
      ]
    }));
}

function classifyDeterministically(gatewayOutput) {
  const text = gatewayOutput.sanitizedText;
  const matches = intentRules.filter((rule) => {
    rule.pattern.lastIndex = 0;
    return rule.pattern.test(text);
  });

  const sorted = matches.sort((a, b) => b.confidence - a.confidence);
  const primary = sorted[0];
  const secondaryIntents = sorted
    .slice(1)
    .map((rule) => rule.intent)
    .filter((intent, index, list) => list.indexOf(intent) === index);

  const riskFromGateway = inferRiskLevel(gatewayOutput);
  const needsHumanReview = gatewayOutput.requiresHumanReview
    || riskFromGateway === "high"
    || riskFromGateway === "blocked"
    || sorted.some((rule) => ["complaint", "sensitive_health", "child_data", "human_request"].includes(rule.intent));

  if (!primary) {
    return normalizeIntent({
      primaryIntent: "general",
      secondaryIntents: [],
      confidence: 0.42,
      riskLevel: riskFromGateway,
      needsHumanReview,
      language: detectLanguage(text),
      customerGoal: summarizeGoal("general", text),
      entities: extractEntities(text),
      source: "deterministic",
      reasons: ["No deterministic intent rule matched"]
    });
  }

  return normalizeIntent({
    primaryIntent: primary.intent,
    secondaryIntents,
    confidence: calculateConfidence(sorted, riskFromGateway),
    riskLevel: riskFromGateway,
    needsHumanReview,
    language: detectLanguage(text),
    customerGoal: summarizeGoal(primary.intent, text),
    entities: extractEntities(text),
    source: "deterministic",
    reasons: sorted.map((rule) => rule.reason)
  });
}

function normalizeGatewayOutput(gatewayOutput) {
  const output = gatewayOutput || {};
  return {
    route: output.route || "send_to_llm",
    reason: output.reason || "",
    sanitizedText: String(output.sanitizedText || output.text || ""),
    shouldCallLLM: output.shouldCallLLM,
    requiresHumanReview: Boolean(output.requiresHumanReview),
    filter: {
      findings: Array.isArray(output.filter?.findings) ? output.filter.findings : [],
      hints: Array.isArray(output.filter?.hints) ? output.filter.hints : [],
      highestRisk: output.filter?.highestRisk || "none"
    }
  };
}

function normalizeIntent(result) {
  const primaryIntent = VALID_INTENTS.has(result.primaryIntent) ? result.primaryIntent : "general";
  const secondaryIntents = Array.isArray(result.secondaryIntents)
    ? result.secondaryIntents.filter((intent) => VALID_INTENTS.has(intent) && intent !== primaryIntent)
    : [];

  return {
    primaryIntent,
    secondaryIntents: [...new Set(secondaryIntents)],
    confidence: clamp(Number(result.confidence) || 0.1),
    riskLevel: normalizeRiskLevel(result.riskLevel),
    needsHumanReview: Boolean(result.needsHumanReview),
    language: result.language || "unknown",
    customerGoal: result.customerGoal || summarizeGoal(primaryIntent, ""),
    entities: result.entities && typeof result.entities === "object" ? result.entities : {},
    source: result.source || "deterministic",
    reasons: Array.isArray(result.reasons) ? result.reasons : []
  };
}

function inferRiskLevel(gatewayOutput) {
  if (gatewayOutput.route === "block_and_handoff") return "blocked";
  const highestRisk = gatewayOutput.filter.highestRisk || "none";
  if (["blocked", "high", "medium", "low"].includes(highestRisk)) return highestRisk;
  return gatewayOutput.requiresHumanReview ? "high" : "low";
}

function inferBlockedIntent(gatewayOutput) {
  const findingTypes = gatewayOutput.filter.findings.map((finding) => finding.type);
  const hintTypes = gatewayOutput.filter.hints.map((hint) => hint.type);
  if (findingTypes.includes("credit_card")) return "payment";
  if (hintTypes.includes("payment_dispute")) return "complaint";
  if (hintTypes.includes("medical_detail")) return "sensitive_health";
  if (hintTypes.includes("child_data")) return "child_data";
  return "general";
}

function calculateConfidence(matches, riskLevel) {
  const base = matches[0]?.confidence || 0.42;
  const multiIntentBonus = Math.min(0.04, Math.max(0, matches.length - 1) * 0.02);
  const riskPenalty = riskLevel === "high" ? 0.05 : riskLevel === "blocked" ? 0.12 : 0;
  return clamp(base + multiIntentBonus - riskPenalty);
}

function normalizeRiskLevel(value) {
  return ["none", "low", "medium", "high", "blocked"].includes(value) ? value : "low";
}

function detectLanguage(text) {
  if (/[\u4e00-\u9fff]/.test(text) && /[A-Za-z]/.test(text)) return "mixed";
  if (/[\u4e00-\u9fff]/.test(text)) return "zh-HK";
  if (/[A-Za-z]/.test(text)) return "en";
  return "unknown";
}

function extractEntities(text) {
  return {
    service: extractFirst(text, [
      ["underarm", /underarm|腋下/i],
      ["laser hair removal", /laser|脫毛/i],
      ["facial", /facial|面部護理/i],
      ["HIFU", /HIFU/i],
      ["nail", /nail|美甲/i],
      ["spa", /spa|按摩/i]
    ]),
    requestedTime: extractFirst(text, [
      ["tonight", /今晚/i],
      ["tomorrow", /聽日|明日|明天|tomorrow/i],
      ["today", /今日|today/i],
      ["evening", /夜晚|晚上|evening/i]
    ]),
    placeholders: Array.from(text.matchAll(/\[[A-Z_]+_\d+\]|\[[A-Z_]+\]/g)).map((match) => match[0])
  };
}

function extractFirst(text, candidates) {
  const match = candidates.find(([, pattern]) => pattern.test(text));
  return match ? match[0] : null;
}

function summarizeGoal(intent, text) {
  const summaries = {
    pricing: "Customer asks about price, package, or offer information.",
    booking: "Customer wants to make or check an appointment.",
    reschedule: "Customer wants to change an existing appointment.",
    hours_location: "Customer asks about opening hours, branch, or location.",
    service_info: "Customer asks for service or treatment information.",
    aftercare: "Customer asks about aftercare guidance.",
    membership: "Customer asks about membership, points, or reward eligibility.",
    payment: "Customer asks about payment methods or payment handling.",
    order_status: "Customer asks about order, delivery, or status.",
    complaint: "Customer has a complaint, refund request, or dispute.",
    sensitive_health: "Customer asks a health-sensitive question.",
    child_data: "Customer mentions child-related personal data.",
    human_request: "Customer asks for human staff.",
    general: "Customer message needs further classification."
  };
  return summaries[intent] || (text ? "Customer sent a general inquiry." : "No customer message provided.");
}

function buildLLMIntentInput(gatewayOutput, deterministicResult) {
  return {
    sanitizedText: gatewayOutput.sanitizedText,
    privacyRoute: gatewayOutput.route,
    privacyFindings: gatewayOutput.filter.findings.map((finding) => finding.type),
    riskHints: gatewayOutput.filter.hints.map((hint) => hint.type),
    deterministicGuess: deterministicResult
  };
}

function clamp(value) {
  return Math.max(0.1, Math.min(0.99, value));
}

module.exports = {
  classifyIntent,
  classifyDeterministically,
  buildLLMIntentInput,
  VALID_INTENTS: Array.from(VALID_INTENTS)
};
