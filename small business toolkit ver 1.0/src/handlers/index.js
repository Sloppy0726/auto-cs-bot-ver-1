"use strict";

const finance = require("./finance");
const billing = require("./billing");
const crm = require("./crm");
const service = require("./service");
const marketing = require("./marketing");
const ops = require("./ops");
const briefings = require("./briefings");
const meta = require("./meta");

// Merge per-category handler maps into a single { toolName: handler } lookup.
const HANDLERS = Object.assign({}, finance, billing, crm, service, marketing, ops, briefings, meta);

module.exports = { HANDLERS };
