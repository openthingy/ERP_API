const express = require('express');
const router = express.Router();


// This is a example route
/* GET users listing. */
router.all('/', function(req, res, next) {
  // All responses must be sent in json
  res.json({"hello": "world"});
});

module.exports = router;
