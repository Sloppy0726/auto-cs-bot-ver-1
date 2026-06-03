"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const verbose = process.argv.includes("--verbose");
const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "deliverables",
  ".local",
  ".cache"
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, out);
    } else if (entry.isFile() && entry.name.endsWith(".test.js")) {
      out.push(fullPath);
    }
  }
  return out;
}

const tests = walk(root).sort((a, b) => a.localeCompare(b));
if (tests.length === 0) {
  console.error("No *.test.js files found.");
  process.exit(1);
}

let failed = 0;
for (const testFile of tests) {
  const relative = path.relative(root, testFile);
  console.log(`\n▶ ${relative}`);
  const result = spawnSync(process.execPath, [testFile], {
    cwd: root,
    stdio: verbose ? "inherit" : ["ignore", "pipe", "pipe"],
    env: process.env
  });
  if (!verbose) {
    if (result.stdout?.length) process.stdout.write(result.stdout);
    if (result.stderr?.length) process.stderr.write(result.stderr);
  }
  if (result.status !== 0) {
    failed += 1;
    console.error(`✖ ${relative} failed with exit code ${result.status}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed}/${tests.length} test files failed.`);
  process.exit(1);
}

console.log(`\n✓ ${tests.length} test files passed.`);
