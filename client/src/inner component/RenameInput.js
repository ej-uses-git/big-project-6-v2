import { useCallback, useContext, useState } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { editEntity } from "../utilities/fetchUtils";
import { AppContext } from "../App";

function RenameInput(props) {
  const navigate = useNavigate();
  const { disappear, entFullName } = props;

  const { pathname: tempPathname } = useResolvedPath();
  const pathname = tempPathname.endsWith("/")
    ? tempPathname
    : `${tempPathname}/`;
  const { content } = props;
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

  const handleClick = useCallback(
    async (e) => {
      try {
        if (fileName === originalName) return;
        const newPath =
          pathname + fileName + (fileType ? `.${fileType}/` : "/");
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
        console.error(error);
        navigate(`/error/${error.message.toLowerCase()}`);
      }
    },
    [
      content,
      disappear,
      fileName,
      fileType,
      entFullName,
      navigate,
      originalName,
      pathname,
      dirsToContents,
      setDirContents,
      setPathInfo,
      setPathType,
    ]
  );

  return (
    <div className="rename-input">
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") handleClick();
        }}
      />
      <p>{fileType}</p>
      <button onClick={handleClick}>SAVE</button>
    </div>
  );
}

export default RenameInput;
