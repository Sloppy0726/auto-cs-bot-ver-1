"use strict";

const { providers } = require("./providers");

// Central "block until logged in" gate. Each provider-backed tool is checked
// against its provider's isConfigured() before any network call is made.

function buildAuthRequired(providerKey) {
  const provider = providers[providerKey];
  if (!provider) {
    return {
      code: "unknown_provider",
      provider: providerKey,
      message: `Unknown provider "${providerKey}".`
    };
  }
  return {
    code: "auth_required",
    provider: provider.name,
    message:
      `${provider.label} is not connected. Set ${provider.envVars.join(" and ")} ` +
      `in your environment, then retry.`,
    requiredEnv: provider.envVars
  };
}

// Returns null when ready, or an auth_required descriptor when blocked.
function checkProvider(providerKey) {
  if (!providerKey) return null; // meta tools need no provider
  const provider = providers[providerKey];
  if (!provider) return buildAuthRequired(providerKey);
  return provider.isConfigured() ? null : buildAuthRequired(providerKey);
}

// Snapshot of which providers are currently connected (used by smb-onboard).
function connectionStatus() {
  return Object.values(providers).map((p) => ({
    provider: p.name,
    label: p.label,
    connected: p.isConfigured(),
    requiredEnv: p.envVars
  }));
}

module.exports = { checkProvider, buildAuthRequired, connectionStatus };
