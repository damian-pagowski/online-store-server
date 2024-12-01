const express = require("express");
const router = express.Router();
const {
  createUser,
  getUser,
  deleteUser,
  login,
} = require("../controllers/userController");
const { authenticationMiddleware } = require("../controllers/authController");

// Create a new user
router.post("/", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await createUser(username, email, password);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message, errors: error.errors });
  }
});

// Get current user
router.get("/:username", authenticationMiddleware, async (req, res) => {
  const { username } = req.params;

  if (username !== req.currentuser) {
    return res.status(403).json({ message: "Access denied: can only retrieve your own data" });
  }

  try {
    const user = await getUser(username, { _id: 0, __v: 0, password: 0 });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});

// Delete current user
router.delete("/:username", authenticationMiddleware, async (req, res) => {
  const { username } = req.params;

  if (username !== req.currentuser) {
    return res.status(403).json({ message: "Access denied: can only delete your own account" });
  }

  try {
    await deleteUser(username);
    return res.status(202).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await login(username, password);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

module.exports = router;