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
  console.log("got here");
  const useablePath = fileUtils.translatePath(req.path);
  try {
    if (useablePath === "/" && req.method === "DELETE") throw new Error();
    await fs.access(path.join(__dirname, "../files", useablePath));
    next();
  } catch (error) {
    return handleError(404, error)(req, res, next);
  }
});

// route all GET requests
// GET /api/drive/path(?mode=info|download)
router.get("/*", async (req, res, next) => {
  try {
    const useablePath = fileUtils.translatePath(req.path);
    const pathname = path.join(__dirname, "../files", useablePath);
    const splitPath = useablePath.split("/");
    const name = splitPath[splitPath.length - 1];

    const mode = req.query.mode;
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

    if (mode === "download") {
      if (stats.isDirectory()) throw new Error(400);
      // download file
      return res.download(pathname);
    }

    if (stats.isDirectory()) {
      // send directory contents
      const contents = await fs.readdir(pathname, { withFileTypes: true });
      return res.send(
        contents.map((ent) => ({
          name: ent.name.split(".")[0],
          type:
            ent.name.split(".").slice(1).join(".") +
            (ent.isDirectory() ? "dir" : ""),
        }))
      );
    }

    // send file contents
    return res.sendFile(pathname);
  } catch (error) {
    const code = parseInt(error.message) || 500;
    return handleError(code, error)(req, res, next);
  }
});

// route DELETE request
// DELETE /api/drive/path
router.delete("/*", async (req, res, next) => {
  const useablePath = fileUtils.translatePath(req.path);
  // delete file
  const pathname = path.join(__dirname, "../files", useablePath);
  await fs.rm(pathname, { recursive: true });

  // send contents of parent directory
  const parentDirPath = path.join(__dirname, "../files", useablePath, "..");
  const parentDirContents = await fs.readdir(parentDirPath, {
    withFileTypes: true,
  });
  return res.send(
    parentDirContents.map((ent) => ({
      name: ent.name.split(".")[0],
      type:
        ent.name.split(".").slice(1).join(".") +
        (ent.isDirectory() ? "dir" : ""),
    }))
  );
});

// route PUT request (for renaming files/directories)
// PUT /api/drive/path
// body: { newName: valid file name }
router.put("/*", async (req, res, next) => {
  try {
    // check if newName is set
    if (!req.body.newName) throw new Error(400);

    // rename file
    const useablePath = fileUtils.translatePath(req.path);
    const pathname = path.join(__dirname, "../files", useablePath);
    const splitPath = useablePath.split("/");
    const type =
      splitPath[splitPath.length - 1].split(".").slice(1).join(".") || "";
    const parentDirPath = path.join(__dirname, "../files", useablePath, "..");
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
      parentDirContents.map((ent) => ({
        name: ent.name.split(".")[0],
        type:
          ent.name.split(".").slice(1).join(".") +
          (ent.isDirectory() ? "dir" : ""),
      }))
    );
  } catch (error) {
    const code = parseInt(error.message) || 500;
    return handleError(code, error)(req, res, next);
  }
});

// route all POST requests (for copying/uploading/creating files)
/*
  ?copy:
  POST /api/drive/path <-- filename to be copied
  body: { mode: "copy", newName: valid file name }

  ?upload:
  POST /api/drive/path <-- directory to upload to
  body: files

  ?create:
  POST /api/drive/path <-- directory to create in
  body: { 
    mode: "create",
    newName: valid file name,
    type: file extension,
    content: content (of the same type as [type])
 }
*/
router.post("/*", async (req, res, next) => {
  try {
    mode = req.files ? "upload" : req.body.mode;

    if (!mode) throw new Error(400);

    const { newName, type, content } = req.body;

    const useablePath = fileUtils.translatePath(req.path);
    const pathname = path.join(__dirname, "../files", useablePath);

    if (mode === "copy") {
      if (!newName) throw new Error(400);

      // copy file to new path
      const parentDirPath = path.join(__dirname, "../files", useablePath, "..");
      const splitPath = useablePath.split("/");
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
        parentDirContents.map((ent) => ({
          name: ent.name.split(".")[0],
          type:
            ent.name.split(".").slice(1).join(".") +
            (ent.isDirectory() ? "dir" : ""),
        }))
      );
    } else {
      //? if the requested path to create/upload to isn't a directory,
      //? we can't make a file inside it
      const stats = await fs.stat(pathname);
      if (!stats.isDirectory()) throw new Error(400);
    }

    if (mode === "upload") {
      // upload every file within req.files
      for (let key in req.files) {
        const file = req.files[key];
        const newPath = path.join(pathname, file.name);
        const err = await util.promisify(file.mv)(newPath);
        if (err) throw new Error(500);
      }
    }

    if (mode === "create") {
      if (!newName) throw new Error(400);
      if (type === "dir") {
        // make new directory with the given name
        const newPath = path.join(pathname, newName);
        await fs.mkdir(newPath);
      } else {
        if (!content) throw new Error(400);

        // make a new file with the given name and contents
        const newPath = path.join(pathname, newName + (type ? "." : "") + type);
        await fs.writeFile(newPath, content);
      }
    }

    // send contents of current directory
    const pathnameContents = await fs.readdir(pathname, {
      withFileTypes: true,
    });
    return res.send(
      pathnameContents.map((ent) => ({
        name: ent.name.split(".")[0],
        type:
          ent.name.split(".").slice(1).join(".") +
          (ent.isDirectory() ? "dir" : ""),
      }))
    );
  } catch (error) {
    const code = parseInt(error.message) || 500;
    return handleError(code, error)(req, res, next);
  }
});

module.exports = router;
