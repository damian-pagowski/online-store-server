const { removeFromInventory } = require("./inventoryController");
const { getUser } = require("./userController");
const Cart = require("../models/cart");

const itemQuantityLimit = 10;

const getCart = async (username) => {
  const cart = await Cart.findOne({ username });
  return cart ? cart.items : {}; // Return the map of productId -> quantity
};

const deleteCart = async (username) => {
  return Cart.deleteOne({ username });
};

const addItemToCart = async (username, productId, quantity) => {
  const cart = await ensureCartExists(username);

  try {
    // Remove the item from inventory
    await removeFromInventory(productId, quantity);

    // Update the cart
    const updatedItems = updateCartItems(cart.items, productId, quantity);
    cart.items = updatedItems;
    await cart.save();

    return updatedItems;
  } catch (err) {
    // Roll back inventory changes on error, except for product_unavailable
    if (err.type !== "product_unavailable") {
      await removeFromInventory(productId, -quantity);
    }
    throw err;
  }
};

// Helper to ensure a user exists and retrieve their cart
const ensureCartExists = async (username) => {
  const user = await getUser(username);
  if (!user) {
    const error = new Error("User not found");
    error.code = 404;
    throw error;
  }

  let cart = await Cart.findOne({ username });
  if (!cart) {
    cart = new Cart({ username, items: {} }); // Initialize empty cart
  }
  return cart;
};

// Helper to update cart items
const updateCartItems = (items, productId, quantity) => {
  const currentItems = { ...items };
  const currentQuantity = currentItems[productId] || 0;

  // Validate quantity limits
  if (currentQuantity + quantity > itemQuantityLimit) {
    throw createCartError("Quantity limit exceeded");
  }
  if (currentQuantity + quantity < 0) {
    throw createCartError("Quantity of item in cart must be greater than 0");
  }

  // Update or remove item
  if (currentQuantity + quantity === 0) {
    delete currentItems[productId];
  } else {
    currentItems[productId] = currentQuantity + quantity;
  }

  return currentItems;
};

// Helper to create cart-related errors
const createCartError = (message) => {
  const error = new Error(message);
  error.type = "cart_error";
  error.code = 400;
  return error;
};

module.exports = { addItemToCart, getCart, deleteCart };