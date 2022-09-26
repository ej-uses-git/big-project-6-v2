import { Link } from "react-router-dom";

function Error(props) {
  return (
    <div className="error">
      <Link to="/username">Username</Link>
    </div>
  );
}

export default Error;
