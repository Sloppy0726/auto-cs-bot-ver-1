"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createConversationContextStore } = require("../src/conversationContext");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "convo-persist-"));
const filePath = path.join(tmpDir, "context.json");

function whatsappInbound(text, businessId = "beauty_demo", sender = "85291110001") {
  return {
    channel: "whatsapp",
    businessId,
    messages: [{ from: sender, id: `wamid_${text.length}`, type: "text", text: { body: text } }]
  };
}

const first = createConversationContextStore({ filePath });
const ctx1 = first.enrichPayload(whatsappInbound("想預約聽日6點facial"));
ctx1.commit();

assert.ok(fs.existsSync(filePath), "commit should persist context file");
const onDisk = JSON.parse(fs.readFileSync(filePath, "utf8"));
assert.equal(Object.keys(onDisk.histories).length, 1, "should persist one conversation key");
const key = Object.keys(onDisk.histories)[0];
assert.equal(onDisk.histories[key].length, 1, "history should contain one message");

const reloaded = createConversationContextStore({ filePath });
assert.equal(reloaded.getHistory(key).length, 1, "reloaded store should hydrate history");

const ctx2 = reloaded.enrichPayload(whatsappInbound("facial"));
assert.ok(ctx2.changed, "second message should stitch using hydrated booking context");
assert.ok(ctx2.stitchedText.includes("聽日"), "stitched text should pull date token from persisted history");
ctx2.commit();
assert.equal(reloaded.getHistory(key).length, 2, "history should grow after commit");

const onDisk2 = JSON.parse(fs.readFileSync(filePath, "utf8"));
assert.equal(onDisk2.histories[key].length, 2, "persisted history should grow");

const corruptPath = path.join(tmpDir, "corrupt.json");
fs.writeFileSync(corruptPath, "{not json");
const fromCorrupt = createConversationContextStore({ filePath: corruptPath });
assert.equal(fromCorrupt.getHistory("any").length, 0, "corrupt file should hydrate to empty store");

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log("conversationContext.persistence: 8 tests passed");
