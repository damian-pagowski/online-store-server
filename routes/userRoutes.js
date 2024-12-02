/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

const express = require("express");
const router = express.Router();
const { getUser, createUser, deleteUser, login } = require("../controllers/userController");
const { authenticationMiddleware } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await createUser(username, email, password);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message, errors: error.errors });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.get("/", authenticationMiddleware, async (req, res) => {
  try {
    const username = req.currentUser.username;
    const user = await getUser(username, { _id: 0, __v: 0, password: 0 });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User successfully deleted
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.delete("/", authenticationMiddleware, async (req, res) => {
  try {
    const username = req.currentUser.username;
    await deleteUser(username);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Authenticate user and return a JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, JWT token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const response = await login(username, password);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;