const express = require("express");
const router = express.Router();
const poluino = require("poluinosdk");
const createError = require("http-errors");

router.all("/", async function(req, res, next) {
  if (!req.body.key) { poluino.warn(`${req.id}: Missing key`); return next(createError(400, "Missing Key")); }

  const key = poluino.validation.sanitizeInput(req.body.key);
  const session = await poluino.session.isSessionValid(key);
  if (session.session) {
    res.json({"sucess": true});
  } else {
    next(createError(401));
  }
});

module.exports = router;
