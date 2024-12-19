const { addItemToCartHandler, getCartHandler, deleteCartHandler } = require('../../../controllers/cartController');
const { addItemToCart, getCart, deleteCart } = require('../../../services/cartService');
const { CartError } = require('../../../utils/errors');

const mockRequest = (overrides = {}) => {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      currentUser: {},
      ...overrides,
    };
  };
  
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  
jest.mock('../../../services/cartService');

describe('Cart Controller', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItemToCartHandler', () => {
    it('should add item to cart successfully and return 200 status', async () => {
      // Arrange
      const req = mockRequest({ body: { productId: 1, quantity: 2, operation: 'add' }, currentUser: { username: 'testuser' } });
      const res = mockResponse();
      const next = jest.fn();
      const mockCart = { 1: 2 };

      addItemToCart.mockResolvedValueOnce(mockCart);

      // Act
      await addItemToCartHandler(req, res, next);

      // Assert
      expect(addItemToCart).toHaveBeenCalledWith('testuser', 1, 2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCart);
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw CartError if operation is invalid', async () => {
      // Arrange
      const req = mockRequest({ body: { productId: 1, quantity: 2, operation: 'invalid' }, currentUser: { username: 'testuser' } });
      const res = mockResponse();
      const next = jest.fn();

      // Act
      await addItemToCartHandler(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(CartError));
      expect(addItemToCart).not.toHaveBeenCalled();
    });

    it('should call next with error if addItemToCart service throws error', async () => {
      // Arrange
      const req = mockRequest({ body: { productId: 1, quantity: 2, operation: 'add' }, currentUser: { username: 'testuser' } });
      const res = mockResponse();
      const next = jest.fn();
      const mockError = new Error('Service Error');

      addItemToCart.mockRejectedValueOnce(mockError);

      // Act
      await addItemToCartHandler(req, res, next);

      // Assert
      expect(addItemToCart).toHaveBeenCalledWith('testuser', 1, 2);
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getCartHandler', () => {
    it('should return cart successfully and respond with 200 status', async () => {
      // Arrange
      const req = mockRequest({ currentUser: { username: 'testuser' } });
      const res = mockResponse();
      const next = jest.fn();
      const mockCart = { 1: 2 };

      getCart.mockResolvedValueOnce(mockCart);

      // Act
      await getCartHandler(req, res, next);

      // Assert
      expect(getCart).toHaveBeenCalledWith('testuser');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCart);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if getCart service throws error', async () => {
      // Arrange
      const req = mockRequest({ currentUser: { username: 'testuser' } });
      const res = mockResponse();
      const next = jest.fn();
      const mockError = new Error('Service Error');

      getCart.mockRejectedValueOnce(mockError);

      // Act
      await getCartHandler(req, res, next);

      // Assert
      expect(getCart).toHaveBeenCalledWith('testuser');
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteCartHandler', () => {
    it('should delete cart successfully and respond with 200 status', async () => {
      // Arrange
      const req = mockRequest({ currentUser: { username: 'testuser' } });
      const res = mockResponse();
      const next = jest.fn();

      deleteCart.mockResolvedValueOnce(true);

      // Act
      await deleteCartHandler(req, res, next);

      // Assert
      expect(deleteCart).toHaveBeenCalledWith('testuser');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart cleared successfully' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if deleteCart service throws error', async () => {
      // Arrange
      const req = mockRequest({ currentUser: { username: 'testuser' } });
      const res = mockResponse();
      const next = jest.fn();
      const mockError = new Error('Service Error');

      deleteCart.mockRejectedValueOnce(mockError);

      // Act
      await deleteCartHandler(req, res, next);

      // Assert
      expect(deleteCart).toHaveBeenCalledWith('testuser');
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});