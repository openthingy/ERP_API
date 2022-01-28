const config = require("./config.json");
const debug  = require("debug")("debug");
const mongo = require("mongodb");
// Logging
const info = debug.extend("info");
const warn = debug.extend("warn");
const error = debug.extend("error");
info.color = 4;
warn.color = 3;
error.color = 1;

class db {
    static async user_from_key(key) {
        const client = new mongo.MongoClient(config.database.mongo_url);
        try {
            await client.connect();
            const db_client = await client.db(config.database.db);
            const key_user = await db_client.collection("api").findOne({"session_key": key});
            return key_user.emp_id;
        } catch (err) {
            error(err);
            return false;
        } finally {
            await client.close();
        }
    }

    static async emp_info(emp_id) {
        // emp_id must be a ObjectID()

        const client = new mongo.MongoClient(config.database.mongo_url);
        try {
            await client.connect();
            const db_client = await client.db(config.database.db);
            const emp_info = await db_client.collection("employees").findOne({"_id": emp_id});
            return emp_info;
        } catch (err) {
            error(err);
            return false;
        } finally {
            await client.close()
        }
    }
}

module.exports = {
    info,
    warn,
    error,
    config,
    db
};