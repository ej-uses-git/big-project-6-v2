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
    if (mode === "type") {
      return res.send(fileUtils.findType(name, stats.isDirectory()));
    }

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
      if (stats.isDirectory())
        throw new Error(400, { cause: "Cannot download directory." });
      // download file
      return res.download(pathname);
    }

    if (stats.isDirectory()) {
      // send directory contents
      return res.send(await fileUtils.dirContents(pathname));
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
  if (req.body.targets) {
    const tempDir = fs.mkdtemp("temp");
    // iterate once to check that all targets are valid, before we start to delete
    for (let target of req.body.targets) {
      const useableTarget = fileUtils.translatePath(target);
      await fs.access(
        path.join(__dirname, "../files", useablePath, useableTarget)
      );
    }

    // delete every target
    for (let target of req.body.targets) {
      const useableTarget = fileUtils.translatePath(target);
      await fs.rm(
        path.join(__dirname, "../files", useablePath, useableTarget),
        { recursive: true }
      );
    }
    res.set("Method", "GET");
    const splitPath = useablePath.split("/");
    return res.redirect(`./${splitPath[splitPath.length - 1]}`);
  }
  // delete file
  const pathname = path.join(__dirname, "../files", useablePath);
  await fs.rm(pathname, { recursive: true });

  // send contents of parent directory
  return res.send(await fileUtils.dirContents(path.join(pathname, "../")));
});

// route PUT request (for editing)
/*
  PUT /api/drive/path
  body: { 
   newName: valid file name, 
   content (if not dir): some content for the file 
  }
 */
router.put("/*", async (req, res, next) => {
  try {
    // check if newName is set
    if (!req.body.newName && !req.body.content)
      throw new Error(400, { cause: "No new information provided." });

    const useablePath = fileUtils.translatePath(req.path);
    const pathname = path.join(__dirname, "../files", useablePath);
    const stats = await fs.stat(pathname);

    // edit file content
    if (req.body.content || req.body.content === "") {
      if (stats.isDirectory())
        throw new Error(400, {
          cause: "Cannot write to directory.",
        });

      await fs.writeFile(pathname, req.body.content);
    }

    // rename file
    if (req.body.newName) {
      const splitPath = useablePath.split("/");
      const type =
        splitPath[splitPath.length - 1].split(".").slice(1).join(".") || "";
      const parentDirPath = path.join(__dirname, "../files", useablePath, "..");
      const newPath = path.join(
        parentDirPath,
        req.body.newName + (type ? "." : "") + type
      );
      await fs.rename(pathname, newPath);
    }

    // respond with parent directory contents
    return res.send(await fileUtils.dirContents(path.join(pathname, "../")));
  } catch (error) {
    const code = parseInt(error.message) || 500;
    return handleError(code, error)(req, res, next);
  }
});

// route all POST requests (for copying/uploading/creating files)
/*
  ->copy:
  POST /api/drive/path <-- filename to be copied
  body: { mode: "copy", newName: valid file name }

  ->upload:
  POST /api/drive/path <-- directory to upload to
  body: files

  ->create:
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
    //? no "mode" portion of the body can be provided if files are being uploaded
    mode = req.files ? "upload" : req.body.mode;

    if (!mode) throw new Error(400, { cause: "No mode provided." });

    const { newName, type, content } = req.body;

    const useablePath = fileUtils.translatePath(req.path);
    const pathname = path.join(__dirname, "../files", useablePath);

    if (mode === "copy") {
      if (!newName) throw new Error(400, { cause: "No new name provided." });

      // copy file to new path
      const parentDirPath = path.join(__dirname, "../files", useablePath, "..");
      // include the original file's type
      const splitPath = useablePath.split("/");
      const fullName = splitPath[splitPath.length - 1];
      let type = fullName.split(".").slice(1).join(".") || "";
      type = (type ? "." : "") + type;
      const newPath = path.join(parentDirPath, newName + type);
      await fs.cp(pathname, newPath, { recursive: true });

      // respond with parent directory contents
      return res.send(await fileUtils.dirContents(path.join(pathname, "../")));
    } else {
      //? if the requested path to create/upload to isn't a directory,
      //? we can't make a file inside it
      const stats = await fs.stat(pathname);
      if (!stats.isDirectory())
        throw new Error(400, {
          cause: "Can only create or upload file inside a directory.",
        });
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
      if (!newName) throw new Error(400, { cause: "No new name provided." });

      if (type === "dir") {
        // make new directory with the given name
        const newPath = path.join(pathname, newName);
        await fs.mkdir(newPath);
      } else {
        if (!content && content !== "")
          throw new Error(400, { cause: "No content provided." });

        // make a new file with the given name and contents
        const newPath = path.join(pathname, newName + (type ? "." : "") + type);
        await fs.writeFile(newPath, content);
      }
    }

    // respond with path directory contents
    return res.send(await fileUtils.dirContents(pathname));
  } catch (error) {
    const code = parseInt(error.message) || 500;
    return handleError(code, error)(req, res, next);
  }
});

module.exports = router;
