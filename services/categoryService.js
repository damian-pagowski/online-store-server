const Category = require('../models/category');
const { DatabaseError } = require('../utils/errors');

const getCategories = async () => {
  try {
    return await Category.find({}, { _id: 0, __v: 0 });
  } catch (error) {
    throw new DatabaseError('Failed to query categories from database', 'getCategories', { originalError: error });
  }
};

module.exports = { 
  getCategories 
};