import { useCallback, useContext } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { AppContext } from "../App";
import { deleteEntity } from "../utilities/fetchUtils";

function DeleteConfirm(props) {
  const navigate = useNavigate();
  const { content, disappear, entFullName } = props;

  const { pathname: tempPathname } = useResolvedPath();
  const pathname = tempPathname.endsWith("/")
    ? tempPathname
    : `${tempPathname}/`;

  const {
    "PATH:TYPE": [, setPathType],
  } = useContext(AppContext);
  const {
    "PATH:INFO": [, setPathInfo],
  } = useContext(AppContext);
  const {
    "DIR:CONTENT": [, setDirContents],
  } = useContext(AppContext);
  const {
    "FILE:CONTENT": [, setFileContents],
  } = useContext(AppContext);

  const handleDelete = useCallback(async () => {
    try {
      const [data, ok, status] = await deleteEntity(pathname + content);
      if (!ok) throw new Error(status + " " + data);
      setPathType(null, null, pathname + content);
      setPathInfo(null, null, pathname + content);
      if (entFullName.type === "dir") {
        setDirContents(null, null, pathname + content);
      } else {
        setFileContents(null, null, pathname + content);
      }
      setDirContents(pathname, data);
      disappear({ target: { tagName: "BODY" } });
    } catch (error) {
      console.error(error);
      navigate(`/error/${error.message.toLowerCase()}`);
    }
  }, [
    content,
    disappear,
    entFullName.type,
    navigate,
    pathname,
    setDirContents,
    setFileContents,
    setPathInfo,
    setPathType,
  ]);

  return (
    <div className="delete-confirm">
      Are you sure? This action cannot be undone!
      <button onClick={handleDelete}>YES</button>
      <button>NO</button>
    </div>
  );
}

export default DeleteConfirm;
