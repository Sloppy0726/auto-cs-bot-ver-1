# Education Centre Vertical

Hong Kong education-centre product layer for the privacy-first Traditional Chinese / English customer-support bot.

## Product Positioning

**AI WhatsApp receptionist for Hong Kong education and activity centres.**

It answers repetitive parent enquiries, collects trial lesson leads, and routes uncertain or sensitive cases to staff approval.

Target customers:
- Tutorial centres
- Music schools
- Dance / sports / activity centres
- Kids learning centres
- After-school enrichment centres

## What This Vertical Adds

This folder is intentionally product-specific while reusing the existing auto-CS bot modules:

- `demo-data/brightpath-centre.json` — fake but realistic education centre data for demos.
- `knowledge-base/approved-faq.md` — approved answers the bot may quote.
- `knowledge-base/brightpath-kb-seed.js` — structured, loadable form of the approved FAQ (zh-HK/en/mixed answers, keywords, `requiresBackend`/`safeAutoSend`/`policyRef`) for `createKnowledgeBase`.
- `intents/education-intents.json` — education-specific intent catalogue.
- `src/educationIntentAdapter.js` — maps vertical product intents onto the core `VALID_INTENTS` taxonomy.
- `lead-capture/trial-lesson-lead.schema.json` — fields for parent/student trial enquiries.
- `business-rules/education-handoff-rules.md` — safety and staff-review rules.
- `sales-demo/demo-conversations.md` — bilingual demo scripts for sales calls.
- `owner-summary/daily-summary-template.md` — owner-facing daily summary format.
- `test/` — adapter unit tests and `educationSafety.test.js` (trial lead, pricing review, complaint/child-data handoff, no slot confirmation, no academic guarantee).

The `brightpath-demo` tenant is registered in `business rules ver 1.0/src/archetypes.js` against the `education` archetype, whose `no_academic_guarantee` policy forbids the draft engine from promising exam/interview outcomes.

## Integration Pattern

Existing pipeline remains the core:

```text
channel adapter
  -> conversation context
  -> privacy filter
  -> privacy gateway
  -> education intent mapping
  -> education approved knowledge base
  -> education business rules
  -> AI draft engine
  -> safety checker
  -> staff inbox / owner summary
```

## MVP Boundaries

The MVP should do:
- Answer FAQs only from approved knowledge.
- Collect trial lesson lead details.
- Draft bilingual replies in local HK parent-friendly tone.
- Send uncertain cases to staff review.
- Export leads to CSV/Google Sheet later.
- Send a daily owner summary.

The MVP should **not** do yet:
- Payment processing.
- Final booking confirmation without staff/backend confirmation.
- Student progress tracking.
- Parent portal.
- Full scheduling engine.
- Claims about guaranteed academic results.

## Safety Rules Summary

Auto-send is only allowed when:
- The answer is grounded in approved FAQ/class/package data.
- No private student records are requested or exposed.
- No refund/payment dispute decision is required.
- No exact slot confirmation is made unless backed by staff/backend data.
- No medical, special-needs, complaint, legal, or child-safety issue is involved.

Otherwise route to staff review.
