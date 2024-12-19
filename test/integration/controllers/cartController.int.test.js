const request = require('supertest');
const app = require('../../../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Cart = require('../../../models/cart');
const Users = require('../../../models/user');
const Product = require('../../../models/product');
const Inventory = require('../../../models/inventory');

const { generateToken } = require('../../../utils/token');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Cart.deleteMany();
  await Users.deleteMany();
  await Product.deleteMany();
});

describe('🔹 Cart Controller Integration Tests', () => {

  let token;
  const username = 'testuser';
  const userPayload = { username, email: 'testuser@example.com', password: 'password123', role: 'registered_user' };

  beforeEach(async () => {
    // Create a user and generate a token for authentication
    await Users.create({ ...userPayload, password: 'hashedpassword' });
    token = generateToken(userPayload);
  });

  describe('🔹 POST /cart - Add Item to Cart', () => {

    it('should add an item to the cart successfully', async () => {
      // Arrange
      const product = await Product.create({ 
        productId: 1, 
        name: 'Test Product', 
        category: 'Test Category', 
        price: 100, 
        description: 'Test description', 
        image: 'test.jpg', 
        subcategory: 'test sub', 
        rating: 4.5 
      });
    
      // Add inventory for this product
      await Inventory.create({
        productId: 1,
        quantity: 10 // Set a sufficient quantity for the test
      });
    
      const payload = { productId: 1, quantity: 2, operation: 'add' };
    
      // Act
      const response = await request(app)
        .post('/cart')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
    
      // Assert
      expect(response.status).toBe(200);
      expect(response.body[product.productId]).toBe(payload.quantity);
    });

    it('should return an error for an invalid operation', async () => {
      const payload = { productId: 1, quantity: 2, operation: 'invalid' };

      const response = await request(app)
        .post('/cart')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('should fail when not authenticated', async () => {
      const payload = { productId: 1, quantity: 2, operation: 'add' };

      const response = await request(app)
        .post('/cart')
        .send(payload);

      expect(response.status).toBe(403);
    });
  });

  describe('🔹 GET /cart - Get Cart', () => {

    it('should retrieve the cart for an authenticated user', async () => {
      // Arrange
      const cart = await Cart.create({ username, items: { 1: 2, 2: 3 } });

      // Act
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cart.items);
    });

    it('should return an empty cart if no cart exists', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should fail when not authenticated', async () => {
      const response = await request(app)
        .get('/cart');

      expect(response.status).toBe(403);
    });
  });

  describe('🔹 DELETE /cart - Delete Cart', () => {

    it('should delete the cart for an authenticated user', async () => {
      // Arrange
      await Cart.create({ username, items: { 1: 2, 2: 3 } });

      // Act
      const response = await request(app)
        .delete('/cart')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);

      const cart = await Cart.findOne({ username });
      expect(cart).toBeNull();
    });

    it('should return 200 even if the cart does not exist', async () => {
      const response = await request(app)
        .delete('/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Cart cleared successfully');
    });

    it('should fail when not authenticated', async () => {
      const response = await request(app)
        .delete('/cart');

      expect(response.status).toBe(403);
    });
  });
});