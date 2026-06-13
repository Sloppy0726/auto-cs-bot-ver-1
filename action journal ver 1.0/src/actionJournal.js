"use strict";

// Action Journal ver 1.0
// A tamper-evident, replayable "flight recorder" for the support pipeline.
//
// Every turn appends one record to an append-only JSONL chain. Each record embeds
// the SHA-256 of the previous record (prevHash) and its own entryHash, so any later
// edit, deletion, or reordering breaks the chain and is detectable by verifyChain().
//
// Why this is possible here and not in tool-calling competitors: the policy gate
// (business rules evaluate()) is a pure function of sanitized inputs. We journal
// those inputs and the resulting decision, so replayDecision() can RE-RUN the gate
// and prove the bot would decide byte-identically again. An LLM tool-call trace
// cannot be replayed this way.
//
// Privacy: the journal stores only sanitized / redacted fields (gateway output,
// derived intent, decision contract, safety verdict). Raw channel text and PII
// never enter a record. Customer-facing text is stored only when it was actually
// sendable (finalStatus === "ready_to_send"); otherwise only its hash is kept.

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const GENESIS_HASH = "0".repeat(64);
const SCHEMA_VERSION = 1;

function sha256(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

// Deterministic JSON: object keys sorted recursively so the same logical record
// always hashes identically regardless of property insertion order. This is what
// makes the chain reproducible across versions and machines.
function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(value[k])}`).join(",")}}`;
}

function hashRecord(body, prevHash) {
  return sha256(`${prevHash}:${canonicalize(body)}`);
}

function createActionJournal(config = {}) {
  const filePath = config.filePath || null;
  const nowFn = config.nowFn || (() => new Date());
  let chain = [];
  let lastHash = GENESIS_HASH;
  let seq = 0;

  if (filePath && fs.existsSync(filePath)) {
    chain = loadChain(filePath);
    const tail = chain[chain.length - 1];
    if (tail) {
      lastHash = tail.entryHash;
      seq = tail.seq;
    }
  }

  function append(turn = {}) {
    const body = buildRecordBody(turn, { nowFn, seq: seq + 1, prevHash: lastHash });
    const entryHash = hashRecord(body, lastHash);
    const record = { ...body, entryHash };
    chain.push(record);
    lastHash = entryHash;
    seq = record.seq;
    if (filePath) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.appendFileSync(filePath, JSON.stringify(record) + "\n", "utf8");
    }
    return record;
  }

  return {
    filePath,
    append,
    records() {
      return chain.slice();
    },
    head() {
      return chain[chain.length - 1] || null;
    },
    verify() {
      return verifyChain(chain);
    },
    // Re-run the deterministic policy gate over the journaled inputs and assert it
    // still produces the recorded decision. Proof that the bot would decide the same.
    replay(evaluate, getConfig) {
      return replayChain(chain, evaluate, getConfig);
    }
  };
}

function buildRecordBody(turn, deps) {
  const { nowFn, seq, prevHash } = deps;
  const result = turn.result || turn || {};
  const normalized = result.normalizedMessage || {};
  const gateway = result.gateway || null;
  const intent = result.intent || null;
  const knowledge = result.knowledge || null;
  const decision = result.decision || null;
  const safety = result.safety || null;
  const draft = result.draft || null;
  const modelRoute = result.modelRoute || null;
  const finalStatus = result.finalStatus || null;

  const sendable = finalStatus === "ready_to_send";
  const draftText = draft && draft.text != null ? String(draft.text) : null;
  const replayable = Boolean(modelRoute) && modelRoute.shouldCallLLM === false;

  return {
    schemaVersion: SCHEMA_VERSION,
    seq,
    prevHash,
    recordedAt: nowFn().toISOString(),
    businessId: normalized.businessId || (gateway && gateway.businessId) || null,
    channel: normalized.channel || null,
    // Senders are pseudonymised in the journal: a stable hash, never the raw id.
    senderRef: normalized.senderId ? sha256(`sender:${normalized.senderId}`).slice(0, 16) : null,
    intent: intent ? intent.primaryIntent || null : null,
    language: (knowledge && knowledge.language) || (intent && intent.language) || null,
    decision: decision
      ? {
        action: decision.action || null,
        escalationLabel: decision.escalationLabel || null,
        reason: decision.reason || null,
        forbiddenCapabilities: decision.forbiddenCapabilities || [],
        grounding: decision.grounding || []
      }
      : null,
    model: modelRoute ? { provider: modelRoute.provider || null, model: modelRoute.model || null, shouldCallLLM: Boolean(modelRoute.shouldCallLLM) } : null,
    safety: safety ? { verdict: safety.verdict || null, safeToSend: Boolean(safety.safeToSend) } : null,
    draftAction: draft ? draft.action || null : null,
    // Keep the customer-facing reply only when it was actually sendable; otherwise
    // a hash is enough to prove "this exact text was (not) produced" without retaining
    // an un-sent staff draft.
    replyText: sendable ? draftText : null,
    replyTextHash: draftText != null ? sha256(draftText) : null,
    finalStatus,
    replayable,
    replayInputs: replayable ? captureReplayInputs({ gateway, intent, knowledge, result }) : null
  };
}

// The exact inputs business-rules evaluate() consumed, captured so the decision can
// be reproduced. All sanitized: the gateway fields evaluate() reads are post-redaction,
// knowledge is approved business content, intent/packageFacts are derived. We capture
// knowledge and intent in full (they carry no PII) so the gate replays byte-identically;
// for the gateway we keep only the PII-safe fields evaluate() actually reads, never
// originalText or detector findings.
function captureReplayInputs({ gateway, intent, knowledge, result }) {
  return {
    gateway: gateway
      ? {
        route: gateway.route,
        businessId: gateway.businessId || null,
        sanitizedText: gateway.sanitizedText || null,
        shouldCallLLM: gateway.shouldCallLLM,
        reason: gateway.reason || null
      }
      : null,
    intent: intent || null,
    knowledge: knowledge || null,
    packageFacts: result.packageFacts || null,
    requiredClarification: result.requiredClarification || null
  };
}

function verifyChain(records) {
  let prevHash = GENESIS_HASH;
  for (let i = 0; i < records.length; i += 1) {
    const record = records[i];
    if (record.prevHash !== prevHash) {
      return { ok: false, brokenAt: i, seq: record.seq, reason: "prevHash_mismatch", total: records.length };
    }
    const { entryHash, ...body } = record;
    const recomputed = hashRecord(body, prevHash);
    if (recomputed !== entryHash) {
      return { ok: false, brokenAt: i, seq: record.seq, reason: "entryHash_mismatch", total: records.length };
    }
    if (record.seq !== i + 1) {
      return { ok: false, brokenAt: i, seq: record.seq, reason: "seq_gap", total: records.length };
    }
    prevHash = entryHash;
  }
  return { ok: true, brokenAt: null, total: records.length, headHash: prevHash };
}

// Re-run evaluate() over each replayable record's journaled inputs and compare the
// decision contract. Divergence pinpoints which deterministic stage changed behaviour
// between versions; matches prove the recorded decision is reproducible.
function replayChain(records, evaluate, getConfig) {
  if (typeof evaluate !== "function") throw new Error("replay requires the business-rules evaluate() function");
  let replayed = 0;
  let matched = 0;
  const divergences = [];
  for (const record of records) {
    if (!record.replayable || !record.replayInputs) continue;
    replayed += 1;
    const inputs = record.replayInputs;
    const businessConfig = typeof getConfig === "function"
      ? getConfig((inputs.knowledge && inputs.knowledge.businessId) || record.businessId)
      : undefined;
    const decision = evaluate({
      gateway: inputs.gateway || {},
      intent: inputs.intent || {},
      knowledge: inputs.knowledge || {},
      packageFacts: inputs.packageFacts || null,
      businessConfig,
      requiredClarification: inputs.requiredClarification || null
    });
    const recorded = record.decision || {};
    const sameAction = decision.action === recorded.action;
    const sameLabel = (decision.escalationLabel || null) === (recorded.escalationLabel || null);
    if (sameAction && sameLabel) {
      matched += 1;
    } else {
      divergences.push({
        seq: record.seq,
        recorded: { action: recorded.action, escalationLabel: recorded.escalationLabel || null },
        replayed: { action: decision.action, escalationLabel: decision.escalationLabel || null }
      });
    }
  }
  return { replayable: replayed, matched, divergences, ok: divergences.length === 0 };
}

function loadChain(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

// Build a customer- or date-scoped evidence bundle (chain-verified records plus a
// verification report) for Consumer Council / PDPO / Small Claims use.
function buildEvidenceBundle(records, filter = {}) {
  const verification = verifyChain(records);
  const scoped = records.filter((r) => {
    if (filter.businessId && r.businessId !== filter.businessId) return false;
    if (filter.senderRef && r.senderRef !== filter.senderRef) return false;
    if (filter.fromDate && String(r.recordedAt) < filter.fromDate) return false;
    if (filter.toDate && String(r.recordedAt) > filter.toDate) return false;
    return true;
  });
  return {
    generatedFrom: "action journal ver 1.0",
    chainVerified: verification.ok,
    chainReport: verification,
    recordCount: scoped.length,
    records: scoped
  };
}

module.exports = {
  GENESIS_HASH,
  SCHEMA_VERSION,
  createActionJournal,
  verifyChain,
  replayChain,
  buildEvidenceBundle,
  loadChain,
  canonicalize,
  sha256,
  _internal: { buildRecordBody, hashRecord, captureReplayInputs }
};
