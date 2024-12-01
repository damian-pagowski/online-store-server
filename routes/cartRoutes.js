/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management
 */

const express = require("express");
const router = express.Router();
const { authenticationMiddleware } = require("../controllers/authController");
const {
  addItemToCart,
  getCart,
  deleteCart,
} = require("../controllers/cartController");

const generateOrderId = () => Math.floor(Math.random() * 1e9); 

/**
 * @swagger
 * /cart/{username}:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: number
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Quantity exceeds limit or invalid data
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: User's cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/:username", authenticationMiddleware, async (req, res) => {
  const username = req.params.username;
  const { productId, quantity } = req.body;

  try {
    const updatedCart = await addItemToCart(username, productId, quantity);
    return res.status(200).json(updatedCart);
  } catch (err) {
    const cart = await getCart(username);
    return res.status(200).json({
      error: true,
      message: err.message,
      cart,
    });
  }
});

// Get cart
router.get("/:username", authenticationMiddleware, async (req, res) => {
  const username = req.params.username;
  const cart = await getCart(username);
  return res.status(200).json(cart);
});

// Delete cart
router.delete("/:username", authenticationMiddleware, async (req, res) => {
  const username = req.params.username;
  await deleteCart(username);
  return res.status(200).json({ message: "Cart removed successfully" });
});

// Checkout
router.post("/:username/checkout", authenticationMiddleware, async (req, res) => {
  const username = req.params.username;

  try {
    await deleteCart(username); 
    const orderId = generateOrderId();
    return res.status(200).json({
      orderId,
      message: "Your order has been placed successfully. Products will be delivered soon.",
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: "Checkout failed" });
  }
});

module.exports = router;