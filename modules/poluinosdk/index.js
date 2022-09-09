const config = require("./config.json");
const mongoUrl = config.dbCredentials.mongoUrl;
const mongoDb = config.dbCredentials.database;
const debug  = require("debug")("debug");
const mongo = require("mongodb");
// Modules
const { session } = require("./session");

//const crypto = require("crypto");
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


/**
 * User-related functions like edit email, password, etc
 * @class
 */
class user {
  /**
  * Gets user data from Session Id.
  * @function
  * @param sessionId Session Id stored on the database.
  * @returns {object|boolean} Returns whether session is valid, if so also returns user ObjectId
  */
  static async isSessionValid(sessionId) {
    sessionId = validation.sanitizeInput(sessionId);
    sessionId = mongo.ObjectId(sessionId);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = client.db(mongoDb);
      const session = await dbClient.collection("sessions").findOne({"_id": sessionId});
      if (session.count() > 0) {
        if (session.date < 14400000) { // 14400000 miliseconds equals 4 hours
          return {
            "session": true,
            "userId": session.userId.toString()
          };
        } else { 
          await dbClient.collection("sessions").deleteOne({"_id": sessionId}); 
          return false; 
        }
      } else { return false; }
    } catch (err) {
      error(err);
      return false;
    } finally {
      await client.close();
    }
  }
}

module.exports = {
  info,
  warn,
  error,
  config,
  validation,
  session,
  user
};