const express = require("express");
const router = express.Router();

router.all("/", async function(req, res) {
  res.json({"hello": "world"});
});

module.exports = router;
