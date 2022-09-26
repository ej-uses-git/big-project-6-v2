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
          pathsToType={props.pathsToType}
          pathsToInfo={props.pathsToInfo}
          dirsToContents={props.dirsToContents}
        />
      )}
    </div>
  );
}

export default Display;
