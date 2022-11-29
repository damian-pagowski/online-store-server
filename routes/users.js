const express = require("express");
const router = express.Router();
const {
  createUser,
  getUser,
  deleteUser,
} = require("../controllers/userController");
const { authenticationMiddleware } = require("../controllers/authController");

router.post("/", async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const user = await createUser(username, email, password);
    return res.status(201).send();
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.get("/:username", authenticationMiddleware, async (req, res, next) => {
  const username = req.params["username"];
  if (username !== req.currentuser) {
    return res.status(400).json({ message: "can only get current user" });
  }
  const user = await getUser(username, { _id: 0, __v: 0, password: 0 });
  delete user.password;
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
    await deleteUser(username);
    return res.status(202).send();
  }
);
module.exports = router;
