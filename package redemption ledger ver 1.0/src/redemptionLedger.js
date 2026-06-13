"use strict";

// Package Redemption Ledger ver 1.0  (套票核銷數簿)
// Turns HK's biggest consumer-dispute category — prepaid package balances — into an
// auditable, customer-visible ledger.
//
// Prepaid packages (facial 10 次, 堂費, etc.) are the operating core of beauty /
// fitness / tutoring shops, and "我仲有幾多次 / 幾時到期" is the #1 dispute (~7,700
// Consumer Council complaints, ~HK$200M). No product gives a per-customer session
// ledger pushed to the customer in WhatsApp after every visit.
//
// What makes it dispute-proof rather than just convenient: balance is DERIVED by
// folding an append-only, hash-chained event log (purchase / redemption / adjustment)
// — never a mutable counter. Mistakes are fixed with a compensating 改正 entry, never
// by editing history, and the chain exports as a statement either side can take to the
// Small Claims Tribunal. The chain reuses the action journal's primitives.

const { sha256, canonicalize } = require("../../action journal ver 1.0/src/actionJournal");

const GENESIS_HASH = "0".repeat(64);
const TYPES = Object.freeze({ PURCHASE: "purchase", REDEMPTION: "redemption", ADJUSTMENT: "adjustment" });

function hashEntry(body, prevHash) {
  return sha256(`${prevHash}:${canonicalize(body)}`);
}

function createRedemptionLedger(config = {}) {
  const nowFn = config.nowFn || (() => new Date());
  const fs = require("node:fs");
  const path = require("node:path");
  const filePath = config.filePath || null;
  // entries keyed by packageId, each an ordered hash chain.
  let chains = new Map();

  if (filePath && fs.existsSync(filePath)) chains = load(filePath);

  function persist() {
    if (!filePath) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const obj = Object.fromEntries(chains);
    const tmp = `${filePath}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, JSON.stringify({ chains: obj }, null, 2), "utf8");
    fs.renameSync(tmp, filePath);
  }

  function append(packageId, body) {
    const chain = chains.get(packageId) || [];
    const prevHash = chain.length ? chain[chain.length - 1].entryHash : GENESIS_HASH;
    const full = { seq: chain.length + 1, prevHash, ...body };
    const entry = { ...full, entryHash: hashEntry(full, prevHash) };
    chain.push(entry);
    chains.set(packageId, chain);
    persist();
    return entry;
  }

  return {
    filePath,

    // Bootstrap from the existing package records so the ledger balance matches the
    // current demo state: one purchase entry + N redemption entries for usedSessions.
    seedFromPackages(packages = []) {
      for (const pkg of packages) {
        if (chains.has(pkg.id)) continue;
        const at = (pkg.purchaseDate || pkg.expiryDate || nowFn().toISOString());
        append(pkg.id, {
          type: TYPES.PURCHASE, packageId: pkg.id, businessId: pkg.businessId,
          customerExternalId: pkg.customerExternalId || null, customerName: pkg.customerName || null,
          packageName: pkg.packageName || null, serviceName: pkg.serviceName || null,
          sessions: Number(pkg.totalSessions) || 0, expiryDate: pkg.expiryDate || null,
          at, by: "seed"
        });
        for (let i = 0; i < (Number(pkg.usedSessions) || 0); i += 1) {
          append(pkg.id, { type: TYPES.REDEMPTION, packageId: pkg.id, businessId: pkg.businessId, sessions: -1, at, by: "seed" });
        }
      }
      return this;
    },

    // Redeem one (or more) sessions. Idempotency key prevents a double-tap burning two.
    redeem(input = {}) {
      const { packageId } = input;
      const chain = chains.get(packageId);
      if (!chain || chain.length === 0) return { ok: false, reason: "package_not_found" };
      const bal = foldChain(chain);
      const n = Number(input.sessions) || 1;
      if (bal.remaining < n) return { ok: false, reason: "insufficient_sessions", balance: bal };
      if (input.idempotencyKey && chain.some((e) => e.idempotencyKey === input.idempotencyKey)) {
        return { ok: true, deduped: true, balance: foldChain(chain), entry: chain.find((e) => e.idempotencyKey === input.idempotencyKey) };
      }
      const entry = append(packageId, {
        type: TYPES.REDEMPTION, packageId, businessId: bal.businessId, sessions: -n,
        service: input.service || bal.serviceName || null, at: (input.now || nowFn()).toISOString(),
        by: input.by || "staff", idempotencyKey: input.idempotencyKey || null
      });
      return { ok: true, entry, balance: foldChain(chains.get(packageId)) };
    },

    // Fix a mistake by APPENDING a compensating entry (history is never edited).
    adjust(input = {}) {
      const { packageId } = input;
      const chain = chains.get(packageId);
      if (!chain || chain.length === 0) return { ok: false, reason: "package_not_found" };
      if (!input.reason) return { ok: false, reason: "reason_required" };
      const entry = append(packageId, {
        type: TYPES.ADJUSTMENT, packageId, businessId: foldChain(chain).businessId,
        sessions: Number(input.sessions) || 0, reason: input.reason,
        at: (input.now || nowFn()).toISOString(), by: input.by || "staff"
      });
      return { ok: true, entry, balance: foldChain(chains.get(packageId)) };
    },

    balance(packageId) {
      const chain = chains.get(packageId);
      return chain ? foldChain(chain) : null;
    },

    // Find a package for a customer by their external id (+ optional service match).
    findPackage({ businessId, customerExternalId, service } = {}) {
      const candidates = [];
      for (const [packageId, chain] of chains) {
        const bal = foldChain(chain);
        if (businessId && bal.businessId !== businessId) continue;
        if (customerExternalId && bal.customerExternalId !== customerExternalId) continue;
        if (bal.remaining <= 0) continue;
        if (service && bal.serviceName && !String(bal.serviceName).toLowerCase().includes(String(service).toLowerCase()) &&
            !String(service).toLowerCase().includes(String(bal.serviceName).toLowerCase())) continue;
        candidates.push({ packageId, ...bal });
      }
      // Prefer the soonest-expiring active package.
      candidates.sort((a, b) => String(a.expiryDate || "9999").localeCompare(String(b.expiryDate || "9999")));
      return candidates[0] || null;
    },

    verify(packageId) {
      if (packageId) return verifyChain(chains.get(packageId) || []);
      for (const [id, chain] of chains) {
        const r = verifyChain(chain);
        if (!r.ok) return { ok: false, packageId: id, ...r };
      }
      return { ok: true };
    },

    statement(packageId, opts = {}) {
      const chain = chains.get(packageId);
      if (!chain) return null;
      return buildStatement(chain, opts);
    },

    chain(packageId) { return (chains.get(packageId) || []).slice(); },
    all() { return Object.fromEntries([...chains].map(([k, v]) => [k, v.slice()])); },
    reset() { chains = new Map(); persist(); }
  };
}

function foldChain(chain) {
  let remaining = 0, used = 0, total = 0;
  let meta = {};
  for (const e of chain) {
    remaining += Number(e.sessions) || 0;
    if (e.type === TYPES.PURCHASE) {
      total += Number(e.sessions) || 0;
      meta = {
        businessId: e.businessId, customerExternalId: e.customerExternalId, customerName: e.customerName,
        packageName: e.packageName, serviceName: e.serviceName, expiryDate: e.expiryDate
      };
    } else if (e.type === TYPES.REDEMPTION) {
      used += -(Number(e.sessions) || 0);
    }
  }
  return { ...meta, total, used, remaining: Math.max(0, remaining) };
}

function verifyChain(chain) {
  let prevHash = GENESIS_HASH;
  for (let i = 0; i < chain.length; i += 1) {
    const e = chain[i];
    if (e.prevHash !== prevHash) return { ok: false, brokenAt: i, reason: "prevHash_mismatch" };
    const { entryHash, ...body } = e;
    if (hashEntry(body, prevHash) !== entryHash) return { ok: false, brokenAt: i, reason: "entryHash_mismatch" };
    prevHash = entryHash;
  }
  return { ok: true, total: chain.length };
}

// Customer-facing receipt after a redemption: "用咗第7次，仲剩3次，到期 2026-09-30".
function receiptText(balance, opts = {}) {
  const en = opts.language === "en";
  const usedOrdinal = balance.used;
  const service = balance.serviceName || balance.packageName || (en ? "your package" : "套票");
  if (en) {
    return `✅ Redeemed 1 session of ${service}. That's visit #${usedOrdinal}; you have ${balance.remaining} left${balance.expiryDate ? `, valid until ${balance.expiryDate}` : ""}.`;
  }
  return `✅ 已為你核銷 1 次${service}。今次係第 ${usedOrdinal} 次，仲剩返 ${balance.remaining} 次${balance.expiryDate ? `，套票到期日 ${balance.expiryDate}` : ""}。`;
}

function buildStatement(chain, opts = {}) {
  const en = opts.language === "en";
  const bal = foldChain(chain);
  const lines = chain.map((e) => {
    const date = String(e.at || "").slice(0, 10);
    if (e.type === TYPES.PURCHASE) return en ? `${date}  Purchased ${e.sessions} sessions` : `${date}  購買 ${e.sessions} 次`;
    if (e.type === TYPES.REDEMPTION) return en ? `${date}  Redeemed ${-e.sessions} session` : `${date}  核銷 ${-e.sessions} 次`;
    return en ? `${date}  Adjustment ${e.sessions > 0 ? "+" : ""}${e.sessions} (${e.reason})` : `${date}  改正 ${e.sessions > 0 ? "+" : ""}${e.sessions} 次（${e.reason}）`;
  });
  const header = en
    ? `Statement — ${bal.packageName || bal.serviceName || "package"} (${bal.customerName || ""})`
    : `套票紀錄 — ${bal.packageName || bal.serviceName || "套票"}（${bal.customerName || ""}）`;
  const footer = en
    ? `Remaining: ${bal.remaining} of ${bal.total}${bal.expiryDate ? `, valid until ${bal.expiryDate}` : ""}.`
    : `餘額：${bal.remaining} / ${bal.total} 次${bal.expiryDate ? `，到期日 ${bal.expiryDate}` : ""}。`;
  return { header, lines, footer, balance: bal, chainVerified: verifyChain(chain).ok };
}

// Parse an owner's "核銷 85261112222 facial" / "核銷 pkg_xxx" command.
function parseRedeemCommand(text) {
  const t = String(text || "").trim();
  if (!/^(核銷|核消|redeem|扣[一1]?次|用咗[一1]次)/i.test(t)) return null;
  const idMatch = t.match(/\b(pkg_[a-z0-9_]+|\d{8,})\b/i);
  if (!idMatch) return null;
  const rest = t.replace(/^(核銷|核消|redeem|扣[一1]?次|用咗[一1]次)/i, "").replace(idMatch[0], "").trim();
  return { ref: idMatch[1], service: rest || null };
}

// 核銷 → write → push WhatsApp receipt to the customer in one call.
function redeemAndReceipt(ledger, outbox, input = {}) {
  const pkg = input.packageId
    ? { packageId: input.packageId, ...(ledger.balance(input.packageId) || {}) }
    : ledger.findPackage({ businessId: input.businessId, customerExternalId: input.ref, service: input.service });
  if (!pkg || !pkg.packageId) return { ok: false, reason: "package_not_found" };

  const res = ledger.redeem({ packageId: pkg.packageId, service: input.service, by: input.by, idempotencyKey: input.idempotencyKey, now: input.now });
  if (!res.ok) return res;

  const receipt = receiptText(res.balance, { language: input.language });
  let enqueued = null;
  const chatKey = input.chatKey || res.balance.customerExternalId;
  if (outbox && chatKey) {
    enqueued = outbox.enqueue({ businessId: res.balance.businessId, chatKey, text: receipt, kind: "package_receipt" });
  }
  return { ok: true, balance: res.balance, receipt, enqueued, packageId: pkg.packageId };
}

function load(filePath) {
  try {
    const parsed = JSON.parse(require("node:fs").readFileSync(filePath, "utf8"));
    return new Map(Object.entries(parsed.chains || {}));
  } catch (_e) {
    return new Map();
  }
}

module.exports = {
  TYPES,
  GENESIS_HASH,
  createRedemptionLedger,
  receiptText,
  parseRedeemCommand,
  redeemAndReceipt,
  _internal: { foldChain, verifyChain, buildStatement, hashEntry }
};
