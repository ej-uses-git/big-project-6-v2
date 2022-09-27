import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { AppContext } from "../App";

function Drive() {
  const navigate = useNavigate();
  const { user } = useParams();
  const {
    "PATH:TYPE": [, setPathType],
  } = useContext(AppContext);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return navigate("/error/not logged in");
    // const currentUser = JSON.parse(rawStorage);
    if (currentUser !== user) return navigate("/error/not logged in");
    setPathType(`/${user}/`, "dir");
  }, []);

  return (
    <div className="drive">
      <h1>Welcome {user}</h1>
      <Outlet />
    </div>
  );
}

export default Drive;
