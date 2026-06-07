"use strict";

// Friendly Chinese command mapping so the owner never types a tool name.
// Three ladders consume this: keyword aliases, the numbered menu, and the
// natural-language fallback (which routes via the toolkit's smb-router).

// Keyword aliases: if the owner's message contains any keyword, run the tool.
// Ordered most-specific first; the resolver takes the first match.
const ALIASES = [
  { keywords: ["追數", "追單", "追款", "未收錢", "欠款", "未付"], tool: "invoice-chase" },
  { keywords: ["現金流", "現金"], tool: "cash-flow-snapshot" },
  { keywords: ["毛利", "利潤", "賺幾多", "賺咗"], tool: "margin-analyzer" },
  { keywords: ["今日生意", "生意", "營業額", "損益", "業績", "數字"], tool: "business-pulse" },
  { keywords: ["埋數", "埋月", "月結"], tool: "close-month" },
  { keywords: ["出糧", "糧"], tool: "plan-payroll" },
  { keywords: ["報稅", "稅"], tool: "tax-prep" },
  { keywords: ["價錢", "報價", "查價", "貨品", "價"], tool: "price-check" },
  { keywords: ["投訴", "客訴", "唔滿意"], tool: "handle-complaint" },
  { keywords: ["新客", "查詢", "潛在客", "leads", "lead"], tool: "lead-triage" },
  { keywords: ["客戶", "客人", "會員"], tool: "customer-pulse" },
  { keywords: ["跟進", "致電", "打電話", "call list"], tool: "call-list" },
  { keywords: ["宣傳", "推廣", "campaign", "出email", "電郵"], tool: "run-campaign" },
  { keywords: ["合約", "簽約", "contract"], tool: "contract-review" },
  { keywords: ["招聘", "請人", "job"], tool: "job-post-builder" },
  { keywords: ["週報", "本週", "今個禮拜", "禮拜"], tool: "friday-brief" }
];

// Numbered menu shown on "?" / "選單". Curated, common-first.
const MENU = [
  { label: "今日生意 / 損益", tool: "business-pulse" },
  { label: "現金流", tool: "cash-flow-snapshot" },
  { label: "追未付數", tool: "invoice-chase" },
  { label: "客戶概況", tool: "customer-pulse" },
  { label: "跟進致電名單", tool: "call-list" },
  { label: "客戶投訴", tool: "handle-complaint" },
  { label: "新客查詢", tool: "lead-triage" },
  { label: "合約檢視", tool: "contract-review" },
  { label: "查價 / 貨品", tool: "price-check" },
  { label: "本週簡報", tool: "friday-brief" }
];

const MENU_TRIGGERS = ["?", "？", "選單", "菜單", "功能", "幫助", "help", "menu", "目錄"];

// Tools that change/send something — confirm before running.
const WRITE_TOOLS = new Set(["run-campaign"]);

// Owner-facing Chinese names for replies.
const CN_LABELS = {
  "business-pulse": "今日生意", "cash-flow-snapshot": "現金流", "margin-analyzer": "毛利分析",
  "close-month": "埋月", "month-end-prep": "月結準備", "month-heads-up": "本月初步損益",
  "quarterly-review": "季度回顧", "plan-payroll": "出糧規劃", "tax-prep": "報稅準備",
  "tax-season-organizer": "稅季整理", "price-check": "查價", "invoice-chase": "追未付數",
  "crm-cleanup": "客戶資料清理", "crm-maintenance": "客戶名冊", "customer-pulse": "客戶概況",
  "customer-pulse-check": "流失客戶檢查", "call-list": "致電名單", "lead-triage": "新客查詢",
  "handle-complaint": "客戶投訴", "ticket-deflector": "自助查詢過濾", "run-campaign": "宣傳電郵",
  "content-strategy": "內容策略", "canva-creator": "Canva 範本", "sales-brief": "銷售簡報",
  "contract-review": "合約檢視", "review-contract": "待簽合約", "job-post-builder": "招聘啟事",
  "friday-brief": "本週簡報", "monday-brief": "週一簡報"
};

module.exports = { ALIASES, MENU, MENU_TRIGGERS, WRITE_TOOLS, CN_LABELS };
