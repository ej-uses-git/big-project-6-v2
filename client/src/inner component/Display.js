import { useEffect } from "react";
import CopyNameInput from "./CopyNameInput";
import DeleteConfirm from "./DeleteConfirm";
import NewFileForm from "./NewFileForm";
import RenameInput from "./RenameInput";

function Display(props) {
  const { mode, content } = props.display;
  return (
    <div className="display">
      {mode === "info" && (
        <ul className="display-list">
          {Object.keys(content).map((key) => (
            <li key={key} className="display-pair">
              <div className="display-key">{key}:</div>
              <div className="display-value">{content[key]}</div>
            </li>
          ))}
        </ul>
      )}

      {mode === "rename" && (
        <RenameInput
          content={content}
          disappear={props.disappear}
          entFullName={props.entFullName}
        />
      )}

      {mode === "delete" && (
        <DeleteConfirm
          content={content}
          disappear={props.disappear}
          entFullName={props.entFullName}
        />
      )}

      {mode === "copy" && (
        <CopyNameInput
          content={content}
          disappear={props.disappear}
          entFullName={props.entFullName}
        />
      )}

      {mode === "create" && <NewFileForm disappear={props.disappear} />}
    </div>
  );
}

export default Display;
