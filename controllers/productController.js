const Products = require("../models/product");
const Categories = require("../models/category");

const searchProduct = (subcategory, category, search) => {
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
  return Products.find(queryCriteria);
};

const getProduct = (productId) => Products.findOne({ productId });

const getCategories = () => Categories.find();

module.exports = { searchProduct, getCategories, getProduct };
