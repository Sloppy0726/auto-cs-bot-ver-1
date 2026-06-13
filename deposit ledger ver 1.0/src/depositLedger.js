"use strict";

// Deposit Ledger ver 1.0  (留位收訂 + 入數確認)
// A deterministic FPS/PayMe deposit state machine for HK SMEs.
//
// HK deposits don't happen on card rails — they happen as FPS / PayMe transfers and
// 入數截圖 inside the WhatsApp thread, and no product reconciles "a customer sent an
// FPS screenshot at 11pm" against a booking. This module issues a unique short code
// (DEP-XXXX) with the shop's own approved payment rail, matches the customer's
// "過咗數 DEP-7K3Q" back to the held booking, and hands staff a one-tap verify.
//
// Hard safety rule: the bot NEVER confirms money. A deposit only becomes `verified`
// through an explicit human action; the customer-facing acknowledgement says
// "we're checking", never "payment received". Raw payment references are not stored
// in clear with the customer — the sender is pseudonymised like the action journal.
//
// State machine:  pending → claimed → verified
//                 pending → expired | released | waived   (TTL / typhoon / staff)
//                 claimed → verified | waived
// `verified` and `waived` are terminal-good; `expired`/`released` free the slot.

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const STATES = Object.freeze({
  PENDING: "pending",
  CLAIMED: "claimed",
  VERIFIED: "verified",
  EXPIRED: "expired",
  RELEASED: "released",
  WAIVED: "waived"
});

const ACTIVE_STATES = Object.freeze(new Set([STATES.PENDING, STATES.CLAIMED]));
const DEFAULT_TTL_MINUTES = 120;
// Crockford-ish alphabet: no I/L/O/U so codes are unambiguous to read and type.
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function senderRef(senderId) {
  return senderId ? crypto.createHash("sha256").update(`sender:${senderId}`).digest("hex").slice(0, 16) : null;
}

function deriveCode(seed, taken = new Set()) {
  const hex = crypto.createHash("sha256").update(String(seed)).digest("hex");
  let base = "";
  for (let i = 0; i < 4; i += 1) {
    base += CODE_ALPHABET[parseInt(hex.slice(i * 2, i * 2 + 2), 16) % CODE_ALPHABET.length];
  }
  let code = `DEP-${base}`;
  let salt = 0;
  while (taken.has(code)) {
    salt += 1;
    const h2 = crypto.createHash("sha256").update(`${seed}#${salt}`).digest("hex");
    let b = "";
    for (let i = 0; i < 4; i += 1) b += CODE_ALPHABET[parseInt(h2.slice(i * 2, i * 2 + 2), 16) % CODE_ALPHABET.length];
    code = `DEP-${b}`;
  }
  return code;
}

function createDepositLedger(config = {}) {
  const filePath = config.filePath || null;
  const nowFn = config.nowFn || (() => new Date());
  let records = [];
  // Suspicious-claim log (fraud gate): claims that failed reconciliation. Kept
  // separate from records because some (e.g. unknown reference) match no booking.
  let suspicious = [];

  if (filePath && fs.existsSync(filePath)) {
    const loaded = load(filePath);
    records = loaded.records;
    suspicious = loaded.suspicious;
  }

  function persist() {
    if (!filePath) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, JSON.stringify({ records, suspicious }, null, 2), "utf8");
    fs.renameSync(tmp, filePath);
  }

  function activeCodes() {
    return new Set(records.filter((r) => ACTIVE_STATES.has(r.status)).map((r) => r.code));
  }

  function transition(record, status, meta = {}) {
    const { now, ...rest } = meta;
    const at = (now instanceof Date ? now : nowFn()).toISOString();
    record.status = status;
    record.updatedAt = at;
    record.history.push({ status, at, ...rest });
    persist();
    return record;
  }

  return {
    filePath,

    // Create a pending deposit + slot hold. bookingDraft is the deterministic snapshot
    // from the pipeline (date/time/service/partySize/resourceId). Returns the record.
    request(input = {}) {
      const now = input.now || nowFn();
      const ttlMinutes = Number(input.ttlMinutes) || DEFAULT_TTL_MINUTES;
      const code = deriveCode(
        `${input.businessId}|${input.senderId}|${JSON.stringify(input.bookingDraft || {})}|${now.toISOString().slice(0, 16)}`,
        activeCodes()
      );
      const record = {
        id: code,
        code,
        businessId: input.businessId || null,
        senderRef: senderRef(input.senderId),
        status: STATES.PENDING,
        amount: input.amount ?? null,
        currency: input.currency || "HKD",
        bookingDraft: input.bookingDraft || null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + ttlMinutes * 60000).toISOString(),
        remindedAt: null,
        history: [{ status: STATES.PENDING, at: now.toISOString() }]
      };
      records.push(record);
      persist();
      return record;
    },

    // 客覆「過咗數 DEP-7K3Q」: match a pending record by code, sender-bound.
    claimByReference(input = {}) {
      const code = normalizeCode(input.reference);
      if (!code) return { ok: false, reason: "no_reference" };
      const ref = senderRef(input.senderId);
      const record = records.find((r) =>
        r.code === code && r.businessId === input.businessId && r.status === STATES.PENDING &&
        (r.senderRef == null || ref == null || r.senderRef === ref));
      if (!record) return { ok: false, reason: "no_matching_pending_deposit" };
      transition(record, STATES.CLAIMED, { actor: "customer", via: "reference", now: input.now });
      return { ok: true, record };
    },

    // Customer sent payment proof (screenshot / 過咗數) with no code, but has exactly
    // one pending deposit → claim it. Ambiguous (0 or >1) → no auto-claim.
    claimBySenderProof(input = {}) {
      const ref = senderRef(input.senderId);
      const pendings = records.filter((r) => r.businessId === input.businessId && r.status === STATES.PENDING && r.senderRef === ref);
      if (pendings.length !== 1) return { ok: false, reason: pendings.length === 0 ? "no_pending_deposit" : "ambiguous_multiple_pending" };
      transition(pendings[0], STATES.CLAIMED, { actor: "customer", via: "proof", now: input.now });
      return { ok: true, record: pendings[0] };
    },

    // The ONLY path that confirms money. Human action required — never automatic.
    verify(id, meta = {}) {
      const record = records.find((r) => r.id === id);
      if (!record) return { ok: false, reason: "not_found" };
      if (![STATES.CLAIMED, STATES.PENDING].includes(record.status)) return { ok: false, reason: `cannot_verify_from_${record.status}` };
      transition(record, STATES.VERIFIED, { actor: meta.actor || "staff", now: meta.now });
      return { ok: true, record };
    },

    waive(id, meta = {}) {
      const record = records.find((r) => r.id === id);
      if (!record) return { ok: false, reason: "not_found" };
      if (!ACTIVE_STATES.has(record.status)) return { ok: false, reason: `cannot_waive_from_${record.status}` };
      transition(record, STATES.WAIVED, { actor: meta.actor || "system", reason: meta.reason || null, now: meta.now });
      return { ok: true, record };
    },

    // Typhoon / black-rain: waive every active deposit for a business (weather synergy).
    waiveAllActive(businessId, meta = {}) {
      const affected = records.filter((r) => r.businessId === businessId && ACTIVE_STATES.has(r.status));
      affected.forEach((r) => transition(r, STATES.WAIVED, { actor: meta.actor || "weather", reason: meta.reason || "weather_waiver" }));
      return affected;
    },

    // Lazy TTL sweep (no timers): expire pending deposits past their hold, and return
    // the records that should get exactly one reminder before expiry.
    sweep(input = {}) {
      const now = input.now || nowFn();
      const reminderLeadMs = (Number(input.reminderLeadMinutes) || 30) * 60000;
      const expired = [];
      const remind = [];
      for (const r of records) {
        if (r.status !== STATES.PENDING) continue;
        const expiresMs = new Date(r.expiresAt).getTime();
        if (now.getTime() >= expiresMs) {
          transition(r, STATES.EXPIRED, { actor: "system", reason: "ttl" });
          expired.push(r);
        } else if (!r.remindedAt && now.getTime() >= expiresMs - reminderLeadMs) {
          r.remindedAt = now.toISOString();
          persist();
          remind.push(r);
        }
      }
      return { expired, remind };
    },

    listActive(input = {}) {
      const ref = input.senderId ? senderRef(input.senderId) : null;
      return records.filter((r) =>
        ACTIVE_STATES.has(r.status) &&
        (!input.businessId || r.businessId === input.businessId) &&
        (!ref || r.senderRef === ref));
    },
    get(id) { return records.find((r) => r.id === id) || null; },
    // Non-mutating lookup by code (any status) — lets the fraud gate assess a claim
    // without transitioning it. claimByReference is the mutating counterpart.
    findByCode(code) { const c = normalizeCode(code); return c ? (records.find((r) => r.code === c) || null) : null; },
    all() { return records.slice(); },

    // Fraud gate: record a claim that failed reconciliation. Never confirms money;
    // this is the loss-prevention log behind the "閘咗 $X 假走數" number.
    flagSuspicious(input = {}) {
      const entry = {
        at: (input.now || nowFn()).toISOString(),
        businessId: input.businessId || null,
        senderRef: senderRef(input.senderId),
        code: input.code || null,
        risk: input.risk || "unknown",
        claimedAmount: input.claimedAmount ?? null,
        expectedAmount: input.expectedAmount ?? null,
        reasons: input.reasons || []
      };
      suspicious.push(entry);
      persist();
      return entry;
    },
    listSuspicious(input = {}) {
      return suspicious.filter((s) =>
        (!input.businessId || s.businessId === input.businessId) &&
        (!input.fromDate || String(s.at) >= input.fromDate) &&
        (!input.toDate || String(s.at) <= input.toDate));
    },
    reset() { records = []; suspicious = []; persist(); }
  };
}

function normalizeCode(value) {
  if (!value) return null;
  const m = String(value).toUpperCase().match(/DEP-?([0-9ABCDEFGHJKMNPQRSTVWXYZ]{4})/);
  return m ? `DEP-${m[1]}` : null;
}

// --- deterministic deposit policy ------------------------------------------------
// businessConfig.depositPolicy = {
//   ttlMinutes, rails: { payme, fps, payee },
//   rules: [{ minPartySize, days:[5,6], fromHour, toHour, service, amount, perHead }]
// }
// First matching rule wins. days use JS getDay() (0=Sun..6=Sat) on the booking date.
function evaluateDepositPolicy(bookingDraft, businessConfig = {}, now = new Date()) {
  const policy = businessConfig.depositPolicy;
  if (!policy || !Array.isArray(policy.rules) || !bookingDraft) return { required: false };
  for (const rule of policy.rules) {
    if (!ruleMatches(rule, bookingDraft)) continue;
    const partySize = Number(bookingDraft.partySize) || 1;
    const amount = rule.perHead ? rule.amount * partySize : rule.amount;
    return {
      required: true,
      amount,
      currency: policy.currency || "HKD",
      rails: policy.rails || {},
      ttlMinutes: policy.ttlMinutes || DEFAULT_TTL_MINUTES,
      matchedRule: rule
    };
  }
  return { required: false };
}

function ruleMatches(rule, draft) {
  if (rule.service && draft.service !== rule.service) return false;
  if (rule.minPartySize && Number(draft.partySize || 0) < rule.minPartySize) return false;
  if (Array.isArray(rule.days) && rule.days.length > 0) {
    const dow = dayOfWeek(draft.date);
    if (dow == null || !rule.days.includes(dow)) return false;
  }
  if ((rule.fromHour != null || rule.toHour != null) && draft.time) {
    const hour = Number(String(draft.time).slice(0, 2));
    if (rule.fromHour != null && hour < rule.fromHour) return false;
    if (rule.toHour != null && hour >= rule.toHour) return false;
  }
  return true;
}

function dayOfWeek(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ""))) return null;
  return new Date(`${dateKey}T00:00:00Z`).getUTCDay();
}

// --- customer-facing text (deterministic, bilingual) -----------------------------
// Rails come from owner-approved config, so quoting them is grounded (not invented).
// Uses a PayMe link and/or an FPS ID — see README on phone-number FPS rails.
function depositInstructionText(record, opts = {}) {
  const en = opts.language === "en";
  const amount = record.amount != null ? `${record.currency === "HKD" ? "HK$" : ""}${record.amount}` : null;
  const rails = opts.rails || {};
  const railLines = [];
  if (rails.payme) railLines.push(en ? `PayMe: ${rails.payme}` : `PayMe：${rails.payme}`);
  if (rails.fps) railLines.push(en ? `FPS ID: ${rails.fps}` : `轉數快 FPS ID：${rails.fps}`);
  if (rails.payee) railLines.push(en ? `Payee: ${rails.payee}` : `收款人：${rails.payee}`);
  const rail = railLines.join(en ? "; " : "；");
  const draft = record.bookingDraft || {};
  const when = [draft.date, draft.time].filter(Boolean).join(" ");

  if (en) {
    return `To hold ${when ? `your ${when} slot` : "your slot"} we need a deposit${amount ? ` of ${amount}` : ""}. ${rail ? `Please transfer via ${rail}. ` : ""}After paying, reply with the code ${record.code} (e.g. "Paid ${record.code}") and our staff will confirm. The slot is held until ${formatHkShort(record.expiresAt)}.`;
  }
  return `想幫你留住${when ? `${when} 嘅位` : "個位"}，需要先收訂金${amount ? `（${amount}）` : ""}。${rail ? `請用 ${rail} 過數。` : ""}過數後請回覆代碼 ${record.code}（例如「過咗數 ${record.code}」），我哋同事會幫你核實確認。個位會幫你保留到 ${formatHkShort(record.expiresAt)}。`;
}

// Acknowledge a claim WITHOUT confirming money — the human verify does that.
function claimAcknowledgementText(record, opts = {}) {
  const en = opts.language === "en";
  if (en) return `Thanks — we've received your payment notice for ${record.code}. Our staff are checking it against our records and will confirm your booking shortly. (This is not yet a payment confirmation.)`;
  return `多謝你！我哋收到你 ${record.code} 嘅過數通知，同事正核實緊，確認後會即刻通知你。（此訊息未代表已確認收款）`;
}

function formatHkShort(iso) {
  try {
    const d = new Date(iso);
    const hk = new Date(d.getTime() + 8 * 60 * 60000);
    return `${String(hk.getUTCHours()).padStart(2, "0")}:${String(hk.getUTCMinutes()).padStart(2, "0")}`;
  } catch (_e) {
    return iso;
  }
}

function load(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return {
      records: Array.isArray(parsed.records) ? parsed.records : [],
      suspicious: Array.isArray(parsed.suspicious) ? parsed.suspicious : []
    };
  } catch (_e) {
    return { records: [], suspicious: [] };
  }
}

module.exports = {
  STATES,
  DEFAULT_TTL_MINUTES,
  createDepositLedger,
  evaluateDepositPolicy,
  depositInstructionText,
  claimAcknowledgementText,
  deriveCode,
  normalizeCode,
  senderRef,
  _internal: { ruleMatches, dayOfWeek }
};
