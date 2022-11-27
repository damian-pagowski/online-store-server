const express = require("express");
const router = express.Router();
const Users = require("../models/user");

const {
  authenticationMiddleware,
  hashPassword,
} = require("../controllers/auth");

router.post("/", async (req, res, next) => {
  const { username, email, password } = req.body;
  const emailFound = await Users.findOne({ email });
  const usernameFound = await Users.findOne({ username });
  if (emailFound || usernameFound) {
    return res.status(400).json({
      message: "username or email already in use",
      emailInUse: emailFound != null,
      usernameInUse: usernameFound != null,
    });
  }
  const hashedPassword = hashPassword(password);
  const newUser = await Users.createUser(
    new Users({ username, email, password: hashedPassword })
  );
  return res.status(201).json(newUser);
});

router.get("/:username", authenticationMiddleware, async (req, res, next) => {
  const username = req.params["username"];
  if (username !== req.currentuser) {
    return res.status(400).json({ message: "can only get current user" });
  }
  const user = await Users.findOne({ username });
  return res.status(200).json(user);
});

router.delete(
  "/:username",
  authenticationMiddleware,
  async (req, res, next) => {
    const username = req.params["username"];
    if (username !== req.currentuser) {
      return res.status(400).json({ message: "can only delete current user" });
    }
    const result = await Users.findOneAndRemove({ username });
    return res.json({ message: `removed ${username}` });
  }
);
module.exports = router;
