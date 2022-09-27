import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../utilities/fetchUtils";
import { encryptPassword } from "../utilities/registerUtils";

function Register(props) {
  const navigate = useNavigate();

  const usernameInput = useRef();
  const passAInput = useRef();

  const [username, setUsername] = useState("");
  const [passwordA, setPasswordA] = useState("");
  const [passwordB, setPasswordB] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (passwordA !== passwordB) {
        passAInput.current.setCustomValidity(
          "Please ensure the passwords match."
        );
        if (!passAInput.current.checkValidity()) {
          setTimeout(() => {
            e.target.requestSubmit();
          }, 0);
          return;
        }
      }
      const passwordRegex = /^(?=[^a-z]*[a-z])(?=\D*\d)[^:&.~\s]{5,20}$/;
      if (!passwordRegex.test(passwordA)) {
        passAInput.current.setCustomValidity(
          `Please match the following requirements:
        Must be 5-20 characters long
        Must contain at least one lower-case letter
        Must contain at least one number
        Must not contain a colon (:); an ampersand (&); a period (.); a tilde (~); or a space`
        );
        if (!passAInput.current.checkValidity()) {
          setTimeout(() => {
            e.target.requestSubmit();
          }, 0);
          return;
        }
      }
      const usernameRegex = /^[a-z][^\W_]{7,14}$/i;
      if (!usernameRegex.test(username)) {
        usernameInput.current
          .setCustomValidity(`Please match the following requirements:
      Must be 8-15 characters and must start with a letter
      May not contain special characters – only letters and numbers`);
        if (!usernameInput.current.checkValidity()) {
          setTimeout(() => {
            e.target.requestSubmit();
          }, 0);
          return;
        }
      }

      const body = { [username]: encryptPassword(passwordA) };
      const res = await registerUser(body);
      if (!res) return navigate(`/error/something went wrong`);
      localStorage.setItem("currentUser", username);
      navigate(`/${username}`);
    },
    [navigate, passwordA, passwordB, username]
  );

  return (
    <div className="user-form">
      <h1 className="form-title title">SIGN UP</h1>
      
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
          <label htmlFor="password-a" className="form-label">
            Enter a password:
          </label>
          <input
            required
            ref={passAInput}
            type="password"
            name="passwordA"
            id="password-a"
            value={passwordA}
            onChange={(e) => {
              setPasswordA(e.target.value);
              e.target.setCustomValidity("");
            }}
            className="form-input"
          />
        </div>

        <div className="form-container container">
          <label htmlFor="password-b" className="form-label">
            Confirm password:
          </label>
          <input
            required
            type="password"
            name="passwordB"
            id="password-b"
            value={passwordB}
            onChange={(e) => {
              setPasswordB(e.target.value);
              passAInput.current.setCustomValidity("");
            }}
            className="form-input"
          />
        </div>

        <button type="submit" className="form-submit btn">
          REGISTER
        </button>
      </form>
      <div className="form-footer" id="register-footer">
        Already signed up?{" "}
        <Link to="/login" className="form-link link">
          Log in here!
        </Link>
      </div>
    </div>
  );
}

export default Register;
