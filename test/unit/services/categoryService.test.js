const { getCategories } = require('../../../services/categoryService');
const Category = require('../../../models/category');
const { DatabaseError } = require('../../../utils/errors');

jest.mock('../../../models/category');

describe('Category Service', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return categories successfully', async() => {
      // Arrange
      const mockCategories = [
        { name: 'Electronics' },
        { name: 'Books' },
        { name: 'Clothing' },
      ];
      Category.find.mockResolvedValueOnce(mockCategories);

      // Act
      const result = await getCategories();

      // Assert
      expect(result).toEqual(mockCategories);
      expect(Category.find).toHaveBeenCalledWith({}, { _id: 0, __v: 0 });
    });

    it('should throw DatabaseError if database query fails', async() => {
      // Arrange
      Category.find.mockRejectedValueOnce(new Error('DB error'));

      // Act & Assert
      await expect(getCategories()).rejects.toThrow(DatabaseError);
      expect(Category.find).toHaveBeenCalledWith({}, { _id: 0, __v: 0 });
    });
  });
});
