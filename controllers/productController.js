const { searchProduct, getProduct } = require('../services/productService');

const searchProductHandler = async(req, res, next) => {
  try {
    const { subcategory, category, search } = req.query;
    const products = await searchProduct(subcategory, category, search);
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getProductHandler = async(req, res, next) => {
  try {
    const { id: productId } = req.params;
    const product = await getProduct(productId);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchProductHandler,
  getProductHandler,
};
