"use strict";

const stripe = require("./stripe");
const quickbooks = require("./quickbooks");
const square = require("./square");
const paypal = require("./paypal");
const google = require("./google");
const canva = require("./canva");
const docusign = require("./docusign");

const providers = { stripe, quickbooks, square, paypal, google, canva, docusign };

module.exports = { providers };
