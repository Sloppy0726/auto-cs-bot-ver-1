"use strict";

// Structured, loadable knowledge-base seed for the BrightPath education-centre demo.
// This is the machine-readable form of ./approved-faq.md: the bot may quote only
// facts that appear here. Anything missing (a price, an exact slot, a policy
// decision) must fall through to staff review — see ../business-rules.
//
// Shape matches "knowledge base ver 1.0/seed/hkSmeSeed.js" so it can be loaded
// straight into createKnowledgeBase({ entries: require(".../brightpath-kb-seed") }).
// businessId matches centre_id in ../demo-data/brightpath-centre.json and the
// brightpath-demo tenant registered in "business rules ver 1.0/src/archetypes.js".
//
// intent uses the CORE taxonomy (the values educationIntentAdapter maps onto),
// not the vertical product ids, because the KB is a core module.

module.exports = [
  // ---- hours_location: owner-approved, safe to auto-send ----
  {
    id: "brightpath_hours",
    businessId: "brightpath-demo",
    intent: "hours_location",
    question: "上課時間 / opening hours",
    keywords: ["幾點", "營業", "開門", "時間", "上課時間", "幾時開", "hours", "open", "close"],
    tone: "education",
    answers: {
      "zh-HK": "我哋上課時間：星期一至五 13:00–20:00，星期六 09:30–18:30，星期日休息。",
      en: "Our hours: Monday to Friday 13:00–20:00, Saturday 09:30–18:30, closed on Sunday.",
      mixed: "我哋hours：Mon–Fri 13:00–20:00，Sat 09:30–18:30，Sunday休息。"
    }
  },
  {
    id: "brightpath_address",
    businessId: "brightpath-demo",
    intent: "hours_location",
    question: "地址 / address",
    keywords: ["地址", "邊度", "點去", "位置", "address", "location", "where"],
    tone: "education",
    answers: {
      "zh-HK": "我哋地址（demo）：旺角 Learning Plaza 8 樓。",
      en: "Our address (demo only): 8/F, Learning Plaza, Mong Kok, Hong Kong.",
      mixed: "我哋地址（demo）：Mong Kok Learning Plaza 8/F。"
    }
  },

  // ---- service_info: course catalogue (education archetype routes to review) ----
  {
    id: "brightpath_courses",
    businessId: "brightpath-demo",
    intent: "service_info",
    question: "課程一覽 / course list",
    keywords: ["課程", "有咩班", "邊啲班", "科目", "course", "class", "subject", "programme"],
    tone: "education",
    answers: {
      "zh-HK": "我哋課程包括：K1–K3 幼稚園拼音班、P1–P3 初小英文閱讀班、P4–P6 高小英文寫作班、初小數學班，同升小面試班。",
      en: "Our courses: K1–K3 Phonics, P1–P3 English Reading, P4–P6 Writing, Junior Maths, and Interview Preparation.",
      mixed: "我哋課程有：K1–K3 Phonics、P1–P3 English Reading、P4–P6 Writing、Junior Maths同升小Interview Prep。"
    }
  },

  // ---- booking: trial lesson lead — backend/staff confirms the actual slot ----
  {
    id: "brightpath_trial",
    businessId: "brightpath-demo",
    intent: "booking",
    question: "試堂預約 / trial lesson",
    keywords: ["試堂", "試堂預約", "試", "trial", "trial lesson", "book", "預約", "留位"],
    tone: "education",
    requiresBackend: true,
    answers: {
      "zh-HK": "我哋可以幫你預約試堂。麻煩你留低家長稱呼、小朋友年級、想試嘅科目、方便嘅平日／週末時間同聯絡方法，實際時間同名額會由同事再確認。",
      en: "We can arrange a trial lesson. Please share the parent's name, the child's year group, the subject, a preferred weekday/weekend time, and a contact — staff will confirm the exact time and availability.",
      mixed: "我哋可以幫你book trial。麻煩留低家長稱呼、小朋友年級、想試嘅subject、方便嘅時間同contact，實際時間同名額會由staff confirm。"
    }
  },

  // ---- pricing: never invented; education archetype forces staff review ----
  {
    id: "brightpath_pricing",
    businessId: "brightpath-demo",
    intent: "pricing",
    question: "課程收費 / pricing",
    keywords: ["幾錢", "學費", "收費", "價錢", "package", "price", "fee", "cost"],
    tone: "education",
    answers: {
      "zh-HK": "課程收費會因應科目同年級而定，最新套餐價錢會由同事為你確認。可以話我知小朋友年級同想報嘅科目，我幫你交畀同事跟進。",
      en: "Course fees depend on the subject and year group, and staff will confirm the latest package price for you. Let me know the child's year group and subject and I'll pass it to staff.",
      mixed: "課程收費會睇subject同年級，最新package price會由staff confirm。話我知年級同subject，我幫你交畀同事跟進。"
    }
  },

  // ---- service_info: make-up class policy — staff confirms availability ----
  {
    id: "brightpath_makeup",
    businessId: "brightpath-demo",
    intent: "service_info",
    question: "補堂安排 / make-up class",
    keywords: ["補堂", "補課", "改時間", "makeup", "make-up", "missed class"],
    tone: "education",
    requiresBackend: true,
    answers: {
      "zh-HK": "補堂安排同名額需要由同事確認。可以留低你錯過嘅堂日期同想補堂嘅時間，我轉交同事跟進。",
      en: "Make-up class availability is confirmed by staff. Please share the missed class date and a preferred make-up time, and I'll pass it to staff.",
      mixed: "補堂安排同名額要由staff confirm。留低missed class嘅日期同想補堂嘅時間，我轉交同事跟進。"
    }
  },

  // ---- service_info: teacher background — kept generic, staff give specifics ----
  {
    id: "brightpath_teacher",
    businessId: "brightpath-demo",
    intent: "service_info",
    question: "師資 / teacher background",
    keywords: ["老師", "導師", "資歷", "師資", "teacher", "tutor", "qualification", "background"],
    tone: "education",
    answers: {
      "zh-HK": "我哋老師都係有教學經驗嘅導師，詳細師資資料會由同事為你介紹。",
      en: "Our teachers are experienced tutors; staff will share detailed qualifications with you.",
      mixed: "我哋老師都係有經驗嘅導師，詳細師資會由staff介紹。"
    }
  },

  // ---- service_info: never promise academic results (no_academic_guarantee) ----
  {
    id: "brightpath_no_academic_guarantee",
    businessId: "brightpath-demo",
    intent: "service_info",
    question: "成績保證 / academic outcome",
    keywords: ["保證", "包唔包", "一定", "成績", "考到", "升到", "面試", "guarantee", "guaranteed", "ensure", "result", "pass", "grade"],
    tone: "education",
    policyRef: "no_academic_guarantee",
    answers: {
      "zh-HK": "我哋會盡力幫小朋友進步，但唔可以保證考試成績或者面試結果。同事可以同你傾下適合小朋友嘅課程。",
      en: "We do our best to help children improve, but we cannot guarantee exam results or interview outcomes. Staff can discuss the right course for your child.",
      mixed: "我哋會盡力幫小朋友進步，但唔可以guarantee考試成績或者interview結果。Staff可以同你傾下啱小朋友嘅課程。"
    }
  }
];
