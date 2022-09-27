import { Link, useResolvedPath } from "react-router-dom";

function Error(props) {
  const { pathname } = useResolvedPath();
  const message = pathname.split("/").slice(-1)[0].replaceAll("%20", " ");
  return (
    <div>
      {message}
      <Link to="/username">Username</Link>
    </div>
  );
}

export default Error;
