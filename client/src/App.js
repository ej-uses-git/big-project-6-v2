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

  const setPathType = useCallback((pathname, type, oldPath) => {
    setPathsToType((prev) => {
      if (!oldPath) return { ...prev, [pathname]: type };
      const copy = { ...prev };
      delete copy[oldPath];
      copy[pathname] = type;
      return copy;
    });
  });

  const setDirContents = useCallback((pathname, contents, oldPath) => {
    setDirsToContents((prev) => {
      if (!oldPath) return { ...prev, [pathname]: contents };
      const copy = { ...prev };
      delete copy[oldPath];
      copy[pathname] = contents;
      return copy;
    });
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
