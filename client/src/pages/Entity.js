import { useState, useEffect, useContext } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import Folder from "./Folder";
import File from "./File";
import { getType } from "../utilities/fetchUtils";
import { AppContext } from "../App";

function Entity(props) {
  const navigate = useNavigate();

  const [isDir, setIsDir] = useState(null);

  const {
    "PATH:TYPE": [pathsToType, setPathType],
  } = useContext(AppContext);

  const { pathname: tempPathname } = useResolvedPath();
  const pathname = tempPathname.endsWith("/")
    ? tempPathname
    : `${tempPathname}/`;

  useEffect(() => {
    if (pathsToType[pathname]) return setIsDir(pathsToType[pathname] === "dir");
    setIsDir(null);
    //? we don't want this to run whenever pathsToType changes,
    //? as it will change upon a rename
    // eslint-disable-next-line
  }, [pathname, setIsDir]);

  useEffect(() => {
    if (isDir !== null) return;
    (async () => {
      try {
        const entType = pathsToType[pathname];
        if (entType || entType === "") return setIsDir(entType === "dir");
        const [data, ok, status] = await getType(pathname);
        if (!ok) throw new Error(status + "\n " + data);
        setIsDir(data === "dir");
        setPathType(pathname, data);
      } catch (error) {
        console.error(error);
        navigate(`/error/${error.message.toLowerCase()}`);
      }
    })();
  }, [isDir, navigate, pathname, pathsToType, setPathType]);

  return (
    <div className="entity">
      {isDir !== null && (isDir ? <Folder /> : <File />)}
    </div>
  );
}

export default Entity;
