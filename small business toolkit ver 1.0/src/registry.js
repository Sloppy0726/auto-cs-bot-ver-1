"use strict";

// Small-Business Toolkit registry.
// Mirrors Claude's small-business plugin tools (~31), recreated as real,
// provider-backed functions exposed over MCP. `provider: null` => meta tool
// (no external service required). inputSchema is a minimal JSON Schema; deeper
// per-tool fields are added as each tool is iterated / localized for HK.

const periodSchema = {
  type: "object",
  properties: {
    businessId: { type: "string", description: "Internal business identifier." },
    start: { type: "string", description: "Period start, ISO date (YYYY-MM-DD)." },
    end: { type: "string", description: "Period end, ISO date (YYYY-MM-DD)." }
  },
  additionalProperties: true
};

const emptySchema = { type: "object", properties: {}, additionalProperties: true };

const REGISTRY = [
  // ---- Finance (QuickBooks, with Square/PayPal/Stripe for revenue) ----
  { name: "business-pulse", category: "finance", provider: "quickbooks", title: "Business pulse",
    summary: "Snapshot of profit & loss for a quick health read.", inputSchema: periodSchema },
  { name: "cash-flow-snapshot", category: "finance", provider: "quickbooks", title: "Cash-flow snapshot",
    summary: "Cash inflows/outflows for the period.", inputSchema: periodSchema },
  { name: "margin-analyzer", category: "finance", provider: "quickbooks", title: "Margin analyzer",
    summary: "Gross/net margin breakdown from P&L.", inputSchema: periodSchema },
  { name: "close-month", category: "finance", provider: "quickbooks", title: "Close month",
    summary: "Trial balance to support the month-end close.", inputSchema: periodSchema },
  { name: "month-end-prep", category: "finance", provider: "quickbooks", title: "Month-end prep",
    summary: "Pre-close checklist data (trial balance).", inputSchema: periodSchema },
  { name: "month-heads-up", category: "finance", provider: "quickbooks", title: "Month heads-up",
    summary: "Early read on the current month's P&L.", inputSchema: periodSchema },
  { name: "quarterly-review", category: "finance", provider: "quickbooks", title: "Quarterly review",
    summary: "Quarter-to-date profit & loss.", inputSchema: periodSchema },
  { name: "plan-payroll", category: "finance", provider: "quickbooks", title: "Plan payroll",
    summary: "Active employees for payroll planning.", inputSchema: emptySchema },
  { name: "tax-prep", category: "finance", provider: "quickbooks", title: "Tax prep",
    summary: "P&L pulled for tax preparation.", inputSchema: periodSchema },
  { name: "tax-season-organizer", category: "finance", provider: "quickbooks", title: "Tax-season organizer",
    summary: "Recorded purchases/expenses to organize for tax season.", inputSchema: periodSchema },
  { name: "price-check", category: "finance", provider: "square", title: "Price check",
    summary: "Catalog items and current prices.", inputSchema: emptySchema },

  // ---- Billing ----
  { name: "invoice-chase", category: "billing", provider: "stripe", title: "Invoice chase",
    summary: "List open/overdue invoices to chase.", inputSchema: {
      type: "object",
      properties: { limit: { type: "number", description: "Max invoices to return (default 20)." } },
      additionalProperties: true
    } },

  // ---- CRM (Square customers / Gmail) ----
  { name: "crm-cleanup", category: "crm", provider: "square", title: "CRM cleanup",
    summary: "Scan customer list for duplicates / missing fields.", inputSchema: emptySchema },
  { name: "crm-maintenance", category: "crm", provider: "square", title: "CRM maintenance",
    summary: "Customer directory health overview.", inputSchema: emptySchema },
  { name: "lead-triage", category: "crm", provider: "google", title: "Lead triage",
    summary: "Recent inbound emails that look like new leads.", inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Gmail search query override." } },
      additionalProperties: true
    } },
  { name: "customer-pulse", category: "crm", provider: "square", title: "Customer pulse",
    summary: "Customer count and recent activity.", inputSchema: emptySchema },
  { name: "customer-pulse-check", category: "crm", provider: "square", title: "Customer pulse check",
    summary: "Lightweight at-risk / inactive customer read.", inputSchema: emptySchema },
  { name: "call-list", category: "crm", provider: "square", title: "Call list",
    summary: "Customers to follow up with by phone.", inputSchema: emptySchema },

  // ---- Service (Gmail) ----
  { name: "handle-complaint", category: "service", provider: "google", title: "Handle complaint",
    summary: "Surface inbound complaint emails to action.", inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Gmail search query override." } },
      additionalProperties: true
    } },
  { name: "ticket-deflector", category: "service", provider: "google", title: "Ticket deflector",
    summary: "Recent support emails that may be self-serviceable.", inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Gmail search query override." } },
      additionalProperties: true
    } },

  // ---- Marketing (Canva, Gmail) ----
  { name: "run-campaign", category: "marketing", provider: "google", title: "Run campaign",
    summary: "Draft a campaign email in Gmail.", inputSchema: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email." },
        subject: { type: "string", description: "Email subject." },
        body: { type: "string", description: "Email body." }
      },
      required: ["to", "subject", "body"],
      additionalProperties: true
    } },
  { name: "content-strategy", category: "marketing", provider: "canva", title: "Content strategy",
    summary: "Existing Canva designs to anchor a content plan.", inputSchema: emptySchema },
  { name: "canva-creator", category: "marketing", provider: "canva", title: "Canva creator",
    summary: "List Canva brand templates to create from.", inputSchema: emptySchema },
  { name: "sales-brief", category: "marketing", provider: "square", title: "Sales brief",
    summary: "Recent orders summarized for a sales brief.", inputSchema: emptySchema },

  // ---- Ops / Legal (DocuSign, Google Drive) ----
  { name: "contract-review", category: "ops", provider: "docusign", title: "Contract review",
    summary: "Recent envelopes awaiting review.", inputSchema: emptySchema },
  { name: "review-contract", category: "ops", provider: "docusign", title: "Review contract",
    summary: "Detail of envelopes to review/sign.", inputSchema: emptySchema },
  { name: "job-post-builder", category: "ops", provider: "google", title: "Job-post builder",
    summary: "List Drive docs to base a job post on.", inputSchema: emptySchema },

  // ---- Briefings (aggregate finance read) ----
  { name: "friday-brief", category: "briefings", provider: "quickbooks", title: "Friday brief",
    summary: "End-of-week P&L read.", inputSchema: periodSchema },
  { name: "monday-brief", category: "briefings", provider: "quickbooks", title: "Monday brief",
    summary: "Start-of-week P&L read.", inputSchema: periodSchema },

  // ---- Meta (no provider) ----
  { name: "smb-router", category: "meta", provider: null, title: "SMB router",
    summary: "Suggest which toolkit tool fits a free-text request.", inputSchema: {
      type: "object",
      properties: { request: { type: "string", description: "What the user wants to do." } },
      required: ["request"],
      additionalProperties: true
    } },
  { name: "smb-onboard", category: "meta", provider: null, title: "SMB onboard",
    summary: "Show which providers are connected and what to set up.", inputSchema: emptySchema }
];

const REGISTRY_BY_NAME = new Map(REGISTRY.map((t) => [t.name, t]));

module.exports = { REGISTRY, REGISTRY_BY_NAME };
