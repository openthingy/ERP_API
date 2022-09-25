const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const erpsdk = require("erpsdk");

router.post("/", async function(req, res, next) {
  const email = erpsdk.validation.sanitizeInput(req.body.email);
  const password = erpsdk.validation.sanitizeInput(req.body.password); // Password should be SHA-256 encrypted

  if (!email || !password) { erpsdk.warn(`${req.id}: Missing email or password`); return next(createError(400)); } // Bad Request

  try {
    const login = await erpsdk.auth.login(email, password);
    if (!login) { return next(createError(500)); } // DB error
    if (login == "WRONG_EMAIL_OR_PASSWORD") { return next(createError(401, "Wrong Email or Password")); }
    erpsdk.info(`${req.id}: Login sucessful`);
    req.session.email = email;
    req.session.password = password;
    res.json({"login": true});
  } catch (err) {
    erpsdk.error(`${req.id}: Something went wrong: ` + err);
    return next(createError(500)); // Internal Server Error
  }
  
});

router.all("/", function(req, res, next) {
  return next(createError(405));
});

module.exports = router;
