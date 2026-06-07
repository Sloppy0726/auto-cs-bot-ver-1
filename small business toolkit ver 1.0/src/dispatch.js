"use strict";

const { REGISTRY_BY_NAME } = require("./registry");
const { HANDLERS } = require("./handlers");
const { checkProvider } = require("./auth");
const { ProviderError } = require("./providers/http");

// Minimal JSON-Schema check: required keys present + primitive type match.
// Avoids pulling in a validator dependency (repo is dependency-light).
function validateInput(schema = {}, input = {}) {
  const errors = [];
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return ["input must be an object"];
  }
  for (const key of schema.required || []) {
    if (input[key] === undefined || input[key] === null) errors.push(`missing required field: ${key}`);
  }
  for (const [key, spec] of Object.entries(schema.properties || {})) {
    if (input[key] === undefined || input[key] === null) continue;
    const expected = spec.type;
    if (!expected) continue;
    const actual = Array.isArray(input[key]) ? "array" : typeof input[key];
    const ok = expected === "number" ? actual === "number" : actual === expected;
    if (!ok) errors.push(`field ${key} should be ${expected}, got ${actual}`);
  }
  return errors;
}

// Returns a normalized result object:
//   success -> { ok: true, tool, summary, data }
//   failure -> { ok: false, tool, code, message, ...details }
async function dispatch(toolName, input = {}) {
  const entry = REGISTRY_BY_NAME.get(toolName);
  if (!entry) {
    return { ok: false, tool: toolName, code: "unknown_tool", message: `Unknown tool "${toolName}".` };
  }

  const validationErrors = validateInput(entry.inputSchema, input);
  if (validationErrors.length > 0) {
    return { ok: false, tool: toolName, code: "invalid_input", message: "Input validation failed.", errors: validationErrors };
  }

  const authBlock = checkProvider(entry.provider);
  if (authBlock) {
    return { ok: false, tool: toolName, ...authBlock };
  }

  const handler = HANDLERS[toolName];
  if (typeof handler !== "function") {
    return { ok: false, tool: toolName, code: "not_implemented", message: `No handler for "${toolName}".` };
  }

  try {
    const { summary, data } = await handler(input, { entry });
    return { ok: true, tool: toolName, summary, data };
  } catch (err) {
    if (err instanceof ProviderError) {
      return {
        ok: false,
        tool: toolName,
        code: "provider_error",
        provider: err.provider,
        status: err.status,
        message: err.message,
        body: err.body
      };
    }
    return { ok: false, tool: toolName, code: "handler_error", message: err.message };
  }
}

module.exports = { dispatch, validateInput };
