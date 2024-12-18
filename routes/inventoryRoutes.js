/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Endpoints for managing product inventory
 */

/**
 * @swagger
 * /inventory/{productId}:
 *   get:
 *     summary: Get inventory details for a specific product
 *     description: Retrieves the inventory details for a product by its productId.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64dcb8e7b1f8e8a34bafc3f2
 *         description: The ID of the product to retrieve the inventory for
 *     responses:
 *       200:
 *         description: Returns the inventory details for the specified product
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
 *                   example: 20
 *       404:
 *         description: Inventory not found for the specified product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Inventory not found for the specified product
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch inventory
 */

const express = require("express");
const { getInventoryHandler } = require("../controllers/inventoryController");
const { authenticationMiddleware } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/authorizeRoles');

const router = express.Router();

router.get(
  "/:productId", 
  authenticationMiddleware, 
  authorizeRoles('guest', 'registered_user'),
  getInventoryHandler
);

module.exports = router;