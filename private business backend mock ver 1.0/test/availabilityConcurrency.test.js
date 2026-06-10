"use strict";

// Regression test for the availability-store cross-process race fix.
// Several processes write bookings to the SAME JSON file at the same time.
// Without the lock, their read-modify-write cycles clobber each other
// (last-writer-wins) and some bookings are lost. With the lock, every write
// is preserved.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { createAvailabilityStore } = require("../src/availabilityStore");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "avail-conc-"));
const filePath = path.join(tmpDir, "availability.json");
const storePath = require.resolve("../src/availabilityStore");
const N = 8;

// Pre-create the state file so children don't race on first-time initialization.
createAvailabilityStore({ filePath }).reset();

function childScript(i) {
  return `
    const { createAvailabilityStore } = require(${JSON.stringify(storePath)});
    const store = createAvailabilityStore({ filePath: ${JSON.stringify(filePath)} });
    const hh = String(11 + ${i}).padStart(2, "0");
    const r = store.addBooking("prince_snooker", {
      date: "2026-07-01", time: hh + ":00", durationMinutes: 30, resourceId: "res_prince_table_1"
    });
    if (!r.ok) { console.error("child ${i} failed: " + r.error); process.exit(2); }
  `;
}

function runChild(i) {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, ["-e", childScript(i)], (err, _stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve();
    });
  });
}

async function run() {
  await Promise.all(Array.from({ length: N }, (_, i) => runChild(i)));

  const store = createAvailabilityStore({ filePath });
  const bookings = store.listBookings("prince_snooker");
  assert.equal(bookings.length, N, `all ${N} concurrent cross-process bookings must persist (got ${bookings.length})`);

  const times = new Set(bookings.map((b) => b.time));
  assert.equal(times.size, N, "every distinct booking time should be present");
  assert.equal(fs.existsSync(`${filePath}.lock`), false, "lock file should be released after writes");

  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`availabilityConcurrency: ${N} concurrent cross-process writes all persisted`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
