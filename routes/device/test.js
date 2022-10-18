const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const erpsdk = require("erpsdk");

router.all("/", async function(req, res, next) {
  if (!req.body.deviceId) { erpsdk.warn(`${req.id}: Missing Device Id`); return next(createError(400)); }
  const deviceId = erpsdk.validation.sanitizeInput(req.body.deviceId);
  try {
    const deviceLogin = await erpsdk.auth.loginDevice(deviceId);
    if (!deviceLogin) { return next(createError(500)); }
    if (deviceLogin == "UNKNOWN_DEVICE") { return next(createError(401)); }
    erpsdk.info(`${req.id}: Device connection sucessful`);
    res.json({"connected": true});
  } catch (err) {
    erpsdk.error(`${req.id}: Unknown error`);
    next(createError(500));
  }

});

module.exports = router;
