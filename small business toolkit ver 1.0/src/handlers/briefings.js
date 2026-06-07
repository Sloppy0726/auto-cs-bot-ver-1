"use strict";

const { providers } = require("../providers");

async function weeklyPnl(label) {
  const report = await providers.quickbooks.request("/reports/ProfitAndLoss", {
    query: { date_macro: "This Week-to-date" }
  });
  return { summary: `${label}: pulled week-to-date Profit & Loss.`, data: report };
}

module.exports = {
  "friday-brief": () => weeklyPnl("Friday brief"),
  "monday-brief": () => weeklyPnl("Monday brief")
};
