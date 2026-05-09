"use strict";

const path = require("node:path");
const { normalizeInbound } = require("../src/channelAdapter");
const { standardCases } = require("../test/channelAdapter.cases");
const { writeReadableReport } = require("../../scripts/readableSideBySideReport");

const rows = standardCases.map((c) => {
  const result = normalizeInbound(c.input);
  const expected = {
    channel: c.expectChannel,
    text: c.expectText,
    sender: c.expectSender,
    errors: c.expectErrors || []
  };
  const actual = {
    channel: result.channel,
    text: result.rawText,
    sender: result.senderId,
    errors: result.errors,
    replyToken: result.replyToken
  };
  const problems = [];
  if (actual.channel !== expected.channel) problems.push(`channel expected ${expected.channel}, got ${actual.channel}`);
  if (actual.text !== expected.text) problems.push("normalized text mismatch");
  if (actual.sender !== expected.sender) problems.push(`sender expected ${expected.sender}, got ${actual.sender}`);
  if (JSON.stringify(actual.errors) !== JSON.stringify(expected.errors)) problems.push(`errors expected ${expected.errors.join(",")}, got ${actual.errors.join(",")}`);
  return {
    name: c.name,
    status: problems.length ? "FAIL" : "PASS",
    keyResult: `${actual.channel} / ${actual.sender}`,
    context: { input: c.input },
    expected,
    actual,
    problems
  };
});

const out = path.join(__dirname, "..", "channel-adapter-side-by-side-results.md");
writeReadableReport(out, {
  title: "Channel Adapter ver 1.0 - Readable Side-by-side Results",
  description: "Each case compares the raw channel payload with the normalized inbound shape used by the pipeline.",
  rows
});
console.log(`Wrote ${rows.length} readable rows to ${out}`);
if (rows.some((row) => row.status !== "PASS")) process.exitCode = 1;
