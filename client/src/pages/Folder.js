import { useEffect, useState } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { getContents } from "../utilities/fetchUtils";

function Folder(props) {
  const navigate = useNavigate();

  const { pathname } = useResolvedPath();

  const [folderContents, setFolderContents] = useState([]);

  const [pathsToType, setPathType] = props.pathsToType;
  const [dirsToContents, setDirContents] = props.dirsToContents;

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
