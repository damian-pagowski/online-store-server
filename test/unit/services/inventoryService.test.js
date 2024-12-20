const { getInventory, removeFromInventory } = require('../../../services/inventoryService');
const Inventory = require('../../../models/inventory');
const { DatabaseError, InventoryError, NotFoundError } = require('../../../utils/errors');

jest.mock('../../../models/inventory');

describe('Inventory Service', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInventory', () => {
    it('should return inventory successfully', async() => {
      const productId = 1;
      const mockInventory = { productId, quantity: 10 };

      // Arrange
      Inventory.findOne.mockResolvedValueOnce(mockInventory);

      // Act
      const result = await getInventory(productId);

      // Assert
      expect(result).toEqual(mockInventory);
      expect(Inventory.findOne).toHaveBeenCalledWith({ productId }, { _id: 0, __v: 0 });
    });

    it('should throw NotFoundError if product is not found', async() => {
      const productId = 1;

      // Arrange
      Inventory.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(getInventory(productId))
        .rejects.toThrow(NotFoundError);

      expect(Inventory.findOne).toHaveBeenCalledWith({ productId }, { _id: 0, __v: 0 });
    });

    it('should throw DatabaseError if database query fails', async() => {
      const productId = 1;

      // Arrange
      Inventory.findOne.mockRejectedValueOnce(new Error('DB error'));

      // Act & Assert
      await expect(getInventory(productId))
        .rejects.toThrow(DatabaseError);
    });
  });

  describe('removeFromInventory', () => {
    it('should reduce quantity in inventory successfully', async() => {
      const productId = 1;
      const quantityToRemove = 2;
      const mockInventory = { productId, quantity: 10, save: jest.fn().mockResolvedValueOnce(true) };
      const updatedInventory = { productId, quantity: 8 };

      // Arrange
      Inventory.findOne.mockResolvedValueOnce(mockInventory);

      // Act
      const result = await removeFromInventory(productId, quantityToRemove);

      // Assert
      expect(result.quantity).toEqual(updatedInventory.quantity);
      expect(Inventory.findOne).toHaveBeenCalledWith({ productId });
      expect(mockInventory.save).toHaveBeenCalled();
    });

    it('should throw InventoryError if product is not found', async() => {
      const productId = 1;
      const quantityToRemove = 2;

      // Arrange
      Inventory.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(removeFromInventory(productId, quantityToRemove))
        .rejects.toThrow(InventoryError);

      expect(Inventory.findOne).toHaveBeenCalledWith({ productId });
    });

    it('should throw InventoryError if quantity requested is more than available stock', async() => {
      const productId = 1;
      const quantityToRemove = 20;
      const mockInventory = { productId, quantity: 10 };

      // Arrange
      Inventory.findOne.mockResolvedValueOnce(mockInventory);

      // Act & Assert
      await expect(removeFromInventory(productId, quantityToRemove))
        .rejects.toThrow(InventoryError);

      expect(Inventory.findOne).toHaveBeenCalledWith({ productId });
    });

    it('should throw DatabaseError if save fails', async() => {
      const productId = 1;
      const quantityToRemove = 2;
      const mockInventory = { productId, quantity: 10, save: jest.fn().mockRejectedValueOnce(new Error('DB error')) };

      // Arrange
      Inventory.findOne.mockResolvedValueOnce(mockInventory);

      // Act & Assert
      await expect(removeFromInventory(productId, quantityToRemove))
        .rejects.toThrow(DatabaseError);

      expect(Inventory.findOne).toHaveBeenCalledWith({ productId });
      expect(mockInventory.save).toHaveBeenCalled();
    });
  });

});
