import { useCallback, useContext, useState } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { AppContext } from "../App";
import { createFile } from "../utilities/fetchUtils";
import { getExtension } from "../utilities/reactUtils";

function NewFileForm(props) {
  const navigate = useNavigate();

  const { pathname: tempPathname } = useResolvedPath();
  const pathname = tempPathname.endsWith("/")
    ? tempPathname
    : `${tempPathname}/`;

  const {
    "PATH:TYPE": [pathsToType, setPathType],
  } = useContext(AppContext);
  const {
    "DIR:CONTENT": [, setDirContents],
  } = useContext(AppContext);

  const [fileName, setFileName] = useState("");
  const [type, setType] = useState("txt");
  const [content, setContent] = useState("Enter some content for the file.");

  const handleSubmit = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        const fullName = fileName + getExtension(type);
        if (typeof pathsToType[fullName] === "string")
          return alert("Please select unique name");
        let body = { newName: fileName, type };
        if (type !== "dir") body.content = content;
        const [data, ok, status] = await createFile(pathname, body);
        if (!ok) throw new Error(status + " " + data);
        setDirContents(pathname, data);
        setPathType(pathname + fullName + "/");
      } catch (error) {
        console.error(error);
        navigate(`/error/${error.message.toLowerCase()}`);
      }
    },
    [
      content,
      fileName,
      navigate,
      pathname,
      pathsToType,
      setDirContents,
      setPathType,
      type,
    ]
  );

  return (
    <form className="new-file-form" onSubmit={handleSubmit}>
      <label htmlFor="new-name">Enter the file's name:</label>
      <input
        type="text"
        name="fileName"
        id="new-name"
        value={fileName}
        onChange={(e) => {
          setFileName(e.target.value);
        }}
      />

      <label htmlFor="type">Enter the file's type:</label>
      <select
        name="type"
        id="type"
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          if (e.target.value === "dir") setContent("");
        }}
      >
        <option value="txt">.txt</option>
        <option value="json">.json</option>
        <option value="html">.html</option>
        <option value="dir">Directory</option>
      </select>

      <textarea
        name="content"
        id="content"
        value={content}
        disabled={type === "dir"}
        onChange={(e) => {
          setContent(e.target.value);
        }}
      ></textarea>

      <button type="submit">CREATE FILE</button>
    </form>
  );
}

export default NewFileForm;
