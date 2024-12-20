/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints for registration, login, account details, and account deletion
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with a username, email, and password.
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
 *                 description: The user's unique username
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 format: password
 *                 example: StrongPassword123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 username:
 *                   type: string
 *                   example: john_doe
 *                 email:
 *                   type: string
 *                   example: john@example.com
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Validation error (username/email already exists or invalid data)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get user details
 *     description: Retrieves the details of the currently authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: john_doe
 *                 email:
 *                   type: string
 *                   example: john@example.com
 *       401:
 *         description: Unauthorized - Token is missing or invalid
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete the currently authenticated user
 *     description: Deletes the account of the currently authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User successfully deleted (no response body)
 *       401:
 *         description: Unauthorized - Token is missing or invalid
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates the user with their username and password and returns a JWT token.
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
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 format: password
 *                 example: StrongPassword123
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
 *                   example: john_doe
 *                 email:
 *                   type: string
 *                   example: john@example.com
 *       400:
 *         description: Validation error (e.g., missing required fields)
 *       401:
 *         description: Invalid credentials
 */

const express = require('express');
const {
  registerUserHandler,
  getUserHandler,
  deleteUserHandler,
  loginHandler,
} = require('../controllers/userController');
const { authenticationMiddleware } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/authorizeRoles');
const { registerUserSchema, loginUserSchema } = require('../validation/userValidation');
const validate = require('../middlewares/validate');

const router = express.Router();

router.post(
  '/',
  validate(registerUserSchema),
  registerUserHandler,
);

router.get(
  '/',
  authenticationMiddleware,
  authorizeRoles('registered_user'),
  getUserHandler,
);

router.delete(
  '/',
  authenticationMiddleware,
  authorizeRoles('registered_user'),
  deleteUserHandler,
);

router.post(
  '/login',
  validate(loginUserSchema),
  loginHandler,
);

module.exports = router;
