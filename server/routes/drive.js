const express = require("express");
const router = express.Router();
console.log = require("debug")("server:drive");
const fs = require("fs/promises");
const path = require("path");
const util = require("util");

const handleError = require("../utilities/errorHandler");
const fileUtils = require("../utilities/fileUtils");

// middleware - validate that the file/dir at path exists
router.use(async (req, res, next) => {
  try {
    if (req.path === "/" && req.method === "DELETE") throw new Error();
    await fs.access(path.join(__dirname, "../files", req.path));
    next();
  } catch (error) {
    return handleError(404)(req, res, next);
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

// route DELETE request
router.delete("/*", async (req, res, next) => {
  // delete file
  const pathname = path.join(__dirname, "../files", req.path);
  await fs.rm(pathname, { recursive: true });

  // send contents of parent directory
  const parentDirPath = path.join(__dirname, "../files", req.path, "..");
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

// route PUT request (for renaming files/directories)
router.put("/*", async (req, res, next) => {
  // check if newName is set
  if (!req.body.newName) return handleError(400)(req, res, next);

  // rename file
  const pathname = path.join(__dirname, "../files", req.path);
  const splitPath = req.path.split("/");
  const type =
    splitPath[splitPath.length - 1].split(".").slice(1).join(".") || "";
  const parentDirPath = path.join(__dirname, "../files", req.path, "..");
  const newPath = path.join(
    parentDirPath,
    req.body.newName + (type ? "." : "") + type
  );
  await fs.rename(pathname, newPath);

  // send contents of parent directory
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

router.post("/*", async (req, res, next) => {
  const { newName, type, content, mode } = req.body;
  if (!newName) return handleError(400)(req, res, next);

  const pathname = path.join(__dirname, "../files", req.path);

  if (mode === "copy") {
    // copy file to new path
    const parentDirPath = path.join(__dirname, "../files", req.path, "..");
    const splitPath = req.path.split("/");
    const type =
      splitPath[splitPath.length - 1].split(".").slice(1).join(".") || "";
    const newPath = path.join(
      parentDirPath,
      req.body.newName + (type ? "." : "") + type
    );
    await fs.cp(pathname, newPath, { recursive: true });

    // send contents of parent directory
    const parentDirContents = await fs.readdir(parentDirPath, {
      withFileTypes: true,
    });
    return res.send(
      parentDirContents.map(({ name }) => ({
        name: name.split(".")[0],
        type: name.split(".").slice(1).join("."),
      }))
    );
  } else {
    //? if the requested path to create/upload to isn't a directory,
    //? we can't make a file inside it
    const stats = await fs.stat(pathname);
    if (!stats.isDirectory()) return handleError(400)(req, res, next);
  }

  if (mode === "upload") {
    // upload every file within req.files
    for (let key in req.files) {
      const file = req.files[key];
      const newPath = path.join(pathname, file.name);
      const err = await util.promisify(file.mv)(newPath);
      if (err) return handleError(500)(req, res, next);
    }
  }

  if (mode === "create") {
    if (type === "dir") {
      // make new directory with the given name
      const newPath = path.join(pathname, newName);
      await fs.mkdir(newPath);
    } else {
      if (!content) return handleError(400)(req, res, next);

      // make a new file with the given name and contents
      const newPath = path.join(pathname, newName + (type ? "." : "") + type);
      await fs.writeFile(newPath, content);
    }
  }

  const pathnameContents = await fs.readdir(pathname, {
    withFileTypes: true,
  });
  return res.send(
    pathnameContents.map(({ name }) => ({
      name: name.split(".")[0],
      type: name.split(".").slice(1).join("."),
    }))
  );
});

module.exports = router;
