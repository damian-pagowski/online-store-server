const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Cart = require('../../../models/cart');
const { addItemToCart, getCart, deleteCart, ensureCartExists } = require('../../../services/cartService');
const { removeFromInventory } = require('../../../services/inventoryService');
const { CartError, DatabaseError } = require('../../../utils/errors');

jest.mock('../../../services/inventoryService');

let mongoServer;

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
  await Cart.deleteMany();
  jest.clearAllMocks();
});

describe('🔹 Cart Service Integration Tests', () => {

  describe('🔹 addItemToCart()', () => {
    it('should add item to cart successfully', async() => {
      // Arrange
      const username = 'testuser';
      const productId = 1;
      const quantity = 2;
      await ensureCartExists(username);
      removeFromInventory.mockResolvedValueOnce(true);

      // Act
      const result = await addItemToCart(username, productId, quantity);

      // Assert
      const cart = await Cart.findOne({ username });
      expect(result[productId]).toEqual(quantity);
      expect(cart.items[productId]).toEqual(quantity);
      expect(removeFromInventory).toHaveBeenCalledWith(productId, quantity);
    });

    it('should throw CartError if quantity exceeds limit', async() => {
      // Arrange
      const username = 'testuser';
      const productId = 1;
      const quantity = 11;
      await ensureCartExists(username);

      // Act & Assert
      await expect(addItemToCart(username, productId, quantity))
        .rejects.toThrow(CartError);
    });

    it('should rollback inventory if an error occurs after inventory removal', async() => {
      // Arrange
      const username = 'testuser';
      const productId = 1;
      const quantity = 2;
      await ensureCartExists(username);
      removeFromInventory.mockResolvedValueOnce(true);
      Cart.prototype.save = jest.fn().mockRejectedValueOnce(new Error('DB Save Error'));

      // Act & Assert
      await expect(addItemToCart(username, productId, quantity))
        .rejects.toThrow(DatabaseError);
      expect(removeFromInventory).toHaveBeenCalledWith(productId, quantity);
      expect(removeFromInventory).toHaveBeenCalledWith(productId, -quantity);
    });
  });

  describe('🔹 getCart()', () => {
    it('should return an empty cart if cart does not exist', async() => {
      // Arrange
      const username = 'nonexistentuser';

      // Act
      const result = await getCart(username);

      // Assert
      expect(result).toEqual({});
    });

    it('should return items in the cart', async() => {
      // Arrange
      const username = 'testuser';
      const items = { 1: 2, 2: 3 };
      await Cart.create({ username, items });

      // Act
      const result = await getCart(username);

      // Assert
      expect(result).toEqual(items);
    });

    it('should throw DatabaseError if there is a DB query failure', async() => {
      // Arrange
      jest.spyOn(Cart, 'findOne').mockRejectedValueOnce(new Error('DB Query Error'));

      // Act & Assert
      await expect(getCart('testuser')).rejects.toThrow(DatabaseError);
    });
  });

  describe('🔹 deleteCart()', () => {
    it('should delete a cart successfully', async() => {
      // Arrange
      const username = 'testuser';
      await Cart.create({ username, items: { 1: 2, 2: 3 } });

      // Act
      await deleteCart(username);

      // Assert
      const cart = await Cart.findOne({ username });
      expect(cart).toBeNull();
    });

    it('should throw DatabaseError if there is a DB deletion failure', async() => {
      // Arrange
      jest.spyOn(Cart, 'deleteOne').mockRejectedValueOnce(new Error('DB Deletion Error'));

      // Act & Assert
      await expect(deleteCart('testuser')).rejects.toThrow(DatabaseError);
    });
  });

  describe('🔹 ensureCartExists()', () => {
    it('should create a cart if it does not exist', async() => {
      // Arrange
      const username = 'newuser';

      // Act
      await ensureCartExists(username);

      // Assert
      const cart = await Cart.findOne({ username });
      expect(cart).toBeDefined();
      expect(cart.username).toEqual(username);
      expect(cart.items).toEqual({});
    });

    it('should return an existing cart if it exists', async() => {
      // Arrange
      const username = 'existinguser';
      await Cart.create({ username, items: { 1: 2 } });

      // Act
      const cart = await ensureCartExists(username);

      // Assert
      expect(cart).toBeDefined();
      expect(cart.username).toEqual(username);
      expect(cart.items).toEqual({ 1: 2 });
    });

    it('should throw DatabaseError if a DB query error occurs', async() => {
      // Arrange
      jest.spyOn(Cart, 'findOne').mockRejectedValueOnce(new Error('DB Error'));

      // Act & Assert
      await expect(ensureCartExists('testuser')).rejects.toThrow(DatabaseError);
    });
  });

});
