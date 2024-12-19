const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../app'); // Assuming your app.js is in the root
const Product = require('../../../models/product');

let mongoServer;

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
    // Clear mocks and remove open handles like timers
    jest.clearAllMocks();
    await Product.deleteMany(); // Clear products from database
});

afterAll(async () => {
    await mongoose.connection.close(); // Close Mongoose connections properly
    await mongoServer.stop(); // Stop in-memory database
});

describe('🔹 Product Controller Integration Tests', () => {

    describe('🔹 GET /products', () => {

        it('should return a list of products matching the query params', async () => {
            // Arrange
            const products = [
                { productId: 1, name: 'Laptop Pro', category: 'electronics', subcategory: 'laptops', description: 'High-end laptop', price: 1000, image: 'laptop-pro.jpg', rating: 4.5 },
                { productId: 2, name: 'Laptop Air', category: 'electronics', subcategory: 'laptops', description: 'Lightweight laptop', price: 800, image: 'laptop-air.jpg', rating: 4.0 },
                { productId: 3, name: 'Phone Max', category: 'electronics', subcategory: 'phones', description: 'Latest smartphone', price: 1200, image: 'phone-max.jpg', rating: 4.8 }
            ];
            await Product.insertMany(products);

            // Act
            const response = await request(app)
                .get('/products')
                .query({ subcategory: 'laptops', category: 'electronics', search: 'Laptop' });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            const productNames = response.body.map(p => p.name);
            expect(productNames).toContain('Laptop Pro');
            expect(productNames).toContain('Laptop Air');
        });

        it('should return an empty list if no products match the query', async () => {
            // Arrange
            const products = [
                { productId: 1, name: 'Laptop Pro', category: 'electronics', subcategory: 'laptops', description: 'High-end laptop', price: 1000, image: 'laptop-pro.jpg', rating: 4.5 }
            ];
            await Product.insertMany(products);

            // Act
            const response = await request(app)
                .get('/products')
                .query({ subcategory: 'phones', category: 'electronics' });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should return a 500 error if the database query fails', async () => {
            // Arrange
            jest.spyOn(Product, 'find').mockRejectedValueOnce(new Error('Database Error'));

            // Act
            const response = await request(app)
                .get('/products')
                .query({ subcategory: 'laptops', category: 'electronics' });

            // Assert
            expect(response.status).toBe(500);
        });

    });

    describe('🔹 GET /products/:id', () => {

        it('should return a product by its ID', async () => {
            // Arrange
            const product = await Product.create({ 
                productId: 1, 
                name: 'Laptop Pro', 
                category: 'electronics', 
                subcategory: 'laptops', 
                description: 'High-end laptop', 
                price: 1000, 
                image: 'laptop-pro.jpg', 
                rating: 4.5 
            });

            // Act
            const response = await request(app)
                .get(`/products/${product.productId}`);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'Laptop Pro');
            expect(response.body).toHaveProperty('price', 1000);
        });

        it('should return a 404 if the product does not exist', async () => {
            // Act
            const response = await request(app)
                .get('/products/9999'); // Non-existent productId

            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', expect.stringContaining('not found'));
        });

        it('should return a 500 error if the database query fails', async () => {
            // Arrange
            jest.spyOn(Product, 'findOne').mockRejectedValueOnce(new Error('Database Error'));

            // Act
            const response = await request(app)
                .get('/products/1');

            // Assert
            expect(response.status).toBe(500);
        });

    });

});