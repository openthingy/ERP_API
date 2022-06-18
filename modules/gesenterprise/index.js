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

/**
* Sanitizes any given input because of NoSQL injection
* @function
* @param input Input
* @returns {object} Returns a safe input
*/
function sanitizeInput(input) {
  // Escape all NoSQL injection characters
  // I have no idea how this works, thanks Github Copilot
  //let regex = /[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi;
  // I still dont know how to make security
  return input;
}


/**
* Database related stuff, like get user data,etc...
* @class
*/
class session {
  
  /**
  * Add a new session (for login)
  * @function
  * @param sessionId Session Id stored on the database.
  * @returns {object} Returns whether the Session Id was deleted
  */
  static async addSession(email, password) {
    email = sanitizeInput(email);
    password = sanitizeInput(password); // SHA-256 encrypted
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = await client.db(mongoDb);
      const emp = await dbClient.collection("employees").findOne({"email": email, "password": password}).count();
      if (emp.count() > 0) {
        const session = {
          "empId": emp._id,
          "sessionId": mongo.ObjectId(),
          "date": Date.now()
        };
        await dbClient.collection("sessions").insertOne(session);
      } else {
        return "WRONG_EMAIL_OR_PASSWORD";
      }
      
    } catch (err) {
      error(err);
      return false;
    } finally {
      await client.close();
    }
  }

  /**
  * Delete Session Id (in case of logout)
  * @function
  * @param sessionId Session Id stored on the database.
  * @returns {object} Returns whether the Session Id was deleted
  */
  static async deleteSession(sessionId) {
    sessionId = sanitizeInput(sessionId);
    sessionId = mongo.ObjectId(sessionId);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = await client.db(mongoDb);
      await dbClient.collection("sessions").deleteOne({"sessionId": sessionId});
      return true;
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
      if (session.count() > 0) {
        if (session.date.getTime() < 14400000) { // 14400000 miliseconds equals 4 hours
          return {
            "session": true,
            "empId": session.empId.toString()
          };
        } else { 
          await dbClient.collection("sessions").deleteOne({"sessionId": sessionId}); 
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
  session,
  hr
};