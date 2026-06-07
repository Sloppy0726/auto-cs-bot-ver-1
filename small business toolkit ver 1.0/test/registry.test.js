"use strict";

const assert = require("node:assert/strict");
const { REGISTRY } = require("../src/registry");
const { HANDLERS } = require("../src/handlers");
const { providers } = require("../src/providers");

function run() {
  assert.ok(REGISTRY.length >= 30, `expected ~31 tools, got ${REGISTRY.length}`);

  const names = new Set();
  const validProviders = new Set(Object.keys(providers));

  for (const t of REGISTRY) {
    assert.ok(t.name && typeof t.name === "string", "tool needs a name");
    assert.ok(!names.has(t.name), `duplicate tool name: ${t.name}`);
    names.add(t.name);

    assert.ok(t.title && t.summary && t.category, `${t.name}: missing title/summary/category`);
    assert.ok(t.inputSchema && t.inputSchema.type === "object", `${t.name}: inputSchema must be an object schema`);

    if (t.provider !== null) {
      assert.ok(validProviders.has(t.provider), `${t.name}: unknown provider ${t.provider}`);
    }

    assert.equal(typeof HANDLERS[t.name], "function", `${t.name}: missing handler`);
  }

  // Every handler maps back to a registry tool (no orphans).
  for (const name of Object.keys(HANDLERS)) {
    assert.ok(names.has(name), `handler ${name} has no registry entry`);
  }

  console.log(`registry: ${REGISTRY.length} tools, all with provider + schema + handler`);
}

run();
