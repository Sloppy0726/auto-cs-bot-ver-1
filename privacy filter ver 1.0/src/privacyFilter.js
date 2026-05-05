"use strict";

const DEFAULT_OPTIONS = {
  preserveOrderRefs: true,
  preserveBookingRefs: false
};

const detectors = [
  {
    type: "credit_card",
    risk: "blocked",
    placeholder: "CREDIT_CARD",
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    validate: looksLikeCreditCard
  },
  {
    type: "hkid",
    risk: "high",
    placeholder: "HKID",
    pattern: /(?<![A-Z0-9])[A-Z]{1,2}\d{6}(?:\([0-9A]\)|[0-9A])(?![A-Z0-9])/gi
  },
  {
    type: "email",
    risk: "medium",
    placeholder: "EMAIL",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
  },
  {
    type: "hong_kong_phone",
    risk: "medium",
    placeholder: "PHONE",
    pattern: /(?:\+852[\s-]*)?[235689]\d{3}[\s-]?\d{4}/g,
    validate: isStandalonePhoneNumber
  },
  {
    type: "fps_reference",
    risk: "medium",
    placeholder: "PAYMENT_REF",
    pattern: /(?:\bFPS|轉數快|入數|付款|\bpayment|\bpayme)[\s:#：-]*[A-Z0-9-]{5,24}\b/gi
  },
  {
    type: "order_reference",
    risk: "medium",
    placeholder: "ORDER_REF",
    pattern: /(?:\border|訂單|單號|\bref|\breference|#)[\s:#：-]*[A-Z]{0,4}\d{4,12}\b/gi
  },
  {
    type: "booking_reference",
    risk: "medium",
    placeholder: "BOOKING_REF",
    pattern: /(?:\bbooking|預約|\bbook)[\s:#：-]*[A-Z]{0,4}\d{4,12}\b/gi
  }
];

const riskHints = [
  {
    type: "medical_detail",
    risk: "high",
    pattern: /濕疹|敏感|皮膚病|懷孕|傷口|紅腫|痛|藥|醫生|診斷|病歷|eczema|allergy|pregnant|wound|medical|medicine|diagnosis/i
  },
  {
    type: "child_data",
    risk: "high",
    pattern: /小朋友全名|學校|幼稚園|學生證|出生日期|child full name|school name|student id|date of birth/i
  },
  {
    type: "address_hint",
    risk: "medium",
    pattern: /地址|大廈|座|樓|室|街|道|邨|村|苑|building|tower|floor|room|street|road|estate/i
  },
  {
    type: "payment_dispute",
    risk: "high",
    pattern: /退款|退錢|未收到款|信用卡|chargeback|refund|payment dispute|not received payment/i
  }
];

function filterForLLM(input, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const originalText = String(input || "");
  const matches = collectMatches(originalText, settings);
  const findings = [];
  let sanitizedText = "";
  let cursor = 0;

  for (const match of matches) {
    if (match.start < cursor) continue;
    sanitizedText += originalText.slice(cursor, match.start);
    sanitizedText += `[${match.placeholder}_${findings.length + 1}]`;
    cursor = match.end;
    findings.push({
      id: `${match.placeholder}_${findings.length + 1}`,
      type: match.type,
      risk: match.risk,
      value: match.value,
      start: match.start,
      end: match.end
    });
  }

  sanitizedText += originalText.slice(cursor);

  const hints = riskHints
    .filter((hint) => hint.pattern.test(originalText))
    .map((hint) => ({ type: hint.type, risk: hint.risk }));

  const highestRisk = calculateHighestRisk([...findings, ...hints]);

  return {
    originalText,
    sanitizedText,
    findings,
    hints,
    highestRisk,
    shouldSendToLLM: highestRisk !== "blocked",
    needsHumanReview: highestRisk === "high" || highestRisk === "blocked"
  };
}

function collectMatches(text, settings) {
  const matches = [];

  for (const detector of detectors) {
    if (detector.type === "order_reference" && settings.preserveOrderRefs) continue;
    if (detector.type === "booking_reference" && settings.preserveBookingRefs) continue;

    detector.pattern.lastIndex = 0;
    let match;
    while ((match = detector.pattern.exec(text)) !== null) {
      const value = match[0];
      if (detector.validate && !detector.validate(value, text, match.index, match.index + value.length)) continue;
      matches.push({
        type: detector.type,
        risk: detector.risk,
        placeholder: detector.placeholder,
        value,
        start: match.index,
        end: match.index + value.length
      });
    }
  }

  return matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
  });
}

function calculateHighestRisk(items) {
  const order = ["none", "low", "medium", "high", "blocked"];
  return items.reduce((highest, item) => {
    return order.indexOf(item.risk) > order.indexOf(highest) ? item.risk : highest;
  }, "none");
}

function looksLikeCreditCard(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  return luhnCheck(digits);
}

function isStandalonePhoneNumber(value, text, start, end) {
  const charBefore = text[start - 1] || "";
  const charAfter = text[end] || "";
  return !/[A-Za-z]/.test(charBefore)
    && !/[A-Za-z]/.test(charAfter)
    && !hasNearbyDigit(text, start, -1)
    && !hasNearbyDigit(text, end, 1);
}

function hasNearbyDigit(text, index, direction) {
  let cursor = index + (direction < 0 ? -1 : 0);

  while (cursor >= 0 && cursor < text.length) {
    const char = text[cursor];
    if (char === " " || char === "-" || char === "\t") {
      cursor += direction;
      continue;
    }
    return /\d/.test(char);
  }

  return false;
}

function luhnCheck(digits) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

module.exports = {
  filterForLLM,
  sanitizeText: (input, options) => filterForLLM(input, options).sanitizedText
};
