import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../utilities/fetchUtils";

function Login(props) {
  const navigate = useNavigate();

  const usernameInput = useRef();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const body = { [username]: password };
      const res = await loginUser(body);
      if (res) {
        localStorage.setItem("currentUser", username);
        navigate(`/${username}`);
      } else {
        usernameInput.current.setCustomValidity("Wrong information provided.");
        setTimeout(() => {
          e.target.requestSubmit();
        }, 0);
        return;
      }
    },
    [navigate, password, username]
  );

  return (
    <div className="user-form form">
      <h1 className="form-title title">LOG IN</h1>

      <form action="" onSubmit={handleSubmit} className="form-body">
        <div className="form-container container">
          <label htmlFor="username" className="form-label">
            Enter username:
          </label>
          <input
            required
            autoComplete="off"
            ref={usernameInput}
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              e.target.setCustomValidity("");
            }}
            className="form-input"
          />
        </div>

        <div className="form-container container">
          <label htmlFor="password" className="form-label">
            Enter password:
          </label>
          <input
            required
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              usernameInput.current.setCustomValidity("");
            }}
            className="form-input"
          />
        </div>

        <button type="submit" className="form-submit btn">
          LOGIN
        </button>
      </form>
      <div className="form-footer area">
        Not registered?{" "}
        <Link to="/register" className="form-link link">
          Sign up here!
        </Link>
      </div>
    </div>
  );
}

export default Login;
