const { searchProductHandler, getProductHandler } = require('../../../controllers/productController');
const { searchProduct, getProduct } = require('../../../services/productService');

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

module.exports = { mockRequest, mockResponse };

jest.mock('../../../services/productService');

describe('Product Controller', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchProductHandler', () => {
    it('should return products successfully and respond with 200 status', async() => {
      // Arrange
      const req = mockRequest({ query: { subcategory: 'laptops', category: 'electronics', search: 'MacBook' } });
      const res = mockResponse();
      const next = jest.fn();
      const mockProducts = [
        { id: 1, name: 'MacBook Pro', category: 'electronics', subcategory: 'laptops' },
        { id: 2, name: 'MacBook Air', category: 'electronics', subcategory: 'laptops' },
      ];

      searchProduct.mockResolvedValueOnce(mockProducts);

      // Act
      await searchProductHandler(req, res, next);

      // Assert
      expect(searchProduct).toHaveBeenCalledWith('laptops', 'electronics', 'MacBook');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if searchProduct service throws error', async() => {
      // Arrange
      const req = mockRequest({ query: { subcategory: 'laptops', category: 'electronics', search: 'MacBook' } });
      const res = mockResponse();
      const next = jest.fn();
      const mockError = new Error('Service Error');

      searchProduct.mockRejectedValueOnce(mockError);

      // Act
      await searchProductHandler(req, res, next);

      // Assert
      expect(searchProduct).toHaveBeenCalledWith('laptops', 'electronics', 'MacBook');
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getProductHandler', () => {
    it('should return product successfully and respond with 200 status', async() => {
      // Arrange
      const req = mockRequest({ params: { id: 1 } });
      const res = mockResponse();
      const next = jest.fn();
      const mockProduct = { id: 1, name: 'MacBook Pro', category: 'electronics', subcategory: 'laptops' };

      getProduct.mockResolvedValueOnce(mockProduct);

      // Act
      await getProductHandler(req, res, next);

      // Assert
      expect(getProduct).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if getProduct service throws error', async() => {
      // Arrange
      const req = mockRequest({ params: { id: 1 } });
      const res = mockResponse();
      const next = jest.fn();
      const mockError = new Error('Service Error');

      getProduct.mockRejectedValueOnce(mockError);

      // Act
      await getProductHandler(req, res, next);

      // Assert
      expect(getProduct).toHaveBeenCalledWith(1);
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
