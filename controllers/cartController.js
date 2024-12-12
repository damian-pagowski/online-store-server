const { removeFromInventory } = require("./inventoryController");
const { getUser } = require("./userController");
const Cart = require("../models/cart");

const itemQuantityLimit = 10;

const getCart = async (username) => {
  const cart = await Cart.findOne({ username });
  return cart ? cart.items : {}; // map of productId -> quantity
};

const deleteCart = async (username) => {
  return Cart.deleteOne({ username });
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
    if (err.type !== "product_unavailable") {
      await removeFromInventory(productId, -quantity);
    }
    throw err;
  }
};

const ensureCartExists = async (username) => {
  const user = await getUser(username);
  if (!user) {
    const error = new Error("User not found");
    error.code = 404;
    throw error;
  }

  let cart = await Cart.findOne({ username });
  if (!cart) {
    cart = new Cart({ username, items: {} }); 
  }
  return cart;
};

const updateCartItems = (items, productId, quantity) => {
  const currentItems = { ...items };
  const currentQuantity = currentItems[productId] || 0;

  if (currentQuantity + quantity > itemQuantityLimit) {
    throw createCartError("Quantity limit exceeded");
  }
  if (currentQuantity + quantity < 0) {
    throw createCartError("Quantity of item in cart must be greater than 0");
  }

  if (currentQuantity + quantity === 0) {
    delete currentItems[productId];
  } else {
    currentItems[productId] = currentQuantity + quantity;
  }

  return currentItems;
};

const createCartError = (message) => {
  const error = new Error(message);
  error.type = "cart_error";
  error.code = 400;
  return error;
};

module.exports = { addItemToCart, getCart, deleteCart };