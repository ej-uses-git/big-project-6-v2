import { useEffect, useState, useCallback } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import ContextMenu from "../inner component/ContextMenu";
import { getContents } from "../utilities/fetchUtils";

function Folder(props) {
  const navigate = useNavigate();

  const { pathname } = useResolvedPath();

  const [folderContents, setFolderContents] = useState([]);
  const [selected, setSelected] = useState();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [hasContext, setHasContext] = useState();
  const [showMenu, setShowMenu] = useState(false);

  const [pathsToType, setPathType] = props.pathsToType;
  const [dirsToContents, setDirContents] = props.dirsToContents;

  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    setSelected(event.target.title);
    setAnchorPoint({ x: event.pageX, y: event.pageY });
    setHasContext(event.target.title);
    setShowMenu(true);
  });

  const handleClick = useCallback(
    (e) => {
      if (showMenu) setShowMenu(false);
      if (e.target.tagName === "BODY" || e.target.tagName === "HTML")
        setSelected(null);
    },
    [showMenu, selected]
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
        const contents = dirsToContents[pathname];
        if (contents) return setFolderContents(contents);
        const [data, ok, status] = await getContents(pathname, "dir");
        if (!ok || !data instanceof Array) throw new Error(status);
        setFolderContents(data);
        setDirContents(pathname, data);
        data.forEach(({ name, type }) => {
          let entPath;
          if (type === "dir" || type === "file")
            entPath = pathname + `/${name}`;
          else entPath = pathname + `/${name}.${type}`;
          setPathType(entPath, type);
        });
      } catch (error) {
        console.error(error);
        navigate(`/error/${error.message.toLowerCase()}`);
      }
    })();
  }, [pathname]);

  return (
    <div className="folder">
      {showMenu && (
        <ContextMenu
          anchorPoint={anchorPoint}
          onOptionSelect={() => {}}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>

        <tbody>
          {folderContents.map(({ name, type }) => (
            <tr
              key={name + type}
              title={name + type}
              onClick={() => {
                if (selected === name + type)
                  return navigate(
                    `${pathname}/${
                      name +
                      (type && type !== "dir" && type !== "file"
                        ? "." + type
                        : "")
                    }`
                  );
                setSelected(name + type);
              }}
              onContextMenu={handleContextMenu}
            >
              <td>{name}</td>
              <td>{type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Folder;
