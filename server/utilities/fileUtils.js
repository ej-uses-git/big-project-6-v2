const fs = require("fs/promises");

async function formatInfo(name, isDir, stats, path) {
  if (isDir) {
    const contentCount = await _countContents(path);

    return {
      Name: name,
      Contents: `${contentCount[0]} ${
        contentCount[0] === 1 ? "directory" : "directories"
      } and ${contentCount[1]} ${contentCount[1] === 1 ? "file" : "files"}`,
      "Birth time": stats.birthtime.toString(),
      "Last modified": stats.mtime.toString(),
      Path: path,
    };
  }

  const cleanName = name.split(".")[0];
  const type = name.split(".").slice(1).join(".");

  return {
    Name: cleanName,
    Type: type || "file",
    Size: stats.size,
    "Birth time": stats.birthtime.toString(),
    "Last modified": stats.mtime.toString(),
    Path: path,
  };
}

async function _countContents(path) {
  const contents = await fs.readdir(path, { withFileTypes: true });
  return [
    contents.filter((ent) => ent.isDirectory()).length,
    contents.filter((ent) => !ent.isDirectory()).length,
  ];
}

const translatePath = (path) => path.replaceAll(/[+]|%20/g, " ");

function findType(name, isDir){
  if(isDir) return "dir";
  return name.split(".").slice(1).join(".");
}

module.exports = { formatInfo, translatePath, findType };
