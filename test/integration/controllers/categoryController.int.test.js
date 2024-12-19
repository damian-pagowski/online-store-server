const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../app');
const Category = require('../../../models/category');

let mongoServer;

beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Category.deleteMany(); // Clear categories before each test
});

describe('🔹 Category Controller Integration Tests', () => {

    describe('🔹 GET /categories', () => {
        it('should return a list of categories', async () => {
            // Arrange
            const categories = [
                { name: 'Electronics', display: 'Electronics', subcategories: [] },
                { name: 'Books', display: 'Books', subcategories: [] }
            ];
            await Category.insertMany(categories);

            // Act
            const response = await request(app).get('/categories');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);

            const expectedCategories = [
                expect.objectContaining({ name: 'Electronics', display: 'Electronics', subcategories: [] }),
                expect.objectContaining({ name: 'Books', display: 'Books', subcategories: [] })
            ];

            expect(response.body).toEqual(expect.arrayContaining(expectedCategories));
        });

        it('should return an empty array if no categories exist', async () => {
            // Act
            const response = await request(app).get('/categories');

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            jest.spyOn(Category, 'find').mockImplementationOnce(() => {
                throw new Error('Database error');
            });

            // Act
            const response = await request(app).get('/categories');

            // Assert
            expect(response.status).toBe(500);
        });
    });
});