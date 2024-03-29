import { useCallback, useContext, useState } from "react";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { AppContext } from "../App";
import { createFile } from "../utilities/fetchUtils";
import { getExtension } from "../utilities/reactUtils";

function NewFileForm(props) {
  const navigate = useNavigate();

  const { disappear } = props;

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
        disappear({ target: { tagName: "BODY" } });
      } catch (error) {
        navigate(`/error/${error.message.toLowerCase()}`);
      }
    },
    [
      content,
      disappear,
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
    <form onSubmit={handleSubmit} className="display-form">
      <label htmlFor="new-name" className="display accent-light">
        Enter the file's name:
      </label>
      <input
        required
        type="text"
        name="fileName"
        id="new-name"
        value={fileName}
        onChange={(e) => {
          setFileName(e.target.value);
        }}
        className="display-input primary"
      />

      <div className="display-holder container type-select">
        <label htmlFor="type" className="display accent-light">
          Enter the file's type:
        </label>
        <select
          required
          name="type"
          id="type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            if (e.target.value === "dir") setContent("");
          }}
          className="display-select light"
        >
          <option value="txt" className="display-option">
            .txt
          </option>
          <option value="json" className="display-option">
            .json
          </option>
          <option value="html" className="display-option">
            .html
          </option>
          <option value="dir" className="display-option">
            Directory
          </option>
        </select>
      </div>

      <textarea
        name="content"
        id="content"
        value={content}
        disabled={type === "dir"}
        onChange={(e) => {
          setContent(e.target.value);
        }}
        className="display new-file-body light"
      ></textarea>

      <button type="submit" className="display-submit btn accent">
        CREATE FILE
      </button>
    </form>
  );
}

export default NewFileForm;
