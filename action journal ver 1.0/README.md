# Action Journal ver 1.0

A tamper-evident, **replayable** "flight recorder" for the support pipeline — the trust artifact that turns this framework's determinism into evidence.

Every turn appends one record to an append-only JSONL chain. Each record embeds the SHA-256 of the previous record (`prevHash`) plus its own `entryHash`, so any later edit, deletion, or reordering breaks the chain and is caught by `verifyChain()`.

## Why this is unique

Competitor agents (Intercom Fin, Decagon, Sierra, Chatbase AI Actions) execute via LLM tool-calling, so their decision trace is a model rollout that **cannot be replayed** — you cannot prove the bot would decide the same way again. Here the policy gate (`business rules evaluate()`) is a pure function of sanitized inputs. The journal records those inputs and the resulting decision, so `replay()` can **re-run the gate and prove the recorded decision reproduces byte-for-byte**.

Post *Moffatt v. Air Canada*, "prove what your bot told the customer, and that it would say it again" is a sellable, defensible artifact for Consumer Council disputes, PDPO access requests, and post-incident audits. The replay pass also doubles as a free regression harness for every code change.

## Privacy by construction

The journal stores **only sanitized / redacted fields**. Raw channel text and PII never enter a record:

- Sender ids are pseudonymised to a 16-char hash (`senderRef`), never stored raw.
- Customer-facing reply text is retained **only when it was actually sendable** (`finalStatus === "ready_to_send"`); otherwise only its SHA-256 hash is kept, proving what was produced without retaining an un-sent staff draft.
- The replay inputs are the gateway output (post-redaction), derived intent, and approved knowledge — never `originalText` or detector findings.

## Main API

```js
const { createActionJournal } = require("./src/actionJournal");

const journal = createActionJournal({ filePath: ".local/action-journal.jsonl" });
journal.append({ result });          // one pipeline result per turn

journal.verify();                    // { ok, brokenAt, reason, total }
journal.replay(evaluate, getConfig); // { replayable, matched, divergences, ok }
```

In the pipeline it is **opt-in** (off unless a journal instance is passed to `createPipeline`, or `ACTION_JOURNAL_PATH` is set), so unconfigured behaviour is byte-for-byte unchanged.

## Evidence bundle

`buildEvidenceBundle(records, { businessId, senderRef, fromDate, toDate })` returns a chain-verified, scoped record set for a single customer or date range — the export a shop can hand to the Small Claims Tribunal.

## Tests

```bash
node "action journal ver 1.0/test/actionJournal.test.js"
```

Covers chain linkage, tamper detection (edit / delete / reorder), PII minimisation, honest replay against the real `evaluate()` gate, divergence detection on a forged decision, JSONL persistence with continued sequence across restarts, and evidence-bundle scoping.
