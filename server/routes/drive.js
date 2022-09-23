const express = require("express");
const router = express.Router();
console.log = require("debug")("server:drive");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
