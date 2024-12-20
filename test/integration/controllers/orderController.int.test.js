const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../app');
const Users = require('../../../models/user');
const Cart = require('../../../models/cart');
const Order = require('../../../models/order');
const Product = require('../../../models/product');
const Inventory = require('../../../models/inventory');
const { generateToken } = require('../../../utils/token');

let mongoServer;
let token;

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
  await Users.deleteMany();
  await Cart.deleteMany();
  await Order.deleteMany();
  await Product.deleteMany();
  await Inventory.deleteMany();

  const user = await Users.create({
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'hashedpassword',
    role: 'registered_user',
  });

  token = generateToken(user);
});

describe('🔹 Order Controller Integration Tests', () => {

  describe('🔹 POST /orders/checkout', () => {
    it('should create an order successfully and clear the cart', async() => {
      // Arrange
      await Product.create({
        productId: 1,
        name: 'Test Product',
        category: 'Test Category',
        price: 100,
        description: 'Test description',
        image: 'test.jpg',
        subcategory: 'test sub',
        rating: 4.5,
      });

      await Inventory.create({
        productId: 1,
        quantity: 10,
      });

      const cartItems = { 1: 2 };
      await Cart.create({ username: 'testuser', items: cartItems });

      // Act
      const response = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send();

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Order created successfully');
      expect(response.body).toHaveProperty('orderId');

      const order = await Order.findOne({ username: 'testuser' });
      expect(order).not.toBeNull();
      expect(order.totalPrice).toBe(200); // 2 items at price 100 each = 200

      const cart = await Cart.findOne({ username: 'testuser' });
      expect(cart).toBeNull(); // Cart should be cleared after checkout
    });

    it('should return 400 if cart is empty', async() => {
      // Act
      const response = await request(app)
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send();

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Cannot checkout with an empty cart');
    });
  });

  describe('🔹 GET /orders', () => {
    it('should return the order history for a user', async() => {
      // Arrange
      const orders = [
        {
          username: 'testuser',
          items: [{ productId: 1, name: 'Test Product', quantity: 2, price: 100 }],
          totalPrice: 200,
          createdAt: new Date(),
        },
        {
          username: 'testuser',
          items: [{ productId: 2, name: 'Another Product', quantity: 1, price: 50 }],
          totalPrice: 50,
          createdAt: new Date(),
        },
      ];

      await Order.insertMany(orders);

      // Act
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.orders).toHaveLength(2);


      const expectedOrders = [
        expect.objectContaining({ totalPrice: 50 }),
        expect.objectContaining({ totalPrice: 200 }),
      ];

      expect(response.body.orders).toEqual(expect.arrayContaining(expectedOrders));
    });

    it('should return 404 if no orders exist for the user', async() => {
      // Act
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('🔹 GET /orders/:id', () => {
    it('should return a single order by ID', async() => {
      // Arrange
      const order = await Order.create({
        username: 'testuser',
        items: [{ productId: 1, name: 'Test Product', quantity: 2, price: 100 }],
        totalPrice: 200,
        createdAt: new Date(),
      });

      // Act
      const response = await request(app)
        .get(`/orders/${order._id}`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.order).not.toBeNull();
      expect(response.body.order.totalPrice).toBe(200);
    });

    it('should return 404 if order does not exist', async() => {
      // Arrange
      const fakeOrderId = new mongoose.Types.ObjectId();

      // Act
      const response = await request(app)
        .get(`/orders/${fakeOrderId}`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain(`Order with identifier "${fakeOrderId}" not found`);
    });
  });

});
