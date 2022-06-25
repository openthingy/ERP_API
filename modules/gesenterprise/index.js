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

  static vatId(vatId) {
    const countryCodes = ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES", "FI", "FR", "GB", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"];
    if (countryCodes.includes(vatId.substring(0, 2))) {
      return vatId;
    } else {
      return false;
    }
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
      const emp = await dbClient.collection("employees").findOne({"email": email, "password": password}).count();
      if (emp.count() > 0) {
        const session = {
          "_id": mongo.ObjectId(),
          "empId": emp._id,
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
            "empId": session.empId.toString()
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

/**
* Employee related stuff likegetting employee information, legal documents, etc..
* @class
*/
class employee {
  /**
  * Create a new employee.
  * @function
  * @param sessionId Session Id stored on the database.
  * @param name Employee name.
  * @param role Employee role.
  * @param email Employee email.
  * @param phoneNumber Employee phone number.
  * @param password Employee password.
  * @param vatId Employee vatId.
  * @param ssNum Employee social security number.
  * @param perms Employee permissions.
  * @returns {boolean} A.
  */
  static async createEmployee(sessionId, name, role, email, phoneNum, password, vatId, ssNum) {
    sessionId = validation.sanitizeInput(sessionId);
    sessionId = mongo.ObjectId(sessionId);
    name = validation.sanitizeInput(name);
    role = validation.sanitizeInput(role);
    email = validation.sanitizeInput(email);
    phoneNum = validation.sanitizeInput(phoneNum);
    password = validation.sanitizeInput(password);

    vatId = validation.sanitizeInput(vatId);
    vatId = validation.vatId(vatId);
    if (!vatId) { return "NVALID_VATID"; } 
    
    ssNum = validation.sanitizeInput(ssNum);
    const perms = {};
    console.log(perms);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = await client.db(mongoDb);
      const session = await dbClient.collection("sessions").findOne({"_id": sessionId}, {"empId": 1});
      if (session.count() > 0) {
        const employeeDetails = await dbClient.collection("sessions").findOne({"_id": session.empId});
        if (employeeDetails.count() > 0 && employeeDetails.perms.addEmployee) {
          const employee = {
            "_id": mongo.ObjectId(),
            "name": name,
            "role": role,
            "email": email,
            "phoneNum": phoneNum,
            "password": password,
            "vatId": vatId,
            "ssNum": ssNum,
            "perms": perms
          };
          await dbClient.collection("employees").insertOne(employee);
          return true;
        }
      } else {return false;}
    } catch (err) {
      error(err);
      return false;
    } finally {
      await client.close();
    }
  }

  /**
  * Gets employee data based from Employee Id.
  * @function
  * @param empId Employee Id stored on the database.
  * @returns {object} Returns alll employee data, except password, id and companyId.
  */
  static async getInfo(empId) {
    empId = validation.sanitizeInput(empId);
    empId = mongo.ObjectId(empId);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = await client.db(mongoDb);
      const employee = await dbClient.collection("employees").findOne({"_id": empId}, {"_id": 0, "password": 0, "companyId": 0});
      if (employee.count() > 0) {return employee;} else {return false; }
    } catch (err) {
      error(err);
      return false;
    } finally {
      await client.close();
    }
  }

  /**
  * Set email of an employee.
  * @function
  * @param empId Employee Id stored on the database.
  * @param email New employee email.
  * @returns {boolean} Return if email was updated or not.
  */
  static async setEmail(empId, email) {
    empId = validation.sanitizeInput(empId);
    empId = mongo.ObjectId(empId);
    email = validation.sanitizeInput(email);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = await client.db(mongoDb);
      const emailUpdate = await dbClient.collection("employees").updateOne({"_id": empId}, { "$set": {"email": email} });
      if (emailUpdate.modifiedCount() > 0) { return true; } else { return true; }
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
  employee
};