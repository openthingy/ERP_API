const express = require("express");
const router = express.Router();

// const poluino = require("poluinosdk");

router.all("/", function(req, res) {
  res.json({
    "Poluino API": "beta",
    "author": "@openthingy",
    "client.ip": req.ip
  });
});

module.exports = router;
