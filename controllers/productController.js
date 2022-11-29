const Products = require("../models/product");
const Categories = require("../models/category");

const mask = { _id: 0, __v: 0 };

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
  return Products.find(queryCriteria, mask);
};

const getProduct = (productId) => Products.findOne({ productId }, mask);

const getCategories = () => Categories.find({}, mask);

module.exports = { searchProduct, getCategories, getProduct };
