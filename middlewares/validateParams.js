const validateParams = (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.params, { abortEarly: false });
      if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        });
      }
      next();
    };
  };
  module.exports = validateParams;