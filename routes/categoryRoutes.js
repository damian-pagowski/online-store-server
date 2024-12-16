/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Endpoints for retrieving product categories
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all product categories
 *     description: Retrieves a list of all product categories available in the store.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 64dcb8e7b1f8e8a34bafc3f2
 *                   name:
 *                     type: string
 *                     example: Electronics
 *                   description:
 *                     type: string
 *                     example: Category for electronic products and devices
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch categories
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

const express = require("express");
const { getCategoriesHandler } = require("../controllers/categoryController");

const router = express.Router();

router.get("/", getCategoriesHandler);

module.exports = router;