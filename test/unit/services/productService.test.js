const { searchProduct, getProduct, getProductsByIds } = require('../../../services/productService');
const Products = require('../../../models/product');
const { NotFoundError, DatabaseError } = require('../../../utils/errors');

jest.mock('../../../models/product');

describe('Product Service', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchProduct', () => {
    it('should return products successfully', async() => {
      const mockProducts = [{ productId: 1, name: 'Product 1' }, { productId: 2, name: 'Product 2' }];
      const subcategory = 'laptops';
      const category = 'electronics';
      const search = 'Product';

      // Arrange
      Products.find.mockResolvedValueOnce(mockProducts);

      // Act
      const result = await searchProduct(subcategory, category, search);

      // Assert
      expect(result).toEqual(mockProducts);
      expect(Products.find).toHaveBeenCalledWith(
        { category: category, subcategory: subcategory, name: { $regex: new RegExp(search, 'i') } },
        { _id: 0, __v: 0 },
      );
    });

    it('should throw DatabaseError if database query fails', async() => {
      const subcategory = 'laptops';
      const category = 'electronics';
      const search = 'Product';

      // Arrange
      Products.find.mockRejectedValueOnce(new Error('DB error'));

      // Act & Assert
      await expect(searchProduct(subcategory, category, search))
        .rejects.toThrow(DatabaseError);
    });
  });

  describe('getProduct', () => {
    it('should return product successfully', async() => {
      const productId = 1;
      const mockProduct = { productId, name: 'Product 1' };

      // Arrange
      Products.findOne.mockResolvedValueOnce(mockProduct);

      // Act
      const result = await getProduct(productId);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(Products.findOne).toHaveBeenCalledWith({ productId }, { _id: 0, __v: 0 });
    });

    it('should throw NotFoundError if product is not found', async() => {
      const productId = 1;

      // Arrange
      Products.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(getProduct(productId))
        .rejects.toThrow(NotFoundError);

      expect(Products.findOne).toHaveBeenCalledWith({ productId }, { _id: 0, __v: 0 });
    });

    it('should throw DatabaseError if database query fails', async() => {
      const productId = 1;

      // Arrange
      Products.findOne.mockRejectedValueOnce(new Error('DB error'));

      // Act & Assert
      await expect(getProduct(productId))
        .rejects.toThrow(DatabaseError);
    });
  });

  describe('getProductsByIds', () => {
    it('should return products successfully', async() => {
      const productIds = [1, 2, 3];
      const mockProducts = [
        { productId: 1, name: 'Product 1' },
        { productId: 2, name: 'Product 2' },
        { productId: 3, name: 'Product 3' },
      ];

      // Arrange
      Products.find.mockResolvedValueOnce(mockProducts);

      // Act
      const result = await getProductsByIds(productIds);

      // Assert
      expect(result).toEqual(mockProducts);
      expect(Products.find).toHaveBeenCalledWith({ productId: { $in: productIds } });
    });

    it('should throw NotFoundError if no products are found', async() => {
      const productIds = [1, 2, 3];

      // Arrange
      Products.find.mockResolvedValueOnce([]);

      // Act & Assert
      await expect(getProductsByIds(productIds))
        .rejects.toThrow(NotFoundError);

      expect(Products.find).toHaveBeenCalledWith({ productId: { $in: productIds } });
    });

    it('should throw DatabaseError if database query fails', async() => {
      const productIds = [1, 2, 3];

      // Arrange
      Products.find.mockRejectedValueOnce(new Error('DB error'));

      // Act & Assert
      await expect(getProductsByIds(productIds))
        .rejects.toThrow(DatabaseError);
    });
  });
});
