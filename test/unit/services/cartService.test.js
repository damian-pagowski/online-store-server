const { addItemToCart, getCart, deleteCart, ensureCartExists } = require('../../../services/cartService');
const Cart = require('../../../models/cart');
const { removeFromInventory } = require('../../../services/inventoryService');
const { CartError, DatabaseError } = require('../../../utils/errors');

jest.mock('../../../models/cart');
jest.mock('../../../services/inventoryService');

describe('Cart Service', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItemToCart', () => {
    it('should add item to cart successfully', async() => {
      // Arrange
      const username = 'testuser';
      const productId = 1;
      const quantity = 2;
      const cartMock = { items: {}, save: jest.fn().mockResolvedValueOnce(true) };
      const updatedItems = { [productId]: quantity };

      Cart.findOne.mockResolvedValueOnce(cartMock);
      removeFromInventory.mockResolvedValueOnce(true);

      // Act
      const result = await addItemToCart(username, productId, quantity);

      // Assert
      expect(result).toEqual(updatedItems);
      expect(removeFromInventory).toHaveBeenCalledWith(productId, quantity);
      expect(cartMock.save).toHaveBeenCalled();
    });

    it('should rollback inventory if adding item fails', async() => {
      const username = 'testuser';
      const productId = 1;
      const quantity = 2;
      const cartMock = { items: {} };

      Cart.findOne.mockResolvedValueOnce(cartMock);
      Cart.prototype.save = jest.fn().mockRejectedValueOnce(new Error('DB save failed'));
      removeFromInventory.mockResolvedValueOnce(true);
      removeFromInventory.mockResolvedValueOnce(true); // Rollback is also mocked

      await expect(addItemToCart(username, productId, quantity))
        .rejects.toThrow(DatabaseError);

      expect(removeFromInventory).toHaveBeenCalledWith(productId, quantity);
      expect(removeFromInventory).toHaveBeenCalledWith(productId, -quantity);
    });

    it('should throw a CartError if quantity exceeds the limit', async() => {
      const username = 'testuser';
      const productId = 1;
      const quantity = 20; // Over itemQuantityLimit
      const cartMock = { items: {}, save: jest.fn().mockResolvedValueOnce(true) };

      Cart.findOne.mockResolvedValueOnce(cartMock);

      await expect(addItemToCart(username, productId, quantity))
        .rejects.toThrow(CartError);
    });
  });

  describe('getCart', () => {
    it('should return cart items successfully', async() => {
      const username = 'testuser';
      const mockCart = { items: { 1: 2, 2: 3 } };

      Cart.findOne.mockResolvedValueOnce(mockCart);

      const result = await getCart(username);

      expect(result).toEqual(mockCart.items);
      expect(Cart.findOne).toHaveBeenCalledWith({ username });
    });

    it('should return an empty object if cart does not exist', async() => {
      const username = 'testuser';

      Cart.findOne.mockResolvedValueOnce(null);

      const result = await getCart(username);

      expect(result).toEqual({});
    });

    it('should throw a DatabaseError if database operation fails', async() => {
      const username = 'testuser';
      Cart.findOne.mockRejectedValueOnce(new Error('DB error'));

      await expect(getCart(username))
        .rejects.toThrow(DatabaseError);
    });
  });

  describe('deleteCart', () => {
    it('should delete the cart successfully', async() => {
      const username = 'testuser';

      Cart.deleteOne.mockResolvedValueOnce({ acknowledged: true, deletedCount: 1 });

      const result = await deleteCart(username);

      expect(result).toEqual({ acknowledged: true, deletedCount: 1 });
      expect(Cart.deleteOne).toHaveBeenCalledWith({ username });
    });

    it('should throw a DatabaseError if deletion fails', async() => {
      const username = 'testuser';

      Cart.deleteOne.mockRejectedValueOnce(new Error('DB error'));

      await expect(deleteCart(username))
        .rejects.toThrow(DatabaseError);
    });
  });

  describe('ensureCartExists', () => {
    it('should return an existing cart', async() => {
      const username = 'testuser';
      const cartMock = { items: {} };

      Cart.findOne.mockResolvedValueOnce(cartMock);

      const result = await ensureCartExists(username);

      expect(result).toEqual(cartMock);
      expect(Cart.findOne).toHaveBeenCalledWith({ username });
    });

    it('should create a new cart if one does not exist', async() => {
      const username = 'testuser';
      const cartMock = { username, items: {} };

      Cart.findOne.mockResolvedValueOnce(null);
      Cart.create.mockResolvedValueOnce(cartMock);

      const result = await ensureCartExists(username);

      expect(result).toEqual(cartMock);
      expect(Cart.findOne).toHaveBeenCalledWith({ username });
      expect(Cart.create).toHaveBeenCalledWith({ username, items: {} });
    });

    it('should throw a DatabaseError if database operation fails', async() => {
      const username = 'testuser';

      Cart.findOne.mockRejectedValueOnce(new Error('DB error'));

      await expect(ensureCartExists(username))
        .rejects.toThrow(DatabaseError);
    });
  });

});
