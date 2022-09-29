import { useEffect, useState, useCallback, useRef, useContext } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import download from "downloadjs";
import ContextMenu from "../inner component/ContextMenu";
import Display from "../inner component/Display";
import {
  downloadFile,
  getContents,
  getInfo,
  uploadFile,
} from "../utilities/fetchUtils";
import { getExtension } from "../utilities/reactUtils";
import { AppContext } from "../App";
import PlusIcon from "../images/plus.svg";
import UploadIcon from "../images/upload.svg";

function Folder(props) {
  const navigate = useNavigate();

  const { pathname: tempPathname } = useResolvedPath();
  const pathname = tempPathname.endsWith("/")
    ? tempPathname
    : `${tempPathname}/`;
  const originalPathname = useRef(pathname);

  const [folderContents, setFolderContents] = useState([]);
  const [selected, setSelected] = useState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [hasContext, setHasContext] = useState();
  const [showMenu, setShowMenu] = useState(false);
  const [display, setDisplay] = useState({ mode: "", content: "" });
  const [showDisplay, setShowDisplay] = useState(false);

  const fileInput = useRef();

  const {
    "PATH:TYPE": [pathsToType, setPathType],
  } = useContext(AppContext);
  const {
    "PATH:INFO": [pathsToInfo, setPathInfo],
  } = useContext(AppContext);
  const {
    "DIR:CONTENT": [dirsToContents, setDirContents],
  } = useContext(AppContext);

  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setSelected(event.target.parentNode.title);
      setAnchorPoint({ x: event.pageX, y: event.pageY });
      setHasContext(event.target.parentNode.title);
      setShowMenu(true);
    },
    [setAnchorPoint, setShowMenu, setHasContext, setSelected]
  );

  const handleClick = useCallback(
    (e) => {
      if (showMenu) setShowMenu(false);
      if (!e.target.className?.includes("cell")) {
        setSelected(null);
      }
      if (
        !e.target.className?.includes("display") &&
        !e.target.className?.includes("option")
      )
        setShowDisplay(false);
    },
    [showMenu, setShowMenu, setSelected]
  );

  const handleOptionSelect = useCallback(
    async (e) => {
      try {
        const { title } = e.target;
        let data, ok, status;
        switch (title) {
          case "info":
            // get info
            const entPath = pathname + hasContext;
            if (pathsToInfo[entPath]) {
              setDisplay({ mode: "info", content: pathsToInfo[entPath] });
              setShowDisplay(true);
              return;
            }
            [data, ok, status] = await getInfo(pathname + hasContext);
            if (!ok) throw new Error(status + " " + data);
            setDisplay({ mode: "info", content: data });
            setPathInfo(pathname + hasContext, data);
            setShowDisplay(true);
            break;
          case "show":
            // enter entity
            return navigate(`${pathname + hasContext}`);
          case "rename":
            setDisplay({ mode: "rename", content: hasContext });
            setShowDisplay(true);
            break;
          case "delete":
            // show confirmation window
            setDisplay({ mode: "delete", content: hasContext });
            setShowDisplay(true);
            // delete on yes
            break;
          case "copy":
            // show new name selection
            setDisplay({ mode: "copy", content: hasContext });
            setShowDisplay(true);
            // copy on selection
            break;
          case "download":
            // get download
            [data, ok, status] = await downloadFile(pathname + hasContext);
            if (!ok) throw new Error(status + " " + data);
            download(data, hasContext);
            break;
          default:
            throw new Error("what the fuck");
        }
      } catch (error) {
        navigate(`/error/${error.message}`);
      }
    },
    [hasContext, navigate, pathname, pathsToInfo, setPathInfo]
  );

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  useEffect(() => {
    (async () => {
      try {
        if (pathname !== originalPathname.current) {
          if (pathsToType[pathname] !== "dir") return;
        }
        const contents = dirsToContents[pathname];
        if (contents) return setFolderContents(contents);
        const [data, ok, status] = await getContents(pathname, "dir");
        if (!ok || !(data instanceof Array))
          throw new Error(status + "\n " + data);
        setFolderContents(data);
        setDirContents(pathname, data);
        data.forEach(({ name, type }) => {
          let entPath;
          if (type === "dir" || !type) entPath = pathname + `${name}/`;
          else entPath = pathname + `${name}.${type}/`;
          setPathType(entPath, type);
        });
      } catch (error) {
        navigate(`/error/${error.message.toLowerCase()}`);
      }
    })();
  }, [pathname, dirsToContents, navigate, setDirContents, setPathType]);

  useEffect(() => {
    if (
      dirsToContents[pathname] === folderContents ||
      !dirsToContents[pathname]
    )
      return;
    setFolderContents(dirsToContents[pathname]);
  }, [dirsToContents, pathname, folderContents]);

  return (
    <>
      {showMenu && (
        <ContextMenu
          anchorPoint={anchorPoint}
          onOptionSelect={handleOptionSelect}
        />
      )}

      {showDisplay && (
        <Display
          display={display}
          disappear={handleClick}
          entFullName={folderContents.find(
            (ent) => ent.name + getExtension(ent.type) === hasContext
          )}
        />
      )}

      <div className="folder-page">
        <div className="folder-holder">
          <table className="folder-table">
            <thead className="folder-headings">
              <tr>
                <th className="name-heading">Name</th>
                <th className="type-heading">Type</th>
              </tr>
            </thead>
            <tbody className="folder-body">
              {folderContents.map(({ name, type }) => (
                <tr
                  className={
                    "folder-entity" +
                    (selected === name + getExtension(type) ? " selected" : "")
                  }
                  key={name + getExtension(type)}
                  title={name + getExtension(type)}
                  onClick={(e) => {
                    if (selected === name + getExtension(type))
                      return navigate(
                        `${pathname}${name + getExtension(type)}`
                      );
                    setSelected(name + getExtension(type));
                  }}
                  onContextMenu={handleContextMenu}
                >
                  <td className="name-cell">{name}</td>
                  <td className="type-cell">{type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="action-buttons">
          <form
            className="upload-action"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const files = fileInput.current.files;
                const formData = new FormData();
                for (let file of files) {
                  formData.append("file", file);
                  formData.append("type", "upload");
                }
                const [data, ok, status] = await uploadFile(pathname, formData);
                if (!ok) throw new Error(status + " " + data);
                setDirContents(pathname, data);
              } catch (error) {
                navigate(`/error/${error.message.toLowerCase()}`);
              }
            }}
          >
            <label htmlFor="upload-file" className="upload-label accent">
              Upload New File
            </label>
            <p>{fileInput.current?.value.split("\\").slice(-1)[0] || "No file selected"}</p>
            <input
              required
              type="file"
              name="uploadFile"
              id="upload-file"
              ref={fileInput}
              className="hidden"
            />
            <button className="hidden" type="submit" id="submit"></button>

            <label htmlFor="submit">
              <img src={UploadIcon} className="upload-icon icon" alt="" />
            </label>
          </form>

          <div className="create-action">
            <label htmlFor="create" className="accent">
              Create New File
            </label>
            <label htmlFor="create">
              <img src={PlusIcon} alt="" className="icon" />
            </label>
            <button
              className="display hidden"
              id="create"
              onClick={() => {
                setDisplay({ mode: "create", content: "" });
                setShowDisplay(true);
              }}
            ></button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Folder;
