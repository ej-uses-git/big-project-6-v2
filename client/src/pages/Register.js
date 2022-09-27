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
      if (!res) return alert("ERROR: Something went wrong :(");
      localStorage.setItem("currentUser", username);
      navigate(`/${username}`);
    },
    [navigate, passwordA, passwordB, username]
  );

  return (
    <div className="register-form">
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

        <label htmlFor="password-a">Enter a password:</label>
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
        />

        <label htmlFor="password-b">Confirm password:</label>
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
        />

        <input type="checkbox" name="not-a-bot" id="not-a-bot" required />

        <button type="submit">REGISTER</button>
      </form>
      Already signed up? <Link to="/login">Log in here!</Link>
    </div>
  );
}

export default Register;
