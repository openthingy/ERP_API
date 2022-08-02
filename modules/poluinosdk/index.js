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


/**
* Database related stuff, like get user data,etc...
* @class
*/
class validation {
  static sanitizeInput(input) {
    // Escape all NoSQL injection characters
    // I have no idea how this works, thanks Github Copilot
    //let regex = /[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi;
    // I still dont know how to make security
    return input;
  }

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
    email = validation.sanitizeInput(email);
    password = validation.sanitizeInput(password); // SHA-256 encrypted
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = await client.db(mongoDb);
      const user = await dbClient.collection("users").findOne({"email": email, "password": password}).count();
      if (user.count() > 0) {
        const session = {
          "_id": mongo.ObjectId(),
          "userId": user._id,
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
    sessionId = validation.sanitizeInput(sessionId);
    sessionId = mongo.ObjectId(sessionId);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = await client.db(mongoDb);
      await dbClient.collection("sessions").deleteOne({"_id": sessionId});
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
  * @returns {object|boolean} Returns whether session is valid, if so also returns user ObjectId
  */
  static async isSessionValid(sessionId) {
    sessionId = validation.sanitizeInput(sessionId);
    sessionId = mongo.ObjectId(sessionId);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = await client.db(mongoDb);
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
  session
};