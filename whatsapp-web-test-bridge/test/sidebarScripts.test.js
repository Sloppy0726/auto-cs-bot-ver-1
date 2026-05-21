"use strict";

const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const {
  buildOpenNextChatNeedingAttentionScript,
  buildReadSidebarSnapshotScript
} = require("../src/sidebarScripts");

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function buildDom(rows) {
  const html = rows
    .map((r) => `<div role="row" aria-label="${escapeAttr(r.aria || "")}"></div>`)
    .join("");
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`, {
    runScripts: "outside-only"
  });
  if (typeof dom.window.document.elementFromPoint !== "function") {
    dom.window.document.elementFromPoint = () => null;
  }
  const rowEls = dom.window.document.querySelectorAll('[role="row"]');
  rows.forEach((r, i) => {
    Object.defineProperty(rowEls[i], "innerText", {
      configurable: true,
      get() {
        return r.text || "";
      }
    });
    rowEls[i].scrollIntoView = () => {};
  });
  return dom;
}

function runOpen(dom, args = {}) {
  return JSON.parse(dom.window.eval(buildOpenNextChatNeedingAttentionScript(args)));
}

function runSnapshot(dom) {
  return JSON.parse(dom.window.eval(buildReadSidebarSnapshotScript()));
}

let passed = 0;
function testCase(name, fn) {
  fn();
  passed += 1;
  // Uncomment for verbose runs:
  // console.log(`  ✓ ${name}`);
  void name;
}

testCase("snapshot collects rows with a time pattern and ignores rows without one", () => {
  const dom = buildDom([
    { aria: "Alice", text: "Alice 上午10:30 食咗飯未" },
    { aria: "Bob", text: "Bob 下午2:00 點呀" },
    { aria: "Header", text: "Pinned messages" }
  ]);
  const { snapshot } = runSnapshot(dom);
  assert.deepEqual(Object.keys(snapshot).sort(), ["Alice", "Bob"]);
  assert.equal(snapshot.Alice, "Alice 上午10:30 食咗飯未");
  assert.equal(snapshot.Bob, "Bob 下午2:00 點呀");
});

testCase("unread_badge takes precedence over row_changed", () => {
  const dom = buildDom([
    { aria: "Alice 1 個未讀訊息", text: "Alice 上午10:30 食咗飯未" },
    { aria: "Bob", text: "Bob 下午2:00 點呀" }
  ]);
  const result = runOpen(dom, {
    seenFingerprints: { Bob: "stale-fingerprint-value" }
  });
  assert.equal(result.opened, true);
  assert.equal(result.chatKey, "Alice");
  assert.equal(result.reason, "unread_badge");
  assert.equal(result.preview, "Alice 上午10:30 食咗飯未");
  assert.ok(result.snapshot && result.snapshot.Alice && result.snapshot.Bob);
});

testCase("row_changed fires when seenFingerprints has a different value", () => {
  const dom = buildDom([
    { aria: "Bob", text: "Bob 下午2:00 點呀" }
  ]);
  const result = runOpen(dom, {
    seenFingerprints: { Bob: "old-fingerprint" }
  });
  assert.equal(result.opened, true);
  assert.equal(result.chatKey, "Bob");
  assert.equal(result.reason, "row_changed");
});

testCase("row_changed does NOT fire when seenFingerprints matches the current value", () => {
  const dom = buildDom([
    { aria: "Bob", text: "Bob 下午2:00 點呀" }
  ]);
  const { snapshot } = runSnapshot(dom);
  const result = runOpen(dom, { seenFingerprints: snapshot });
  assert.equal(result.opened, false);
});

testCase("row_changed does NOT fire when chatKey is missing from seenFingerprints (first-sight chat)", () => {
  const dom = buildDom([
    { aria: "Bob", text: "Bob 下午2:00 點呀" }
  ]);
  const result = runOpen(dom, { seenFingerprints: {} });
  assert.equal(result.opened, false);
});

testCase("latestIsOutgoing (你：) is excluded from row_changed candidates", () => {
  const dom = buildDom([
    {
      aria: "Bob 你：好呀我會準時到",
      text: "Bob 下午2:00 你：好呀我會準時到"
    }
  ]);
  const result = runOpen(dom, {
    seenFingerprints: { Bob: "old-fingerprint" }
  });
  assert.equal(result.opened, false);
});

testCase("latestIsOutgoing (You:) is excluded from row_changed candidates", () => {
  const dom = buildDom([
    { aria: "You: see you tomorrow", text: "Carol AM10:15 see you" }
  ]);
  const result = runOpen(dom, {
    seenFingerprints: { Carol: "old-fingerprint" }
  });
  assert.equal(result.opened, false);
});

testCase("activeChatTitle is skipped even if it has the unread badge", () => {
  const dom = buildDom([
    { aria: "Alice 1 unread message", text: "Alice 上午10:30 hi" }
  ]);
  const result = runOpen(dom, { activeChatTitle: "Alice" });
  assert.equal(result.opened, false);
  assert.ok(result.snapshot && result.snapshot.Alice);
});

testCase("cooldownPreview suppresses a re-click of the same row", () => {
  const dom = buildDom([
    { aria: "Alice 1 unread message", text: "Alice 上午10:30 hi" }
  ]);
  const previewSnippet = "Alice 上午10:30 hi";
  const result = runOpen(dom, { cooldownPreview: previewSnippet });
  assert.equal(result.opened, false);
  assert.equal(result.skipped, true);
  assert.equal(result.preview, previewSnippet);
});

testCase("rows without a time pattern are filtered out of candidates", () => {
  const dom = buildDom([
    { aria: "Header", text: "Pinned messages" },
    { aria: "Search", text: "Search or start a new chat" }
  ]);
  const result = runOpen(dom, {
    seenFingerprints: { "Pinned messages": "anything" }
  });
  assert.equal(result.opened, false);
  assert.deepEqual(result.snapshot, {});
});

testCase("snapshot fingerprints are stable when the row is unchanged (no flapping)", () => {
  const dom = buildDom([
    { aria: "Alice", text: "Alice 上午10:30 hi" },
    { aria: "Bob", text: "Bob 下午2:00 hello" }
  ]);
  const first = runSnapshot(dom).snapshot;
  const second = runSnapshot(dom).snapshot;
  const third = runSnapshot(dom).snapshot;
  assert.deepEqual(first, second);
  assert.deepEqual(second, third);
});

testCase("snapshot fingerprint changes when the row's latest message changes", () => {
  const before = buildDom([
    { aria: "Alice", text: "Alice 上午10:30 hi" }
  ]);
  const after = buildDom([
    { aria: "Alice", text: "Alice 上午10:31 are you there" }
  ]);
  const beforeFp = runSnapshot(before).snapshot.Alice;
  const afterFp = runSnapshot(after).snapshot.Alice;
  assert.notEqual(beforeFp, afterFp);
});

console.log(`sidebarScripts: ${passed} tests passed`);
