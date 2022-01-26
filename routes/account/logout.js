const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const crypto = require("crypto");
const { MongoClient } = require('mongodb');

const gesenterprise = require("gesenterprise");
const config = gesenterprise.config;

router.post('/', async function(req, res, next) {

  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {gesenterprise.info(`${req.id}: Missing email or password`); next(createError(400)); return;} // Doesnt execute the rest of the code

  const db_url = config.database.mongo_url;
  gesenterprise.info("Connecting to database: " + db_url);
  // Connect to the db
  const client = new MongoClient(db_url);
  try {
    await client.connect();
    db = await client.db(config.database.database);
    // Check if the user exists
    user_info = await db.collection('employees').findOne({email: email, password: password});
    if (!user_info) { log(`${req.id}: Login Unsucessful`); next(createError(401)); return;}

    // Generate a Session Key
    const session_key = crypto.randomBytes(32).toString('hex');

    // Store the session key in the database
    await db.collection('sessions').insertOne({
        session_key: session_key,
        user_id: user_info._id,
        created_at: new Date()
    });

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

router.all('/', function(req, res, next) {
  gesenterprise.info(req.id + ": Method not allowed");
  next(createError(405));
});
module.exports = router;
