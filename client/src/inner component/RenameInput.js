import { useCallback, useEffect, useState } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { editEntity } from "../utilities/fetchUtils";

function RenameInput(props) {
  const navigate = useNavigate();
  const { pathname: tempPathname } = useResolvedPath();
  const pathname = tempPathname.endsWith("/")
    ? tempPathname
    : `${tempPathname}/`;
  const { content } = props;
  const fileType = content.split(".").slice(1).join(".") || props.entType;
  const originalName = content.split(".")[0];
  const [fileName, setFileName] = useState(originalName);

  const [, setPathType] = props.pathsToType;
  const [, setPathInfo] = props.pathsToInfo;
  const [dirsToContents, setDirContents] = props.dirsToContents;

  const handleClick = useCallback(
    async (e) => {
      try {
        if (fileName === originalName) return;
        const [data, ok, status] = await editEntity(pathname + content, {
          newName: fileName,
        });
        if (!ok) throw new Error(status + " " + data);
        const newPath =
          pathname + fileName + (fileType ? `.${fileType}/` : "/");
        setPathType(newPath, fileType, pathname + content + "/");
        setPathInfo(null, null, pathname + content + "/");
        setDirContents(pathname, data);
        if (fileType === "dir" && dirsToContents[pathname + content + "/"]) {
          setDirContents(
            newPath,
            dirsToContents[pathname + content + "/"],
            pathname + content + "/"
          );
        }
        props.disappear({ target: { tagName: "BODY" } });
      } catch (error) {
        console.error(error);
        navigate(`/error/${error.message.toLowerCase()}`);
      }
    },
    [
      content,
      fileName,
      fileType,
      navigate,
      originalName,
      pathname,
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
