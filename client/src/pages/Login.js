import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../utilities/fetchUtils";

function Login(props) {
  const navigate = useNavigate();

  const usernameInput = useRef();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = useCallback(async (e) => {
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
  }, [navigate, password, username]);

  return (
    <div className="login-form">
      <form action="" onSubmit={handleSubmit}>
        <label htmlFor="username">Enter username:</label>
        <input
          required
          ref={usernameInput}
          type="text"
          name="username"
          id="username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            e.target.setCustomValidity("");
          }}
        />

        <label htmlFor="password">Enter password:</label>
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
        />

        <button type="submit">LOGIN</button>
      </form>
      Not registered? <Link to="/register">Sign up here!</Link>
    </div>
  );
}

export default Login;
