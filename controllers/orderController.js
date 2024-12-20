const { checkout, getOrderHistory, getOrderById } = require('../services/orderService');

const checkoutHandler = async(req, res, next) => {
  try {
    const username = req.currentUser.username;
    const response = await checkout(username);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const getOrderHistoryHandler = async(req, res, next) => {
  try {
    const username = req.currentUser.username;
    const orders = await getOrderHistory(username);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

const getOrderByIdHandler = async(req, res, next) => {
  try {
    const username = req.currentUser.username;
    const { id } = req.params;
    const order = await getOrderById(id, username);
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkoutHandler,
  getOrderHistoryHandler,
  getOrderByIdHandler,
};
