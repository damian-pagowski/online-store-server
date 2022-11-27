const express = require("express");
const router = express.Router();
const Products = require("../models/product");
const Categories = require("../models/category");

router.get("/", async (req, res, next) => {
  const { subcategory, category, search } = req.query;
  let queryCriteria = {};
  if (category) {
    queryCriteria = { ...queryCriteria, category };
  }
  if (subcategory) {
    queryCriteria = { ...queryCriteria, subcategory };
  }
  if (search) {
    const regex = new RegExp("(" + search + ")", "gi");
    queryCriteria = { ...queryCriteria, name: { $regex: regex } };
  }
  const products = await Products.find(queryCriteria);
  res.json(products);
});

router.get("/categories", async (req, res, next) => {
  const categories = await Categories.find();
  res.json(categories);
});

router.get("/:id", async (req, res, next) => {
  const productId = req.params["id"];
  const product = await Products.findOne({ productId });
  return product
    ? res.json(product)
    : res.status(404).json({ error: "product not found" });
});
module.exports = router;
