const express = require("express");
const router = express.Router();
const { getInventory } = require("../controllers/inventoryController");

router.get("/:productId", async (req, res, next) => {
  const productId = req.params["productId"];
  const productInventory = await getInventory(productId);
  res.json(productInventory);
});

module.exports = router;
