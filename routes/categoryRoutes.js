/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API to manage products and categories
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Successfully retrieved product categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The category ID.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the category.
 *                     example: Electronics
 *       500:
 *         description: Server error while fetching categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: Failed to fetch categories
 *                 message:
 *                   type: string
 *                   description: Detailed error message.
 *                   example: Database connection error
 */

const express = require("express");
const router = express.Router();

const {
  searchProduct,
  getCategories,
  getProduct,
} = require("../controllers/productController");

router.get("/", async (req, res) => {
  try {
    const categories = await getCategories();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch categories", message: error.message });
  }
});

module.exports = router;