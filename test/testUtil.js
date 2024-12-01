const request = require("supertest"); // Import supertest for API requests

const { createUser, getUser } = require("../controllers/userController");
const { deleteCart } = require("../controllers/cartController");

const Inventory = require("../models/inventory");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Category = require("../models/category");

const products = require("./fixtures/products");
const categories = require("./fixtures/categories");
const inventories = require("./fixtures/inventories");
const users = require("./fixtures/users"); // Import user fixtures

// Extract default users from the fixtures
const { defaultUser, userToDelete } = users;

// Generate unique user data
const generateUniqueUser = () => {
  const now = Date.now();
  return {
    username: `user${now}`,
    email: `user${now}@example.com`,
    password: "password",
  };
};

// Make an authenticated request
const makeAuthenticatedRequest = (endpoint, method, user, data = {}) => {
  const BASE_URL = `${process.env.SERVER_URL || "http://localhost"}:${process.env.SERVER_PORT || 3030}`;
  return request(BASE_URL)
    [method](endpoint)
    .auth(user.username, user.password)
    .send(data);
};

// Create a user if it doesn't exist
const createUserIfNotExist = async (user) => {
  const foundUser = await getUser(user.username);
  if (!foundUser) {
    await createUser(user.username, user.email, user.password);
  }
};

// Set inventory for a product
const setInventory = async (productId, quantity) => {
  await Inventory.findOneAndDelete({ productId });
  const newInventory = new Inventory({
    productId,
    quantity,
  });
  await newInventory.save();
};

// Clear a user's cart
const clearCart = async (username) => {
  return deleteCart(username);
};

// Set an item in a user's cart
const setCart = async (productId, username, quantity) => {
  const newItem = new Cart({ username, productId, quantity });
  return newItem.save();
};

// Clear all collections (products, categories, inventory, and carts)
const clearDatabase = async () => {
  await Product.deleteMany();
  await Category.deleteMany();
  await Inventory.deleteMany();
  await Cart.deleteMany();
};

// Seed the database with fixtures
const seedDatabase = async () => {
  await Product.insertMany(products);
  await Category.insertMany(categories);
  await Inventory.insertMany(inventories);
};

module.exports = {
  createUserIfNotExist,
  defaultUser,
  userToDelete,
  setInventory,
  clearCart,
  setCart,
  generateUniqueUser,
  makeAuthenticatedRequest,
  clearDatabase,
  seedDatabase,
};