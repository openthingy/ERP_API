const createError = require('http-errors');
const express = require('express');
const walkSync = require('walk-sync');
const {MongoClient} = require('mongodb');
const crypto = require('crypto');
const app = express();

// Configuration File
const { dirname } = require('path');
const config = require(dirname(require.main.filename) + '/../config.json'); // ../ because we are in the bin folder

// Logging
const debug = require('debug');
const log   = debug('app:log');
const warn  = debug('app:warn'); 
const error = debug('app:error'); 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  req.id = crypto.randomUUID(); // Generate a unique ID for each request
  log(`${req.id}: IP: ${req.ip} Path: ${req.path} Time: ${new Date()}`); // For Tracing purposes
  next();
});

app.use(async function (req, res, next){
  // Authentication Middleware
  // This will overwrite any other http error code including 404

  // Checks if a Authorization header is present
  // If yes it will check if the key is valid
  // If no it will return a 401 Unauthorized
  // Checks if theres a Login Header present
  // This indicates the server to allow the user to access the login route (/account/login)
  log(`${req.id}: Authentication started`);
  const db_url = "mongodb://"+config.database.user+":"+ encodeURIComponent(config.database.password) +"@"+ config.database.host +":"+ config.database.port +"/" + "?ssl=false";
  log(req.id + " Connecting to database: " + db_url);
  // Connect to the db
  const client = new MongoClient(db_url);
  try {
    await client.connect();
    db = await client.db(config.database.database);

    // Check if the user is authenticated
    if (req.header("Authorization") && !req.header("Login")) {
      log(`${req.id}: Authorization header found`);
      // Check if the user session is valid
      const key = await db.collection("sessions").find({"key": req.header("Authorization")}).count();

      if (key > 0) { 
        log(`${req.id}: Authentication successful`);
        next();
      } else {
        log(`${req.id}: Authentication failed`);
        next(createError(401)); // Unauthorized
      }
    
    } else if (req.header("Login") && req.path == "/account/login") { // Verify if the user is trying to login and only allow if the path is /account/login
      log(`${req.id}: Login attempt`);	
      next();  
    } else {
      log(`${req.id}: Missing Authentication`);
      next(createError(401)); // Unauthorized
    }
  } catch (err) {
    error("An error ocurred during MongoDB connection/query: " + err);
    next(createError(500)); // Internal Server Error
  } finally {
    await client.close();
    log(req.id + ": Database Connection closed");
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
    log("Added Route: /" + value_index);
    log("Added Route: /" + value_nojs);
  } else {
    app.use("/" + value_nojs, require(dir + value_nojs));
    log("Added Route: /" + value_nojs);
  }
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  log(`${req.id}: Reached 404`)
  next(createError(404));
});




// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.json({"code": err.status, "error.message":err.message});
});


module.exports = app;
