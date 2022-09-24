import { useState, useEffect } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import Folder from "./Folder";
import { getType } from "../utilities/fetchUtils";

function Entity(props) {
  const navigate = useNavigate();

  const [isDir, setIsDir] = useState(false);

  const [pathsToType, setPathType] = props.pathsToType;
  const [dirsToContents, setDirContents] = props.dirsToContents;

  const { pathname } = useResolvedPath();

  useEffect(() => {
    (async () => {
      let entType = pathsToType[pathname];
      if (entType) return setIsDir(entType === "dir");
      try {
        const [data, ok, status] = await getType(pathname);
        if (!ok) throw new Error(status);
        setIsDir(data === "dir");
        setPathType(pathname, data);
      } catch (error) {
        console.error(error);
        navigate(`/error/${error.message.toLowerCase()}`);
      }
    })();
  }, [pathname]);

  return (
    <div className="entity">
      {isDir ? (
        <Folder
          pathsToType={props.pathsToType}
          dirsToContents={props.dirsToContents}
        />
      ) : (
        "Not dir"
      )}
    </div>
  );
}

export default Entity;
