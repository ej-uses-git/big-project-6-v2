import { useContext, useEffect } from "react";
import { useParams, useNavigate, Outlet, Link } from "react-router-dom";
import { AppContext } from "../App";

function Drive() {
  const navigate = useNavigate();
  const { user } = useParams();
  const {
    "PATH:TYPE": [, setPathType],
  } = useContext(AppContext);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser || currentUser !== user)
      return navigate("/error/not logged in");
    setPathType(`/${user}/`, "dir");
  }, [navigate, setPathType, user]);

  return (
    <div className="drive">
      <Link
        to="/login"
        onClick={() => {
          localStorage.removeItem("currentUser");
        }}
      >
        <button>Log Out</button>
      </Link>
      <h1>Welcome {user}</h1>
      <Outlet />
    </div>
  );
}

export default Drive;
