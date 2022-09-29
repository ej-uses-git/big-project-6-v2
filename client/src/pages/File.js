import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { createBrowserHistory } from "history";
import { getContents, editEntity } from "../utilities/fetchUtils";
import { AppContext } from "../App";

const history = createBrowserHistory();

function File(props) {
  const navigate = useNavigate();

  const { pathname } = useResolvedPath();
  const splitPath = pathname.split("/");
  let pathWithoutName = splitPath.slice(0, -1).join("/");
  pathWithoutName = pathWithoutName.endsWith("/")
    ? pathWithoutName
    : `${pathWithoutName}/`;
  const fullName = splitPath[splitPath.length - 1];
  const cleanName = fullName.split(".")[0];
  const fileType = fullName.split(".").slice(1).join(".");

  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState(cleanName);

  const {
    "PATH:TYPE": [pathsToType, setPathType],
  } = useContext(AppContext);
  const {
    "PATH:INFO": [, setPathInfo],
  } = useContext(AppContext);
  const {
    "DIR:CONTENT": [, setDirContents],
  } = useContext(AppContext);
  const {
    "FILE:CONTENT": [filesToContents, setFileContents],
  } = useContext(AppContext);

  const originalContents = useRef(filesToContents[pathname] ?? null);

  const fetchContent = useCallback(async () => {
    try {
      const [data, ok, status] = await getContents(pathname);
      if (!ok) throw new Error(status + "\n " + data);
      setContent(data);
      originalContents.current = data;
      setFileContents(pathname, data);
    } catch (error) {
      navigate(`/error/${error.message.toLowerCase()}`);
    }
  }, [pathname, navigate, setFileContents]);

  const handleNameBlur = useCallback(
    async (e) => {
      try {
        if (fileName === cleanName) return;
        const newPath =
          pathWithoutName + fileName + (fileType ? `.${fileType}/` : "/");
        if (typeof pathsToType[newPath] === "string")
          return alert("Please select unique name");
        const [data, ok, status] = await editEntity(pathname, {
          newName: fileName,
        });
        if (!ok) throw new Error(status + " " + data);
        setPathType(newPath, fileType, pathname + "/");
        setPathInfo(null, null, pathname);
        setFileContents(newPath, content, pathname);
        setDirContents(pathWithoutName, data);
        history.replace(
          pathWithoutName + fileName + (fileType ? `.${fileType}` : "")
        );
      } catch (error) {
        navigate(`/error/${error.message.toLowerCase()}`);
      }
    },
    [
      pathname,
      cleanName,
      fileType,
      pathWithoutName,
      fileName,
      content,
      navigate,
      pathsToType,
      setDirContents,
      setFileContents,
      setPathInfo,
      setPathType,
    ]
  );

  const handleContentBlur = useCallback(async () => {
    try {
      if (content === originalContents.current) return;
      const [data, ok, status] = await editEntity(pathname, {
        content,
      });
      if (!ok) throw new Error(status + " " + data);
      setFileContents(pathname, content);
      setPathInfo(null, null, pathname);
      originalContents.current = content;
    } catch (error) {
      navigate(`/error/${error.message.toLowerCase()}`);
    }
  }, [pathname, content, navigate, setFileContents, setPathInfo]);

  useEffect(() => {
    if (originalContents.current !== null)
      return setContent(originalContents.current);
    fetchContent();
  }, [fetchContent]);

  return (
    <div className="file-page">
      <div className="file-header container">
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onBlur={handleNameBlur}
          onKeyUp={(e) => {
            if (e.key === "Enter") handleNameBlur();
          }}
          className="file-name"
        />
        <p>{fileType}</p>
      </div>
      <textarea
        name="file-content"
        id="file-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleContentBlur}
        className="file-body primary"
      ></textarea>
    </div>
  );
}

export default File;
