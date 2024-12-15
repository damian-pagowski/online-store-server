const Joi = require('joi');

const checkoutCartSchema = Joi.object({});

const cartOperationSchema = Joi.object({
    productId: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'Product ID must be a number',
        'number.integer': 'Product ID must be an integer',
        'number.positive': 'Product ID must be a positive number',
        'any.required': 'Product ID is required'
      }),
    quantity: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.positive': 'Quantity must be a positive number',
        'any.required': 'Quantity is required'
      }),
    operation: Joi.string().valid('add', 'remove').required()
      .messages({
        'any.only': 'Operation must be either "add" or "remove"',
        'any.required': 'Operation is required'
      })
  });

module.exports = { checkoutCartSchema , cartOperationSchema};