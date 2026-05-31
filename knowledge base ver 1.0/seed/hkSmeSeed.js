"use strict";

// Sample approved knowledge for four common HK SME archetypes.
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
    id: "beauty_identity",
    businessId: "beauty_demo",
    intent: "hours_location",
    question: "店名 / company identity",
    keywords: ["邊間公司", "邊間店", "店名", "公司名", "間舖", "間鋪", "舖名", "鋪名", "叫咩", "brand", "business name", "shop name", "store name", "你係"],
    tone: "luxury_beauty",
    answers: {
      "zh-HK": "我哋係 Solara Beauty（測試美容店），銅鑼灣店提供面部護理、皮膚狀態評估同部分脫毛護理。",
      en: "We are Solara Beauty, a test beauty salon. Our Causeway Bay branch offers facial treatments, skin assessments, and selected laser hair removal services.",
      mixed: "我哋係 Solara Beauty（測試美容店），Causeway Bay店提供facial、skin assessment同部分laser hair removal。"
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
    id: "beauty_service_list",
    businessId: "beauty_demo",
    intent: "service_info",
    question: "療程列表 / treatment list",
    keywords: ["list", "menu", "treatments", "services", "service menu", "treatment list", "有咩療程", "有咩服務", "有冇list", "有無list", "療程list", "服務list"],
    tone: "luxury_beauty",
    policyRef: "no_medical_claim",
    answers: {
      "zh-HK": "我哋測試美容店暫時有：免費皮膚狀態評估、首次體驗面部護理、皇牌保濕修護護理、面部護理五次套票，同腋下脫毛單次護理。實際適合邊個療程要先睇膚況；如果想睇收費，可以直接問我價目。",
      en: "Our test beauty salon currently offers: free skin assessments, first-trial facial treatments, signature hydrating repair facials, 5-session facial packages, and single-session underarm laser hair removal. Suitability depends on your skin condition; you can ask me for pricing details anytime.",
      mixed: "我哋暫時有free skin assessment、first-trial facial、signature hydrating repair facial、5-session facial package同underarm laser hair removal。實際適合邊個plan要睇膚況；想睇pricing可以直接問我。"
    }
  },
  {
    id: "beauty_service_recommendation",
    businessId: "beauty_demo",
    intent: "service_info",
    question: "療程推介 / treatment recommendation",
    keywords: ["推介", "推薦", "建議", "介紹", "療程建議", "有咩療程建議", "recommend", "recommendation", "facial", "plan"],
    tone: "luxury_beauty",
    policyRef: "no_medical_claim",
    answers: {
      "zh-HK": "如果你係第一次嚟，通常會建議先做免費皮膚狀態評估，再按膚況揀療程。想先體驗面部護理，可以考慮首次體驗面部護理；如果主要想定期保養，就可以了解皇牌保濕修護護理或五次套票。",
      en: "For first-time customers, we usually suggest starting with a free skin assessment, then choosing a treatment based on your skin condition. If you want to try a facial first, you can consider the first-trial facial. For regular maintenance, you can look at the signature hydrating repair facial or the 5-session package.",
      mixed: "如果第一次嚟，建議先做free skin assessment，再按膚況揀plan。想試facial可以考慮首次體驗；想regular保養可以睇皇牌保濕修護或5次package。"
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
  {
    id: "beauty_membership_points",
    businessId: "beauty_demo",
    intent: "membership",
    question: "會員積分 / member points",
    keywords: ["會員", "會員號碼", "會員編號", "積分", "免費療程", "換療程", "member", "membership", "member id", "points", "free treatment", "redeem"],
    tone: "luxury_beauty",
    requiresBackend: true,
    answers: {
      "zh-HK": "請提供8位數字會員編號，我可以幫你查會員積分。每完成1次療程會累積1分；每10分可換1次免費療程。",
      en: "Please share your 8-digit member ID and I can check your points. You earn 1 point for each completed treatment, and every 10 points can be redeemed for 1 free treatment.",
      mixed: "請提供8位member ID，我可以幫你check points。每做1次treatment有1 point；每10 points可換1次free treatment。"
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
  {
    id: "igshop_order_status",
    businessId: "igshop_demo",
    intent: "order_status",
    question: "訂單狀態 / order status",
    keywords: ["order", "status", "訂單", "單號", "物流", "tracking", "shipment", "courier", "IG"],
    tone: "casual_ig",
    requiresBackend: true,
    answers: {
      "zh-HK": "我可以幫你睇訂單狀態；為保障私隱，只會用已驗證嘅IG帳戶同訂單號查詢。",
      en: "I can check the order status using the verified IG account and order reference.",
      mixed: "我可以幫你check order status，會用verified IG account同order ref查。"
    }
  },
  {
    id: "igshop_payment_check",
    businessId: "igshop_demo",
    intent: "payment",
    question: "付款查詢 / payment check",
    keywords: ["FPS", "PayMe", "payment", "付款", "入數", "轉數快", "paid", "pay"],
    tone: "casual_ig",
    requiresBackend: true,
    answers: {
      "zh-HK": "我可以幫你查付款紀錄；為保障私隱，只會用已驗證帳戶同付款參考編號查詢。",
      en: "I can check the payment record using the verified account and payment reference.",
      mixed: "我可以幫你check payment record，會用verified account同payment ref查。"
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

  // ---------------- Prince Snooker (snooker hall, per-table booking) ----------------
  {
    id: "prince_hours",
    businessId: "prince_snooker",
    intent: "hours_location",
    question: "營業時間 / opening hours",
    keywords: ["幾點", "營業", "開門", "收工", "hours", "open", "close", "點開"],
    tone: "polite_professional",
    answers: {
      "zh-HK": "我哋每日11:00–23:30開門。",
      en: "We're open daily 11:00–23:30.",
      mixed: "我哋每日11:00–23:30 open。"
    }
  },
  {
    id: "prince_identity",
    businessId: "prince_snooker",
    intent: "hours_location",
    question: "店名 / identity",
    keywords: ["邊間", "店名", "公司名", "間舖", "間鋪", "叫咩", "brand", "shop name", "你係"],
    tone: "polite_professional",
    answers: {
      "zh-HK": "我哋係王子桌球，提供桌球枱租用服務。",
      en: "We are Prince Snooker, a snooker hall offering table rentals.",
      mixed: "我哋係王子桌球，提供snooker table rental。"
    }
  },
  {
    id: "prince_booking",
    businessId: "prince_snooker",
    intent: "booking",
    question: "預約桌球枱 / book a snooker table",
    keywords: ["book", "預約", "訂枱", "訂位", "想book", "想訂", "table", "枱", "snooker", "桌球"],
    tone: "polite_professional",
    answers: {
      "zh-HK": "請問你想book邊張枱、邊日同邊個時間？我哋會由真人同事再次確認後正式幫你留位。",
      en: "Which table, date, and time would you like to book? Our staff will confirm before holding the slot for you.",
      mixed: "請問你想book邊張枱、邊日同邊個時間？我哋會由staff confirm之後正式為你hold住。"
    }
  }
];
