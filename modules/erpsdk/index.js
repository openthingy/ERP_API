const config = require("../../config.json");
const debug  = require("debug")("debug");

// Modules
const { auth } = require("./user");
const { time } = require("./time");
// Logging
const info = debug.extend("info");
const warn = debug.extend("warn");
const error = debug.extend("error");
info.color = 4; // Blue
warn.color = 3; // Yellow
error.color = 1; // Red


/**
* Database related stuff, like get user data,etc...
* @class
*/
class validation {
  /**
  * Sanitizes any given input because of NoSQL injection
  * @function
  * @param input Input
  * @returns {object} Returns a safe input
  */
  static sanitizeInput(input) {
    // Escape all NoSQL injection characters
    // I still dont know how to make security
    // TBD
    return input;
  }

}

module.exports = {
  info,
  warn,
  error,
  config,
  validation,
  auth,
  time
};