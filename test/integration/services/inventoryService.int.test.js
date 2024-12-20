const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Inventory = require('../../../models/inventory');
const { getInventory, removeFromInventory } = require('../../../services/inventoryService');
const { InventoryError, DatabaseError , NotFoundError } = require('../../../utils/errors');

let mongoServer;

beforeAll(async() => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async() => {
  await Inventory.deleteMany(); // Clear inventory collection before each test
});

describe('🔹 Inventory Service Integration Tests', () => {

  describe('🔹 getInventory()', () => {
    it('should return inventory for a valid productId', async() => {
      // Arrange
      const productId = 101;
      const inventoryData = { productId, quantity: 50 };
      await Inventory.create(inventoryData);

      // Act
      const result = await getInventory(productId);

      // Assert
      expect(result).toMatchObject({ productId, quantity: 50 });
    });

    it('should throw NotFoundError if product is not found', async() => {
      // Arrange
      const productId = 999;

      // Act & Assert
      await expect(getInventory(productId)).rejects.toThrow(NotFoundError);
    });

    it('should throw DatabaseError if database query fails', async() => {
      // Arrange
      jest.spyOn(Inventory, 'findOne').mockRejectedValueOnce(new Error('DB Error'));
      const productId = 101;

      // Act & Assert
      await expect(getInventory(productId)).rejects.toThrow(DatabaseError);
    });
  });

  describe('🔹 removeFromInventory()', () => {
    it('should remove the correct quantity from the inventory', async() => {
      // Arrange
      const productId = 101;
      const initialInventory = { productId, quantity: 50 };
      await Inventory.create(initialInventory);

      // Act
      const result = await removeFromInventory(productId, 20);

      // Assert
      const updatedInventory = await Inventory.findOne({ productId });
      expect(updatedInventory.quantity).toBe(30);
      expect(result.quantity).toBe(30);
    });

    it('should throw InventoryError if product is not found', async() => {
      // Arrange
      const productId = 999;

      // Act & Assert
      await expect(removeFromInventory(productId, 10)).rejects.toThrow(InventoryError);
      await expect(removeFromInventory(productId, 10)).rejects.toThrow('Product not found');
    });

    it('should throw InventoryError if not enough stock is available', async() => {
      // Arrange
      const productId = 101;
      const initialInventory = { productId, quantity: 10 };
      await Inventory.create(initialInventory);

      // Act & Assert
      await expect(removeFromInventory(productId, 20)).rejects.toThrow(InventoryError);
      await expect(removeFromInventory(productId, 20)).rejects.toThrow('Insufficient stock');
    });

    it('should throw DatabaseError if database query fails', async() => {
      // Arrange
      jest.spyOn(Inventory, 'findOne').mockRejectedValueOnce(new Error('DB Error'));
      const productId = 101;

      // Act & Assert
      await expect(removeFromInventory(productId, 10)).rejects.toThrow(DatabaseError);
    });
  });

});
