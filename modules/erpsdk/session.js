const poluino = require("poluinosdk");
const config = require("./config.json");
const mongoUrl = config.dbCredentials.mongoUrl;
const mongoDb = config.dbCredentials.database;
const mongo = require("mongodb");

/**
* Database related stuff, like get user data,etc...
* @class
*/
class session {
  
  /**
  * Add a new session (for login)
  * @function
  * @param sessionId Session Id stored on the database.
  * @returns {object} Returns the Session Id
  */
  static async addLoginSession(email, password) {
    email = poluino.validation.sanitizeInput(email);
    password = poluino.validation.sanitizeInput(password); // SHA-256 encrypted
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = client.db(mongoDb);
      const user = await dbClient.collection("users").findOne({"email": email, "password": password});
      if (user) {
        const session = {
          "_id": mongo.ObjectId(),
          "userId": user._id,
          "sessionType": "login",
          "date": new Date()
        };
        await dbClient.collection("sessions").insertOne(session);
        return session._id;
      } else {
        return "WRONG_EMAIL_OR_PASSWORD";
      }
    } catch (err) {
      poluino.error(err);
      return false;
    } finally {
      await client.close();
    }
  }

  /**
  * Add a new session (for API Key)
  * @function
  * @param userId User Id stored on the database.
  * @returns {object} Returns the Session Id
  */
  static async addAPISession(userId) {
    userId = poluino.validation.sanitizeInput(userId);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = client.db(mongoDb);
      const user = await dbClient.collection("users").findOne({"_id": userId});
      if (user) {
        const session = {
          "_id": mongo.ObjectId(),
          "userId": user._id,
          "sessionType": "api",
          "date": new Date()
        };
        await dbClient.collection("sessions").insertOne(session);
        return session._id;
      } else {
        return "WRONG_API_KEY";
      }
    } catch (err) {
      poluino.error(err);
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
    sessionId = poluino.validation.sanitizeInput(sessionId);
    sessionId = mongo.ObjectId(sessionId);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = client.db(mongoDb);
      await dbClient.collection("sessions").deleteOne({"_id": sessionId});
      return true;
    } catch (err) {
      poluino.error(err);
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
  static async validateSession(sessionId) {
    sessionId = poluino.validation.sanitizeInput(sessionId);
    sessionId = mongo.ObjectId(sessionId);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = client.db(mongoDb);
      const session = await dbClient.collection("sessions").findOne({"_id": sessionId});
      if (session) {
        if (session.date > 14400000 && session.type == "login") { // 14400000 miliseconds equals 4 hours
          // Only Login Sessions expire
          this.deleteSession(sessionId);
          return "SESSION_NOT_VALID"; 
        } else {
          return {
            "session": {
              "active": true,
              "type": session.type
            },
            "userId": session.userId.toString()
          };

        }
      } else { return "SESSION_NOT_FOUND"; }
    } catch (err) {
      poluino.error(err);
      return false;
    } finally {
      await client.close();
    }
  }
}


module.exports = {
  session
};