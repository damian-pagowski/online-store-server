const express = require("express");
const router = express.Router();
const { getInventory } = require("../controllers/inventoryController");

// Get inventory details for a specific product
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