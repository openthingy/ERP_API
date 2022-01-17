const express = require('express');
const router = express.Router();

// Logging
const debug = require('debug');
const log   = debug('app:log');
const info  = debug('app:info');
const warn  = debug('app:warn'); 
const error = debug('app:error'); 

// This is a example route
/* GET users listing. */
router.all('/', function(req, res, next) {
  // All responses must be sent in json
  res.json({"hello": "world"});
});

module.exports = router;
