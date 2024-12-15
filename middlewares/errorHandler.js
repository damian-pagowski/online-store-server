const { AppError } = require('../utils/errors');
const { v4: uuidv4 } = require('uuid');

const errorHandler = (err, req, res, next) => {
  const requestId = uuidv4();
  const { method, url, body, query, params } = req;

  console.error('🔥 Error occurred:', {
    requestId,
    message: err.message,
    type: err.type || 'unknown_error',
    statusCode: err.statusCode || 500,
    method,
    url,
    body,
    query,
    params,
    stack: err.stack
  });

  if (err instanceof AppError) {
    const errorResponse = {
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      type: err.type || 'app_error',
      requestId,
      context: {
        ...(err.resource && { resource: err.resource }),
        ...(err.identifier && { identifier: err.identifier }),
        ...(err.productId && { productId: err.productId }),
        ...(err.cartId && { cartId: err.cartId }),
        ...(err.operation && { operation: err.operation }),
        ...(err.details && { details: err.details }),
        ...(err.errors && { errors: err.errors })
      }
    };

    return res.status(err.statusCode).json(errorResponse);
  }

 
  // if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack,
      statusCode: 500,
      requestId
    });
  // }

  // Production
  // res.status(500).json({
  //   success: false,
  //   message: 'Something went wrong on our end. Please try again later.',
  //   statusCode: 500,
  //   requestId
  // });
};

module.exports = errorHandler;