const Joi = require('joi');

const registerUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must be at most 30 characters long',
      'any.required': 'Username is required'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().min(6).max(50).required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must be at most 50 characters long',
      'any.required': 'Password is required'
    })
});

const loginUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must be at most 30 characters long',
      'any.required': 'Username is required'
    }),
  password: Joi.string().min(6).max(50).required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must be at most 50 characters long',
      'any.required': 'Password is required'
    })
});

module.exports = { registerUserSchema, loginUserSchema };