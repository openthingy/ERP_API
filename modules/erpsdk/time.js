const mongo = require("mongodb");

const main = require("./index");
const config = require("./config.json");
const mongoUrl = config.dbCredentials.mongoUrl;
const mongoDb = config.dbCredentials.database;


/**
* Timesheet
* @class
*/
class time {
  static async addRecord(userId, time, type = "online") {
    userId = main.validation.sanitizeInput(userId);
    userId = mongo.ObjectId(userId);
    time = main.validation.sanitizeInput(time);
    const client = new mongo.MongoClient(mongoUrl);
    try {
      await client.connect();
      const dbClient = client.db(mongoDb);
      const record = await dbClient.collection("timesheet").insertOne({
        "userId": userId, 
        "time": time,
        "type": type // type = online | physical
      });
      main.log("Inserting sheet record");
      if (record.acknowledged) { return true; } else { main.error("Error in query"); return false; }
    } catch (err) {
      main.error(err);
      return false;
    } finally {
      await client.close();
    }
  } 
}

module.exports = {
  time
};