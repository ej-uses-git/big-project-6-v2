import { useState, useEffect, createContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Drive from "./pages/Drive";
import Entity from "./pages/Entity";
import Folder from "./pages/Folder";
import Error from "./pages/Error";
import "./App.css";
import { assignToState } from "./utilities/reactUtils";
import Register from "./pages/Register";
import Login from "./pages/Login";

export const AppContext = createContext();

function App() {
  useEffect(() => {
    console.log("App mount");
  }, []);

  const [pathsToType, setPathsToType] = useState({});
  const [pathsToInfo, setPathsToInfo] = useState({});
  const [dirsToContents, setDirsToContents] = useState({});
  const [filesToContents, setFilesToContents] = useState({});
  const ContextValues = {
    "PATH:TYPE": [pathsToType, assignToState(setPathsToType)],
    "PATH:INFO": [pathsToInfo, assignToState(setPathsToInfo)],
    "DIR:CONTENT": [dirsToContents, assignToState(setDirsToContents)],
    "FILE:CONTENT": [filesToContents, assignToState(setFilesToContents)],
  };

  return (
    <div>
      <AppContext.Provider value={ContextValues}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/error" element={<Outlet />}>
              <Route path="*" element={<Error />} />
            </Route>
            <Route path="/:user" element={<Drive />}>
              <Route index element={<Folder />} />
              <Route path="*" element={<Entity />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppContext.Provider>
    </div>
  );
}

export default App;
