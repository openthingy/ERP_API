const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const erpsdk = require("erpsdk");

router.post("/", async function(req, res, next) {
  const sessionId = erpsdk.validation.sanitizeInput(req.body.sessionId);

  if (!sessionId) { erpsdk.warn(`${req.id}: Missing session Id`); return next(createError(400)); } // Doesnt execute the rest of the code

  try {
    const isSessionValid = await erpsdk.session.validateSession(sessionId);
    if (!isSessionValid) { return next(createError(500)); }
    if (isSessionValid == "SESSION_NOT_VALID" || isSessionValid == "SESSION_NOT_FOUND") { return next(createError(401, "Valid Session Not Found")); }
    if (isSessionValid.session.type == "api") {
      erpsdk.warn(`${req.id}: Create Account via API not allowed: ${sessionId}`);
      return next(createError(406, "API session not allowed"));
    }
    erpsdk.info(`${req.id}: Login sucessful`);
    //res.json({"sessionId": session});
  } catch (err) {
    erpsdk.error(`${req.id}: Something went wrong: ` + err);
    return next(createError(500)); // Internal Server Error
  }
  
});

router.all("/", function(req, res, next) {
  return next(createError(405));
});

module.exports = router;