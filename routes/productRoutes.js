const express = require("express");
const router = express.Router();
const { productQuerySchema, productIdSchema } = require('../validation/productValidation');
const validateParams = require('../middlewares/validateParams');

const {
  searchProduct,
  getProduct,
} = require("../controllers/productController");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of products
 *     description: Fetch a list of products with optional filters for subcategory, category, and search term.
 *     parameters:
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
 *         description: Filter by subcategory
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search for products by keyword
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   image:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get("/", validateParams(productQuerySchema), async (req, res) => {
  const { subcategory, category, search } = req.query;
  try {
    const products = await searchProduct(subcategory, category, search);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch products", message: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Retrieve a product by ID
 *     description: Get the details of a specific product by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 image:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", validateParams(productIdSchema), async (req, res) => {
  const { id: productId } = req.params;
  try {
    const product = await getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch product", message: error.message });
  }
});

module.exports = router;