import DeleteConfirm from "./DeleteConfirm";
import RenameInput from "./RenameInput";

function Display(props) {
  const { mode, content } = props.display;
  return (
    <div className="display">
      {mode === "info" && (
        <ul>
          {Object.keys(content).map((key) => (
            <li key={key}>
              <div className="key">{key}:</div>
              <div className="value">{content[key]}</div>
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
    </div>
  );
}

export default Display;
