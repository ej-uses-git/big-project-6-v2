import { useCallback, useEffect, useState } from "react";
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

  const [pathsToType, setPathType] = props.pathsToType;
  const [dirsToContents, setDirContents] = props.dirsToContents;

  const handleNameBlur = useCallback(async () => {
    if (fileName === cleanName) return;
    try {
      const [data, ok, status] = await editEntity(pathname, {
        newName: fileName,
      });
      if (!ok) throw new Error(status);
      const newPath =
        pathWithoutName + fileName + (fileType ? `.${fileType}` : "");
      setPathType(newPath, fileType, pathname);
      setDirContents(pathWithoutName, data);
      window.history.replaceState({}, "", pathWithoutName);
      console.log(fileType);
      navigate(fileName + (fileType ? `.${fileType}` : ""));
    } catch (error) {
      console.error(error);
      navigate(`/error/${error.message.toLowerCase()}`);
    }
  });

  useEffect(() => {
    (async () => {
      try {
        const [data, ok, status] = await getContents(pathname);
        if (!ok) throw new Error(status);
        setContent(data);
      } catch (error) {
        console.error(error);
        navigate(`/error/${error.message.toLowerCase()}`);
      }
    })();
  }, [pathname]);
  return (
    <div className="file">
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        onBlur={handleNameBlur}
      />
      <p>{fileType}</p>
      <textarea
        name="file-content"
        id="file-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
    </div>
  );
}

export default File;
