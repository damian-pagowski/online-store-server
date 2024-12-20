/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Endpoints for managing the user's shopping cart
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add or remove items in the user's cart
 *     description: Add or remove a product from the user's cart based on the operation. The operation can be "add" or "remove".
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
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
 *                 type: string
 *                 example: 64dcb8e7b1f8e8a34bafc3f2
 *               quantity:
 *                 type: number
 *                 example: 2
 *               operation:
 *                 type: string
 *                 enum: [add, remove]
 *                 example: add
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productId:
 *                   type: string
 *                   example: 64dcb8e7b1f8e8a34bafc3f2
 *                 quantity:
 *                   type: number
 *                   example: 2
 *                 message:
 *                   type: string
 *                   example: Cart updated successfully
 *       400:
 *         description: Validation error (e.g., invalid operation, invalid productId)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid operation. Use "add" or "remove".
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the current user's cart
 *     description: Retrieves the items currently in the user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the current user's cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: object
 *                   example:
 *                     "64dcb8e7b1f8e8a34bafc3f2": 2
 *                     "64dcb8e7b1f8e8a34bafc3f3": 5
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear the user's cart
 *     description: Removes all items from the user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart cleared successfully
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

const express = require('express');
const { addItemToCartHandler, getCartHandler, deleteCartHandler } = require('../controllers/cartController');
const { authenticationMiddleware } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/authorizeRoles');
const validate = require('../middlewares/validate');

const { cartOperationSchema } = require('../validation/cartValidation');

const router = express.Router();

router.post('/',
  authenticationMiddleware,
  authorizeRoles('registered_user'),
  validate(cartOperationSchema),
  addItemToCartHandler,
);

router.get('/',
  authenticationMiddleware,
  authorizeRoles('registered_user'),
  getCartHandler,
);

router.delete('/',
  authenticationMiddleware,
  authorizeRoles('registered_user'),
  deleteCartHandler,
);

module.exports = router;
