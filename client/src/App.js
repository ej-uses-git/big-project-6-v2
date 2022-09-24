import { useCallback, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Drive from "./pages/Drive";
import Entity from "./pages/Entity";
import Folder from "./pages/Folder";
import "./App.css";

function App() {
  useEffect(() => {
    console.log("App mount");
  }, []);
  const [pathsToType, setPathsToType] = useState({});
  const [dirsToContents, setDirsToContents] = useState({});

  const setPathType = useCallback((pathname, type) => {
    setPathsToType((prev) => ({ ...prev, [pathname]: type }));
  });

  const setDirContents = useCallback((pathname, contents) => {
    setDirsToContents((prev) => ({ ...prev, [pathname]: contents }));
  });

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" />

          <Route path="/register" />

          <Route path="/login" />

          <Route path="/error">
            <Route path="*" />
          </Route>

          <Route path="/:user" element={<Drive />}>
            <Route
              index
              element={
                <Folder
                  pathsToType={[pathsToType, setPathType]}
                  dirsToContents={[dirsToContents, setDirContents]}
                />
              }
            />
            <Route
              path="*"
              element={
                <Entity
                  pathsToType={[pathsToType, setPathType]}
                  dirsToContents={[dirsToContents, setDirContents]}
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
