import { useCallback, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Drive from "./pages/Drive";
import Entity from "./pages/Entity";
import Folder from "./pages/Folder";
import "./App.css";
import { assignToState } from "./utilities/reactUtils";

function App() {
  useEffect(() => {
    console.log("App mount");
  }, []);

  const [pathsToType, setPathsToType] = useState({});
  const [dirsToContents, setDirsToContents] = useState({});
  const [filesToContents, setFilesToContents] = useState({});

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
                  pathsToType={[pathsToType, assignToState(setPathsToType)]}
                  dirsToContents={[
                    dirsToContents,
                    assignToState(setDirsToContents),
                  ]}
                />
              }
            />
            <Route
              path="*"
              element={
                <Entity
                  pathsToType={[pathsToType, assignToState(setPathsToType)]}
                  dirsToContents={[
                    dirsToContents,
                    assignToState(setDirsToContents),
                  ]}
                  filesToContents={[
                    filesToContents,
                    assignToState(setFilesToContents),
                  ]}
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
