const express = require("express");
const router = express.Router();
const gesenterprise = require("gesenterprise");


// This is a example route
/* GET users listing. */
router.all("/", async function(req, res) {
  // All responses must be sent in json
  const key = await gesenterprise.auth.login("teste@gmail.com", "teste");
  res.json({"hello": "world", "key": key});
});

module.exports = router;
