const express = require("express");
const router = express.Router();

const {
  searchProduct,
  getCategories,
  getProduct,
} = require("../controllers/productController");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await getCategories();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch categories", message: error.message });
  }
});

module.exports = router;