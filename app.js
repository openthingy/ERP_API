const createError = require('http-errors');
const express = require('express');
const walkSync = require('walk-sync');

const crypto = require('crypto');
const app = express();

// Logging
const debug = require('debug');
const log   = debug('app:log');
const info  = debug('app:info');
const warn  = debug('app:warn'); 
const error = debug('app:error'); 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  req.id = crypto.randomUUID(); // Generate a unique ID for each request
  log(`${req.id}: IP: ${req.ip} Time: ${new Date()}`); // For Tracing purposes
  next();
});

app.use(function (req, res, next){
  // Authentication Middleware
  // This will overwrite any other http error code including 404
  log(`${req.id}: Authentication started`);
  if (req.header('Authorization') == "API-KEY") {
    log(`${req.id}: Authentication successful`);
    next();
  }
  else if (!req.header("Authorization")) {
    log(`${req.id}: Authentication failed (no header present)`);
    next(createError(401)); 
    return;
}  else {
    error(req.id + ": HTTP Auth request failed due to invalid Authorization header (neither missing nor present");
    next(createError(500));
    return;
  }

  
});


dir = "./routes/"
const paths = walkSync(dir, { directories: false }); //Express doesn't like async stuff
paths.forEach(function (value, index, array) {
  value_nojs = value.slice(0, -3); //removes .js, assuming all files are .js

  if (value.endsWith("index.js")) {
    value_index = value.slice(0, -8);
    app.use("/" + value_index, require(dir + value_nojs)); // Route: /test
    app.use("/" + value_nojs, require(dir + value_nojs));  // Route: /test/index
    info("Added Route: /" + value_index);
    info("Added Route: /" + value_nojs);
  } else {
    app.use("/" + value_nojs, require(dir + value_nojs));
    info("Added Route: /" + value_nojs);
  }
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  log(`${req.id}: Reached 404`)
  next(createError(404));
});




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //res.locals.message = err.message;                                     //Not sure what does this do
  //res.locals.error = req.app.get('env') === 'development' ? err : {};   // This requires a view engine maybe?

  // render the error page
  res.status(err.status || 500);
  res.json({"code": err.status, "error.message":err.message});
});


module.exports = app;
