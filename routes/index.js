const express = require("express");
const router = express.Router();
const process = require("process");

const gesenterprise = require("gesenterprise");

router.all("/", function(req, res) {
  let env;
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
  });
});

module.exports = router;
