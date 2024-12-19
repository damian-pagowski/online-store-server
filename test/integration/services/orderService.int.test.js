const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Order = require('../../../models/order');
const Cart = require('../../../models/cart');
const Product = require('../../../models/product');
const { checkout, getOrderHistory, getOrderById } = require('../../../services/orderService');
const { getCart, deleteCart } = require('../../../services/cartService');
const { getProductsByIds } = require('../../../services/productService');
const { NotFoundError, ValidationError, DatabaseError } = require('../../../utils/errors');

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
    await Order.deleteMany();
    await Cart.deleteMany();
    await Product.deleteMany();
});

describe('🔹 Order Service Integration Tests', () => {

    describe('🔹 checkout()', () => {
        it('should successfully checkout and create an order', async () => {
            // Arrange
            const username = 'testuser';
            const cartItems = { '1': 2, '2': 3 }; // productId: quantity
            const products = [
                { productId: 1, name: 'Product 1', price: 10, description: 'Description 1', rating: 4.5, image: 'image1.jpg', category: 'electronics', subcategory: 'laptops', },
                { productId: 2, name: 'Product 2', price: 20, description: 'Description 2', rating: 4, image: 'image2.jpg', category: 'electronics', subcategory: 'laptops', }
            ];

            await Cart.create({ username, items: cartItems });
            await Product.insertMany(products);

            // Act
            const response = await checkout(username);

            // Assert
            const order = await Order.findOne({ username });
            expect(order).toBeDefined();
            expect(order.items).toHaveLength(2);
            expect(order.totalPrice).toBe(80); // (2 * 10) + (3 * 20)
            expect(response.message).toBe('Order created successfully');
            expect(response.orderId.toString()).toBe(order._id.toString());
            const cart = await Cart.findOne({ username });
            expect(cart).toBeNull(); // Cart should be deleted after checkout
        });

        it('should throw a ValidationError if the cart is empty', async () => {
            // Arrange
            const username = 'testuser';
            // Act & Assert
            await expect(checkout(username)).rejects.toThrow(ValidationError);
        });

        it('should throw a NotFoundError if a product in the cart is not found', async () => {
            // Arrange
            const username = 'testuser';
            const cartItems = { '1': 2, '2': 3 }; // productId: quantity
            await Cart.create({ username, items: cartItems });

            // Only create 1 product, but cart has 2 products
            await Product.create({ productId: 1, name: 'Product 1', price: 10, description: 'Description 1', rating: 4.5, image: 'image1.jpg', category: 'electronics', subcategory: 'laptops', });

            // Act & Assert
            await expect(checkout(username)).rejects.toThrow(NotFoundError);
        });
    });

    describe('🔹 getOrderHistory()', () => {
        it('should return a list of orders for the user', async () => {
            // Arrange
            const username = 'testuser';
            const orders = [
                { username, items: [], totalPrice: 50, createdAt: new Date() },
                { username, items: [], totalPrice: 75, createdAt: new Date() }
            ];
            await Order.insertMany(orders);

            // Act
            const result = await getOrderHistory(username);

            // Assert
            expect(result).toHaveLength(2);
            const receivedPrices = result.map(order => order.totalPrice);
            expect(receivedPrices).toEqual(expect.arrayContaining([50, 75]));

        });

        it('should throw a NotFoundError if no orders are found', async () => {
            // Arrange
            const username = 'testuser';

            // Act & Assert
            await expect(getOrderHistory(username)).rejects.toThrow(NotFoundError);
        });

        it('should throw a DatabaseError if a database error occurs', async () => {
            // Arrange
            const username = 'testuser';

            // Simulate a database error
            jest.spyOn(Order, 'find').mockImplementationOnce(() => {
                throw new Error('DB error');
            });

            // Act & Assert
            await expect(getOrderHistory(username)).rejects.toThrow(DatabaseError);
        });
    });

    describe('🔹 getOrderById()', () => {
        it('should return the order by id for the user', async () => {
            // Arrange
            const username = 'testuser';
            const order = await Order.create({ username, items: [], totalPrice: 50, createdAt: new Date() });

            // Act
            const result = await getOrderById(order._id, username);

            // Assert
            expect(result).toBeDefined();
            expect(result._id.toString()).toBe(order._id.toString());
        });

        it('should throw a NotFoundError if the order is not found', async () => {
            // Arrange
            const username = 'testuser';
            const orderId = new mongoose.Types.ObjectId();
            // Act & Assert
            await expect(getOrderById(orderId, username)).rejects.toThrow(NotFoundError);
        });

        it('should throw a DatabaseError if a database error occurs', async () => {
            // Arrange
            const orderId = new mongoose.Types.ObjectId();
            const username = 'testuser';

            // Simulate a database error
            jest.spyOn(Order, 'findOne').mockImplementationOnce(() => {
                throw new Error('DB error');
            });

            // Act & Assert
            await expect(getOrderById(orderId, username)).rejects.toThrow(DatabaseError);
        });
    });
});