import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Drive from "./pages/Drive";
import "./App.css";

function App() {
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
            <Route index />
            <Route path="*" />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
