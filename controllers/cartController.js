const { addItemToCart, getCart, deleteCart } = require('../services/cartService');
const { CartError } = require('../utils/errors');

const addItemToCartHandler = async(req, res, next) => {
  try {
    const { productId, quantity, operation } = req.body;
    const username = req.currentUser.username;

    if (!['add', 'remove'].includes(operation)) {
      throw new CartError('Invalid operation. Use "add" or "remove".');
    }

    const operationQuantity = operation === 'add' ? quantity : -quantity;
    const updatedCart = await addItemToCart(username, productId, operationQuantity);
    res.status(200).json(updatedCart);
  } catch (error) {
    next(error);
  }
};

const getCartHandler = async(req, res, next) => {
  try {
    const username = req.currentUser.username;
    const cart = await getCart(username);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

const deleteCartHandler = async(req, res, next) => {
  try {
    const username = req.currentUser.username;
    await deleteCart(username);
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addItemToCartHandler,
  getCartHandler,
  deleteCartHandler,
};
