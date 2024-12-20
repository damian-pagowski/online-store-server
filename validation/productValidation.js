const Joi = require('joi');

const productQuerySchema = Joi.object({
  subcategory: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z\-]+$/, 'letters and dashes only')
    .optional()
    .messages({
      'string.base': 'Subcategory must be a string',
      'string.pattern.base': 'Subcategory must contain only letters and dashes',
      'string.empty': 'Subcategory cannot be empty',
    }),
  category: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z\-]+$/, 'letters and dashes only')
    .optional()
    .messages({
      'string.base': 'Category must be a string',
      'string.pattern.base': 'Category must contain only letters and dashes',
      'string.empty': 'Category cannot be empty',
    }),
  search: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'Search must be a string',
      'string.max': 'Search must not exceed 100 characters',
      'string.empty': 'Search cannot be empty',
    }),
});

const productIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Product ID must be a number',
      'number.integer': 'Product ID must be an integer',
      'number.positive': 'Product ID must be a positive number',
      'any.required': 'Product ID is required',
    }),
});

module.exports = { productQuerySchema, productIdSchema };
