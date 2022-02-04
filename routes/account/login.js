const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const crypto = require("crypto");
const { MongoClient } = require('mongodb');

const gesenterprise = require("gesenterprise");
const config = gesenterprise.config;

router.post('/', async function(req, res, next) {

  const email = req.body.email;
  const password = req.body.password; // Password should be SHA-256 encrypted

  if (!email || !password) { gesenterprise.warn(`${req.id}: Missing email or password`); return next(createError(400)); } // Doesnt execute the rest of the code

  try {
    const key = await gesenterprise.auth.login(email, password);
    if (!key) { return next(createError(401));}
    gesenterprise.info(`${req.id}: Login sucessful`)
    res.json({"key": key});
  } catch (err) {
    gesenterprise.error(`${req.id}: Something went wrong: ` + err);
    return next(createError(500)); // Internal Server Error
  }
  
});

router.all('/', function(req, res, next) {
  gesenterprise.warn(req.id + ": Method not allowed");
  next(createError(405));
});
module.exports = router;
