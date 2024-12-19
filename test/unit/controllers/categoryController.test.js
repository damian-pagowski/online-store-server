const { getCategoriesHandler } = require('../../../controllers/categoryController');
const { getCategories } = require('../../../services/categoryService');
const { mockRequest, mockResponse } = require('../../testUtil');
const { DatabaseError } = require('../../../utils/errors');

jest.mock('../../../services/categoryService');

describe('Category Controller Tests', () => {

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  describe('getCategoriesHandler', () => {
    it('should return categories successfully', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const mockCategories = [{ name: 'Electronics' }, { name: 'Books' }];
      getCategories.mockResolvedValueOnce(mockCategories);
      
      // Act
      await getCategoriesHandler(req, res, next);
      
      // Assert
      expect(getCategories).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCategories);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error on service failure', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();
      const error = new DatabaseError('Failed to query categories from database');
      getCategories.mockRejectedValueOnce(error);
      
      // Act
      await getCategoriesHandler(req, res, next);
      
      // Assert
      expect(getCategories).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

});