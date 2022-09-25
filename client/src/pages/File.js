import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { getContents, editEntity } from "../utilities/fetchUtils";

function File(props) {
  const navigate = useNavigate();

  const { pathname } = useResolvedPath();
  const splitPath = pathname.split("/");
  const pathWithoutName = splitPath.slice(0, -1).join("/");
  const fullName = splitPath[splitPath.length - 1];
  const cleanName = fullName.split(".")[0];
  const fileType = fullName.split(".").slice(1).join(".");

  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState(cleanName);

  const [, setPathType] = props.pathsToType;
  const [, setDirContents] = props.dirsToContents;
  const [filesToContents, setFileContents] = props.filesToContents;

  const originalContents = useRef(filesToContents[pathname] ?? null);
  const isMount = useRef(true);

  const fetchContent = useCallback(async () => {
    try {
      const [data, ok, status] = await getContents(pathname);
      if (!ok) throw new Error(status);
      setContent(data);
      originalContents.current = data;
      setFileContents(pathname, data);
    } catch (error) {
      console.error(error);
      navigate(`/error/${error.message.toLowerCase()}`);
    }
  });

  const handleNameBlur = useCallback(async () => {
    if (fileName === cleanName) return;
    try {
      const [data, ok, status] = await editEntity(pathname, {
        newName: fileName,
      });
      if (!ok) throw new Error(status);
      const newPath =
        pathWithoutName + "/" + fileName + (fileType ? `.${fileType}` : "");
      setPathType(newPath, fileType || "file", pathname);
      setFileContents(newPath, content, pathname);
      setDirContents(pathWithoutName, data);
      window.history.replaceState({}, "", pathWithoutName);
      navigate(fileName + (fileType ? `.${fileType}` : ""));
    } catch (error) {
      console.error(error);
      navigate(`/error/${error.message.toLowerCase()}`);
    }
  });

  const handleContentBlur = useCallback(async () => {
    if (content === originalContents.current) return;
    try {
      const [data, ok, status] = await editEntity(pathname, {
        content,
      });
      if (!ok) throw new Error(status);
      setFileContents(pathname, content);
    } catch (error) {
      console.error(error);
      navigate(`/error/${error.message.toLowerCase()}`);
    }
  });

  useEffect(() => {
    if (originalContents.current !== null)
      return setContent(originalContents.current);
    isMount.current = false;
    fetchContent();
  }, []);

  useEffect(() => {
    if (isMount || content === originalContents.current) return;
    fetchContent();
  }, [pathname]);

  return (
    <div className="file">
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        onBlur={handleNameBlur}
        onKeyUp={(e) => {
          if (e.key === "Enter") handleNameBlur();
        }}
      />
      <p>{fileType}</p>
      <textarea
        name="file-content"
        id="file-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleContentBlur}
      ></textarea>
    </div>
  );
}

export default File;
