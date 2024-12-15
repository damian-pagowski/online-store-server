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
const { cartOperationSchema, checkoutCartSchema } = require('../validation/cartValidation');
const generateOrderId = () => Math.floor(Math.random() * 1e9);
const validate = require('../middlewares/validate');


/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add or remove item from cart
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
 *               - operation
 *             properties:
 *               productId:
 *                 type: number
 *                 description: The ID of the product to be added or removed
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product to be added or removed
 *               operation:
 *                 type: string
 *                 enum: [add, remove]
 *                 description: The operation to be performed. Use 'add' to add items and 'remove' to remove items from the cart.
 *     responses:
 *       200:
 *         description: Updated cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid data or operation field is missing
 *       401:
 *         description: Unauthorized
 * 
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
 * 
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

router.post("/", authenticationMiddleware, validate(cartOperationSchema), async (req, res) => {
  const { productId, quantity, operation } = req.body;
  const username = req.currentUser.username;

  try {
    let updatedCart;
    if (operation === 'add') {
      updatedCart = await addItemToCart(username, productId, quantity);
    } else if (operation === 'remove') {
      updatedCart = await addItemToCart(username, productId, -quantity); // Quick and dirty fix
    } else {
      return res.status(400).json({ error: true, message: 'Invalid operation. Use "add" or "remove".' });
    }
    return res.status(200).json(updatedCart);
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message });
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
router.post("/checkout", authenticationMiddleware, validate(checkoutCartSchema), async (req, res) => {
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