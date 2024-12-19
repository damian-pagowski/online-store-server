const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Category = require('../../../models/category');
const { getCategories } = require('../../../services/categoryService');
const { DatabaseError } = require('../../../utils/errors');

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
  await Category.deleteMany(); // Clear categories before each test
});

describe('🔹 Category Service Integration Tests', () => {
  
  describe('🔹 getCategories()', () => {
    
    it('should return an empty array if no categories exist', async () => {
      // Act
      const categories = await getCategories();

      // Assert
      expect(categories).toEqual([]);
    });

    it('should return a list of categories', async () => {
        // Arrange
        const categoriesData = [
          { name: 'Electronics', display: 'Electronics', subcategories: [] },
          { name: 'Books', display: 'Books', subcategories: [] }
        ];
        await Category.insertMany(categoriesData);
      
        // Act
        const result = await getCategories();
      
        // Assert
        expect(result).toHaveLength(2);
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Electronics', display: 'Electronics', subcategories: [] }),
            expect.objectContaining({ name: 'Books', display: 'Books', subcategories: [] })
          ])
        );
      });

    it('should throw a DatabaseError if the database query fails', async () => {
      // Arrange
      const originalFind = Category.find;
      Category.find = jest.fn().mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(getCategories()).rejects.toThrow(DatabaseError);

      // Cleanup
      Category.find = originalFind; 
    });

  });
});