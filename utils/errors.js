class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500; // Default to 500 if statusCode is not provided
        this.isOperational = true; // Used to distinguish between operational and programming errors
        this.timestamp = new Date().toISOString(); // Add timestamp for better tracking
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(errors = [], message = 'Validation failed') {
        super(message, 400);
        this.errors = errors; // Array of validation messages
        this.type = 'validation_error';
    }
}

class DatabaseError extends AppError {
    constructor(message, operation = 'unknown', details = {}) {
        super(message, 500); // Database errors should be 500 (Internal Server Error)
        this.type = 'database_error';
        this.operation = operation; // Operation that failed (e.g., 'findOne', 'updateOne')
        this.details = details; // Additional details about the failure
    }
}


class NotFoundError extends AppError {
    constructor(resource = 'Resource', identifier = '') {
        const message = identifier ? `${resource} with identifier "${identifier}" not found` : `${resource} not found`;
        super(message, 404);
        this.resource = resource;
        this.identifier = identifier;
        this.type = 'not_found';
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
        this.type = 'unauthorized';
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden access') {
        super(message, 403);
        this.type = 'forbidden';
    }
}

class CartError extends AppError {
    constructor(message, cartId = null) {
        super(message, 400);
        this.type = 'cart_error';
        if (cartId) this.cartId = cartId; // Include cartId for debugging
    }
}

class InventoryError extends AppError {
    constructor(productId, message) {
        super(`Inventory Error for Product ${productId}: ${message}`, 400);
        this.type = 'inventory_error';
        this.productId = productId; // Include the product ID to identify which product failed
    }
}

class TokenError extends AppError {
    constructor(message) {
        super(message, 401); // Token errors should use 401 (Unauthorized)
        this.type = 'token_error';
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Invalid authentication') {
        super(message, 401); // Authentication errors should use 401 (Unauthorized)
        this.type = 'authentication_error';
    }
}

module.exports = { 
    AppError, 
    ValidationError, 
    NotFoundError, 
    UnauthorizedError, 
    ForbiddenError, 
    CartError, 
    DatabaseError, 
    InventoryError, 
    AuthenticationError, 
    TokenError 
};