const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const poluino = require("poluinosdk");

router.post("/", async function(req, res, next) {
  const sessionId = poluino.validation.sanitizeInput(req.body.sessionId);

  if (!sessionId) { poluino.warn(`${req.id}: Missing dession Id`); return next(createError(400)); } // Doesnt execute the rest of the code

  try {
    const session = await poluino.session.validateSession(sessionId);
    if (!session) { return next(createError(500)); }
    if (session == "SESSION_NOT_VALID" || session == "SESSION_NOT_FOUND") { 
      poluino.warn(`${req.id}: No valid session id: ${sessionId}`);
      return next(createError(404, "Valid session Id Not Found")); 
    }
    poluino.info(`${req.id}: Validated session ${sessionId}`);
    res.json(session);
  } catch (err) {
    poluino.error(`${req.id}: Something went wrong: ` + err);
    return next(createError(500)); // Internal Server Error
  }
  
});

router.all("/", function(req, res, next) {
  return next(createError(405));
});

module.exports = router;
