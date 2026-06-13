"use strict";

// IRD s.51C Books-of-Record Engine ver 1.0  (稅務存檔 / 收訂・套票紀錄投影)
// A PURE PROJECTOR — no new source of truth, no pipeline hot-path. It folds the
// existing ledgers into canonical, hash-verified line items + a daily-takings roll-up,
// and exports a CSV + bilingual signed statement an accountant or the Small Claims
// Tribunal can accept for the chat-mediated slice of the business.
//
// HONEST FRAMING (must be stated to the owner):
//  • This records ONLY what the bot handled (verified deposits + package purchases/
//    redemptions). Cash/card/Octopus walk-ins, rent, payroll never enter — it is NOT
//    the shop's full statutory books. IRO s.51C compels keeping business records for
//    7 years SOMEWHERE; Xero/QuickBooks/a shoebox all satisfy it, and this CSV export
//    is itself the easy exit. The real value is EVIDENTIARY (tamper-evident dispute /
//    audit defence on the bot-mediated revenue), not a compliance lock-in.
//  • Counterparties are pseudonymised (senderRef). A revenue authority may want
//    identifiable parties — that join lives outside this de-identified projection.

const { sha256, canonicalize } = require("../../action journal ver 1.0/src/actionJournal");
const { hkDateKey } = require("../../google drive promo sync ver 1.0/src/hkTime");

const RETENTION_YEARS = 7;

function createIrdLedger(config = {}) {
  const nowFn = config.nowFn || (() => new Date());
  const depositLedger = config.depositLedger || null;
  const redemptionLedger = config.redemptionLedger || null;
  const journal = config.journal || null;

  // Fold the ledgers into canonical line items. Cash-in events (deposits, package
  // purchases) drive daily takings; redemptions are non-cash service-delivery detail.
  function project(input = {}) {
    const businessId = input.businessId || null;
    const fromDate = input.fromDate || null;
    const toDate = input.toDate || null;
    const inRange = (d) => (!fromDate || d >= fromDate) && (!toDate || d <= toDate);

    const lineItems = [];

    if (depositLedger) {
      for (const r of depositLedger.all()) {
        if (businessId && r.businessId !== businessId) continue;
        if (!["verified", "waived"].includes(r.status)) continue; // only settled deposits
        const verifiedAt = (r.history || []).find((h) => h.status === r.status)?.at || r.updatedAt || r.createdAt;
        const date = hkDateKey(verifiedAt);
        if (!inRange(date)) continue;
        lineItems.push({
          date, type: r.status === "waived" ? "deposit_waived" : "deposit_verified",
          amount: r.status === "waived" ? 0 : (Number(r.amount) || 0),
          currency: r.currency || "HKD", ref: r.code,
          detail: [r.bookingDraft?.date, r.bookingDraft?.time].filter(Boolean).join(" ") || null,
          counterparty: r.senderRef || null, cashIn: r.status === "verified"
        });
      }
    }

    if (redemptionLedger) {
      const all = redemptionLedger.all();
      for (const packageId of Object.keys(all)) {
        const chain = all[packageId];
        for (const e of chain) {
          if (businessId && e.businessId !== businessId) continue;
          const date = hkDateKey(e.at);
          if (!inRange(date)) continue;
          if (e.type === "purchase") {
            const amount = e.unitPrice != null ? Number(e.unitPrice) * Number(e.sessions || 0) : null;
            lineItems.push({
              date, type: "package_purchase", amount: amount ?? 0, currency: e.currency || "HKD",
              ref: packageId, detail: e.packageName || e.serviceName || null,
              counterparty: senderRefFor(e.customerExternalId), cashIn: amount != null, amountKnown: amount != null
            });
          } else if (e.type === "redemption") {
            // Service delivered — NOT a cash event (cash was recognised at purchase).
            lineItems.push({
              date, type: "package_redemption", amount: 0, currency: e.currency || "HKD",
              ref: packageId, detail: e.service || null, counterparty: null, cashIn: false
            });
          } else if (e.type === "adjustment") {
            lineItems.push({ date, type: "package_adjustment", amount: 0, ref: packageId, detail: e.reason || null, counterparty: null, cashIn: false });
          }
        }
      }
    }

    lineItems.sort((a, b) => a.date.localeCompare(b.date));

    const dailyTakings = {};
    let totalTakings = 0;
    for (const li of lineItems) {
      if (!li.cashIn) continue;
      dailyTakings[li.date] = (dailyTakings[li.date] || 0) + (Number(li.amount) || 0);
      totalTakings += Number(li.amount) || 0;
    }

    return {
      businessId, fromDate, toDate,
      lineItems, dailyTakings, totalTakings,
      lineCount: lineItems.length,
      chainVerified: verifyAllChains(redemptionLedger, journal),
      generatedAt: nowFn().toISOString()
    };
  }

  function exportCsv(input = {}) {
    const p = project(input);
    const header = ["date", "type", "amount", "currency", "ref", "detail", "counterparty", "cash_in"];
    const rows = p.lineItems.map((li) =>
      [li.date, li.type, li.amount, li.currency || "HKD", li.ref || "", `"${(li.detail || "").replace(/"/g, "'")}"`, li.counterparty || "", li.cashIn ? "Y" : "N"].join(","));
    return { csv: [header.join(",")].concat(rows).join("\n"), projection: p };
  }

  // Bilingual signed statement with a tamper-evidence report and the honest scope note.
  function statement(input = {}) {
    const p = project(input);
    const en = input.language === "en";
    const digest = sha256(canonicalize(p.lineItems));
    const period = [p.fromDate || "—", p.toDate || "—"].join(" → ");
    const header = en
      ? `Books-of-record extract (bot-mediated) — ${period}`
      : `業務紀錄摘要（系統經手部分）— ${period}`;
    const scope = en
      ? `Scope: only deposits and prepaid-package transactions handled by this system. NOT your full statutory books — cash/card walk-ins, rent and payroll are not included. IRO s.51C requires keeping business records for ${RETENTION_YEARS} years; this extract can be given to your accountant or merged into your books.`
      : `範圍：只包括經本系統處理嘅收訂同套票交易，並非貴店全部帳目（現金／碌卡散客、租金、人工均不在內）。《稅務條例》第51C條規定業務紀錄須保存 ${RETENTION_YEARS} 年；此摘要可交會計師或併入正式帳簿。`;
    const totals = en
      ? `Recorded takings: HK$${p.totalTakings} across ${Object.keys(p.dailyTakings).length} day(s); ${p.lineCount} line item(s).`
      : `已記錄收入：HK$${p.totalTakings}，涵蓋 ${Object.keys(p.dailyTakings).length} 日；共 ${p.lineCount} 條紀錄。`;
    const integrity = en
      ? `Tamper-evidence: ledger chains ${p.chainVerified ? "VERIFIED" : "FAILED VERIFICATION"}; extract digest ${digest.slice(0, 16)}.`
      : `防篡改核證：紀錄鏈${p.chainVerified ? "已通過核證" : "核證失敗"}；摘要指紋 ${digest.slice(0, 16)}。`;
    return { header, scope, totals, integrity, digest, projection: p };
  }

  return { project, exportCsv, statement, RETENTION_YEARS };
}

function senderRefFor(externalId) {
  return externalId ? sha256(`sender:${externalId}`).slice(0, 16) : null;
}

function verifyAllChains(redemptionLedger, journal) {
  if (redemptionLedger && !redemptionLedger.verify().ok) return false;
  if (journal && typeof journal.verify === "function" && !journal.verify().ok) return false;
  // deposit ledger records are a state machine (history-backed), not a hash chain — the
  // hash-verified evidence is the redemption chains + (optional) the action journal.
  return true;
}

module.exports = { RETENTION_YEARS, createIrdLedger, _internal: { senderRefFor, verifyAllChains } };
