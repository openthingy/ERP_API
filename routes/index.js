const express = require("express");
const router = express.Router();

// const poluino = require("poluinosdk");

router.all("/", function(req, res) {
  res.json({
    "poluino.api": "beta",
    "author": "@openthingy",
    "request": {
      "ip": req.ip,
      "id": req.id
    }
  });
});

module.exports = router;
