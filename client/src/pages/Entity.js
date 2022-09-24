import { useState, useEffect } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
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
        entType = data;
        setIsDir(entType === "dir");
        setPathType(pathname, entType);
      } catch (error) {
        console.error(error);
        navigate(`/error/${error.message}`);
      }
    })();
  }, [pathname]);

  return <div className="entity">{isDir ? "Dir" : "Not dir"}</div>;
}

export default Entity;
