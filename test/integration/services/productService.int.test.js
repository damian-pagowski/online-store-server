const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../../../models/product');
const { searchProduct, getProduct, getProductsByIds } = require('../../../services/productService');
const { NotFoundError } = require('../../../utils/errors');

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
    await Product.deleteMany(); // Clear products before each test
});

describe('Product Service Integration Tests', () => {

    describe('🔹 searchProduct()', () => {
        it('should return products matching the search query', async () => {
            // Arrange
            const products = [
                {
                    productId: 1,
                    name: 'Laptop Pro',
                    category: 'electronics',
                    subcategory: 'laptops',
                    price: 1200,
                    rating: 4.5,
                    description: 'High-end laptop for professionals',
                    image: 'laptop-pro.jpg'
                },
                {
                    productId: 2,
                    name: 'Laptop Air',
                    category: 'electronics',
                    subcategory: 'laptops',
                    price: 1000,
                    rating: 4.3,
                    description: 'Lightweight and powerful laptop',
                    image: 'laptop-air.jpg'
                },
                {
                    productId: 3,
                    name: 'Phone Max',
                    category: 'electronics',
                    subcategory: 'phones',
                    price: 900,
                    rating: 4.7,
                    description: 'Flagship smartphone with great performance',
                    image: 'phone-max.jpg'
                }
            ];
            await Product.insertMany(products);

            // Act
            const result = await searchProduct('laptops', 'electronics', 'Laptop');

            // Assert
            expect(result).toHaveLength(2);
            expect(result.map(p => p.name)).toContain('Laptop Pro');
            expect(result.map(p => p.name)).toContain('Laptop Air');
        });

        it('should return an empty array if no products match the query', async () => {
            // Arrange
            await Product.insertMany([
                {
                    productId: 3,
                    name: 'Phone Max',
                    category: 'electronics',
                    subcategory: 'phones',
                    price: 900,
                    rating: 4.7,
                    description: 'Flagship smartphone with great performance',
                    image: 'phone-max.jpg'
                }
            ]);

            // Act
            const result = await searchProduct('laptops', 'electronics', 'Laptop');

            // Assert
            expect(result).toHaveLength(0);
        });

        it('should return all products when no query is provided', async () => {
            // Arrange
            const products = [
                {
                    productId: 2,
                    name: 'Laptop Air',
                    category: 'electronics',
                    subcategory: 'laptops',
                    price: 1000,
                    rating: 4.3,
                    description: 'Lightweight and powerful laptop',
                    image: 'laptop-air.jpg'
                },
                {
                    productId: 3,
                    name: 'Phone Max',
                    category: 'electronics',
                    subcategory: 'phones',
                    price: 900,
                    rating: 4.7,
                    description: 'Flagship smartphone with great performance',
                    image: 'phone-max.jpg'
                }
            ];
            await Product.insertMany(products);

            // Act
            const result = await searchProduct();

            // Assert
            expect(result).toHaveLength(2);
        });
    });

    describe('🔹 getProduct()', () => {
        it('should return a product by its productId', async () => {
            // Arrange
            const product =
            {
                productId: 1,
                name: 'Laptop Pro',
                category: 'electronics',
                subcategory: 'laptops',
                price: 1000,
                rating: 4.3,
                description: 'Lightweight and powerful laptop',
                image: 'laptop-air.jpg'
            };

            await Product.create(product);

            // Act
            const result = await getProduct(1);

            // Assert
            expect(result).toBeDefined();
            expect(result.name).toBe('Laptop Pro');
        });

        it('should throw NotFoundError if the product does not exist', async () => {
            // Act & Assert
            await expect(getProduct(999)).rejects.toThrow('Product with ID 999 not found');
        });
    });

    describe('🔹 getProductsByIds()', () => {
        it('should return multiple products by their IDs', async () => {
            // Arrange
            const products = [
                {
                    productId: 1, name: 'Laptop Pro', category: 'electronics', subcategory: 'laptops',
                    price: 1000,
                    rating: 4.3,
                    description: 'Lightweight and powerful laptop',
                    image: 'laptop-air.jpg'
                },
                {
                    productId: 2, name: 'Phone Max', category: 'electronics', subcategory: 'phones',
                    price: 1000,
                    rating: 4.3,
                    description: 'Lightweight and powerful laptop',
                    image: 'laptop-air.jpg'
                },
                {
                    productId: 3, name: 'Tablet Mini', category: 'electronics', subcategory: 'tablets',
                    price: 1000,
                    rating: 4.3,
                    description: 'Lightweight and powerful laptop',
                    image: 'laptop-air.jpg'
                }
            ];
            await Product.insertMany(products);

            // Act
            const result = await getProductsByIds([1, 3]);

            // Assert
            expect(result).toHaveLength(2);
            expect(result.map(p => p.name)).toContain('Laptop Pro');
            expect(result.map(p => p.name)).toContain('Tablet Mini');
        });

        it('should throw NotFoundError if no products are found for the given IDs', async () => {
            // Arrange
            const products = [
                { productId: 1, name: 'Laptop Pro', category: 'electronics', subcategory: 'laptops',
                    price: 1000,
                    rating: 4.3,
                    description: 'Lightweight and powerful laptop',
                    image: 'laptop-air.jpg'
                 },
            ];
            await Product.insertMany(products);

            // Act & Assert
            await expect(getProductsByIds([999, 888])).rejects.toThrow('Products with identifier "999, 888" not found');
        });

        it('should throw NotFoundError if productIds array is empty', async () => {
            // Act & Assert
            await expect(getProductsByIds([])).rejects.toThrow(NotFoundError);
          });
    });

});