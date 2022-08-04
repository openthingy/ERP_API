const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const poluino = require("poluinosdk");

router.post("/", async function(req, res, next) {

  const email = req.body.email;
  const password = req.body.password; // Password should be SHA-256 encrypted

  if (!email || !password) { poluino.warn(`${req.id}: Missing email or password`); return next(createError(400)); } // Doesnt execute the rest of the code

  try {
    const session = await poluino.session.addSession(email, password);
    if (!session) { return next(createError(500)); }
    if (session == "WRONG_EMAIL_OR_PASSWORD") { return next(createError(401, "Wrong Email or Password")); }
    poluino.info(`${req.id}: Login sucessful`);
    res.json({"sessionId": session});
  } catch (err) {
    poluino.error(`${req.id}: Something went wrong: ` + err);
    return next(createError(500)); // Internal Server Error
  }
  
});

router.all("/", function(req, res, next) {
  return next(createError(405));
});

module.exports = router;
