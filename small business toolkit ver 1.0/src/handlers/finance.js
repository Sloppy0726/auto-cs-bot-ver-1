"use strict";

// Finance handlers. Provider creds are guaranteed present by the dispatch
// auth-gate before any handler runs, so handlers call the real API directly.

const { providers } = require("../providers");

function periodParams(input = {}) {
  const params = {};
  if (input.start) params.start_date = input.start;
  if (input.end) params.end_date = input.end;
  return params;
}

async function profitAndLoss(input, label) {
  const report = await providers.quickbooks.request("/reports/ProfitAndLoss", { query: periodParams(input) });
  return { summary: `${label}: pulled QuickBooks Profit & Loss.`, data: report };
}

module.exports = {
  "business-pulse": (input) => profitAndLoss(input, "Business pulse"),
  "month-heads-up": (input) => profitAndLoss(input, "Month heads-up"),
  "quarterly-review": (input) => profitAndLoss(input, "Quarterly review"),
  "tax-prep": (input) => profitAndLoss(input, "Tax prep"),

  "cash-flow-snapshot": async (input) => {
    const report = await providers.quickbooks.request("/reports/CashFlow", { query: periodParams(input) });
    return { summary: "Cash-flow snapshot: pulled QuickBooks Cash Flow.", data: report };
  },

  "margin-analyzer": async (input) => {
    const report = await providers.quickbooks.request("/reports/ProfitAndLoss", { query: periodParams(input) });
    return { summary: "Margin analyzer: pulled P&L for margin breakdown.", data: report };
  },

  "close-month": async (input) => {
    const report = await providers.quickbooks.request("/reports/TrialBalance", { query: periodParams(input) });
    return { summary: "Close month: pulled QuickBooks Trial Balance.", data: report };
  },

  "month-end-prep": async (input) => {
    const report = await providers.quickbooks.request("/reports/TrialBalance", { query: periodParams(input) });
    return { summary: "Month-end prep: pulled Trial Balance.", data: report };
  },

  "plan-payroll": async () => {
    const result = await providers.quickbooks.request("/query", {
      query: { query: "select * from Employee where Active = true" }
    });
    return { summary: "Plan payroll: fetched active employees.", data: result };
  },

  "tax-season-organizer": async () => {
    const result = await providers.quickbooks.request("/query", {
      query: { query: "select * from Purchase maxresults 100" }
    });
    return { summary: "Tax-season organizer: fetched recorded purchases.", data: result };
  },

  "price-check": async () => {
    const result = await providers.square.request("/catalog/list", { query: { types: "ITEM" } });
    return { summary: "Price check: listed Square catalog items.", data: result };
  }
};
