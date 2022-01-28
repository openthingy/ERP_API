const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { MongoClient } = require('mongodb');


const gesenterprise = require("gesenterprise");
const config = gesenterprise.config;

router.all('/', function(req, res, next) {
  if (process.env.GESENT) {
    env = process.env.GESENT;
  } else {
    gesenterprise.warn("Could not determine current environment, setting DEV as environment");
    env = "DEV";
  }
  res.json({
    "GesEnterprise": "beta",
    "env": env,
    "author": "@github/danielalexis"
  })
});

module.exports = router;
