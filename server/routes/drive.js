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
    if (req.path === "/") throw new Error();
    await fs.access(path.join(__dirname, "../files", req.path));
    next();
  } catch (error) {
    handleError(404)(req, res, next);
  }
});

// route all GET requests
router.get("/*", async (req, res, next) => {
  const pathname = path.join(__dirname, "../files", req.path);
  const splitPath = req.path.split("/");
  const name = splitPath[splitPath.length - 1];

  const mode = req.body.mode;
  const stats = await fs.stat(pathname);
  if (mode === "info") {
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
    const contents = await fs.readdir(pathname, { withFileTypes: true });
    return res.send(
      contents.map(({ name }) => ({
        name: name.split(".")[0],
        type: name.split(".").slice(1).join("."),
      }))
    );
  }

  if (mode === "download") {
    // download file
    return res.download(pathname);
  }

  // send file contents
  return res.sendFile(pathname);
});

router.delete("/*", async (req, res, next) => {
  const pathname = path.join(__dirname, "../files", req.path);
  const parentDirPath = path.join(__dirname, "../files", req.path, "..");
  await fs.rm(pathname, { recursive: true });
  const parentDirContents = await fs.readdir(parentDirPath, {
    withFileTypes: true,
  });
  return res.send(
    parentDirContents.map(({ name }) => ({
      name: name.split(".")[0],
      type: name.split(".").slice(1).join("."),
    }))
  );
});

module.exports = router;
