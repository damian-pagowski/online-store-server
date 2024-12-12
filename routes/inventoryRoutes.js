/**
 * @swagger
 * /inventory/{productId}:
 *   get:
 *     summary: Get inventory details for a specific product
 *     description: Returns the inventory details for a product using the provided product ID.
 *     tags: 
 *       - Inventory
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product to retrieve inventory for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved inventory details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productId:
 *                   type: string
 *                   example: "64b6f79a63f1f2c4e8f70a1b"
 *                 stock:
 *                   type: integer
 *                   example: 25
 *                 warehouseLocation:
 *                   type: string
 *                   example: "Aisle 3, Shelf B"
 *       404:
 *         description: Inventory not found for the specified product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Inventory not found for the specified product"
 *       500:
 *         description: Failed to fetch inventory due to server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch inventory"
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

const express = require("express");
const router = express.Router();
const { getInventory } = require("../controllers/inventoryController");

router.get("/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const productInventory = await getInventory(productId);

    if (!productInventory) {
      return res.status(404).json({ error: "Inventory not found for the specified product" });
    }

    return res.status(200).json(productInventory);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch inventory",
      message: error.message,
    });
  }
});

module.exports = router;