const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const crypto = require("crypto");
const { MongoClient } = require('mongodb');

const gesenterprise = require("gesenterprise");
const config = gesenterprise.config;

router.post('/', async function(req, res, next) {

  const email = req.body.session_key;

  if (!session_key) {log(`${req.id}: Missing Session Key`); next(createError(400)); return;} // Doesnt execute the rest of the code

  const db_url = config.database.mongo_url;
  // Connect to the db
  const client = new MongoClient(db_url);
  try {
    await client.connect();
    db = await client.db(config.database.database);
    // Check if the user exists
    user_info = await db.collection('employees').findOne({email: email, password: password});
    if (!user_info) { gesenterprise.info(`${req.id}: Login Unsucessful`); next(createError(401)); return;}

    // Get all users from the employees collection
    const employees = await db.collection('employees').find({}).projector({
        "emp_number": 1,
        "name": 1,
        "email": 1,
        "phone_number": 1,
        "status": 1
    }).toArray();

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
