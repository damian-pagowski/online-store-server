const Products = require("../models/product");
const Categories = require("../models/category");

const mask = { _id: 0, __v: 0 };

const buildQueryCriteria = (subcategory, category, search) => {
  const queryCriteria = {};

  if (category) queryCriteria.category = category;
  if (subcategory) queryCriteria.subcategory = subcategory;
  if (search) queryCriteria.name = { $regex: new RegExp(`(${search})`, "gi") };

  return queryCriteria;
};

const searchProduct = (subcategory, category, search) => {
  const queryCriteria = buildQueryCriteria(subcategory, category, search);
  return Products.find(queryCriteria, mask);
};

const getProduct = (productId) => Products.findOne({ productId }, mask);

const getCategories = () => Categories.find({}, mask);

module.exports = { searchProduct, getCategories, getProduct };