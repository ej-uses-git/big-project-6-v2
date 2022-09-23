const fs = require("fs/promises");

async function formatInfo(name, isDir, stats, path) {
  if (isDir) {
    const contentCount = await _countContents(path);
    console.log(contentCount);

    return {
      Name: name,
      Contents: `${contentCount[0]} directories and ${contentCount[1]} files`,
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

module.exports = { formatInfo };
