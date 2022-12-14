const createError = require("http-errors");
const express = require("express");
const walkSync = require("walk-sync");
const crypto = require("crypto");
const session = require("express-session");
const app = express();

const erpsdk = require("erpsdk");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Similar to PHP session system
app.use(session({ genid: crypto.randomUUID(), cookie: { maxAge: 10800000 }})); // Cookie lasts up to 2 hours


app.use(function (req, res, next) {
  req.id = crypto.randomUUID(); // Generate a unique ID for each request
  erpsdk.info(`${req.id}: IP: ${req.ip} Path: ${req.path} Time: ${new Date()}`); // For Tracing purposes
  next();
});


// At some point we've gotta change this
const dir = "./routes/";
const paths = walkSync(dir, { directories: false });
paths.forEach(function (value) {
  let value_nojs = value.slice(0, -3); //removes .js, assuming all files are .js

  if (value.endsWith("index.js")) {
    let value_index = value.slice(0, -8);
    app.use("/" + value_index, require(dir + value_nojs)); // Route: /test
    app.use("/" + value_nojs, require(dir + value_nojs));  // Route: /test/index
    erpsdk.info("Added Route: /" + value_index);
    erpsdk.info("Added Route: /" + value_nojs);
  } else {
    app.use("/" + value_nojs, require(dir + value_nojs));
    erpsdk.info("Added Route: /" + value_nojs);
  }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  erpsdk.warn(`${req.id}: Reached 404`);
  return next(createError(404));
});


// error handler
// this disables the `next` is unused warning, for some reason its required
// or else the error handler just straight up stops working
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
  erpsdk.error(`${req.id}: Error: ${err}`);
  // render the error page
  res.status(err.status || 500);
  res.json({"code": err.status, "error.message":err.message});
});


module.exports = app;
