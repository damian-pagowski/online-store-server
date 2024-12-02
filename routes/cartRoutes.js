/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management
 */

const express = require("express");
const router = express.Router();
const { authenticationMiddleware } = require("../middlewares/authMiddleware");
const {
  addItemToCart,
  getCart,
  deleteCart,
} = require("../controllers/cartController");

const generateOrderId = () => Math.floor(Math.random() * 1e9);


/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
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
 *     responses:
 *       200:
 *         description: User's cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   delete:
 *     summary: Clear user's cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/", authenticationMiddleware, async (req, res) => {
  const username = req.currentUser.username;

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

router.get("/", authenticationMiddleware, async (req, res) => {
  const username = req.currentUser.username;
  const cart = await getCart(username);
  return res.status(200).json(cart);
});

router.delete("/", authenticationMiddleware, async (req, res) => {
  const username = req.currentUser.username;
  await deleteCart(username);
  return res.status(200).json({ message: "Cart removed successfully" });
});

/**
* @swagger
* /cart/checkout:
*   post:
*     summary: Checkout user's cart
*     tags: [Cart]
*     responses:
*       200:
*         description: Checkout successful
*         content:
*           application/json:
*             schema:
*               type: object
*       500:
*         description: Checkout failed
*/
router.post("/checkout", authenticationMiddleware, async (req, res) => {
  const username = req.currentUser.username;
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