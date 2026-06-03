"use strict";

// Sample approved knowledge for four common locale SME archetypes.
// Each entry must be reviewed by the business owner before going live.
// IDs are stable so AI replies can cite them ("from kb: beauty_pricing_facial").

module.exports = [
  // ---------------- Beauty clinic / facial centre ----------------
  {
    id: "beauty_hours",
    businessId: "beauty_demo",
    intent: "hours_location",
    question: "營業時間 / opening hours",
    keywords: ["幾點", "營業", "開門", "收工", "hours", "open", "close"],
    tone: "luxury_beauty",
    answers: {
      "zh-HK": "我哋銅鑼灣店每日11:00–21:00，星期日11:00–19:00，公眾假期休息。",
      en: "Our Causeway Bay branch is open daily 11:00–21:00, Sundays 11:00–19:00, closed on public holidays.",
      mixed: "我哋Causeway Bay店每日11:00–21:00，Sunday到19:00，PH休息。"
    }
  },
  {
    id: "beauty_pricing_facial",
    businessId: "beauty_demo",
    intent: "pricing",
    question: "面部護理價錢 / facial pricing",
    keywords: ["facial", "面部", "護理", "價錢", "幾錢", "price", "套票"],
    tone: "luxury_beauty",
    answers: {
      "zh-HK": "基礎面部護理單次 HK$680，5次套票 HK$2,980。首次體驗價 HK$380。",
      en: "Signature facial: HK$680 single session, HK$2,980 for a 5-session package. First-trial price HK$380.",
      mixed: "Signature facial單次$680，5次package $2,980，首次trial $380。"
    }
  },
  {
    id: "beauty_no_medical_claim",
    businessId: "beauty_demo",
    intent: "service_info",
    question: "療程效果 / treatment effect",
    keywords: ["效果", "好唔好", "有冇副作用", "medical", "side effect", "見效"],
    tone: "luxury_beauty",
    policyRef: "no_medical_claim",
    answers: {
      "zh-HK": "每位客人膚質唔同，效果因人而異。我哋會安排美容師同你做免費膚質評估，再建議啱你嘅療程。",
      en: "Results vary by skin type. Our therapist will do a free skin assessment and recommend a suitable plan.",
      mixed: "Results因人而異，我哋會幫你做free skin assessment再recommend啱你嘅plan。"
    }
  },
  {
    id: "beauty_booking_policy",
    businessId: "beauty_demo",
    intent: "booking",
    question: "點樣預約 / how to book",
    keywords: ["book", "預約", "有冇位", "appointment", "slot"],
    tone: "luxury_beauty",
    requiresBackend: true,
    policyRef: "deposit_required",
    answers: {
      "zh-HK": "我哋幫你check下時段，預約成功後需付HK$200留位費，會喺療程當日扣返。",
      en: "Let me check availability for you. A HK$200 deposit is required to secure the slot, deductible from your treatment fee.",
      mixed: "Let me check下個slot，confirm之後要$200 deposit，做嘅時候deduct返。"
    }
  },

  // ---------------- Restaurant / cafe ----------------
  {
    id: "restaurant_hours",
    businessId: "restaurant_demo",
    intent: "hours_location",
    question: "營業時間",
    keywords: ["幾點", "營業", "開門", "hours", "open"],
    tone: "friendly_local",
    answers: {
      "zh-HK": "我哋每日12:00–15:00 lunch，18:00–22:30 dinner，星期一休息。",
      en: "Lunch 12:00–15:00, dinner 18:00–22:30, closed on Mondays.",
      mixed: "Lunch 12–3, dinner 6–10:30, Mon休息。"
    }
  },
  {
    id: "restaurant_booking",
    businessId: "restaurant_demo",
    intent: "booking",
    question: "訂位",
    keywords: ["有冇位", "book", "訂位", "table", "reserve"],
    tone: "friendly_local",
    requiresBackend: true,
    answers: {
      "zh-HK": "麻煩你話我知日期、時間同人數，我幫你睇下有冇位。8點之後位比較緊，建議早少少。",
      en: "Please share the date, time, and headcount and I'll check availability. After 8pm gets busy, earlier is easier.",
      mixed: "話低date / time / 幾位，我check下。After 8pm比較full。"
    }
  },

  // ---------------- IG shop ----------------
  {
    id: "igshop_stock",
    businessId: "igshop_demo",
    intent: "service_info",
    question: "現貨",
    keywords: ["現貨", "有冇貨", "stock", "available"],
    tone: "casual_ig",
    requiresBackend: true,
    answers: {
      "zh-HK": "我幫你check下倉，可唔可以畀張product 圖或者款號我？",
      en: "Let me check stock — could you send the product photo or SKU?",
      mixed: "send張圖或SKU我，幫你check stock～"
    }
  },
  {
    id: "igshop_shipping",
    businessId: "igshop_demo",
    intent: "service_info",
    question: "運費",
    keywords: ["順豐", "包郵", "運費", "sf", "shipping", "delivery"],
    tone: "casual_ig",
    answers: {
      "zh-HK": "滿HK$500免順豐順便智能櫃，未滿就$30運費。工商/住宅地址另外報價。",
      en: "Free SF locker shipping for orders over HK$500, otherwise HK$30. Door-to-door quoted separately.",
      mixed: "滿$500免SF locker，否則$30，door-to-door另計。"
    }
  },

  // ---------------- Education centre ----------------
  {
    id: "edu_p3_english",
    businessId: "edu_demo",
    intent: "service_info",
    question: "P3英文班",
    keywords: ["p3", "小三", "英文", "english", "小朋友"],
    tone: "education",
    answers: {
      "zh-HK": "我哋P3英文班分基礎班同enhance班，每週一堂，每堂75分鐘，4–6人小班。可以安排免費評估堂睇下啱邊個level。",
      en: "Our P3 English programme has Foundation and Enhance tiers, 75-min weekly lessons, 4–6 students per class. We offer a free assessment lesson.",
      mixed: "P3有Foundation同Enhance班，weekly 75min，4–6人小班，可以book free assessment。"
    }
  },
  {
    id: "edu_pricing",
    businessId: "edu_demo",
    intent: "pricing",
    question: "課程收費",
    keywords: ["幾錢", "學費", "收費", "price", "fee"],
    tone: "education",
    answers: {
      "zh-HK": "P3英文班每月HK$1,280（4堂），一次過報10堂送1堂。教材費另計HK$120/期。",
      en: "P3 English: HK$1,280/month (4 lessons). Pay for 10 lessons, get 1 free. Materials HK$120/term.",
      mixed: "P3 English $1,280/月（4堂），10堂送1堂，教材$120/term。"
    }
  },

  // ---------------- Solara Bazi ----------------
  {
    id: "solara_bazi_hours",
    businessId: "solara_bazi",
    intent: "hours_location",
    question: "營業時間 / opening hours",
    keywords: ["營業", "開舖", "開門", "24小時", "二十四小時", "hours", "open"],
    tone: "mystic_practical",
    answers: {
      "zh-HK": "Solara Bazi 24小時接受查詢，你可以隨時留言。",
      en: "Solara Bazi accepts enquiries 24 hours a day. You can message us anytime.",
      mixed: "Solara Bazi 24小時accept enquiry，你可以anytime留言。"
    }
  },
  {
    id: "solara_bazi_pricing",
    businessId: "solara_bazi",
    intent: "pricing",
    question: "八字服務價目 / BaZi pricing",
    keywords: ["價目", "價錢", "收費", "幾錢", "幾多錢", "八字", "bazi", "一個問題", "流年", "大運", "詳細批", "price", "pricing"],
    tone: "mystic_practical",
    answers: {
      "zh-HK": "Solara Bazi 價目：HK$100 一個問題、HK$300 一個流年、HK$500 一個大運、HK$1,000 詳細批。",
      en: "Solara Bazi pricing: HK$100 for one question, HK$300 for annual luck reading, HK$500 for 10-year luck cycle reading, HK$1,000 for a detailed reading.",
      mixed: "Solara Bazi價目：$100一個問題、$300一個流年、$500一個大運、$1,000詳細批。"
    }
  },
  {
    id: "solara_bazi_intake",
    businessId: "solara_bazi",
    intent: "service_info",
    question: "開始批八字需要咩資料 / intake details",
    keywords: ["八字", "命理", "算命", "流年", "大運", "詳細批", "問事", "問問題", "出生", "出生時間", "出生地", "需要咩資料", "點開始", "bazi"],
    tone: "mystic_practical",
    answers: {
      "zh-HK": "如想開始，請先講你想問邊款服務，並準備出生年月日、出生時間、出生地，同你想問嘅主題。出生時間唔準確都接受，不過最好可以準確至分鐘。",
      en: "To start, please choose the service and prepare your date of birth, birth time, birthplace, and the topic you want to ask about. An uncertain birth time is accepted, but minute-level accuracy is preferred.",
      mixed: "想開始可以先講想問邊款service，並準備出生年月日、出生時間、出生地，同想問嘅topic。出生時間唔準確都接受，不過最好準確至分鐘。"
    }
  },
  {
    id: "solara_bazi_payment_methods",
    businessId: "solara_bazi",
    intent: "payment",
    question: "付款方法 / payment methods",
    keywords: ["付款", "點付款", "收錢", "點收錢", "付款方法", "fps", "轉數快", "payme", "alipay", "支付寶", "payment", "pay"],
    tone: "mystic_practical",
    safeAutoSend: true,
    answers: {
      "zh-HK": "可以用 FPS、PayMe 或 Alipay 付款。",
      en: "Payment can be made by FPS, PayMe, or Alipay.",
      mixed: "可以用 FPS、PayMe 或 Alipay 付款。"
    }
  },
  {
    id: "solara_bazi_delivery_format",
    businessId: "solara_bazi",
    intent: "service_info",
    question: "交付時間同形式 / delivery time and format",
    keywords: ["交付", "即日", "幾時有", "幾耐", "文字", "語音", "通話", "形式", "format", "delivery", "same day", "voice", "call"],
    tone: "mystic_practical",
    answers: {
      "zh-HK": "付款後即日交付。詳細批可以用文字、語音或通話形式安排。",
      en: "Delivery is same-day after payment. Detailed readings can be delivered by text, voice message, or call.",
      mixed: "付款後即日交付。詳細批可以用文字、語音或通話形式安排。"
    }
  },
  {
    id: "solara_bazi_scope",
    businessId: "solara_bazi",
    intent: "service_info",
    question: "八字服務範圍 / service scope",
    keywords: ["包括", "睇咩", "問咩", "有咩可以問", "可以問咩", "感情", "事業", "財運", "運勢", "流年", "大運", "詳細批", "scope"],
    tone: "mystic_practical",
    answers: {
      "zh-HK": "可以問感情、事業、財運、個人方向、流年重點或大運走勢。命理分析只作自我了解同參考，唔會保證結果，亦唔代替法律、醫療或投資意見。",
      en: "You can ask about relationships, career, wealth themes, personal direction, annual luck, or 10-year luck cycles. BaZi readings are for self-understanding and reference only, not legal, medical, or investment advice.",
      mixed: "可以問感情、事業、財運、personal direction、流年重點或大運走勢。命理分析只作參考，唔保證結果，亦唔代替legal / medical / investment advice。"
    }
  },
  {
    id: "solara_bazi_restricted_topics",
    businessId: "solara_bazi",
    intent: "service_info",
    question: "不接問題 / restricted topics",
    keywords: ["法律", "官司", "合約", "犯法", "告人", "legal", "lawsuit", "contract"],
    tone: "mystic_practical",
    answers: {
      "zh-HK": "法律相關個案唔接。如果係感情、事業、財運、流年、大運或個人方向，可以再講你想問嘅主題。",
      en: "Legal-related cases are not accepted. For relationships, career, wealth themes, annual luck, 10-year luck cycles, or personal direction, please share the topic you want to ask about.",
      mixed: "法律相關個案唔接。如果係感情、事業、財運、流年、大運或personal direction，可以再講你想問嘅topic。"
    }
  }
];
