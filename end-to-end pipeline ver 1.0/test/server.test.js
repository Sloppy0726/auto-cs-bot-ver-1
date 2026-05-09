"use strict";

const assert = require("node:assert/strict");
const { _internal } = require("../src/server");

assert.equal(_internal.statusCodeForError(new SyntaxError("bad json")), 400, "SyntaxError should be treated as bad request");
assert.equal(_internal.statusCodeForError(new Error("request_too_large")), 413, "request_too_large should be payload too large");
assert.equal(_internal.statusCodeForError(new Error("database unavailable")), 500, "unexpected errors stay server errors");

console.log("server: 3 tests passed");
