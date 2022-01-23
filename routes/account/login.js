const express = require("express");
const router = express.Router();
const crypto = require("crypto");

// Configuration File
const { dirname } = require('path');
const config = require(dirname(require.main.filename) + '/../config.json'); // ../ because we are in the bin folder

// MongoDB
const {MongoClient} = require('mongodb');

// Logging
const debug = require('debug');
const { create } = require("domain");
const createError = require("http-errors");
const log   = debug('app:log');
const warn  = debug('app:warn'); 
const error = debug('app:error'); 

router.post('/', async function(req, res, next) {
  const db_url = "mongodb://"+config.database.user+":"+ encodeURIComponent(config.database.password) +"@"+ config.database.host +":"+ config.database.port +"/" + "?ssl=false";
  log("Connecting to database: " + db_url);
  // Connect to the db
  const client = new MongoClient(db_url);
  const email = req.body.email;
  const password = req.body.password;
  try {
    await client.connect();
    db = await client.db(config.database.database);
    // Check if the user exists
    user_info = await db.collection('employees').findOne({email: email, password: password});
    if (!user_info) { log(`${req.id}: Login Unsucessful`); next(createError(401)); }
    // Generate a Session Key
    const session_key = crypto.randomBytes(32).toString('hex');
    // Store the session key in the database
    await db.collection('sessions').insertOne({
        session_key: session_key,
        user_id: user_info._id,
        created_at: new Date()
    });
    res.json({"session_key": session_key});
    log(`${req.id}: Login Successful`);	
  } catch (err) {
    error("An error ocurred during MongoDB connection/query: " + err);
    next(createError(500)); // Internal Server Error
  } finally {
    await client.close();
  }
  
});

router.all('/', function(req, res, next) {
  log(req.id + ": Method not allowed");
  next(createError(405));
});
module.exports = router;
