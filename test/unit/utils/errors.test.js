const {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  CartError,
  DatabaseError,
  InventoryError,
  AuthenticationError,
  TokenError,
  InventoryRollbackError,
} = require('../../../utils/errors');

describe('Error Classes', () => {

  describe('AppError', () => {
    it('should create an AppError with default status code and message', () => {
      const error = new AppError('Something went wrong');
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(typeof error.timestamp).toBe('string');
      expect(error.stack).toBeDefined();
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError('Custom Error', 400);
      expect(error.message).toBe('Custom Error');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with default message and empty errors', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual([]);
      expect(error.type).toBe('validation_error');
    });

    it('should create a ValidationError with custom message and errors', () => {
      const error = new ValidationError(['field1', 'field2'], 'Custom validation error');
      expect(error.message).toBe('Custom validation error');
      expect(error.errors).toEqual(['field1', 'field2']);
    });
  });

  describe('DatabaseError', () => {
    it('should create a DatabaseError with default operation and message', () => {
      const error = new DatabaseError('Database connection failed');
      expect(error.message).toBe('Database connection failed');
      expect(error.operation).toBe('unknown');
      expect(error.details).toEqual({});
    });

    it('should create a DatabaseError with custom operation and details', () => {
      const error = new DatabaseError('Query failed', 'find', { query: 'SELECT * FROM users' });
      expect(error.message).toBe('Query failed');
      expect(error.operation).toBe('find');
      expect(error.details).toEqual({ query: 'SELECT * FROM users' });
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with default resource', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.type).toBe('not_found');
    });

    it('should create a NotFoundError for a specific resource and identifier', () => {
      const error = new NotFoundError('User', '123');
      expect(error.message).toBe('User with identifier "123" not found');
      expect(error.resource).toBe('User');
      expect(error.identifier).toBe('123');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an UnauthorizedError with default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized access');
      expect(error.statusCode).toBe(401);
    });

    it('should create an UnauthorizedError with custom message', () => {
      const error = new UnauthorizedError('Custom unauthorized message');
      expect(error.message).toBe('Custom unauthorized message');
    });
  });

  describe('ForbiddenError', () => {
    it('should create a ForbiddenError with default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Forbidden access');
      expect(error.statusCode).toBe(403);
    });

    it('should create a ForbiddenError with custom message', () => {
      const error = new ForbiddenError('Custom forbidden message');
      expect(error.message).toBe('Custom forbidden message');
    });
  });

  describe('CartError', () => {
    it('should create a CartError with default cartId', () => {
      const error = new CartError('Item not found');
      expect(error.message).toBe('Item not found');
      expect(error.statusCode).toBe(400);
    });

    it('should create a CartError with cartId', () => {
      const error = new CartError('Item not found', 'cart123');
      expect(error.cartId).toBe('cart123');
    });
  });

  describe('InventoryError', () => {
    it('should create an InventoryError with a message', () => {
      const error = new InventoryError(123, 'Out of stock');
      expect(error.message).toBe('Inventory Error for Product 123: Out of stock');
      expect(error.statusCode).toBe(400);
      expect(error.productId).toBe(123);
    });
  });

  describe('TokenError', () => {
    it('should create a TokenError with a custom message', () => {
      const error = new TokenError('Token is invalid');
      expect(error.message).toBe('Token is invalid');
      expect(error.statusCode).toBe(401);
      expect(error.type).toBe('token_error');
    });
  });

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Invalid authentication');
      expect(error.statusCode).toBe(401);
    });

    it('should create an AuthenticationError with custom message', () => {
      const error = new AuthenticationError('Custom auth error');
      expect(error.message).toBe('Custom auth error');
    });
  });

  describe('InventoryRollbackError', () => {
    it('should create an InventoryRollbackError with default message', () => {
      const error = new InventoryRollbackError('Rollback failed');
      expect(error.message).toBe('Rollback failed');
      expect(error.statusCode).toBe(500);
      expect(typeof error.timestamp).toBe('string');
    });

    it('should create an InventoryRollbackError with originalError', () => {
      const originalError = new Error('Something went wrong');
      const error = new InventoryRollbackError('Rollback failed', originalError);
      expect(error.originalError).toBe(originalError);
    });
  });

});
