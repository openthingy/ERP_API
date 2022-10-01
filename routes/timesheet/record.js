const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const erpsdk = require("erpsdk");

router.post("/", async function(req, res, next) {
  if (!req.body.type) { erpsdk.warn(`${req.id}: Connection type missing`); return next(createError(400)); }
  const type = erpsdk.validation.sanitizeInput(req.body.type);

  if (type == "online") {
    if (!req.session.userId || !req.session.password) { erpsdk.warn(`${req.id}: Missing email or password in session`); return next(createError(400)); } 
    const userId = erpsdk.validation.sanitizeInput(req.session.userId);
    const password = erpsdk.validation.sanitizeInput(req.session.password);
    const time = new Date();
    //  if (!userId || !type) { erpsdk.warn(`${req.id}: Missing email or password`); return next(createError(400)); } // Bad Request
    try {
      const login = await erpsdk.auth.login(userId, password);
      if (!login) { return next(createError(500)); } // DB error
      if (login == "WRONG_EMAIL_OR_PASSWORD") { return next(createError(401, "Wrong Email or Password")); }
      erpsdk.info(`${req.id}: Login sucessful`);
      const timeRecord = await erpsdk.time.addRecord(userId, userId, time, type);
      if (timeRecord) {
        res.json({"record": true});
      }
    } catch (err) {
      erpsdk.error(`${req.id}: Something went wrong: ` + err);
      return next(createError(500)); // Internal Server Error
    }
  } else if (type == "device") {
    if (!req.body.userId || !req.body.deviceId) { erpsdk.warn(`${req.id}: Missing User Id and Device Id`); return next(createError(401)); } // Unauthorized
    const userId = erpsdk.validation.sanitizeInput(req.session.userId);
    const deviceId = erpsdk.validation.sanitizeInput(req.session.deviceId);
    const time = new Date();
    //  if (!userId || !type) { erpsdk.warn(`${req.id}: Missing email or password`); return next(createError(400)); } // Bad Request
    try {
      const login = await erpsdk.auth.loginDevice(deviceId);
      if (!login) { return next(createError(500)); } // DB error
      if (login == "UNKNOWN_DEVICE") { return next(createError(401, "Unknown Device Id")); }
      erpsdk.info(`${req.id}: Login sucessful`);
      const timeRecord = await erpsdk.time.addRecord(userId, deviceId, time, type);
      if (timeRecord) {
        res.json({"record": true});
      }
    } catch (err) {
      erpsdk.error(`${req.id}: Something went wrong: ` + err);
      return next(createError(500)); // Internal Server Error
    }
  }




  
  
});

router.all("/", function(req, res, next) {
  return next(createError(405));
});

module.exports = router;
