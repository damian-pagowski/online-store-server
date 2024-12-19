const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../app');
const Inventory = require('../../../models/inventory');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Inventory.deleteMany();
});

describe('🔹 Inventory Controller Integration Tests', () => {

  describe('🔹 GET /inventory/:productId', () => {

    it('should return inventory for a valid productId', async () => {
      // Arrange
      const productId = 1;
      const inventoryData = { productId, quantity: 50 };
      await Inventory.create(inventoryData);

      // Act
      const response = await request(app)
        .get(`/inventory/${productId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('productId', productId);
      expect(response.body).toHaveProperty('quantity', inventoryData.quantity);
    });

    it('should return 404 if inventory for productId does not exist', async () => {
      // Arrange
      const productId = 999;

      // Act
      const response = await request(app)
        .get(`/inventory/${productId}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Product not found');
    });

    it('should return 400 if productId is not a valid number', async () => {
      // Arrange
      const productId = 'invalid_id';

      // Act
      const response = await request(app)
        .get(`/inventory/${productId}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid Product ID');
    });

    it('should handle unexpected server errors gracefully', async () => {
      // Arrange
      const productId = 1;
      jest.spyOn(Inventory, 'findOne').mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      // Act
      const response = await request(app)
        .get(`/inventory/${productId}`);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });

  });

});