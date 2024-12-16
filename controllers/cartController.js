const { removeFromInventory } = require("./inventoryController");
const { getUser } = require("./userController");
const Cart = require("../models/cart");
const { NotFoundError, CartError, DatabaseError, InventoryRollbackError } = require('../utils/errors');

const itemQuantityLimit = 10;

const addItemToCartHandler = async (req, res) => {
  const { productId, quantity, operation } = req.body;
  const username = req.currentUser.username;
  if (!['add', 'remove'].includes(operation)) {
    throw new CartError(`Invalid operation. Use "add" or "remove".`);
  }
  const operationQuantity = operation === 'add' ? quantity : -quantity;
  const updatedCart = await addItemToCart(username, productId, operationQuantity);
  res.status(200).json(updatedCart);
};

const getCartHandler = async (req, res) => {
  const username = req.currentUser.username;
  const cart = await getCart(username);
  res.status(200).json(cart);
};

const deleteCartHandler = async (req, res) => {
  const username = req.currentUser.username;
  await deleteCart(username);
  res.status(200).json({ message: 'Cart cleared successfully' });
};

const getCart = async (username) => {
  try {
    const cart = await Cart.findOne({ username });
    return cart ? cart.items : {};
  } catch (error) {
    throw new DatabaseError(`Failed to get cart for user ${username}`, error);
  }
};

const deleteCart = async (username) => {
  try {
    return await Cart.deleteOne({ username });
  } catch (error) {
    throw new DatabaseError(`Failed to delete cart for user ${username}`, error);
  }
};

const addItemToCart = async (username, productId, quantity) => {
  const cart = await ensureCartExists(username);
  try {
    await removeFromInventory(productId, quantity);
    const updatedItems = updateCartItems(cart.items, productId, quantity);
    cart.items = updatedItems;
    await cart.save();
    return updatedItems;
  } catch (err) {
    try {
      if (err.type !== "product_unavailable") {
        await removeFromInventory(productId, -quantity);
      }
    } catch (rollbackError) {
      throw new InventoryRollbackError(`Failed to rollback inventory for product ${productId}`, rollbackError);
    }
    throw new DatabaseError(`Failed to add item to cart for user ${username}`, err);
  }
};

const ensureCartExists = async (username) => {
  try {
    const user = await getUser(username);
    if (!user) {
      throw new NotFoundError(`User ${username} not found`);
    }
    let cart = await Cart.findOne({ username });
    if (!cart) {
      cart = new Cart({ username, items: {} });
    }
    return cart;
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw new DatabaseError(`Failed to ensure cart for user ${username}`, error);
    }
    throw error;
  }
};

const updateCartItems = (items, productId, quantity) => {
  const currentItems = { ...items };
  const currentQuantity = currentItems[productId] || 0;
  if (currentQuantity + quantity > itemQuantityLimit) {
    throw new CartError(`Quantity limit exceeded for product ${productId}`);
  }
  if (currentQuantity + quantity < 0) {
    throw new CartError(`Cannot reduce product ${productId} to a negative quantity`);
  }
  if (currentQuantity + quantity === 0) {
    delete currentItems[productId];
  } else {
    currentItems[productId] = currentQuantity + quantity;
  }
  return currentItems;
};

module.exports = { 
  addItemToCartHandler, 
  getCartHandler, 
  deleteCartHandler 
};