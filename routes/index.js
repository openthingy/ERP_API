const express = require("express");
const router = express.Router();

router.all("/", function(req, res) {
  res.json({
    "poluino": {
      "version": "0.2beta",
      "codename": "jellyfish"
    },
    "author": "@openthingy",
    "request": {
      "ip": req.ip,
      "id": req.id
    }
  });
});

module.exports = router;
