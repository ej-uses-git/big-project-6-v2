import { useCallback, useContext, useState } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { editEntity } from "../utilities/fetchUtils";
import { AppContext } from "../App";

function RenameInput(props) {
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
    "PATH:INFO": [, setPathInfo],
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
      const [data, ok, status] = await editEntity(pathname + content, {
        newName: fileName,
      });
      if (!ok) throw new Error(status + " " + data);
      setPathType(
        newPath,
        fileType || entFullName.type,
        pathname + content + "/"
      );
      setPathInfo(newPath, null, pathname + content + "/", true);
      setDirContents(pathname, data);
      if (
        entFullName.type === "dir" &&
        dirsToContents[pathname + content + "/"]
      ) {
        setDirContents(
          newPath,
          dirsToContents[pathname + content + "/"],
          pathname + content + "/"
        );
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
    setPathInfo,
    setPathType,
  ]);

  return (
    <div className="display-form">
      <div className="display-holder">
        <input
          className="display-input"
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") handleClick();
          }}
        />
        <p className="display-type">{fileType}</p>
      </div>
      <button onClick={handleClick} className="btn smaller">
        SAVE
      </button>
    </div>
  );
}

export default RenameInput;
