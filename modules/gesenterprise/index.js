const config = require("./config.json");
const debug  = require("debug")("debug");
const mongo = require("mongodb");
const crypto = require("crypto");
// Logging
const info = debug.extend("info");
const warn = debug.extend("warn");
const error = debug.extend("error");
info.color = 4;
warn.color = 3;
error.color = 1;

class db {
    static async userFromKey(key) {
        const client = new mongo.MongoClient(config.database.mongo_url);
        try {
            await client.connect();
            const db_client = await client.db(config.database.db);
            const key_user = await db_client.collection("api").findOne({"key": key});
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

class auth {
    static async is_key_valid(key) {
        const client = new mongo.MongoClient(config.database.mongo_url);
        try {
            await client.connect();
            const db_client = await client.db(config.database.db);
            const is_valid = await db_client.collection("api").findOne({"key": key}).count();
            return is_valid; // If it finds it will return 1 (true) else it will return 0 (false)
        } catch (err) {
            error(err);
            return false;
        } finally {
            await client.close();
        }
    }

    static async login(email, password) {
        // Password must be a SHA-256 encrypted string
        const client = new mongo.MongoClient(config.database.mongo_url);
        try {
            await client.connect();
            const db_client = await client.db(config.database.db);
            const emp_info = await db_client.collection("employees").findOne({"email": email, "password": password});
            if (!emp_info) {return false;}
            
            // generate API key
            const key = crypto.randomBytes(32).toString('hex');
            await db_client.collection("api").insertOne({
                "key": key,
                "emp_id": emp_info._id,
                "created_at": new Date()
            });
            return key;

        } catch (err) {
            error(err);
            return false;
        } finally {
            await client.close();
        }
    }

    static async logout(key) {
        const client = new mongo.MongoClient(config.database.mongo_url);
        try {
            await client.connect();
            const db_client = await client.db(config.database.db);
            const deleted = await db_client.collection("api").deleteOne({"key": key});
            if (deleted.deletedCount == 0) { return false; }
            return true;
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
    db,
    auth
};