"use strict";

const { createOwnerConsole } = require("./ownerConsole");
const { isOwner, loadOwnerPhones, normalizePhone } = require("./ownerRegistry");
const { resolveCommand } = require("./commandResolver");

module.exports = { createOwnerConsole, isOwner, loadOwnerPhones, normalizePhone, resolveCommand };
