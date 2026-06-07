"use strict";

const { providers } = require("../providers");

module.exports = {
  "invoice-chase": async (input = {}) => {
    const limit = Number.isFinite(input.limit) ? input.limit : 20;
    const result = await providers.stripe.request("/invoices", {
      query: { status: "open", limit }
    });
    const invoices = Array.isArray(result?.data) ? result.data : [];
    return {
      summary: `Invoice chase: ${invoices.length} open invoice(s) on Stripe.`,
      data: invoices.map((inv) => ({
        id: inv.id,
        customer: inv.customer_email || inv.customer_name || inv.customer,
        amountDue: inv.amount_due,
        currency: inv.currency,
        dueDate: inv.due_date,
        hostedUrl: inv.hosted_invoice_url
      }))
    };
  }
};
