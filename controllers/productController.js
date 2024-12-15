const Products = require("../models/product");
const Categories = require("../models/category");
const { NotFoundError, DatabaseError } = require('../utils/errors');

const mask = { _id: 0, __v: 0 };

const buildQueryCriteria = (subcategory, category, search) => {
  const queryCriteria = {};
  if (category) queryCriteria.category = category;
  if (subcategory) queryCriteria.subcategory = subcategory;
  if (search) queryCriteria.name = { $regex: new RegExp(search, 'i') };
  return queryCriteria;
};

const searchProduct = async (subcategory, category, search) => {
  try {
    const queryCriteria = buildQueryCriteria(subcategory, category, search);
    return await Products.find(queryCriteria, mask);
  } catch (error) {
    throw new DatabaseError(`Failed to search products. Query: ${JSON.stringify({ subcategory, category, search })}`, error);
  }
};

const getProduct = async (productId) => {
  try {
    const product = await Products.findOne({ _id: productId }, mask);
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }
    return product;
  } catch (error) {
    throw new DatabaseError(`Failed to get product with ID ${productId}`, error);
  }
};

const getCategories = async () => {
  try {
    return await Categories.find({}, mask);
  } catch (error) {
    throw new DatabaseError('Failed to retrieve product categories', error);
  }
};

module.exports = { searchProduct, getCategories, getProduct };