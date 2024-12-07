const express = require("express");
const router = express.Router();

const {
  searchProduct,
  getCategories,
  getProduct,
} = require("../controllers/productController");

// Search products
router.get("/", async (req, res) => {
  const { subcategory, category, search } = req.query;

  try {
    const products = await searchProduct(subcategory, category, search);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch products", message: error.message });
  }
});

// // Get all categories
// router.get("/categories", async (req, res) => {
//   try {
//     const categories = await getCategories();
//     return res.status(200).json(categories);
//   } catch (error) {
//     return res.status(500).json({ error: "Failed to fetch categories", message: error.message });
//   }
// });

// Get a specific product by ID
router.get("/:id", async (req, res) => {
  const { id: productId } = req.params;

  try {
    const product = await getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch product", message: error.message });
  }
});

module.exports = router;