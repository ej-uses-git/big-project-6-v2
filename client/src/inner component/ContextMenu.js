function ContextMenu({ anchorPoint, onOptionSelect }) {
  const { x, y } = anchorPoint;
  return (
    <ul className="menu" style={{ top: y, left: x }}>
      <li onClick={onOptionSelect} title="info" className="option">
        Info
      </li>
      <li onClick={onOptionSelect} title="show" className="option">
        Show
      </li>
      <li onClick={onOptionSelect} title="rename" className="option">
        Rename
      </li>
      <li onClick={onOptionSelect} title="delete" className="option">
        Delete
      </li>
      <li onClick={onOptionSelect} title="copy" className="option">
        Copy
      </li>
      <li onClick={onOptionSelect} title="download" className="option">
        Download
      </li>
    </ul>
  );
}

export default ContextMenu;