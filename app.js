const createError = require("http-errors");
const express = require("express");
const walkSync = require("walk-sync");
const crypto = require("crypto");
const app = express();

const gesenterprise = require("gesenterprise");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request ID generator and begin logging
app.use(function (req, res, next) {
  req.id = crypto.randomUUID(); // Generate a unique ID for each request
  gesenterprise.info(`${req.id}: IP: ${req.ip} Path: ${req.path} Time: ${new Date()}`); // For Tracing purposes
  next();
});



const dir = "./routes/";
const paths = walkSync(dir, { directories: false }); //Express doesn't like async stuff
paths.forEach(function (value) {
  let value_nojs = value.slice(0, -3); //removes .js, assuming all files are .js

  if (value.endsWith("index.js")) {
    let value_index = value.slice(0, -8);
    app.use("/" + value_index, require(dir + value_nojs)); // Route: /test
    app.use("/" + value_nojs, require(dir + value_nojs));  // Route: /test/index
    gesenterprise.info("Added Route: /" + value_index);
    gesenterprise.info("Added Route: /" + value_nojs);
  } else {
    app.use("/" + value_nojs, require(dir + value_nojs));
    gesenterprise.info("Added Route: /" + value_nojs);
  }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  gesenterprise.warn(`${req.id}: Reached 404`);
  next(createError(404));
});


// error handler
app.use(function(err, req, res) {
  // render the error page
  res.status(err.status || 500);
  res.json({"code": err.status, "error.message":err.message});
});


module.exports = app;
