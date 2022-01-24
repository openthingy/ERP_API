const config = require("./config.json");
const debug  = require("debug")("debug");

// Logging
const info = debug.extend("info");
const warn = debug.extend("warn");
const error = debug.extend("error");
info.color = 4;
warn.color = 3;
error.color = 1;


module.exports = {
    info,
    warn,
    error,
    config
};