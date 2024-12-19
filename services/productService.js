const Products = require("../models/product");
const { NotFoundError, DatabaseError } = require('../utils/errors');

const mask = { _id: 0, __v: 0 };

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
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError(`Failed to get product with ID ${productId}`, error);
  }
};

const getProductsByIds = async (productIds) => {
  try {
    const products = await Products.find({ productId: { $in: productIds } });
    if (!products || products.length === 0) {
      throw new NotFoundError('Products', productIds.join(', '));
    }
    return products;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new DatabaseError('Failed to get products by IDs', 'getProductsByIds', { productIds, originalError: error });
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
  searchProduct,
  getProduct,
  getProductsByIds
};