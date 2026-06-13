"use strict";

// Owner Morning Digest ver 1.0  (每朝一覽)
// A read-only aggregator (no LLM, owns no data) that folds the ledgers + weather +
// calendar + inbox risk flags into ONE bilingual WhatsApp message the owner reads each
// morning. It is the spine that makes the daily habit form around A/C/D — it locks in
// nothing by itself, so it ships last and only over modules that already exist.
//
// Two rules from the research, enforced here:
//  • Emit ONLY lines that have content (an empty digest trains owners to ignore it).
//  • NO compliance-deadline lines — the cooling-off / PDPO / consent clocks don't exist,
//    and a default-silent "compliance" line is a liability (false sense of coverage).

const { hkDateKey } = require("../../google drive promo sync ver 1.0/src/hkTime");
const { isHkPublicHoliday } = require("../../hk calendar ver 1.0/src/hkCalendar");
const { createWinback } = require("../../winback ver 1.0/src/winback");
const { SIGNAL_NAMES } = require("../../weather policy ver 1.0/src/weatherPolicy");

function createOwnerDigest(config = {}) {
  const nowFn = config.nowFn || (() => new Date());
  const fs = require("node:fs");
  const path = require("node:path");
  const filePath = config.filePath || null;
  let lastSent = {}; // businessId → dateKey

  if (filePath && fs.existsSync(filePath)) {
    try { lastSent = JSON.parse(fs.readFileSync(filePath, "utf8")).lastSent || {}; } catch (_e) { lastSent = {}; }
  }
  function persist() {
    if (!filePath) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ lastSent }, null, 2), "utf8");
  }

  // Build the digest lines (only non-empty ones). deps = { depositLedger, redemptionLedger,
  // winback, weatherStore, inbox }.
  function build(input = {}) {
    const { deps = {}, businessId, language = "zh-HK" } = input;
    const now = input.now || nowFn();
    const en = language === "en";
    const today = hkDateKey(now);
    const lines = [];

    // 1. Weather signal
    if (deps.weatherStore && deps.weatherStore.getSignal && deps.weatherStore.getSignal() !== "none") {
      const sig = deps.weatherStore.getSignal();
      const name = (SIGNAL_NAMES[sig] || {})[en ? "en" : "zh"] || sig;
      lines.push(en ? `⚠️ Weather: ${name} in force — check closure policy.` : `⚠️ 天氣：${name}生效，留意停業安排。`);
    }

    // 2. Upcoming HK public holiday in the next 3 days
    for (let i = 0; i <= 3; i += 1) {
      const d = shiftDateKey(today, i);
      if (isHkPublicHoliday(d)) {
        const when = i === 0 ? (en ? "today" : "今日") : i === 1 ? (en ? "tomorrow" : "聽日") : d;
        lines.push(en ? `📅 Public holiday ${when} (${d}) — plan staffing.` : `📅 ${when}（${d}）係公眾假期，記得排更。`);
        break;
      }
    }

    // 3. Pending deposits awaiting payment/confirmation
    if (deps.depositLedger) {
      const pending = deps.depositLedger.listActive({ businessId }).filter((r) => r.status === "pending").length;
      if (pending > 0) lines.push(en ? `💰 ${pending} deposit(s) awaiting payment/confirmation.` : `💰 ${pending} 個訂金待過數／待確認。`);

      // 4. Today's verified deposits
      const verifiedToday = deps.depositLedger.all().filter((r) =>
        (!businessId || r.businessId === businessId) && r.status === "verified" &&
        hkDateKey((r.history || []).find((h) => h.status === "verified")?.at || r.updatedAt || r.createdAt) === today);
      if (verifiedToday.length > 0) {
        const sum = verifiedToday.reduce((s, r) => s + (Number(r.amount) || 0), 0);
        lines.push(en ? `✅ Confirmed deposits today: ${verifiedToday.length} (HK$${sum}).` : `✅ 今日已確認收訂 ${verifiedToday.length} 筆，共 HK$${sum}。`);
      }
    }

    // 5. Near-expiry packages (recoverable value)
    if (deps.redemptionLedger || deps.winback) {
      const wb = deps.winback || createWinback({ redemptionLedger: deps.redemptionLedger, nowFn: () => now });
      const swept = wb.sweep({ businessId, now });
      const expiring = swept.candidates.filter((c) => c.type === "package_expiry");
      if (expiring.length > 0) {
        const val = expiring.reduce((s, c) => s + (Number(c.estValue) || 0), 0);
        lines.push(en ? `⏳ ${expiring.length} package(s) expiring soon — HK$${val} recoverable, worth a win-back.` : `⏳ ${expiring.length} 個套票快到期，HK$${val} 可召回，值得 follow。`);
      }
    }

    // 6. Open risk items in the staff inbox
    if (deps.inbox && typeof deps.inbox.list === "function") {
      const open = (label) => deps.inbox.list({ status: "open", escalationLabel: label }).filter((i) => !businessId || i.businessId === businessId).length;
      const rep = open("reputation_risk");
      const susp = open("deposit_suspicious");
      if (rep > 0) lines.push(en ? `🚨 ${rep} review/reputation-risk case(s) waiting.` : `🚨 ${rep} 宗負評風險待你跟進。`);
      if (susp > 0) lines.push(en ? `🕵️ ${susp} suspicious deposit claim(s) to check.` : `🕵️ ${susp} 宗可疑過數待核對。`);
    }

    const head = en ? `Good morning — your ${today} brief:` : `早晨！${today} 今日概況：`;
    const text = lines.length ? `${head}\n${lines.map((l) => `• ${l}`).join("\n")}` : (en ? "Good morning — nothing needs your attention right now." : "早晨！暫時冇特別要跟嘅嘢。");
    return { today, lines, hasContent: lines.length > 0, text };
  }

  // Once-per-day enqueue to the owner. Skips if already sent today or if there's no
  // content (never spam an empty digest). Returns { sent, reason?, text }.
  function runOnce(input = {}) {
    const { deps = {}, businessId, outbox, journal, ownerChatKey, language } = input;
    const now = input.now || nowFn();
    const digest = build({ deps, businessId, now, language });
    if (lastSent[businessId] === digest.today) return { sent: false, reason: "already_sent_today", text: digest.text };
    if (!digest.hasContent) return { sent: false, reason: "empty", text: digest.text };
    const chatKey = ownerChatKey || firstOwnerPhone(deps);
    if (outbox && chatKey) outbox.enqueue({ businessId, chatKey, text: digest.text, kind: "owner_digest" });
    lastSent[businessId] = digest.today;
    persist();
    if (journal && typeof journal.append === "function") {
      try { journal.append({ result: { normalizedMessage: { businessId, channel: "whatsapp" }, finalStatus: "ready_to_send", draft: { action: "auto_send", text: "[owner_digest]" } } }); } catch (_e) { /* best effort */ }
    }
    return { sent: true, text: digest.text };
  }

  return { build, runOnce, _lastSent: () => ({ ...lastSent }) };
}

function firstOwnerPhone(deps) {
  const env = (deps.config && deps.config.env) || {};
  const raw = env.OWNER_PHONES || "";
  return String(raw).split(/[,;\s]+/).filter(Boolean)[0] || null;
}

function shiftDateKey(dateKey, days) {
  if (!days) return dateKey;
  const [y, m, d] = dateKey.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d) + days * 86400000;
  const dt = new Date(ms);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

// Owner command triggers for an on-demand digest.
function isDigestCommand(text) {
  return /每朝|今日概況|今朝概況|簡報|digest|早晨報告|今日滙報|今日匯報/i.test(String(text || ""));
}

module.exports = { createOwnerDigest, isDigestCommand, _internal: { shiftDateKey, firstOwnerPhone } };
