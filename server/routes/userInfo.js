const express = require("express");
const router = express.Router();
const fs = require("fs/promises");

const users = require("../userdata/userdata.json");
const handleError = require("../utilities/errorHandler");
const { encryptPassword, encryptFromKey } = require("../utilities/loginUtils");

// POST a new user
// POST /api/userinfo/register
// body : { [username]: encrypted password }
router.post("/register", async (req, res, next) => {
  const username = Object.keys(req.body)[0];
  if (users[username]) return handleError(400)(req, res, next);
  //TODO: make the client send the password as already encrypted
  users[username] = encryptPassword(req.body[username]);
  await fs.writeFile("./userdata/userdata.json", JSON.stringify(users));
  res.send(true);
});

// POST a login to check
// POST /api/userinfo/login
// body: { [username]: unencrypted password }
router.post("/login", async (req, res, next) => {
  const username = Object.keys(req.body)[0];
  if (!users[username]) return handleError(400)(req, res, next);
  const encryptionFromKey = encryptFromKey(req.body[username], users[username]);
  if (!encryptionFromKey) return handleError(400)(req, res, next);
  if (users[username] !== encryptionFromKey)
    return handleError(400)(req, res, next);
  res.send(true);
});

module.exports = router;
