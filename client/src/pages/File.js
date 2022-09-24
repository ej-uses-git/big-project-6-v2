import { useCallback, useEffect, useState } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { getContents } from "../utilities/fetchUtils";

function File(props) {
  const navigate = useNavigate();

  const { pathname } = useResolvedPath();
  const splitPath = pathname.split("/");

  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState(splitPath[splitPath.length - 1]);

  const [pathsToType, setPathType] = props.pathsToType;
  const [dirsToContents, setDirContents] = props.dirsToContents;

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
  }, []);
  return (
    <div className="file">
      <input type="text" value={fileName} />
      <textarea
        name="file-content"
        id="file-content"
        value={content}
      ></textarea>
    </div>
  );
}

export default File;
