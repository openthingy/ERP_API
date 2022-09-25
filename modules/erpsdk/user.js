const mongo = require("mongodb");

const main = require("./index");
const mongoUrl = main.config.dbCredentials.mongoUrl;
const mongoDb = main.config.dbCredentials.database;


/**
* Authentication like account validation
* @class
*/
class auth {
  /**
  * Check if the login exists
  * @function
  * @param email Email
  * @param password SHA-256 encrypted password
  * @returns {boolean|string} Returns wheter account exists or not
  */
  static async login(email, password) {
    email = main.validation.sanitizeInput(email);
    password = main.validation.sanitizeInput(password);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = client.db(mongoDb);
      const login = await dbClient.collection("users").findOne({"email": email, "password": password});
      if (login) { return true; } else { return "WRONG_EMAIL_OR_PASSWORD"; }
    } catch (err) {
      main.error(err);
      return false;
    } finally {
      await client.close();
    }
  } 
}

module.exports = {
  auth
};