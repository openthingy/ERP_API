const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { MongoClient } = require('mongodb');


const gesenterprise = require("gesenterprise");
const config = gesenterprise.config;

router.get('/', async function(req, res, next) {
  const db_url = config.database.mongo_url;
  gesenterprise.log("Connecting to database: " + db_url);
  // Connect to the db
  const client = new MongoClient(db_url);
  try {
    await client.connect();
    db = await client.db(config.database.database);

    res.json({
      "company": "TBD",
      "employees": await db.collection('employees').count()
    });
  } catch (err) {
    gesenterprise.error("An error ocurred during MongoDB connection/query: " + err);
    next(createError(500)); // Internal Server Error
  } finally {
    await client.close();
  }
  
});

router.all('/', function(req, res, next) {
  gesenterprise.log(req.id + ": Method not allowed");
  next(createError(405));
});
module.exports = router;
