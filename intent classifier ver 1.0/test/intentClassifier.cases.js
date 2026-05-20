"use strict";

const standardCases = [
  {
    name: "beauty price and booking",
    input: "有冇underarm脫毛價錢？今晚7點有冇位？",
    primaryIntent: "pricing",
    secondaryIntents: ["booking", "service_info"],
    minConfidence: 0.9
  },
  {
    name: "simple booking",
    input: "我想book聽晚7點",
    primaryIntent: "booking",
    minConfidence: 0.86
  },
  {
    name: "reschedule facial booking",
    input: "我book咗facial但臨時嚟唔到，可以改期嗎？",
    primaryIntent: "reschedule",
    secondaryIntents: ["booking", "service_info"],
    minConfidence: 0.9
  },
  {
    name: "branch hours",
    input: "你哋旺角分店今日收幾點？",
    primaryIntent: "hours_location",
    minConfidence: 0.86
  },
  {
    name: "payment methods",
    input: "可以PayMe/FPS嗎？",
    primaryIntent: "payment",
    minConfidence: 0.8
  },
  {
    name: "laser aftercare",
    input: "做完laser之後可唔可以即刻做gym？",
    primaryIntent: "aftercare",
    secondaryIntents: ["service_info"],
    minConfidence: 0.86
  },
  {
    name: "health sensitive treatment question",
    input: "我皮膚敏感同有濕疹，做HIFU會唔會安全？",
    primaryIntent: "sensitive_health",
    secondaryIntents: ["service_info"],
    needsHumanReview: true,
    minConfidence: 0.9
  },
  {
    name: "refund complaint",
    input: "我要退款，你哋完全無覆我",
    primaryIntent: "complaint",
    needsHumanReview: true,
    minConfidence: 0.85
  },
  {
    name: "child data",
    input: "要唔要俾小朋友全名同學校資料先報名？",
    primaryIntent: "child_data",
    needsHumanReview: true,
    minConfidence: 0.85
  },
  {
    name: "phone plus price",
    input: "我電話係9123 4567，想問underarm幾錢",
    primaryIntent: "pricing",
    secondaryIntents: ["service_info"],
    minConfidence: 0.88,
    expectedPlaceholders: ["[PHONE_1]"]
  },
  {
    name: "english price",
    input: "How much is underarm laser trial?",
    primaryIntent: "pricing",
    secondaryIntents: ["service_info"],
    language: "en",
    minConfidence: 0.9
  },
  {
    name: "english service cost",
    input: "What is the cost for full leg laser?",
    primaryIntent: "pricing",
    secondaryIntents: ["service_info"],
    language: "en",
    minConfidence: 0.9
  },
  {
    name: "english appointment availability",
    input: "Do you have any available slots tomorrow evening?",
    primaryIntent: "booking",
    language: "en",
    minConfidence: 0.9
  },
  {
    name: "english reschedule",
    input: "I cannot come tonight, can I change my appointment?",
    primaryIntent: "reschedule",
    secondaryIntents: ["booking"],
    language: "en",
    minConfidence: 0.9
  },
  {
    name: "english payment deposit",
    input: "Do you accept Visa or cash for the deposit?",
    primaryIntent: "payment",
    language: "en",
    minConfidence: 0.8
  },
  {
    name: "english aftercare",
    input: "Can I exercise after treatment or take a hot bath?",
    primaryIntent: "aftercare",
    secondaryIntents: ["service_info"],
    language: "en",
    minConfidence: 0.86
  },
  {
    name: "english human request",
    input: "Can I speak to a real person from customer service?",
    primaryIntent: "human_request",
    secondaryIntents: ["service_info"],
    needsHumanReview: true,
    language: "en",
    minConfidence: 0.86
  },
  {
    name: "mixed english cantonese booking",
    input: "Can I book facial 聽晚？",
    primaryIntent: "booking",
    secondaryIntents: ["service_info"],
    language: "mixed",
    minConfidence: 0.9
  },
  {
    name: "service duration",
    input: "脫毛療程通常需時幾耐？",
    primaryIntent: "service_info",
    minConfidence: 0.74
  },
  {
    name: "location english",
    input: "Where is your Causeway Bay branch?",
    primaryIntent: "hours_location",
    language: "en",
    minConfidence: 0.86
  },
  {
    name: "delivery status",
    input: "我個訂單幾時送到？",
    primaryIntent: "order_status",
    minConfidence: 0.8
  },
  {
    name: "human staff request",
    input: "可以搵真人同事覆我嗎？",
    primaryIntent: "human_request",
    needsHumanReview: true,
    minConfidence: 0.86
  }
  ,
  { name: "cantonese package count", input: "我想問個package仲有幾多次", primaryIntent: "pricing", minConfidence: 0.88 },
  { name: "cantonese two person offer", input: "有冇二人同行優惠？", primaryIntent: "pricing", minConfidence: 0.88 },
  { name: "cantonese walk in availability", input: "今日可以walk in嗎？", primaryIntent: "booking", minConfidence: 0.88 },
  { name: "cantonese nearest mtr", input: "你哋近邊個地鐵站出口？", primaryIntent: "hours_location", minConfidence: 0.86 },
  { name: "cantonese business identity", input: "你係邊間公司？", primaryIntent: "hours_location", minConfidence: 0.86 },
  { name: "cantonese booking deposit", input: "第一次預約要唔要俾deposit？", primaryIntent: "booking", secondaryIntents: ["payment"], minConfidence: 0.9 },
  { name: "cantonese order tracking", input: "我想查訂單tracking", primaryIntent: "order_status", minConfidence: 0.82 },
  { name: "cantonese complaint no reply", input: "你哋成日唔覆，我想投訴", primaryIntent: "complaint", needsHumanReview: true, minConfidence: 0.9 },
  { name: "english promotion", input: "Any promotion for first-time customers?", primaryIntent: "pricing", language: "en", minConfidence: 0.88 },
  { name: "english package", input: "Do you have a package offer for facial?", primaryIntent: "pricing", secondaryIntents: ["service_info"], language: "en", minConfidence: 0.9 },
  { name: "english booking reserve slot", input: "Can you reserve a slot for me this Saturday?", primaryIntent: "booking", language: "en", minConfidence: 0.9 },
  { name: "english nearest mtr", input: "Which MTR exit is nearest to your shop?", primaryIntent: "hours_location", language: "en", minConfidence: 0.86 },
  { name: "english opening", input: "Are you open on Sunday?", primaryIntent: "hours_location", language: "en", minConfidence: 0.86 },
  { name: "english post treatment sun", input: "Can I get sun exposure after laser?", primaryIntent: "aftercare", secondaryIntents: ["service_info"], language: "en", minConfidence: 0.86 },
  { name: "english delivery tracking", input: "Can you check my delivery tracking?", primaryIntent: "order_status", language: "en", minConfidence: 0.82 },
  { name: "english bad service complaint", input: "Bad service, I want to complain", primaryIntent: "complaint", secondaryIntents: ["service_info"], needsHumanReview: true, language: "en", minConfidence: 0.9 },
  { name: "english medication health risk", input: "I am on medication, can I do HIFU?", primaryIntent: "sensitive_health", secondaryIntents: ["service_info"], needsHumanReview: true, language: "en", minConfidence: 0.9 },
  { name: "english student number child data", input: "Do you need my child\x27s student number?", primaryIntent: "child_data", needsHumanReview: true, language: "en", minConfidence: 0.85 },
  { name: "mixed price booking", input: "underarm trial 幾錢？聽晚有slot嗎？", primaryIntent: "pricing", secondaryIntents: ["booking", "service_info"], language: "mixed", minConfidence: 0.9 },
  { name: "mixed payment", input: "可以用credit card俾deposit嗎？", primaryIntent: "payment", language: "mixed", minConfidence: 0.8 },
  { name: "mixed reschedule", input: "我cannot come tonight，可以改booking嗎？", primaryIntent: "reschedule", secondaryIntents: ["booking"], language: "mixed", minConfidence: 0.9 },
  { name: "mixed human request", input: "可唔可以叫staff覆我？", primaryIntent: "human_request", needsHumanReview: true, language: "mixed", minConfidence: 0.86 },
  {"name":"cantonese price full leg","input":"full leg laser幾錢？","primaryIntent":"pricing","secondaryIntents":["service_info"],"language":"mixed","minConfidence":0.9},
  {"name":"cantonese trial price","input":"第一次試做價錢係幾多？","primaryIntent":"pricing","minConfidence":0.88},
  {"name":"cantonese package offer","input":"facial package有冇優惠？","primaryIntent":"pricing","secondaryIntents":["service_info"],"language":"mixed","minConfidence":0.9},
  {"name":"cantonese promotion","input":"而家有冇promotion？","primaryIntent":"pricing","language":"mixed","minConfidence":0.88},
  {"name":"cantonese service fee","input":"HIFU收費點計？","primaryIntent":"pricing","secondaryIntents":["service_info"],"language":"mixed","minConfidence":0.9},
  {"name":"english facial rate","input":"What are your facial rates?","primaryIntent":"pricing","secondaryIntents":["service_info"],"language":"en","minConfidence":0.9},
  {"name":"english discount","input":"Is there any discount for two people?","primaryIntent":"pricing","language":"en","minConfidence":0.88},
  {"name":"english package pricing","input":"Can you send me package pricing?","primaryIntent":"pricing","language":"en","minConfidence":0.9},
  {"name":"english service charge","input":"What do you charge for HIFU?","primaryIntent":"pricing","secondaryIntents":["service_info"],"language":"en","minConfidence":0.9},
  {"name":"mixed price discount","input":"laser有無discount offer？","primaryIntent":"pricing","secondaryIntents":["service_info"],"language":"mixed","minConfidence":0.9},
  {"name":"cantonese tomorrow booking","input":"聽日有冇位做facial？","primaryIntent":"booking","secondaryIntents":["service_info"],"minConfidence":0.9},
  {"name":"cantonese available times booking","input":"預約首次 你聽日有咩時間？","primaryIntent":"booking","minConfidence":0.9},
  {"name":"cantonese same day slot","input":"今日仲有冇slot？","primaryIntent":"booking","language":"mixed","minConfidence":0.88},
  {"name":"cantonese reserve appointment","input":"可以幫我hold個appointment嗎？","primaryIntent":"booking","language":"mixed","minConfidence":0.9},
  {"name":"cantonese schedule booking","input":"想schedule下星期六做laser","primaryIntent":"booking","secondaryIntents":["service_info"],"language":"mixed","minConfidence":0.9},
  {"name":"cantonese appointment availability","input":"星期日appointment availability點？","primaryIntent":"booking","language":"mixed","minConfidence":0.9},
  {"name":"english book laser","input":"I want to book laser next week","primaryIntent":"booking","secondaryIntents":["service_info"],"language":"en","minConfidence":0.9},
  {"name":"english schedule facial","input":"Can I schedule a facial appointment?","primaryIntent":"booking","secondaryIntents":["service_info"],"language":"en","minConfidence":0.9},
  {"name":"english hold slot","input":"Please hold a slot for tomorrow","primaryIntent":"booking","language":"en","minConfidence":0.9},
  {"name":"english appointment available","input":"Is there any appointment available tonight?","primaryIntent":"booking","language":"en","minConfidence":0.9},
  {"name":"mixed reserve booking","input":"想reserve聽晚slot","primaryIntent":"booking","language":"mixed","minConfidence":0.9},
  {"name":"cantonese move appointment","input":"可以幫我改時間嗎？","primaryIntent":"reschedule","minConfidence":0.9},
  {"name":"cantonese reschedule booking","input":"想reschedule我個booking","primaryIntent":"reschedule","secondaryIntents":["booking"],"language":"mixed","minConfidence":0.9},
  {"name":"cantonese cannot come","input":"我今晚嚟唔到，可以改期？","primaryIntent":"reschedule","minConfidence":0.9},
  {"name":"english move appointment","input":"Can I move my appointment to Friday?","primaryIntent":"reschedule","secondaryIntents":["booking"],"language":"en","minConfidence":0.9},
  {"name":"english change booking","input":"Need to change my booking time","primaryIntent":"reschedule","secondaryIntents":["booking"],"language":"en","minConfidence":0.9},
  {"name":"cantonese branch address","input":"尖沙咀分店地址係邊？","primaryIntent":"hours_location","minConfidence":0.86},
  {"name":"cantonese opening hours","input":"星期日營業時間係點？","primaryIntent":"hours_location","minConfidence":0.86},
  {"name":"cantonese close time","input":"今日幾點close？","primaryIntent":"hours_location","language":"mixed","minConfidence":0.86},
  {"name":"cantonese directions","input":"銅鑼灣店點去？有冇directions？","primaryIntent":"hours_location","language":"mixed","minConfidence":0.86},
  {"name":"english address","input":"What is your address?","primaryIntent":"hours_location","language":"en","minConfidence":0.86},
  {"name":"english closing time","input":"What are your closing hours?","primaryIntent":"hours_location","language":"en","minConfidence":0.86},
  {"name":"english directions","input":"Can you give me directions to the branch?","primaryIntent":"hours_location","language":"en","minConfidence":0.86},
  {"name":"cantonese service included","input":"facial包括啲咩？","primaryIntent":"service_info","language":"mixed","minConfidence":0.74},
  {"name":"cantonese treatment effect","input":"HIFU效果通常維持幾耐？","primaryIntent":"service_info","language":"mixed","minConfidence":0.74},
  {"name":"cantonese treatment time","input":"underarm療程需時幾耐？","primaryIntent":"service_info","language":"mixed","minConfidence":0.74},
  {"name":"english service details","input":"What does the facial treatment include?","primaryIntent":"service_info","language":"en","minConfidence":0.74},
  {"name":"english treatment duration","input":"How long does the laser treatment take?","primaryIntent":"service_info","language":"en","minConfidence":0.74},
  {"name":"english hifu effect","input":"How long does HIFU effect last?","primaryIntent":"service_info","language":"en","minConfidence":0.74},
  {"name":"cantonese aftercare sauna","input":"做完之後可唔可以去桑拿？","primaryIntent":"aftercare","minConfidence":0.86},
  {"name":"cantonese aftercare sun","input":"laser之後曬太陽得唔得？","primaryIntent":"aftercare","secondaryIntents":["service_info"],"language":"mixed","minConfidence":0.86},
  {"name":"english aftercare sauna","input":"Can I use sauna after treatment?","primaryIntent":"aftercare","secondaryIntents":["service_info"],"language":"en","minConfidence":0.86},
  {"name":"english aftercare exfoliation","input":"Can I do exfoliation after laser?","primaryIntent":"aftercare","secondaryIntents":["service_info"],"language":"en","minConfidence":0.86},
  {"name":"cantonese octopus payment","input":"你哋收唔收八達通？","primaryIntent":"payment","minConfidence":0.8},
  {"name":"cantonese bank transfer","input":"可以bank transfer俾deposit嗎？","primaryIntent":"payment","language":"mixed","minConfidence":0.8},
  {"name":"english payme payment","input":"Can I pay by PayMe?","primaryIntent":"payment","language":"en","minConfidence":0.8},
  {"name":"english mastercard payment","input":"Do you take Mastercard?","primaryIntent":"payment","language":"en","minConfidence":0.8},
  {"name":"cantonese order delivery","input":"訂單幾時delivery？","primaryIntent":"order_status","language":"mixed","minConfidence":0.82},
  {"name":"cantonese parcel status","input":"我個parcel出貨未？","primaryIntent":"order_status","language":"mixed","minConfidence":0.82},
  {"name":"english courier status","input":"Can you check courier status?","primaryIntent":"order_status","language":"en","minConfidence":0.82},
  {"name":"english shipment tracking","input":"Where is my shipment tracking?","primaryIntent":"order_status","language":"en","minConfidence":0.82},
  {"name":"cantonese angry complaint","input":"我好嬲，想投訴你哋服務","primaryIntent":"complaint","secondaryIntents":["service_info"],"needsHumanReview":true,"minConfidence":0.9},
  {"name":"cantonese abusive bot complaint","input":"你地個bot咁廢","primaryIntent":"complaint","needsHumanReview":true,"minConfidence":0.9},
  {"name":"cantonese refund complaint","input":"服務唔滿意，可以退款嗎？","primaryIntent":"complaint","secondaryIntents":["service_info"],"needsHumanReview":true,"minConfidence":0.85},
  {"name":"english angry complaint","input":"I am angry about the bad service","primaryIntent":"complaint","secondaryIntents":["service_info"],"needsHumanReview":true,"language":"en","minConfidence":0.9},
  {"name":"english refund request","input":"I want a refund for this treatment","primaryIntent":"complaint","secondaryIntents":["service_info"],"needsHumanReview":true,"language":"en","minConfidence":0.85},
  {"name":"cantonese doctor risk","input":"醫生話我皮膚敏感，做laser安全嗎？","primaryIntent":"sensitive_health","secondaryIntents":["service_info"],"needsHumanReview":true,"minConfidence":0.9},
  {"name":"english pregnancy risk","input":"I am pregnant, can I do laser?","primaryIntent":"sensitive_health","secondaryIntents":["service_info"],"needsHumanReview":true,"language":"en","minConfidence":0.9},
  {"name":"english breastfeeding risk","input":"I am breastfeeding, is HIFU okay?","primaryIntent":"sensitive_health","secondaryIntents":["service_info"],"needsHumanReview":true,"language":"en","minConfidence":0.9},
  {"name":"cantonese child school data","input":"報名前要唔要講學校名？","primaryIntent":"child_data","needsHumanReview":true,"minConfidence":0.85},
  {"name":"english child birth date","input":"Do you need my child date of birth?","primaryIntent":"child_data","needsHumanReview":true,"language":"en","minConfidence":0.85},
  {"name":"english representative request","input":"I want to talk to a representative","primaryIntent":"human_request","needsHumanReview":true,"language":"en","minConfidence":0.86}
];


const edgeCases = [
  { name: "credit card blocks before normal LLM flow", input: "我想用卡 4111 1111 1111 1111 俾deposit", expectedRoute: "block_and_handoff", primaryIntent: "payment", riskLevel: "blocked", needsHumanReview: true, source: "privacy_gateway" },
  { name: "HKID review before LLM still gets deterministic pricing intent", input: "HKID A123456(3) 想問underarm幾錢", expectedRoute: "review_before_llm", primaryIntent: "pricing", secondaryIntents: ["service_info"], needsHumanReview: true, source: "deterministic" },
  { name: "medical hint plus booking stays health-sensitive", input: "我懷孕但想book laser，聽晚得唔得？", expectedRoute: "review_before_llm", primaryIntent: "sensitive_health", secondaryIntents: ["booking", "service_info"], needsHumanReview: true, minConfidence: 0.9 },
  { name: "payment dispute is complaint even with order language", input: "order HK12345 你哋話未收到款，我想退款", expectedRoute: "review_before_llm", primaryIntent: "complaint", secondaryIntents: ["payment", "order_status"], needsHumanReview: true, minConfidence: 0.85 },
  { name: "plain today hours should not become booking", input: "今日開唔開？幾點收？", primaryIntent: "hours_location", secondaryIntents: [], needsHumanReview: false },
  { name: "english health risk", input: "I have a rash and swelling, is the treatment safe?", expectedRoute: "review_before_llm", primaryIntent: "sensitive_health", secondaryIntents: ["service_info"], needsHumanReview: true, minConfidence: 0.9 },
  { name: "english overcharged complaint", input: "I was overcharged and nobody replied", expectedRoute: "review_before_llm", primaryIntent: "complaint", secondaryIntents: ["payment"], needsHumanReview: true, minConfidence: 0.85 },
  { name: "english child data", input: "Do you need my child's full name and school name?", expectedRoute: "review_before_llm", primaryIntent: "child_data", needsHumanReview: true, minConfidence: 0.85 },
  { name: "english delivery status", input: "Has my order shipped by courier yet?", primaryIntent: "order_status", needsHumanReview: false, minConfidence: 0.8 },
  { name: "english opening hours", input: "What time do you close today?", primaryIntent: "hours_location", needsHumanReview: false, minConfidence: 0.86 },
  { name: "vague greeting remains general", input: "hello 想問下", primaryIntent: "general", secondaryIntents: [], source: "deterministic", maxConfidence: 0.5 },
  { name: "address medium risk keeps location intent", input: "你哋地址係咪ABC Building 5/F附近？", primaryIntent: "hours_location", riskLevel: "medium", needsHumanReview: false },
  { name: "email placeholder does not change booking intent", input: "email me@example.com 想book facial", primaryIntent: "booking", secondaryIntents: ["service_info"], needsHumanReview: false },
  { name: "phone placeholder keeps english pricing intent", input: "My phone is 9123 4567, what is the facial price?", primaryIntent: "pricing", secondaryIntents: ["service_info"], needsHumanReview: false, language: "en", expectedPlaceholders: ["[PHONE_1]"] },
  { name: "email placeholder keeps english human request", input: "Please email me@example.com and have a real person reply", primaryIntent: "human_request", needsHumanReview: true, language: "en", expectedPlaceholders: ["[EMAIL_1]"] },
  { name: "booking reference redacted with option", input: "booking BK12345 can I reschedule?", gatewayOptions: { filterOptions: { preserveBookingRefs: false } }, primaryIntent: "reschedule", secondaryIntents: ["booking"], needsHumanReview: false, language: "en", expectedPlaceholders: ["[BOOKING_REF_1]"] },
  { name: "order reference preserved by default", input: "order HK12345 delivery status please", primaryIntent: "order_status", needsHumanReview: false, language: "en" },
  { name: "home address medium risk remains location", input: "Is your shop near my home address in Central?", primaryIntent: "hours_location", riskLevel: "medium", needsHumanReview: false, language: "en" },
  { name: "english payment dispute with tracking", input: "I paid but you said payment not found for order HK99999", expectedRoute: "review_before_llm", primaryIntent: "complaint", secondaryIntents: ["payment", "order_status"], needsHumanReview: true, language: "en", minConfidence: 0.85 },
  { name: "mixed child data and booking", input: "要唔要提供kid's full name先book trial class？", expectedRoute: "review_before_llm", primaryIntent: "child_data", secondaryIntents: ["pricing", "booking"], needsHumanReview: true, language: "mixed", minConfidence: 0.85 }
];

module.exports = {
  standardCases,
  edgeCases
};
