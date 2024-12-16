const Products = require("../models/product");
const { NotFoundError, DatabaseError } = require('../utils/errors');

const mask = { _id: 0, __v: 0 };

const searchProductHandler = async (req, res) => {
  const { subcategory, category, search } = req.query;
  const products = await searchProduct(subcategory, category, search);
  res.status(200).json(products);
};

const getProductHandler = async (req, res) => {
  const { id: productId } = req.params;
  const product = await getProduct(productId);
  res.status(200).json(product);
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
    const product = await Products.findOne({ productId }, mask);
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }
    return product;
  } catch (error) {
    throw new DatabaseError(`Failed to get product with ID ${productId}`, error);
  }
};

const buildQueryCriteria = (subcategory, category, search) => {
  const queryCriteria = {};
  if (category) queryCriteria.category = category;
  if (subcategory) queryCriteria.subcategory = subcategory;
  if (search) queryCriteria.name = { $regex: new RegExp(search, 'i') };
  return queryCriteria;
};

module.exports = { 
  searchProductHandler, 
  getProductHandler, 
  searchProduct, 
  getProduct 
};