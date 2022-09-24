import { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";

function Drive() {
  const { user } = useParams();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const rawStorage = localStorage.getItem("currentUser");
  //   if (!rawStorage) return navigate("/error/not%20logged%20in");
  //   const currentUser = JSON.parse(rawStorage);
  //   if (currentUser !== user) return navigate("/error/not%20logged%20in");
  // }, []);

  return (
    <div className="drive">
      <h1>Welcome {user}</h1>
      <Outlet />
    </div>
  );
}

export default Drive;
