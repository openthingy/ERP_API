const express = require("express");
const router = express.Router();
const createError = require("http-errors");

const gesenterprise = require("gesenterprise");

router.post("/", async function(req, res, next) {

  const emp_key = req.body.key;

  if (!emp_key) { gesenterprise.warn(`${req.id}: Missing Key`); return next(createError(400)); }


  try {
    const loggedout = await gesenterprise.auth.logout(emp_key);
    console.log(loggedout);
  } catch (err) {
    gesenterprise.error(`${req.id}: Something went wrong: ` + err);
    next(createError(500)); // Internal Server Error
  }
  res.json({
    "action": "logout",
    "success": "true"
  });
});

router.all("/", function(req, res, next) {
  gesenterprise.info(req.id + ": Method not allowed");
  next(createError(405));
});
module.exports = router;
