/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Endpoints for managing and viewing user orders
 */

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Checkout user's cart and create an order
 *     description: Creates a new order based on the user's cart. The cart will be cleared after a successful order is created.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order created successfully
 *                 orderId:
 *                   type: string
 *                   example: 64dcb8e7b1f8e8a34bafc3f2
 *       400:
 *         description: Validation error (e.g., cart is empty)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cannot checkout with an empty cart
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
 * /orders:
 *   get:
 *     summary: Get order history for the authenticated user
 *     description: Returns a list of past orders for the authenticated user.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64dcb8e7b1f8e8a34bafc3f2
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productId:
 *                               type: string
 *                               example: 64dcb8e7b1f8e8a34bafc3f2
 *                             name:
 *                               type: string
 *                               example: Laptop
 *                             quantity:
 *                               type: number
 *                               example: 2
 *                             price:
 *                               type: number
 *                               example: 1499.99
 *                       totalPrice:
 *                         type: number
 *                         example: 2999.98
 *                       status:
 *                         type: string
 *                         enum: [pending, shipped, delivered, cancelled]
 *                         example: pending
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-12-14T12:45:30.000Z
 *       404:
 *         description: No orders found for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No orders found for the user
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
 * /orders/{id}:
 *   get:
 *     summary: Get details of a specific order by order ID
 *     description: Retrieve details of a specific order for the authenticated user.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 64dcb8e7b1f8e8a34bafc3f2
 *         description: The ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Details of the specific order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64dcb8e7b1f8e8a34bafc3f2
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             example: 64dcb8e7b1f8e8a34bafc3f2
 *                           name:
 *                             type: string
 *                             example: Laptop
 *                           quantity:
 *                             type: number
 *                             example: 2
 *                           price:
 *                             type: number
 *                             example: 1499.99
 *                     totalPrice:
 *                       type: number
 *                       example: 2999.98
 *                     status:
 *                       type: string
 *                       enum: [pending, shipped, delivered, cancelled]
 *                       example: pending
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-12-14T12:45:30.000Z
 *       404:
 *         description: Order not found for the provided ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
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
const { checkout, getOrderHistory, getOrderById } = require('../controllers/orderController');
const { authenticationMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/checkout', authenticationMiddleware, checkout);
router.get('/', authenticationMiddleware, getOrderHistory);
router.get('/:id', authenticationMiddleware, getOrderById);

module.exports = router;