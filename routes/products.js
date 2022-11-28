const express = require("express");
const router = express.Router();

const {
  searchProduct,
  getCategories,
  getProduct,
} = require("../controllers/productController");

router.get("/", async (req, res, next) => {
  const { subcategory, category, search } = req.query;
  const products = await searchProduct(subcategory, category, search);
  res.json(products);
});

router.get("/categories", async (req, res, next) => {
  const categories = await getCategories();
  res.json(categories);
});

router.get("/:id", async (req, res, next) => {
  const productId = req.params["id"];
  const product = await getProduct(productId);
  return product
    ? res.json(product)
    : res.status(404).json({ error: "product not found" });
});
module.exports = router;
