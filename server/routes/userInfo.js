const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");

const users = require("../userdata/userdata.json");
const handleError = require("../utilities/errorHandler");
const { encryptPassword, encryptFromKey } = require("../utilities/loginUtils");

// POST a new user
// POST /api/userinfo/register
// body : { [username]: encrypted password }
router.post("/register", async (req, res, next) => {
  try {
    const username = Object.keys(req.body)[0];
    if (users[username])
      throw new Error(400, { cause: "Cannot register an existing user." });

    //TODO: make the client send the password as already encrypted
    users[username] = req.body[username];
    await fs.writeFile("./userdata/userdata.json", JSON.stringify(users));
    await fs.mkdir(path.join(__dirname, "../files", username));
    res.send(true);
  } catch (error) {
    const code = parseInt(error.message) || 500;
    return handleError(code, error)(req, res, next);
  }
});

// POST a login to check
// POST /api/userinfo/login
// body: { [username]: unencrypted password }
router.post("/login", async (req, res, next) => {
  try {
    const username = Object.keys(req.body)[0];
    if (!users[username])
      throw new Error(400, { cause: "Incorrect information provided." });

    const encryptionFromKey = encryptFromKey(
      req.body[username],
      users[username]
    );

    if (!encryptionFromKey)
      throw new Error(400, { cause: "Incorrect information provided." });
    if (users[username] !== encryptionFromKey)
      throw new Error(400, { cause: "Incorrect information provided." });

    res.send(true);
  } catch (error) {
    const code = parseInt(error.message) || 500;
    return handleError(code, error)(req, res, next);
  }
});

module.exports = router;
