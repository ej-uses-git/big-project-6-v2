const express = require("express");
const { encryptPassword, encryptFromKey } = require("../utilities/loginUtils");
const router = express.Router();
const fs = require("fs/promises");

const users = require("../userdata/userdata.json");
const handleError = require("../utilities/errorHandler");

// POST a new user
router.post("/register", async (req, res, next) => {
  const username = Object.keys(req.body)[0];
  if (users[username]) return handleError(400)(req, res, next);
  users[username] = encryptPassword(req.body[username]);
  await fs.writeFile("./userdata/userdata.json", JSON.stringify(users));
  res.send(true);
});

router.post("/login", async (req, res, next) => {
  const username = Object.keys(req.body)[0];
  if (!users[username]) return handleError(400)(req, res, next);
  const encryptionFromKey = encryptFromKey(req.body[username], users[username]);
  if (!encryptionFromKey) return handleError(400)(req, res, next);
  console.log(
    "users stored:",
    users[username],
    "reencrypted:",
    encryptionFromKey
  );
  if (users[username] !== encryptionFromKey)
    return handleError(400)(req, res, next);
  console.log("got here");
  res.send(true);
});

module.exports = router;
