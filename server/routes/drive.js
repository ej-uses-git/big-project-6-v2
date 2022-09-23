const express = require("express");
const router = express.Router();
console.log = require("debug")("server:drive");
const fs = require("fs/promises");
const path = require("path");
const handleError = require("../utilities/errorHandler");

// middleware - validate that the file/dir at path exists
router.use(async (req, res, next) => {
  try {
    await fs.access(path.join(__dirname, "../files", req.path));
    next();
  } catch (error) {
    console.log(error);
    handleError(404)(req, res, next);
  }
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
