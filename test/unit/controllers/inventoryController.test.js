const { getInventoryHandler } = require('../../../controllers/inventoryController');
const { getInventory } = require('../../../services/inventoryService');
const { mockRequest, mockResponse } = require('../../testUtil');
const { DatabaseError } = require('../../../utils/errors');

jest.mock('../../../services/inventoryService');

describe('Inventory Controller Tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInventoryHandler', () => {

    it('should return product inventory successfully', async() => {
      // Arrange
      const productId = 123;
      const req = mockRequest({ params: { productId } });
      const res = mockResponse();
      const next = jest.fn();
      const mockInventory = { productId: 123, quantity: 50 };

      getInventory.mockResolvedValueOnce(mockInventory);

      // Act
      await getInventoryHandler(req, res, next);

      // Assert
      expect(getInventory).toHaveBeenCalledWith(productId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInventory);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when getInventory throws an error', async() => {
      // Arrange
      const productId = 123;
      const req = mockRequest({ params: { productId } });
      const res = mockResponse();
      const next = jest.fn();
      const error = new DatabaseError('Failed to fetch product inventory');

      getInventory.mockRejectedValueOnce(error);

      // Act
      await getInventoryHandler(req, res, next);

      // Assert
      expect(getInventory).toHaveBeenCalledWith(productId);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

  });

});
