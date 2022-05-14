const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { MongoClient } = require("mongodb");

const gesenterprise = require("gesenterprise");
const config = gesenterprise.config;

router.post("/", async function(req, res, next) {

  const session_key = req.body.session_key;
  const email = req.body.session_key;
  const password = req.body.session_key;

  if (!session_key) {gesenterprise.log(`${req.id}: Missing Session Key`); next(createError(400)); return;} // Doesnt execute the rest of the code

  const db_url = config.database.mongo_url;
  // Connect to the db
  const client = new MongoClient(db_url);
  try {
    await client.connect();
    const db = await client.db(config.database.database);
    // Check if the user exists
    const user_info = await db.collection("employees").findOne({email: email, password: password});
    if (!user_info) { gesenterprise.info(`${req.id}: Login Unsucessful`); next(createError(401)); return;}

    // Send the session key to the client
    res.json({"session_key": session_key});
    gesenterprise.info(`${req.id}: Login Successful`);	

  } catch (err) {
    gesenterprise.error("An error ocurred during MongoDB connection/query: " + err);
    next(createError(500)); // Internal Server Error
  } finally {
    await client.close();
  }
  
});

router.all("/", function(req, res, next) {
  gesenterprise.info(req.id + ": Method not allowed");
  next(createError(405));
});
module.exports = router;
