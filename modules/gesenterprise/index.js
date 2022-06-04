const config = require("./config.json");
const mongoUrl = config.dbCredentials.mongoUrl;
const mongoDb = config.dbCredentials.database;
const debug  = require("debug")("debug");
const mongo = require("mongodb");
//const crypto = require("crypto");
// Logging
const info = debug.extend("info");
const warn = debug.extend("warn");
const error = debug.extend("error");
info.color = 4; //Blue
warn.color = 3; // Yellow
error.color = 1; // Red


function sanitizeInput(input) {
  // Sanitize input to prevent XSS and NoSQL injection
  //return input.replace(/[^a-zA-Z0-9]/g, "");
  // TO BE COMPLETED
  return input;

}

/**
* Database related stuff, like get user data,etc...
* @class
*/
class db {
  /**
  * Gets user data from Session Id.
  * @function
  * @param sessionId Session Id stored on the database.
  * @returns {object} Returns whether session is valid, if so also returns user ObjectId
  */
  static async isSessionValid(sessionId) {
    sessionId = sanitizeInput(sessionId);
    sessionId = mongo.ObjectId(sessionId);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = await client.db(mongoDb);
      const session = await dbClient.collection("sessions").findOne({"sessionId": sessionId});
      if (session.count() > 0 ) { // Add time validation
        return {
          "session": true,
          "userId": session.empId.toString()
        };
      } else { return { "session": false }; }
    } catch (err) {
      error(err);
      return false;
    } finally {
      await client.close();
    }
  }

  /**
  * Gets user data from Session Id.
  * @function
  * @param empId Employee Id stored on the database.
  * @returns {object} Returns all user data
  */
  static async empInfo(empId) {
    empId = sanitizeInput(empId);
    empId = mongo.ObjectId(empId);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = await client.db(mongoDb);
      const empData = await dbClient.collection("employees").findOne({"_id": empId}, {"_id": 0});
      if (empData.count() > 0) { return empData; } 
      else { return false; }
    } catch (err) {
      error(err);
      return false;
    } finally {
      await client.close();
    }
  }
}

/**
* HR related stuff like sending salaries, etc
* @class
*/
class hr {

}

module.exports = {
  info,
  warn,
  error,
  config,
  sanitizeInput,
  db,
  hr
};