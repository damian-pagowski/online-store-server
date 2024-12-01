const { removeFromInventory } = require("./inventoryController");
const { getUser } = require("./userController");
const Cart = require("../models/cart");
const itemQuantityLimit = 10;

const getCart = async (username) => {
  const cart = await Cart.findOne({ username });
  return cart ? cart.items : {}; // Return the map of productId -> quantity
};

const deleteCart = (username) => Cart.deleteOne({ username });

const addItemToCart = async (username, productId, quantity) => {
  try {
    // Check if user exists
    const user = await getUser(username);
    if (!user) {
      const userNotFound = new Error("User not found");
      userNotFound.code = 404;
      throw userNotFound;
    }

    // Remove the item from inventory
    await removeFromInventory(productId, quantity);

    // Get or initialize the user's cart
    let cart = await Cart.findOne({ username });
    if (!cart) {
      cart = new Cart({ username, items: {} }); // Initialize empty cart
    }

    // Get current quantity for the product in the cart
    let i = { ...cart.items } ;
    const currentQuantity = Number( i[productId]) || 0;

    // Validate quantity limits
    if (currentQuantity + quantity > itemQuantityLimit) {
      throw new Error("Quantity limit 10 exceeded");
    }
    if (currentQuantity + quantity < 0) {
      throw new Error("Quantity of item in cart must be greater than 0");
    }

    // Update the cart
    if (currentQuantity + quantity === 0) {
      // If the new quantity is 0, remove the product from the cart
      delete i[productId];
    } else {
      // Otherwise, update the quantity
      i[productId] = currentQuantity + quantity;
    }

    // Save the updated cart
    cart.items = i
    await cart.save();
    return i;
  } catch (err) {
    // Roll back inventory changes on error, except for product_unavailable
    if (err.type !== "product_unavailable") {
      await removeFromInventory(productId, -1 * quantity);
    }
    throw err;
  }
};

module.exports = { addItemToCart, getCart, deleteCart };