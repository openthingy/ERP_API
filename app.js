const createError = require('http-errors');
const express = require('express');
const walkSync = require('walk-sync');

const app = express();

//app.use(morgan('de v'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next){
  // Authentication Middleware
  // This will overwrite any other http error code including 404
  
  // Needs testing on if createError works here
  if (req.header('Authorization') == "API-KEY") {
    next();
  }
  else if (!req.header("Authorization")) {
    next(createError(401));
    return;
  }  else {
    next(createError(500));
    return;
  }

  
});


dir = "./routes/"
const paths = walkSync(dir, { directories: false }); //Express doesn't like async stuff
paths.forEach(function (value, index, array) {
  value_nojs = value.slice(0, -3); //removes .js, assuming all files are .js
  //value_index = value.slice(0, -8); //removes .js, assuming all files are .js
  //console.log(value_index)

  if (value.endsWith("index.js")) {
    value_index = value.slice(0, -8);
    app.use("/" + value_index, require(dir + value_nojs)); // Route: /test
    app.use("/" + value_nojs, require(dir + value_nojs));  // Route: /test/index
  } else {
    app.use("/" + value_nojs, require(dir + value_nojs));
  }
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
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
