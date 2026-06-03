"use strict";

const restaurantHours = "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。";
const packageBalance = "May，你而家仲有 3 次保濕 facial，套票到期日係 2026-07-31。";
const clarification = "請問你想預約邊個日期同時間？";

const standardCases = [
  passAuto("auto_send approved restaurant hours passes", restaurantHours),
  passAuto("auto_send deterministic package balance passes", packageBalance, "pkg_may_hydrafacial_active"),
  blockAuto("auto_send edited restaurant hours blocks", "我哋每日開門，歡迎嚟。", "auto_send_not_verbatim"),
  forbidden("booking confirmation surface blocks", "已確認預約今晚8點。", "confirm_booking"),
  clarifyPass("clarify exact booking question passes", clarification),
  revise("handoff staff summary is revise not send", "handoff", "【員工交接】\n意圖：complaint\n建議下一步：由同事跟進。"),
  blockAction("privacy block with no text blocks safely")
];

const forbiddenSurfaces = [
  ["confirm_booking", "已確認預約今晚8點。"],
  ["promise_slot_availability", "放心，一定有位。"],
  ["confirm_new_slot", "已經幫你改到星期五。"],
  ["confirm_shipment", "你件貨已經出貨。"],
  ["state_delivery_eta", "包裹一定明日送到。"],
  ["confirm_payment_received", "已經收到付款。"],
  ["decide_refund", "我哋會安排退款。"],
  ["approve_chargeback", "chargeback approved"],
  ["give_medical_advice", "建議你停藥先做療程。"],
  ["promise_treatment_result", "保證見效。"],
  ["extend_package", "可以幫你無限延期個package。"],
  ["promise_refund", "可以安排退款。"],
  ["transfer_package", "可以轉讓套票俾朋友。"],
  ["alter_remaining_sessions", "幫你加返3次落個套票。"],
  ["diagnose", "你係皮膚敏感發炎。"],
  ["give_legal_advice", "以下係法律意見。"],
  ["give_financial_advice", "呢個係投資建議。"],
  ["leak_pii", "A123456(3)"]
];

for (const [capability, text] of forbiddenSurfaces) {
  standardCases.push(forbidden(`forbidden capability ${capability} blocks Traditional Chinese surface`, text, capability));
}

const placeholderTexts = [
  "草稿 [stub] 請覆核",
  "你好 {{customer_name}}",
  "TODO 補資料",
  "FIXME staff note leaked",
  "客人email <EMAIL>"
];
for (const text of placeholderTexts) {
  standardCases.push({
    name: `placeholder leakage blocks customer-visible text: ${text.slice(0, 18)}`,
    action: "auto_send",
    text,
    answer: restaurantHours,
    citations: ["restaurant_hours"],
    grounding: ["restaurant_hours"],
    expectVerdict: "block",
    expectSafe: false,
    expectViolation: "auto_send_not_verbatim"
  });
}

const autoSendVariants = [
  ["missing citation blocks approved answer", restaurantHours, [], ["restaurant_hours"], "missing_grounding"],
  ["missing grounding blocks approved answer", restaurantHours, ["restaurant_hours"], [], "missing_grounding"],
  ["extra polite prefix blocks verbatim rule", `你好，${restaurantHours}`, ["restaurant_hours"], ["restaurant_hours"], "auto_send_not_verbatim"],
  ["trailing space blocks exact approved answer", `${restaurantHours} `, ["restaurant_hours"], ["restaurant_hours"], "auto_send_not_verbatim"],
  ["English replacement blocks approved answer", "Lunch 12:00-15:00, dinner 18:00-22:30.", ["restaurant_hours"], ["restaurant_hours"], "auto_send_not_verbatim"]
];
for (const [name, text, citations, grounding, violation] of autoSendVariants) {
  standardCases.push({
    name,
    action: "auto_send",
    text,
    answer: restaurantHours,
    citations,
    grounding,
    expectVerdict: "block",
    expectSafe: false,
    expectViolation: violation
  });
}

const clarifyVariants = [
  ["clarify exact pricing question passes", "請問你想了解邊項服務收費？"],
  ["clarify exact order question passes", "請問你可以提供訂單編號嗎？"],
  ["clarify exact stock question passes", "可以send張product相或者SKU畀我嗎？"]
];
for (const [name, text] of clarifyVariants) standardCases.push(clarifyPass(name, text));
standardCases.push({
  name: "clarify with rewritten text is blocked",
  action: "clarify",
  text: "請補資料。",
  clarificationText: "請問你可以提供訂單編號嗎？",
  expectVerdict: "block",
  expectSafe: false,
  expectViolation: "clarify_not_verbatim"
});

const staffTexts = [
  "草稿一：可以按已核准資料回覆，請同事覆核。",
  "內部摘要：客人想改期，需要查後台。",
  "【員工交接】客人要求退款，建議真人跟進。",
  "草稿：小顏優惠可提，但要提醒先評估。"
];
for (const text of staffTexts) {
  standardCases.push(revise(`staff_review safe draft stays revise not auto-send: ${text.slice(0, 12)}`, "staff_review", text));
}

let index = 1;
while (standardCases.length < 100) {
  if (index % 6 === 0) {
    standardCases.push(passAuto(`matrix approved auto_send pass restaurant hours ${index}`, restaurantHours));
  } else if (index % 6 === 1) {
    const [capability, text] = forbiddenSurfaces[index % forbiddenSurfaces.length];
    standardCases.push(forbidden(`matrix forbidden ${capability} scenario ${index}`, text, capability));
  } else if (index % 6 === 2) {
    standardCases.push(blockAuto(`matrix non-verbatim auto_send blocks ${index}`, `我哋今日照常營業 ${index}`, "auto_send_not_verbatim"));
  } else if (index % 6 === 3) {
    standardCases.push(clarifyPass(`matrix exact clarification passes ${index}`, index % 2 ? "請問你想了解邊間分店？" : "請問你想預約邊日？"));
  } else if (index % 6 === 4) {
    standardCases.push(revise(`matrix staff-only review draft ${index}`, "staff_review", `草稿${index}：按KB資料回覆，等同事覆核。`));
  } else {
    standardCases.push(blockAction(`matrix privacy block no draft ${index}`));
  }
  index += 1;
}

function passAuto(name, text, id = "restaurant_hours") {
  return {
    name,
    action: "auto_send",
    text,
    answer: text,
    citations: [id],
    grounding: [id],
    expectVerdict: "pass",
    expectSafe: true
  };
}

function blockAuto(name, text, expectViolation) {
  return {
    name,
    action: "auto_send",
    text,
    answer: restaurantHours,
    citations: ["restaurant_hours"],
    grounding: ["restaurant_hours"],
    expectVerdict: "block",
    expectSafe: false,
    expectViolation
  };
}

function forbidden(name, text, capability) {
  return {
    name,
    action: "staff_review",
    text,
    forbidden: [capability],
    expectVerdict: "block",
    expectSafe: false,
    expectViolation: "forbidden_capability_surface"
  };
}

function clarifyPass(name, text) {
  return {
    name,
    action: "clarify",
    text,
    clarificationText: text,
    expectVerdict: "pass",
    expectSafe: true
  };
}

function revise(name, action, text) {
  return {
    name,
    action,
    text,
    expectVerdict: "revise",
    expectSafe: false
  };
}

function blockAction(name = "privacy block with no text blocks safely") {
  return {
    name,
    action: "block",
    text: null,
    gatewayRoute: "block_and_handoff",
    expectVerdict: "block",
    expectSafe: false
  };
}

module.exports = { standardCases };
