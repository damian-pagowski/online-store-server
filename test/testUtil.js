/* istanbul ignore file */
const request = require('supertest');

const { createUser, getUser } = require('../controllers/userController');
const { deleteCart } = require('../controllers/cartController');

const Inventory = require('../models/inventory');
const Cart = require('../models/cart');
const Product = require('../models/product');
const Category = require('../models/category');

const products = require('./fixtures/products');
const categories = require('./fixtures/categories');
const inventories = require('./fixtures/inventories');
const users = require('./fixtures/users');

const { defaultUser, userToDelete } = users;

const generateUniqueUser = () => {
  const now = Date.now();
  return {
    username: `user${now}`,
    email: `user${now}@example.com`,
    password: 'password',
  };
};

const makeAuthenticatedRequest = (endpoint, method, token, data = {}) => {
  const BASE_URL = `${process.env.SERVER_URL || 'http://localhost'}:${process.env.SERVER_PORT || 3030}`;
  return request(BASE_URL)
    [method](endpoint)
    .set('Authorization', `Bearer ${token}`)
    .send(data);
};

const createUserIfNotExist = async(user) => {
  const foundUser = await getUser(user.username);
  if (!foundUser) {
    await createUser(user.username, user.email, user.password);
  }
};

const setInventory = async(productId, quantity) => {
  await Inventory.findOneAndDelete({ productId });
  const newInventory = new Inventory({
    productId,
    quantity,
  });
  await newInventory.save();
};

const clearCart = async(username) => {
  return deleteCart(username);
};

const setCart = async(productId, username, quantity) => {
  const newItem = new Cart({ username, productId, quantity });
  return newItem.save();
};

const clearDatabase = async() => {
  await Product.deleteMany();
  await Category.deleteMany();
  await Inventory.deleteMany();
  await Cart.deleteMany();
};

const seedDatabase = async() => {
  await Product.insertMany(products);
  await Category.insertMany(categories);
  await Inventory.insertMany(inventories);
};

const mockRequest = (data = {}) => ({
  body: data.body || {},
  params: data.params || {},
  query: data.query || {},
  currentUser: data.currentUser || {},
  headers: data.headers || {},
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
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
  mockRequest,
  mockResponse,
};
