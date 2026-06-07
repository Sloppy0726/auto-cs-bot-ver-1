"use strict";

const assert = require("node:assert/strict");
const { isOwner, normalizePhone, loadOwnerPhones } = require("../src/ownerRegistry");
const { resolveCommand } = require("../src/commandResolver");
const { createOwnerConsole } = require("../src/ownerConsole");

// Fake toolkit dispatch so tests never touch providers / network.
function fakeDispatch() {
  const calls = [];
  const fn = async (tool, args) => {
    calls.push({ tool, args });
    if (tool === "smb-router") {
      return { ok: true, tool, data: { suggestions: [{ name: "business-pulse" }] } };
    }
    return { ok: true, tool, summary: `${tool} ok`, data: { total: 3 } };
  };
  fn.calls = calls;
  return fn;
}

async function run() {
  // --- ownerRegistry ---
  assert.equal(normalizePhone("+852 6111 2222@c.us"), "85261112222");
  assert.equal(isOwner("85261112222@c.us", ["85261112222"]), true);
  assert.equal(isOwner("85261112222", ["61112222"]), true, "suffix match (no country code)");
  assert.equal(isOwner("85299998888", ["85261112222"]), false);
  assert.deepEqual(loadOwnerPhones({ OWNER_PHONES: "+852 6111 2222, 85299998888" }), ["85261112222", "85299998888"]);

  // --- commandResolver ---
  assert.equal(resolveCommand("選單").type, "menu");
  assert.equal(resolveCommand("?").type, "menu");
  assert.deepEqual(resolveCommand("追數"), { type: "tool", tool: "invoice-chase", source: "alias" });
  assert.equal(resolveCommand("3").tool, "invoice-chase", "menu item 3 = invoice-chase");
  assert.equal(resolveCommand("睇下公司近排表現點").type, "nl");

  // --- ownerConsole behaviour ---
  const phones = ["85261112222"];

  // Non-owner -> not handled, normal flow continues.
  const nonOwner = createOwnerConsole({ dispatch: fakeDispatch(), ownerPhones: phones });
  assert.deepEqual(await nonOwner.handle({ senderId: "85299998888", text: "追數" }), { handled: false });

  // Menu.
  const c1 = createOwnerConsole({ dispatch: fakeDispatch(), ownerPhones: phones });
  const menu = await c1.handle({ senderId: "85261112222", text: "?" });
  assert.ok(menu.handled && menu.text.includes("1. 今日生意"), "menu should list items");

  // Keyword alias -> runs the tool.
  const d2 = fakeDispatch();
  const c2 = createOwnerConsole({ dispatch: d2, ownerPhones: phones });
  const r2 = await c2.handle({ senderId: "85261112222", text: "追數" });
  assert.equal(r2.tool, "invoice-chase");
  assert.ok(r2.text.startsWith("✅ 追未付數"), `got: ${r2.text}`);
  assert.equal(d2.calls.at(-1).tool, "invoice-chase");

  // Numbered menu pick.
  const d3 = fakeDispatch();
  const c3 = createOwnerConsole({ dispatch: d3, ownerPhones: phones });
  const r3 = await c3.handle({ senderId: "85261112222", text: "1" });
  assert.equal(r3.tool, "business-pulse");

  // Natural language -> smb-router fallback -> business-pulse.
  const d4 = fakeDispatch();
  const c4 = createOwnerConsole({ dispatch: d4, ownerPhones: phones });
  const r4 = await c4.handle({ senderId: "85261112222", text: "睇下公司近排表現點" });
  assert.ok(d4.calls.some((c) => c.tool === "smb-router"), "should consult smb-router");
  assert.equal(r4.tool, "business-pulse");

  // Injected local-LLM router takes priority over smb-router.
  const d5 = fakeDispatch();
  const c5 = createOwnerConsole({
    dispatch: d5,
    ownerPhones: phones,
    toolRouter: async () => ({ tool: "cash-flow-snapshot", args: {} })
  });
  const r5 = await c5.handle({ senderId: "85261112222", text: "啲錢夠唔夠用呀" });
  assert.equal(r5.tool, "cash-flow-snapshot");
  assert.ok(!d5.calls.some((c) => c.tool === "smb-router"), "LLM router should pre-empt smb-router");

  // Write tool -> confirm gate, then execute on 確認.
  const d6 = fakeDispatch();
  const c6 = createOwnerConsole({ dispatch: d6, ownerPhones: phones });
  const ask = await c6.handle({ senderId: "85261112222", text: "出email宣傳" });
  assert.equal(ask.awaitingConfirm, true);
  assert.ok(!d6.calls.some((c) => c.tool === "run-campaign"), "must not run before confirm");
  const done = await c6.handle({ senderId: "85261112222", text: "確認" });
  assert.equal(done.tool, "run-campaign");
  assert.ok(d6.calls.some((c) => c.tool === "run-campaign"), "runs after confirm");

  // Cancel path.
  const c7 = createOwnerConsole({ dispatch: fakeDispatch(), ownerPhones: phones });
  await c7.handle({ senderId: "85261112222", text: "出email宣傳" });
  const cancelled = await c7.handle({ senderId: "85261112222", text: "取消" });
  assert.equal(cancelled.text, "好,已取消。");

  console.log("ownerConsole: registry, resolver, menu, alias, number, NL, LLM-router, confirm/cancel all passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
