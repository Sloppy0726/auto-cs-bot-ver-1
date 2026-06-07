"use strict";

const { providers } = require("../providers");

async function listCustomers(label) {
  const result = await providers.square.request("/customers", { query: { limit: 100 } });
  const customers = Array.isArray(result?.customers) ? result.customers : [];
  return { customers, result, label };
}

module.exports = {
  "crm-cleanup": async () => {
    const { customers } = await listCustomers();
    const seen = new Map();
    const duplicates = [];
    const missingContact = [];
    for (const c of customers) {
      const key = (c.email_address || c.phone_number || "").toLowerCase();
      if (!c.email_address && !c.phone_number) missingContact.push(c.id);
      if (key) {
        if (seen.has(key)) duplicates.push({ key, ids: [seen.get(key), c.id] });
        else seen.set(key, c.id);
      }
    }
    return {
      summary: `CRM cleanup: ${duplicates.length} duplicate(s), ${missingContact.length} missing contact info.`,
      data: { total: customers.length, duplicates, missingContact }
    };
  },

  "crm-maintenance": async () => {
    const { customers } = await listCustomers();
    return { summary: `CRM maintenance: ${customers.length} customer record(s).`, data: { total: customers.length } };
  },

  "customer-pulse": async () => {
    const { customers } = await listCustomers();
    return { summary: `Customer pulse: ${customers.length} customer(s) on file.`, data: { total: customers.length } };
  },

  "customer-pulse-check": async () => {
    const { customers } = await listCustomers();
    const noRecentActivity = customers.filter((c) => !c.updated_at).length;
    return {
      summary: `Customer pulse check: ${customers.length} total, ${noRecentActivity} with no recent activity.`,
      data: { total: customers.length, noRecentActivity }
    };
  },

  "call-list": async () => {
    const { customers } = await listCustomers();
    const callable = customers.filter((c) => c.phone_number);
    return {
      summary: `Call list: ${callable.length} customer(s) with a phone number.`,
      data: callable.map((c) => ({ id: c.id, name: `${c.given_name || ""} ${c.family_name || ""}`.trim(), phone: c.phone_number }))
    };
  },

  "lead-triage": async (input = {}) => {
    const q = input.query || "newer_than:7d in:inbox";
    const result = await providers.google.request("gmail", "/users/me/messages", { query: { q, maxResults: 25 } });
    const messages = Array.isArray(result?.messages) ? result.messages : [];
    return { summary: `Lead triage: ${messages.length} recent inbound email(s) matching "${q}".`, data: messages };
  }
};
