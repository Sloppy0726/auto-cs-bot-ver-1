"use strict";

function makeCase({
  name,
  input,
  expectedText,
  expectedTypes = [],
  expectedHints,
  options,
  shouldSendToLLM = true,
  needsHumanReview = false
}) {
  return {
    name,
    input,
    expectedText,
    expectedTypes,
    expectedHints,
    options,
    shouldSendToLLM,
    needsHumanReview
  };
}

function makePhoneCases() {
  const prefixes = ["2", "3", "5", "6", "8", "9"];
  const formats = [
    { label: "compact", format: (number) => number },
    { label: "spaced", format: (number) => `${number.slice(0, 4)} ${number.slice(4)}` },
    { label: "hyphen", format: (number) => `${number.slice(0, 4)}-${number.slice(4)}` },
    { label: "country compact", format: (number) => `+852${number}` },
    { label: "country spaced", format: (number) => `+852 ${number.slice(0, 4)} ${number.slice(4)}` },
    { label: "country hyphen", format: (number) => `+852-${number.slice(0, 4)}-${number.slice(4)}` }
  ];
  const cases = [];
  let index = 0;

  while (cases.length < 80) {
    const prefix = prefixes[index % prefixes.length];
    const middle = String(100 + index).slice(-3);
    const tail = String(4500 + index).slice(-4);
    const number = `${prefix}${middle}${tail}`;
    const formatter = formats[index % formats.length];
    const input = `phone case ${index + 1}: ${formatter.format(number)} for booking`;
    cases.push(makeCase({
      name: `phone ${index + 1}: ${formatter.label}`,
      input,
      expectedText: `phone case ${index + 1}: [PHONE_1] for booking`,
      expectedTypes: ["hong_kong_phone"]
    }));
    index += 1;
  }

  return cases;
}

function makeEmailCases() {
  const domains = ["example.hk", "shop.com", "support.example.com", "beauty.co.uk", "centre.org"];
  return Array.from({ length: 60 }, (_, index) => {
    const local = index % 3 === 0 ? `user.${index}` : index % 3 === 1 ? `carmen+${index}` : `team_${index}`;
    const domain = domains[index % domains.length];
    const input = `email case ${index + 1}: contact ${local}@${domain} for follow up`;
    return makeCase({
      name: `email ${index + 1}`,
      input,
      expectedText: `email case ${index + 1}: contact [EMAIL_1] for follow up`,
      expectedTypes: ["email"]
    });
  });
}

function makeHkidCases() {
  const letters = ["A", "B", "C", "Z", "AB", "CD", "XY", "K"];
  const checks = ["0", "1", "2", "3", "7", "9", "A"];
  return Array.from({ length: 60 }, (_, index) => {
    const letter = letters[index % letters.length];
    const body = String(123456 + index).slice(-6);
    const check = checks[index % checks.length];
    const hkid = index % 2 === 0 ? `${letter}${body}(${check})` : `${letter}${body}${check}`;
    const input = `HKID case ${index + 1}: ${hkid} update profile`;
    return makeCase({
      name: `hkid ${index + 1}`,
      input,
      expectedText: `HKID case ${index + 1}: [HKID_1] update profile`,
      expectedTypes: ["hkid"],
      needsHumanReview: true
    });
  });
}

function makeCreditCardCases() {
  const cardNumbers = [
    "4111 1111 1111 1111",
    "4111111111111111",
    "5555 5555 5555 4444",
    "378282246310005",
    "6011-1111-1111-1117"
  ];
  return Array.from({ length: 25 }, (_, index) => {
    const card = cardNumbers[index % cardNumbers.length];
    return makeCase({
      name: `credit card ${index + 1}`,
      input: `card case ${index + 1}: ${card}`,
      expectedText: `card case ${index + 1}: [CREDIT_CARD_1]`,
      expectedTypes: ["credit_card"],
      shouldSendToLLM: false,
      needsHumanReview: true
    });
  });
}

function makeNonCreditCardCases() {
  return Array.from({ length: 25 }, (_, index) => {
    const code = `AA${String(100000 + index)}ZZ${String(700000 + index)}`;
    const input = `membership case ${index + 1}: ${code}`;
    return makeCase({
      name: `non credit card ${index + 1}`,
      input,
      expectedText: input
    });
  });
}

function makePaymentReferenceCases() {
  const triggers = ["FPS", "FPS:", "FPS：", "PayMe", "payment", "付款", "入數", "轉數快"];
  return Array.from({ length: 50 }, (_, index) => {
    const trigger = triggers[index % triggers.length];
    const ref = `REF${String(880000 + index)}`;
    return makeCase({
      name: `payment reference ${index + 1}`,
      input: `payment case ${index + 1}: ${trigger} ${ref}`,
      expectedText: `payment case ${index + 1}: [PAYMENT_REF_1]`,
      expectedTypes: ["fps_reference"]
    });
  });
}

function makeOrderReferenceCases() {
  const triggers = ["order", "order:", "#", "訂單", "單號", "ref", "reference"];
  return Array.from({ length: 50 }, (_, index) => {
    const trigger = triggers[index % triggers.length];
    const ref = trigger === "#" ? `${100000 + index}` : `HK${10000 + index}`;
    return makeCase({
      name: `order reference ${index + 1}`,
      input: `order case ${index + 1}: ${trigger} ${ref}`,
      expectedText: `order case ${index + 1}: [ORDER_REF_1]`,
      expectedTypes: ["order_reference"],
      options: { preserveOrderRefs: false }
    });
  });
}

function makeBookingReferenceCases() {
  const triggers = ["booking", "booking:", "book", "預約"];
  return Array.from({ length: 40 }, (_, index) => {
    const trigger = triggers[index % triggers.length];
    const ref = `BK${20000 + index}`;
    return makeCase({
      name: `booking reference ${index + 1}`,
      input: `booking case ${index + 1}: ${trigger} ${ref}`,
      expectedText: `booking case ${index + 1}: [BOOKING_REF_1]`,
      expectedTypes: ["booking_reference"]
    });
  });
}

function makeHintCases() {
  const fixtures = [
    { label: "medical eczema", text: "I have eczema, can I do laser?", hints: ["medical_detail"], review: true },
    { label: "medical side effects", text: "Will there be side effects after HIFU?", hints: ["medical_detail"], review: true },
    { label: "medical medication", text: "I am taking prescription medication, can I do facial?", hints: ["medical_detail"], review: true },
    { label: "medical pregnancy", text: "我懷孕做唔做得？", hints: ["medical_detail"], review: true },
    { label: "medical wound", text: "傷口未好可以做嗎？", hints: ["medical_detail"], review: true },
    { label: "medical diagnosis", text: "醫生診斷過敏感，可以做療程？", hints: ["medical_detail"], review: true },
    { label: "child school", text: "要提供school name嗎？", hints: ["child_data"], review: true },
    { label: "child full name english", text: "Do you need my child's full name?", hints: ["child_data"], review: true },
    { label: "child birth date", text: "Do you need the birth date before trial class?", hints: ["child_data"], review: true },
    { label: "child dob", text: "需要date of birth先報名？", hints: ["child_data"], review: true },
    { label: "child full name", text: "要小朋友全名先可以試堂？", hints: ["child_data"], review: true },
    { label: "address building", text: "地址係ABC Building 5/F", hints: ["address_hint"], review: false },
    { label: "home address english", text: "My home address is Flat B, Tower 2", hints: ["address_hint"], review: false },
    { label: "address estate", text: "我住太古城某座", hints: ["address_hint"], review: false },
    { label: "payment refund", text: "I want a refund", hints: ["payment_dispute"], review: true },
    { label: "payment chargeback", text: "I will chargeback this payment", hints: ["payment_dispute"], review: true },
    { label: "payment overcharged", text: "I was overcharged and want a refund", hints: ["payment_dispute"], review: true },
    { label: "payment not found", text: "I paid but you said payment not found", hints: ["payment_dispute"], review: true },
    { label: "payment not received", text: "你哋話未收到款，我想退款", hints: ["payment_dispute"], review: true }
  ];
  return Array.from({ length: 60 }, (_, index) => {
    const fixture = fixtures[index % fixtures.length];
    return makeCase({
      name: `hint ${index + 1}: ${fixture.label}`,
      input: `${fixture.text} case ${index + 1}`,
      expectedText: `${fixture.text} case ${index + 1}`,
      expectedHints: fixture.hints,
      needsHumanReview: fixture.review
    });
  });
}

function makeCleanCases() {
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
    "可以walk in嗎？"
  ];
  return Array.from({ length: 30 }, (_, index) => {
    const input = `${inputs[index % inputs.length]} case ${index + 1}`;
    return makeCase({
      name: `clean inquiry ${index + 1}`,
      input,
      expectedText: input
    });
  });
}

function makeMultiPiiCases() {
  return Array.from({ length: 20 }, (_, index) => {
    const phone = `${index % 2 === 0 ? "9123" : "6123"} ${String(4500 + index).slice(-4)}`;
    const email = `lead${index}@example.hk`;
    const hkid = `A${String(123456 + index).slice(-6)}(${index % 10})`;
    const input = `multi case ${index + 1}: phone ${phone}, email ${email}, HKID ${hkid}`;
    return makeCase({
      name: `multi pii ${index + 1}`,
      input,
      expectedText: `multi case ${index + 1}: phone [PHONE_1], email [EMAIL_2], HKID [HKID_3]`,
      expectedTypes: ["hong_kong_phone", "email", "hkid"],
      needsHumanReview: true
    });
  });
}

const allCases = [
  ...makePhoneCases(),
  ...makeEmailCases(),
  ...makeHkidCases(),
  ...makeCreditCardCases(),
  ...makeNonCreditCardCases(),
  ...makePaymentReferenceCases(),
  ...makeOrderReferenceCases(),
  ...makeBookingReferenceCases(),
  ...makeHintCases(),
  ...makeCleanCases(),
  ...makeMultiPiiCases()
];

module.exports = {
  allCases
};
