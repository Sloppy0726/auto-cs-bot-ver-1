"use strict";

const assert = require("node:assert/strict");
const { createPipeline } = require("../src/pipeline");
const { standardCases } = require("./pipeline.cases");

async function run() {
  const pipeline = createPipeline({
    llmAdapter: async (prompt, context) => {
      if (context.decision.action === "handoff") {
        return { text: "【員工交接】\n意圖：" + context.intent.primaryIntent + "\n建議下一步：由同事跟進。" };
      }
      return { text: context.knowledge.bestMatch?.answer || "請問你想了解邊方面？" };
    }
  });

  for (const c of standardCases) {
    const result = await pipeline.runMessage(c.input);
    assert.equal(result.finalStatus, c.expectStatus, `${c.name}: finalStatus mismatch`);
    assert.equal(result.decision.action, c.expectAction, `${c.name}: action mismatch`);
    if (c.expectStatus === "ready_to_send") {
      assert.equal(result.outbound.status, "ready_to_send", `${c.name}: outbound mismatch`);
      assert.ok(result.safety.safeToSend, `${c.name}: safety should allow send`);
    } else {
      assert.ok(result.staffItem, `${c.name}: staff item missing`);
    }
  }

  assert.ok(pipeline.inbox.list().length >= 2, "staff inbox should collect held items");
  console.log(`pipeline: ${standardCases.length + 1} tests passed`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
