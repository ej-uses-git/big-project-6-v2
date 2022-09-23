const express = require("express");
const router = express.Router();
console.log = require("debug")("server:drive");
const fs = require("fs/promises");
const path = require("path");
const handleError = require("../utilities/errorHandler");
const fileUtils = require("../utilities/fileUtils");

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

// route all GET requests
router.get("/*", async (req, res, next) => {
  const pathname = path.join(__dirname, "../files", req.path);
  const splitPath = req.path.split("/");
  const name = splitPath[splitPath.length - 1];

  const isInfo = req.body.isInfo;
  const stats = await fs.stat(pathname);
  if (isInfo) {
    // send directory info
    const formattedInfo = await fileUtils.formatInfo(
      name,
      stats.isDirectory(),
      stats,
      pathname
    );
    return res.send(formattedInfo);
  }

  if (stats.isDirectory()) {
    // send directory contents
  }

  if (/* "download" is flagged */ true) {
    // download file
  }

  // send file contents
  res.send("did not get to the right place");
});

module.exports = router;
