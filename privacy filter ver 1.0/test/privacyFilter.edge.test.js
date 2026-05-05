"use strict";

const assert = require("node:assert/strict");
const { filterForLLM } = require("../src/privacyFilter");

function makeCase({
  name,
  input,
  expectedText,
  expectedTypes = [],
  expectedHints = [],
  options,
  shouldSendToLLM = true,
  needsHumanReview = false,
  highestRisk
}) {
  return {
    name,
    input,
    options,
    expectedText,
    expectedTypes,
    expectedHints,
    shouldSendToLLM,
    needsHumanReview,
    highestRisk
  };
}

function phoneEdgeCases() {
  const formats = [
    ["91234567", "[PHONE_1]"],
    ["9123 4567", "[PHONE_1]"],
    ["9123-4567", "[PHONE_1]"],
    ["+85291234567", "[PHONE_1]"],
    ["+852 9123 4567", "[PHONE_1]"],
    ["+852-9123-4567", "[PHONE_1]"],
    ["61234567", "[PHONE_1]"],
    ["5123 4567", "[PHONE_1]"],
    ["8123-4567", "[PHONE_1]"],
    ["23880000", "[PHONE_1]"],
    ["2388 0000", "[PHONE_1]"],
    ["3123-4567", "[PHONE_1]"],
    ["電話:91234567", "電話:[PHONE_1]"],
    ["電話\t9123 4567", "電話\t[PHONE_1]"],
    ["main 91234567 backup 61234567", "main [PHONE_1] backup [PHONE_2]"],
    ["請覆 +852 6123-4567", "請覆 [PHONE_1]"],
    ["whatsapp(+85291234567)", "whatsapp([PHONE_1])"],
    ["聯絡 8523 4567", "聯絡 [PHONE_1]"],
    ["office +852 2388 0000", "office [PHONE_1]"],
    ["搵我 9234 5678，唔該", "搵我 [PHONE_1]，唔該"],
    ["phone 51234567 email later", "phone [PHONE_1] email later"],
    ["call 6234 5678.", "call [PHONE_1]."],
    ["電話係61234567，想book", "電話係[PHONE_1]，想book"],
    ["backup number +852 9123-4567", "backup number [PHONE_1]"],
    ["改期電話6123 4567", "改期電話[PHONE_1]"],
    ["公司電話21234567", "公司電話[PHONE_1]"],
    ["請打 31234567", "請打 [PHONE_1]"],
    ["手機 85234567", "手機 [PHONE_1]"],
    ["mobile 9523-0000", "mobile [PHONE_1]"],
    ["店舖 2888 9999", "店舖 [PHONE_1]"]
  ];
  return formats.map(([input, expectedText], index) => makeCase({
    name: `phone edge ${index + 1}`,
    input,
    expectedText,
    expectedTypes: expectedText.includes("PHONE_2")
      ? ["hong_kong_phone", "hong_kong_phone"]
      : ["hong_kong_phone"],
    highestRisk: "medium"
  }));
}

function emailEdgeCases() {
  const fixtures = [
    ["user@example.hk", "[EMAIL_1]"],
    ["carmen.chan@example.com", "[EMAIL_1]"],
    ["carmen+trial@gmail.com", "[EMAIL_1]"],
    ["TEAM@SHOP.COM", "[EMAIL_1]"],
    ["a.b@support.example.com", "[EMAIL_1]"],
    ["user_name@centre.org", "[EMAIL_1]"],
    ["email:abc@example.co.uk.", "email:[EMAIL_1]."],
    ["我email係hello@beauty.hk，唔該", "我email係[EMAIL_1]，唔該"],
    ["to a@test.com cc b@test.com", "to [EMAIL_1] cc [EMAIL_2]"],
    ["reply-to me@example.com", "reply-to [EMAIL_1]"],
    ["owner@salon.com", "[EMAIL_1]"],
    ["parent99@school.hk", "[EMAIL_1]"],
    ["admin@sub.domain.hk", "[EMAIL_1]"],
    ["first.last@beauty.hk", "[EMAIL_1]"],
    ["hello@shop123.hk", "[EMAIL_1]"],
    ["contact cs@example.hk please", "contact [EMAIL_1] please"],
    ["EMAIL TEST@EXAMPLE.HK", "EMAIL [EMAIL_1]"],
    ["abc-def@example.hk", "[EMAIL_1]"],
    ["abc_def@example.hk", "[EMAIL_1]"],
    ["abc.def+promo@example.hk", "[EMAIL_1]"]
  ];
  return fixtures.map(([input, expectedText], index) => makeCase({
    name: `email edge ${index + 1}`,
    input,
    expectedText,
    expectedTypes: expectedText.includes("EMAIL_2") ? ["email", "email"] : ["email"],
    highestRisk: "medium"
  }));
}

function hkidEdgeCases() {
  const fixtures = [
    ["A123456(3)", "[HKID_1]"],
    ["A1234563", "[HKID_1]"],
    ["AB123456(7)", "[HKID_1]"],
    ["AB1234567", "[HKID_1]"],
    ["Z123456(A)", "[HKID_1]"],
    ["a123456(3)", "[HKID_1]"],
    ["身份證係K654321(0)", "身份證係[HKID_1]"],
    ["HKID:AB654321(9)", "HKID:[HKID_1]"],
    ["A123456(3) and B654321(0)", "[HKID_1] and [HKID_2]"],
    ["AB1234567.", "[HKID_1]."],
    ["id C111111(1)", "id [HKID_1]"],
    ["D2222222", "[HKID_1]"],
    ["XY333333(9)", "[HKID_1]"],
    ["Q444444(A)", "[HKID_1]"],
    ["N5555555", "[HKID_1]"],
    ["M666666(6)", "[HKID_1]"],
    ["P777777(7)", "[HKID_1]"],
    ["R8888888", "[HKID_1]"],
    ["T999999(9)", "[HKID_1]"],
    ["V123123(0)", "[HKID_1]"]
  ];
  return fixtures.map(([input, expectedText], index) => makeCase({
    name: `hkid edge ${index + 1}`,
    input,
    expectedText,
    expectedTypes: expectedText.includes("HKID_2") ? ["hkid", "hkid"] : ["hkid"],
    needsHumanReview: true,
    highestRisk: "high"
  }));
}

function creditCardEdgeCases() {
  const fixtures = [
    ["4111 1111 1111 1111", "[CREDIT_CARD_1]"],
    ["4111111111111111", "[CREDIT_CARD_1]"],
    ["5555 5555 5555 4444", "[CREDIT_CARD_1]"],
    ["378282246310005", "[CREDIT_CARD_1]"],
    ["6011-1111-1111-1117", "[CREDIT_CARD_1]"],
    ["card 4000 0000 0000 0002", "card [CREDIT_CARD_1]"],
    ["card 5105 1051 0510 5100", "card [CREDIT_CARD_1]"],
    ["card 3714 496353 98431", "card [CREDIT_CARD_1]"],
    ["card 3530 1113 3330 0000", "card [CREDIT_CARD_1]"],
    ["卡係4111 1111 1111 1111", "卡係[CREDIT_CARD_1]"],
    ["payment card 5555555555554444", "payment card [CREDIT_CARD_1]"],
    ["4111-1111-1111-1111 and 5555 5555 5555 4444", "[CREDIT_CARD_1] and [CREDIT_CARD_2]"]
  ];
  return fixtures.map(([input, expectedText], index) => makeCase({
    name: `credit card edge ${index + 1}`,
    input,
    expectedText,
    expectedTypes: expectedText.includes("CREDIT_CARD_2")
      ? ["credit_card", "credit_card"]
      : ["credit_card"],
    shouldSendToLLM: false,
    needsHumanReview: true,
    highestRisk: "blocked"
  }));
}

function paymentReferenceEdgeCases() {
  const fixtures = [
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
  return fixtures.map(([input, expectedText], index) => makeCase({
    name: `payment ref edge ${index + 1}`,
    input,
    expectedText,
    expectedTypes: ["fps_reference"],
    highestRisk: "medium"
  }));
}

function referenceOptionEdgeCases() {
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
      name: `order preserve edge ${index + 1}`,
      input,
      expectedText: preserved
    }),
    makeCase({
      name: `order redact edge ${index + 1}`,
      input,
      options: { preserveOrderRefs: false },
      expectedText: redacted,
      expectedTypes: ["order_reference"],
      highestRisk: "medium"
    })
  ]);
  const bookingCases = bookingRefs.flatMap(([input, redacted], index) => [
    makeCase({
      name: `booking redact edge ${index + 1}`,
      input,
      expectedText: redacted,
      expectedTypes: ["booking_reference"],
      highestRisk: "medium"
    }),
    makeCase({
      name: `booking preserve edge ${index + 1}`,
      input,
      options: { preserveBookingRefs: true },
      expectedText: input
    })
  ]);
  return [...orderCases, ...bookingCases];
}

function hintEdgeCases() {
  const fixtures = [
    ["I have eczema, can I do laser?", ["medical_detail"], true, "high"],
    ["我懷孕做唔做得？", ["medical_detail"], true, "high"],
    ["傷口未好可以做嗎？", ["medical_detail"], true, "high"],
    ["食緊藥可以做HIFU嗎？", ["medical_detail"], true, "high"],
    ["醫生診斷過敏感，可以做療程？", ["medical_detail"], true, "high"],
    ["我有病歷想send俾你", ["medical_detail"], true, "high"],
    ["I have allergy to laser gel", ["medical_detail"], true, "high"],
    ["做完之後好痛點算？", ["medical_detail"], true, "high"],
    ["要提供school name嗎？", ["child_data"], true, "high"],
    ["需要date of birth先報名？", ["child_data"], true, "high"],
    ["要小朋友全名先可以試堂？", ["child_data"], true, "high"],
    ["Do you need student id?", ["child_data"], true, "high"],
    ["I want a refund", ["payment_dispute"], true, "high"],
    ["I will chargeback this payment", ["payment_dispute"], true, "high"],
    ["你哋話未收到款，我想退款", ["payment_dispute"], true, "high"],
    ["信用卡扣多咗錢", ["payment_dispute"], true, "high"],
    ["地址係ABC Building 5/F", ["address_hint"], false, "medium"],
    ["我住太古城某座", ["address_hint"], false, "medium"],
    ["Room 1201, Tower 2", ["address_hint"], false, "medium"],
    ["送去某大廈地下", ["address_hint"], false, "medium"]
  ];
  return fixtures.map(([input, hints, review, risk], index) => makeCase({
    name: `hint edge ${index + 1}`,
    input,
    expectedText: input,
    expectedHints: hints,
    needsHumanReview: review,
    highestRisk: risk
  }));
}

function falsePositiveEdgeCases() {
  const fixtures = [
    "會員卡 1234 5678 9012 3456",
    "tracking 1234567890123",
    "invoice 9999 8888 7777 6666",
    "serial 1000-2000-3000-4001",
    "coupon 1111222233334445",
    "promo code 85261234567X",
    "not phone 191234567",
    "price 2388 and 0000 deposit",
    "reference text orderHKabc",
    "email is not provided",
    "FPS付款可以嗎？",
    "booking policy點計？",
    "order status點查？",
    "HKID not needed right?",
    "信用卡可以俾deposit嗎？",
    "痛感大唔大？",
    "小朋友課程幾錢？",
    "地址喺邊？",
    "refund policy係點？",
    "medicine facial有冇？"
  ];
  const expected = [
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [[], false, "none"],
    [["payment_dispute"], true, "high"],
    [["medical_detail"], true, "high"],
    [[], false, "none"],
    [["address_hint"], false, "medium"],
    [["payment_dispute"], true, "high"],
    [["medical_detail"], true, "high"]
  ];
  return fixtures.map((input, index) => makeCase({
    name: `false positive and keyword edge ${index + 1}`,
    input,
    expectedText: input,
    expectedHints: expected[index][0],
    needsHumanReview: expected[index][1],
    highestRisk: expected[index][2]
  }));
}

function mixedOrderingEdgeCases() {
  const fixtures = [
    ["電話9123 4567 email carmen@example.hk", "電話[PHONE_1] email [EMAIL_2]", ["hong_kong_phone", "email"], [], true, false, "medium"],
    ["email carmen@example.hk HKID A123456(3)", "email [EMAIL_1] HKID [HKID_2]", ["email", "hkid"], [], true, true, "high"],
    ["電話9123 4567 HKID A123456(3)", "電話[PHONE_1] HKID [HKID_2]", ["hong_kong_phone", "hkid"], [], true, true, "high"],
    ["電話9123 4567 卡4111 1111 1111 1111", "電話[PHONE_1] 卡[CREDIT_CARD_2]", ["hong_kong_phone", "credit_card"], [], false, true, "blocked"],
    ["email carmen@example.hk 我有濕疹", "email [EMAIL_1] 我有濕疹", ["email"], ["medical_detail"], true, true, "high"],
    ["FPS REF880000 但我想退款", "[PAYMENT_REF_1] 但我想退款", ["fps_reference"], ["payment_dispute"], true, true, "high"],
    ["booking B12345 地址係ABC Building", "[BOOKING_REF_1] 地址係ABC Building", ["booking_reference"], ["address_hint"], true, false, "medium"],
    ["order HK12345 phone 9123 4567", "order HK12345 phone [PHONE_1]", ["hong_kong_phone"], [], true, false, "medium"],
    ["order HK12345 phone 9123 4567", "[ORDER_REF_1] phone [PHONE_2]", ["order_reference", "hong_kong_phone"], [], true, false, "medium", { preserveOrderRefs: false }],
    ["小朋友全名 HKID A123456(3)", "小朋友全名 HKID [HKID_1]", ["hkid"], ["child_data"], true, true, "high"],
    ["A123456(3) 91234567 abc@example.hk", "[HKID_1] [PHONE_2] [EMAIL_3]", ["hkid", "hong_kong_phone", "email"], [], true, true, "high"],
    ["4111111111111111 A123456(3)", "[CREDIT_CARD_1] [HKID_2]", ["credit_card", "hkid"], [], false, true, "blocked"],
    ["付款 REF880005 email a@test.com", "[PAYMENT_REF_1] email [EMAIL_2]", ["fps_reference", "email"], [], true, false, "medium"],
    ["預約 A98765 電話61234567", "[BOOKING_REF_1] 電話[PHONE_2]", ["booking_reference", "hong_kong_phone"], [], true, false, "medium"],
    ["地址係ABC Building email a@test.com", "地址係ABC Building email [EMAIL_1]", ["email"], ["address_hint"], true, false, "medium"],
    ["退款 email a@test.com", "退款 email [EMAIL_1]", ["email"], ["payment_dispute"], true, true, "high"]
  ];
  return fixtures.map(([input, expectedText, types, hints, send, review, risk, options], index) => makeCase({
    name: `mixed ordering edge ${index + 1}`,
    input,
    options,
    expectedText,
    expectedTypes: types,
    expectedHints: hints,
    shouldSendToLLM: send,
    needsHumanReview: review,
    highestRisk: risk
  }));
}

function oddInputEdgeCases() {
  const fixtures = [
    [null, "", [], [], true, false, "none"],
    [undefined, "", [], [], true, false, "none"],
    ["", "", [], [], true, false, "none"],
    ["   ", "   ", [], [], true, false, "none"],
    [12345, "12345", [], [], true, false, "none"],
    [true, "true", [], [], true, false, "none"],
    ["有冇價錢？\n今晚有冇位？", "有冇價錢？\n今晚有冇位？", [], [], true, false, "none"]
  ];
  return fixtures.map(([input, expectedText, types, hints, send, review, risk], index) => makeCase({
    name: `odd input edge ${index + 1}`,
    input,
    expectedText,
    expectedTypes: types,
    expectedHints: hints,
    shouldSendToLLM: send,
    needsHumanReview: review,
    highestRisk: risk
  }));
}

function boundaryNearMissEdgeCases() {
  const fixtures = [
    ["x91234567y", "x91234567y", [], [], true, false, "none"],
    ["191234567", "191234567", [], [], true, false, "none"],
    ["912345678", "912345678", [], [], true, false, "none"],
    ["85261234567X", "85261234567X", [], [], true, false, "none"],
    ["abc@example", "abc@example", [], [], true, false, "none"],
    ["A123456", "A123456", [], [], true, false, "none"],
    ["4111 1111 1111 1112", "4111 1111 1111 1112", [], [], true, false, "none"]
  ];
  return fixtures.map(([input, expectedText, types, hints, send, review, risk], index) => makeCase({
    name: `boundary near miss edge ${index + 1}`,
    input,
    expectedText,
    expectedTypes: types,
    expectedHints: hints,
    shouldSendToLLM: send,
    needsHumanReview: review,
    highestRisk: risk
  }));
}

const cases = [
  ...phoneEdgeCases(),
  ...emailEdgeCases(),
  ...hkidEdgeCases(),
  ...creditCardEdgeCases(),
  ...paymentReferenceEdgeCases(),
  ...referenceOptionEdgeCases(),
  ...hintEdgeCases(),
  ...falsePositiveEdgeCases(),
  ...mixedOrderingEdgeCases(),
  ...oddInputEdgeCases(),
  ...boundaryNearMissEdgeCases()
];

assert.equal(cases.length, 200, "privacy filter edge suite should contain exactly 200 cases");

for (const testCase of cases) {
  const result = filterForLLM(testCase.input, testCase.options);
  assert.equal(result.sanitizedText, testCase.expectedText, testCase.name);
  assert.deepEqual(result.findings.map((item) => item.type), testCase.expectedTypes, testCase.name);
  assert.deepEqual(result.hints.map((item) => item.type), testCase.expectedHints, testCase.name);
  assert.equal(result.shouldSendToLLM, testCase.shouldSendToLLM, testCase.name);
  assert.equal(result.needsHumanReview, testCase.needsHumanReview, testCase.name);
  if (testCase.highestRisk) {
    assert.equal(result.highestRisk, testCase.highestRisk, testCase.name);
  }
}

console.log(`privacyFilter edge: ${cases.length} tests passed`);
