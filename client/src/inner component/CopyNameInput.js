import { useState, useContext, useCallback } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { copyEntity } from "../utilities/fetchUtils";
import { AppContext } from "../App";

function CopyNameInput(props) {
  const navigate = useNavigate();
  const { content, disappear, entFullName } = props;

  const { pathname: tempPathname } = useResolvedPath();
  const pathname = tempPathname.endsWith("/")
    ? tempPathname
    : `${tempPathname}/`;
  const fileType = content.split(".").slice(1).join(".");
  const originalName = content.split(".")[0];
  const [fileName, setFileName] = useState(originalName);

  const {
    "PATH:TYPE": [pathsToType, setPathType],
  } = useContext(AppContext);
  const {
    "DIR:CONTENT": [dirsToContents, setDirContents],
  } = useContext(AppContext);

  const handleClick = useCallback(async () => {
    try {
      if (fileName === originalName) return;
      const newPath = pathname + fileName + (fileType ? `.${fileType}/` : "/");
      if (typeof pathsToType[newPath] === "string")
        return alert("Please select unique name");
      const [data, ok, status] = await copyEntity(pathname + content, fileName);
      if (!ok) throw new Error(status + " " + data);
      setPathType(newPath, fileType || entFullName.type);
      setDirContents(pathname, data);
      if (
        entFullName.type === "dir" &&
        dirsToContents[pathname + content + "/"]
      ) {
        setDirContents(newPath, dirsToContents[pathname + content + "/"]);
      }
      disappear({ target: { tagName: "BODY" } });
    } catch (error) {
      navigate(`/error/${error.message.toLowerCase()}`);
    }
  }, [
    content,
    disappear,
    fileName,
    fileType,
    entFullName,
    navigate,
    originalName,
    pathname,
    dirsToContents,
    pathsToType,
    setDirContents,
    setPathType,
  ]);

  return (
    <div className="display-form">
      <label htmlFor="" className="display-label">
        Please select new name:
      </label>
      <div className="display-holder">
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") handleClick();
          }}
          className="display-input"
        />
        <p className="display-type">{fileType}</p>
      </div>
      <button onClick={handleClick} className="display-btn btn smaller">
        SAVE
      </button>
    </div>
  );
}

export default CopyNameInput;
