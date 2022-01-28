const express = require('express');
const router = express.Router();
const gesenterprise = require("gesenterprise");


// This is a example route
/* GET users listing. */
router.all('/', function(req, res, next) {
  // All responses must be sent in json
  gesenterprise.db.user_from_key("d6aa667028c9581be1e4d14dfc90e8f90295ca66643f394b513ea3dca400960d");
  res.json({"hello": "world"});
});

module.exports = router;
