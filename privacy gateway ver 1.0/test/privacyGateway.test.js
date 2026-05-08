"use strict";

const assert = require("node:assert/strict");
const { ROUTES, routeMessage } = require("../src/privacyGateway");

function makeCase({
  name,
  input,
  expectedRoute,
  expectedSanitizedText,
  options,
  expectedFindingTypes = [],
  expectedHintTypes = [],
  shouldCallLLM,
  requiresHumanReview
}) {
  return {
    name,
    input,
    options,
    expectedRoute,
    expectedSanitizedText,
    expectedFindingTypes,
    expectedHintTypes,
    shouldCallLLM: shouldCallLLM ?? expectedRoute !== ROUTES.BLOCK_AND_HANDOFF,
    requiresHumanReview: requiresHumanReview ?? expectedRoute !== ROUTES.SEND_TO_LLM
  };
}

function cleanInquiryCases() {
  const inputs = [
    "有冇underarm價錢？",
    "今晚7點有冇位？",
    "你哋幾點收工？",
    "尖沙咀分店星期日開唔開？",
    "可以用FPS付款嗎？",
    "laser trial 幾錢？",
    "想問取消booking policy",
    "銅鑼灣店近邊個出口？",
    "有冇二人同行優惠？",
    "可以walk in嗎？",
    "想問脫毛療程需時幾耐？",
    "package有冇優惠？",
    "Can I book tomorrow evening?",
    "Do you accept Octopus?",
    "Any first trial offer?",
    "今日有冇last minute位？",
    "美容院近地鐵嗎？",
    "試做價幾多？",
    "可唔可以改時間？",
    "what time do you close?"
  ];
  return inputs.map((input, index) => makeCase({
    name: `clean inquiry ${index + 1}`,
    input,
    expectedRoute: ROUTES.SEND_TO_LLM,
    expectedSanitizedText: input
  }));
}

function phoneCases() {
  const numbers = [
    ["9123 4567", "[PHONE_1]"],
    ["6123-4567", "[PHONE_1]"],
    ["+852 5123 4567", "[PHONE_1]"],
    ["+852-8123-4567", "[PHONE_1]"],
    ["2388 0000", "[PHONE_1]"],
    ["31234567", "[PHONE_1]"],
    ["main 91234567 backup 61234567", "main [PHONE_1] backup [PHONE_2]"],
    ["電話:91234567", "電話:[PHONE_1]"],
    ["whatsapp +85261234567", "whatsapp [PHONE_1]"],
    ["搵我 9234 5678", "搵我 [PHONE_1]"],
    ["公司電話 2123 4567", "公司電話 [PHONE_1]"],
    ["Can call 6234 5678?", "Can call [PHONE_1]?"],
    ["電話\t9123 4567", "電話\t[PHONE_1]"],
    ["請覆 8523 4567", "請覆 [PHONE_1]"],
    ["office +852 2388 0000", "office [PHONE_1]"],
    ["我電話係61234567，想book", "我電話係[PHONE_1]，想book"],
    ["phone 51234567 email later", "phone [PHONE_1] email later"],
    ["聯絡 9123-4567 thanks", "聯絡 [PHONE_1] thanks"],
    ["backup number +852 9123-4567", "backup number [PHONE_1]"],
    ["想改期，電話6123 4567", "想改期，電話[PHONE_1]"]
  ];
  return numbers.map(([inputPart, expectedPart], index) => makeCase({
    name: `phone redaction route ${index + 1}`,
    input: `case ${index + 1}: ${inputPart}`,
    expectedRoute: ROUTES.SEND_TO_LLM,
    expectedSanitizedText: `case ${index + 1}: ${expectedPart}`,
    expectedFindingTypes: expectedPart.includes("PHONE_2")
      ? ["hong_kong_phone", "hong_kong_phone"]
      : ["hong_kong_phone"]
  }));
}

function emailCases() {
  const emails = [
    "carmen@example.hk",
    "lead+trial@gmail.com",
    "TEAM@SHOP.COM",
    "a.b@support.example.com",
    "user_name@centre.org",
    "cs@example.co.uk",
    "first.last@beauty.hk",
    "parent99@school.hk",
    "owner@salon.com",
    "hello@shop123.hk",
    "a@test.com and b@test.com",
    "email:abc@example.hk",
    "reply-to me@example.com",
    "c.c+promo@example.org",
    "admin@sub.domain.hk"
  ];
  return emails.map((email, index) => {
    const hasTwo = email.includes(" and ");
    return makeCase({
      name: `email redaction route ${index + 1}`,
      input: `email case ${index + 1}: ${email}`,
      expectedRoute: ROUTES.SEND_TO_LLM,
      expectedSanitizedText: hasTwo
        ? `email case ${index + 1}: [EMAIL_1] and [EMAIL_2]`
        : `email case ${index + 1}: ${email.startsWith("email:") ? "email:" : email.startsWith("reply-to") ? "reply-to " : ""}[EMAIL_1]`,
      expectedFindingTypes: hasTwo ? ["email", "email"] : ["email"]
    });
  });
}

function hkidCases() {
  const ids = [
    ["A123456(3)", "[HKID_1]"],
    ["A1234563", "[HKID_1]"],
    ["AB123456(7)", "[HKID_1]"],
    ["AB1234567", "[HKID_1]"],
    ["Z123456(A)", "[HKID_1]"],
    ["a123456(3)", "[HKID_1]"],
    ["K654321(0)", "[HKID_1]"],
    ["HKID:AB654321(9)", "HKID:[HKID_1]"],
    ["身份證係AB1234567", "身份證係[HKID_1]"],
    ["id C111111(1)", "id [HKID_1]"],
    ["D2222222", "[HKID_1]"],
    ["XY333333(9)", "[HKID_1]"],
    ["Q444444(A)", "[HKID_1]"],
    ["N5555555", "[HKID_1]"],
    ["M666666(6)", "[HKID_1]"],
    ["P777777(7)", "[HKID_1]"],
    ["R8888888", "[HKID_1]"],
    ["T999999(9)", "[HKID_1]"],
    ["V123123(0)", "[HKID_1]"],
    ["W3213211", "[HKID_1]"]
  ];
  return ids.map(([id, expected], index) => makeCase({
    name: `hkid review route ${index + 1}`,
    input: `hkid case ${index + 1}: ${id}`,
    expectedRoute: ROUTES.REVIEW_BEFORE_LLM,
    expectedSanitizedText: `hkid case ${index + 1}: ${expected}`,
    expectedFindingTypes: ["hkid"]
  }));
}

function creditCardCases() {
  const cards = [
    "4111 1111 1111 1111",
    "4111111111111111",
    "5555 5555 5555 4444",
    "378282246310005",
    "6011-1111-1111-1117",
    "4222 2222 2222 2",
    "4000 0000 0000 0002",
    "5105 1051 0510 5100",
    "3714 496353 98431",
    "3530 1113 3330 0000"
  ];
  return cards.map((card, index) => makeCase({
    name: `credit card block route ${index + 1}`,
    input: `card case ${index + 1}: ${card}`,
    expectedRoute: ROUTES.BLOCK_AND_HANDOFF,
    expectedSanitizedText: `card case ${index + 1}: [CREDIT_CARD_1]`,
    expectedFindingTypes: ["credit_card"]
  }));
}

function highRiskHintCases() {
  const fixtures = [
    ["medical eczema", "I have eczema, can I do laser?", ["medical_detail"]],
    ["medical pregnancy", "我懷孕做唔做得？", ["medical_detail"]],
    ["medical wound", "傷口未好可以做嗎？", ["medical_detail"]],
    ["medical medicine", "食緊藥可以做HIFU嗎？", ["medical_detail"]],
    ["medical diagnosis", "醫生診斷過敏感，可以做療程？", ["medical_detail"]],
    ["medical record", "我有病歷想send俾你", ["medical_detail"]],
    ["medical allergy", "I have allergy to laser gel", ["medical_detail"]],
    ["medical side effects", "Will there be side effects or swelling after treatment?", ["medical_detail"]],
    ["medical breastfeeding", "I am breastfeeding, can I do HIFU?", ["medical_detail"]],
    ["medical pain", "做完之後好痛點算？", ["medical_detail"]],
    ["child school", "要提供school name嗎？", ["child_data"]],
    ["child dob", "需要date of birth先報名？", ["child_data"]],
    ["child full name", "要小朋友全名先可以試堂？", ["child_data"]],
    ["student id", "Do you need student id?", ["child_data"]],
    ["child full name english", "Do you need my child's full name?", ["child_data"]],
    ["refund", "I want a refund", ["payment_dispute"]],
    ["chargeback", "I will chargeback this payment", ["payment_dispute"]],
    ["overcharged", "I was overcharged and want a refund", ["payment_dispute"]],
    ["payment not found", "I paid but you said payment not found", ["payment_dispute"]],
    ["not received payment", "你哋話未收到款，我想退款", ["payment_dispute"]],
    ["credit card dispute", "信用卡扣多咗錢", ["payment_dispute"]],
    ["mixed medical phone", "我濕疹，電話9123 4567", ["medical_detail"]],
    ["mixed child email", "小朋友全名要send去parent@example.hk嗎？", ["child_data"]],
    ["mixed dispute order", "order HK12345 未收到款要退款", ["payment_dispute"]],
    ["mixed pregnancy booking", "懷孕可以book laser嗎？", ["medical_detail"]]
  ];
  return fixtures.map(([label, input, hints], index) => {
    const result = routeMessage(input);
    return makeCase({
      name: `high risk hint ${index + 1}: ${label}`,
      input,
      expectedRoute: ROUTES.REVIEW_BEFORE_LLM,
      expectedSanitizedText: result.sanitizedText,
      expectedFindingTypes: result.filter.findings.map((finding) => finding.type),
      expectedHintTypes: hints
    });
  });
}

function mediumRiskConfigCases() {
  const fixtures = [
    "地址係ABC Building 5/F",
    "我住太古城某座",
    "送去銅鑼灣記利佐治街18號5樓可以嗎？",
    "Room 1201, Tower 2",
    "building lobby交收可以嗎？",
    "街口等你哋得唔得？",
    "Road side pickup please",
    "我喺某屋苑會所",
    "office address is on Queen's Road",
    "送去某大廈地下"
  ];
  return fixtures.flatMap((input, index) => [
    makeCase({
      name: `medium risk default send ${index + 1}`,
      input,
      expectedRoute: ROUTES.SEND_TO_LLM,
      expectedSanitizedText: input,
      expectedHintTypes: ["address_hint"]
    }),
    makeCase({
      name: `medium risk forced review ${index + 1}`,
      input,
      options: { requireReviewForMediumRisk: true },
      expectedRoute: ROUTES.REVIEW_BEFORE_LLM,
      expectedSanitizedText: input,
      expectedHintTypes: ["address_hint"]
    })
  ]);
}

function referenceOptionCases() {
  const orderRefs = [
    ["order HK12345", "order HK12345", "[ORDER_REF_1]"],
    ["order:HK98765", "order:HK98765", "[ORDER_REF_1]"],
    ["#123456", "#123456", "[ORDER_REF_1]"],
    ["訂單 HK11111", "訂單 HK11111", "[ORDER_REF_1]"],
    ["單號 A22222", "單號 A22222", "[ORDER_REF_1]"],
    ["ref R33333", "ref R33333", "[ORDER_REF_1]"],
    ["reference ABCD44444", "reference ABCD44444", "[ORDER_REF_1]"],
    ["order 1234567890", "order 1234567890", "[ORDER_REF_1]"]
  ];
  const bookingRefs = [
    ["booking B12345", "[BOOKING_REF_1]"],
    ["booking:B12345", "[BOOKING_REF_1]"],
    ["book BK123456", "[BOOKING_REF_1]"],
    ["預約 A98765", "[BOOKING_REF_1]"],
    ["booking 12345678", "[BOOKING_REF_1]"],
    ["book ABCD123456789", "[BOOKING_REF_1]"]
  ];

  const orderCases = orderRefs.flatMap(([input, preserved, redacted], index) => [
    makeCase({
      name: `order default preserve ${index + 1}`,
      input,
      expectedRoute: ROUTES.SEND_TO_LLM,
      expectedSanitizedText: preserved
    }),
    makeCase({
      name: `order configured redact ${index + 1}`,
      input,
      options: { filterOptions: { preserveOrderRefs: false } },
      expectedRoute: ROUTES.SEND_TO_LLM,
      expectedSanitizedText: redacted,
      expectedFindingTypes: ["order_reference"]
    })
  ]);

  const bookingCases = bookingRefs.flatMap(([input, redacted], index) => [
    makeCase({
      name: `booking default redact ${index + 1}`,
      input,
      expectedRoute: ROUTES.SEND_TO_LLM,
      expectedSanitizedText: redacted,
      expectedFindingTypes: ["booking_reference"]
    }),
    makeCase({
      name: `booking configured preserve ${index + 1}`,
      input,
      options: { filterOptions: { preserveBookingRefs: true } },
      expectedRoute: ROUTES.SEND_TO_LLM,
      expectedSanitizedText: input
    })
  ]);

  return [...orderCases, ...bookingCases];
}

function mixedPriorityCases() {
  const fixtures = [
    {
      name: "credit card beats phone",
      input: "電話9123 4567，卡4111 1111 1111 1111",
      sanitized: "電話[PHONE_1]，卡[CREDIT_CARD_2]",
      findings: ["hong_kong_phone", "credit_card"],
      route: ROUTES.BLOCK_AND_HANDOFF
    },
    {
      name: "credit card beats medical review",
      input: "我濕疹，卡4111 1111 1111 1111",
      sanitized: "我濕疹，卡[CREDIT_CARD_1]",
      findings: ["credit_card"],
      hints: ["medical_detail"],
      route: ROUTES.BLOCK_AND_HANDOFF
    },
    {
      name: "hkid plus phone reviews",
      input: "電話9123 4567 HKID A123456(3)",
      sanitized: "電話[PHONE_1] HKID [HKID_2]",
      findings: ["hong_kong_phone", "hkid"],
      route: ROUTES.REVIEW_BEFORE_LLM
    },
    {
      name: "email plus medical reviews",
      input: "email carmen@example.hk，我有濕疹",
      sanitized: "email [EMAIL_1]，我有濕疹",
      findings: ["email"],
      hints: ["medical_detail"],
      route: ROUTES.REVIEW_BEFORE_LLM
    },
    {
      name: "payment ref plus refund reviews",
      input: "FPS REF880000，但我想退款",
      sanitized: "[PAYMENT_REF_1]，但我想退款",
      findings: ["fps_reference"],
      hints: ["payment_dispute"],
      route: ROUTES.REVIEW_BEFORE_LLM
    },
    {
      name: "booking ref plus address default sends",
      input: "booking B12345 地址係ABC Building",
      sanitized: "[BOOKING_REF_1] 地址係ABC Building",
      findings: ["booking_reference"],
      hints: ["address_hint"],
      route: ROUTES.SEND_TO_LLM
    },
    {
      name: "booking ref plus address forced reviews",
      input: "booking B12345 地址係ABC Building",
      options: { requireReviewForMediumRisk: true },
      sanitized: "[BOOKING_REF_1] 地址係ABC Building",
      findings: ["booking_reference"],
      hints: ["address_hint"],
      route: ROUTES.REVIEW_BEFORE_LLM
    },
    {
      name: "order preserved plus phone sends",
      input: "order HK12345 phone 9123 4567",
      sanitized: "order HK12345 phone [PHONE_1]",
      findings: ["hong_kong_phone"],
      route: ROUTES.SEND_TO_LLM
    },
    {
      name: "order redacted plus phone sends",
      input: "order HK12345 phone 9123 4567",
      options: { filterOptions: { preserveOrderRefs: false } },
      sanitized: "[ORDER_REF_1] phone [PHONE_2]",
      findings: ["order_reference", "hong_kong_phone"],
      route: ROUTES.SEND_TO_LLM
    },
    {
      name: "child data plus hkid reviews",
      input: "小朋友全名 HKID A123456(3)",
      sanitized: "小朋友全名 HKID [HKID_1]",
      findings: ["hkid"],
      hints: ["child_data"],
      route: ROUTES.REVIEW_BEFORE_LLM
    }
  ];

  return fixtures.map((fixture, index) => makeCase({
    name: `mixed priority ${index + 1}: ${fixture.name}`,
    input: fixture.input,
    options: fixture.options,
    expectedRoute: fixture.route,
    expectedSanitizedText: fixture.sanitized,
    expectedFindingTypes: fixture.findings,
    expectedHintTypes: fixture.hints || []
  }));
}

function falsePositiveCases() {
  const inputs = [
    ["會員卡 1234 5678 9012 3456", []],
    ["tracking 1234567890123", []],
    ["invoice 9999 8888 7777 6666", []],
    ["serial 1000-2000-3000-4001", []],
    ["coupon 1111222233334445", []],
    ["promo code 85261234567X", []],
    ["not phone 191234567", []],
    ["room 9123 floor 4567", ["address_hint"]],
    ["price 2388 and 0000 deposit", []],
    ["reference text orderHKabc", []]
  ];
  return inputs.map(([input, expectedHintTypes], index) => makeCase({
    name: `false positive guard ${index + 1}`,
    input,
    expectedRoute: ROUTES.SEND_TO_LLM,
    expectedSanitizedText: input,
    expectedHintTypes
  }));
}

function paymentReferenceCases() {
  const refs = [
    ["FPS REF880000", "[PAYMENT_REF_1]"],
    ["FPS:REF880001", "[PAYMENT_REF_1]"],
    ["FPS：REF880002", "[PAYMENT_REF_1]"],
    ["PayMe REF880003", "[PAYMENT_REF_1]"],
    ["payment REF880004", "[PAYMENT_REF_1]"],
    ["付款 REF880005", "[PAYMENT_REF_1]"],
    ["入數 REF880006", "[PAYMENT_REF_1]"],
    ["轉數快 REF880007", "[PAYMENT_REF_1]"],
    ["paid by payme PMT-889900", "paid by [PAYMENT_REF_1]"],
    ["我已經FPS ABCD123456", "我已經[PAYMENT_REF_1]"],
    ["付款 ABCD-889900", "[PAYMENT_REF_1]"],
    ["入數 TXN778899", "[PAYMENT_REF_1]"],
    ["轉數快 FPS889900", "[PAYMENT_REF_1]"],
    ["payment PAY123456", "[PAYMENT_REF_1]"],
    ["PayMe PMT123456", "[PAYMENT_REF_1]"],
    ["FPS XYZ987654321", "[PAYMENT_REF_1]"],
    ["FPS PAY123456", "[PAYMENT_REF_1]"],
    ["payment REF-12345", "[PAYMENT_REF_1]"],
    ["付款 REF12345", "[PAYMENT_REF_1]"],
    ["入數 PAYME99999", "[PAYMENT_REF_1]"]
  ];
  return refs.map(([input, expected], index) => makeCase({
    name: `payment ref route ${index + 1}`,
    input,
    expectedRoute: ROUTES.SEND_TO_LLM,
    expectedSanitizedText: expected,
    expectedFindingTypes: ["fps_reference"]
  }));
}

function oddInputCases() {
  const fixtures = [
    ["empty string", "", ""],
    ["null input", null, ""],
    ["undefined input", undefined, ""],
    ["number input", 12345, "12345"],
    ["boolean input", true, "true"],
    ["spaces only", "   ", "   "],
    ["newline clean", "有冇價錢？\n今晚有冇位？", "有冇價錢？\n今晚有冇位？"]
  ];
  return fixtures.map(([label, input, expected], index) => makeCase({
    name: `odd input ${index + 1}: ${label}`,
    input,
    expectedRoute: ROUTES.SEND_TO_LLM,
    expectedSanitizedText: expected
  }));
}

const cases = [
  ...cleanInquiryCases(),
  ...phoneCases(),
  ...emailCases(),
  ...hkidCases(),
  ...creditCardCases(),
  ...highRiskHintCases(),
  ...mediumRiskConfigCases(),
  ...referenceOptionCases(),
  ...mixedPriorityCases(),
  ...falsePositiveCases(),
  ...paymentReferenceCases(),
  ...oddInputCases()
];

assert.equal(cases.length, 205, "gateway suite should contain exactly 205 cases");

for (const testCase of cases) {
  const result = routeMessage(testCase.input, testCase.options);
  assert.equal(result.route, testCase.expectedRoute, testCase.name);
  assert.equal(result.sanitizedText, testCase.expectedSanitizedText, testCase.name);
  assert.equal(result.shouldCallLLM, testCase.shouldCallLLM, testCase.name);
  assert.equal(result.requiresHumanReview, testCase.requiresHumanReview, testCase.name);
  assert.deepEqual(result.filter.findings.map((item) => item.type), testCase.expectedFindingTypes, testCase.name);
  assert.deepEqual(result.filter.hints.map((item) => item.type), testCase.expectedHintTypes, testCase.name);
  assert.ok(result.reason.length > 0, testCase.name);
}

console.log(`privacyGateway: ${cases.length} tests passed`);
