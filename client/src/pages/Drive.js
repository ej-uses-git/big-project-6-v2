import { useContext, useEffect } from "react";
import { useParams, useNavigate, Outlet, Link } from "react-router-dom";
import { AppContext } from "../App";

function Drive() {
  const navigate = useNavigate();
  const { user } = useParams();
  const {
    "PATH:TYPE": [pathsToType, setPathType],
  } = useContext(AppContext);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser || currentUser !== user)
      return navigate("/error/not logged in");
    if(!pathsToType[`/${user}/`]) setPathType(`/${user}/`, "dir");
  }, [navigate, setPathType, user]);

  return (
    <div className="user-page">
      <div className="page-header">
      <div className="fake-logo">Fake logo</div>
        <h1 className="user-message">Welcome, {user}!</h1>
        <Link
          to="/login"
          onClick={() => {
            localStorage.removeItem("currentUser");
          }}
        >
          <button className="log-out btn inverted smaller">Log Out</button>
        </Link>
      </div>
      <Outlet />
    </div>
  );
}

export default Drive;
