const { getCategories } = require('../services/categoryService');

const getCategoriesHandler = async(req, res, next) => {
  try {
    const categories = await getCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategoriesHandler,
};
