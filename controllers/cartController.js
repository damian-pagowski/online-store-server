const { removeFromInventory } = require("./inventoryController");
const { getUser } = require("./userController");
const Cart = require("../models/cart");
const itemQuantityLimit = 10;

const getCartItem = (username, productId) =>
  Cart.findOne({ username, productId });

const getCart = (username) => Cart.find({ username });

const deleteCart = (username) => Cart.deleteMany({ username });

const addItemToCart = async (username, productId, quantity) => {
  try {
    await removeFromInventory(productId, quantity);
    const user = await getUser(username);
    if (!user) {
      const userNotFound = new Error("user not found");
      userNotFound.code = 404;
    }
    const itemEntry = await getCartItem(username, productId);

    if (itemEntry && itemEntry.quantity + quantity > itemQuantityLimit) {
      const err = new Error();
      err.message = "Quantity limit 10 exceeded";
      throw err;
    }
    if (itemEntry && itemEntry.quantity + quantity < 0) {
      const err = new Error();
      err.message = "Quantity of item in cart must be greater than 0";
      throw err;
    }
    if (itemEntry) {
      itemEntry.quantity += quantity;
      await itemEntry.save();
    } else {
      const newItem = new Cart({ username, productId, quantity });
      await newItem.save();
    }
  } catch (err) {
    if (err.type !== "product_unavailable") {
      await removeFromInventory(productId, -1 * quantity);
    }
    throw err;
  }
  return getCartItem(username, productId);
};

module.exports = { addItemToCart, getCart, deleteCart };
