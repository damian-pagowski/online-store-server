const { DatabaseError } = require('../utils/errors');
const Category = require('../models/category');

const getCategoriesHandler = async (req, res) => {
  try {
    const categories = await getCategories();
    res.status(200).json(categories);
  } catch (error) {
    throw new DatabaseError('Failed to fetch categories', 'getCategories', { originalError: error });
  }
};

const getCategories = async () => {
  try {
    return await Category.find({}, { _id: 0, __v: 0 });
  } catch (error) {
    throw new DatabaseError('Failed to query categories from database', 'getCategories', { originalError: error });
  }
};

module.exports = { getCategoriesHandler };