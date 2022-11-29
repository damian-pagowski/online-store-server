const { createUser, getUser } = require("../controllers/userController");
const Inventory = require("../models/inventory");
const Cart = require("../models/cart");
const { deleteCart } = require("../controllers/cartController");

const defaultUser = {
  username: "test2",
  email: "test2@test.com",
  password: "secret",
};

const userToDelete = {
  username: "test3",
  email: "test3@test.com",
  password: "secret",
};

const createUserIfNotExist = async (user) => {
  const foundUser = await getUser(user.username);
  if (!foundUser) {
    await createUser(user.username, user.email, user.password);
  }
};

const setInventory = async (productId, quantity) => {
  await Inventory.findOneAndDelete({ productId });
  const newInventory = new Inventory({
    productId,
    quantity,
  });
  await newInventory.save();
};

const clearCart = async (username) => {
  return deleteCart(username);
};

const setCart = (productId, username, quantity) => {
  const newItem = new Cart({ username, productId, quantity });
  return newItem.save();
};

module.exports = {
  createUserIfNotExist,
  userToDelete,
  defaultUser,
  setInventory,
  clearCart,
  setCart,
};
