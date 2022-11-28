const { removeFromInventory } = require("./inventoryController");
const { getUser } = require("./userController");
const Cart = require("../models/cart");
const itemQuantityLimit = 10;

const getCartItem = (username, productId) => Cart.find({ username, productId });

const getCart = (username) => Cart.find({ username });

const deleteCart = (username) => Cart.deleteMany({ username });

const addItemToCart = async (username, productId, quantity) => {
  await removeFromInventory(productId);
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

  if (itemEntry) {
    itemEntry.quantity += quantity;
    await itemEntry.save();
  } else {
    const newItem = new Cart({ username, productId, quantity });
    await newItem.save();
  }

  return getCartItem(username, productId);
};

module.exports = { addItemToCart, getCart, deleteCart };
