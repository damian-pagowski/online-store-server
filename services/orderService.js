const Order = require('../models/order');
const { NotFoundError, ValidationError, DatabaseError } = require('../utils/errors');
const { getCart, deleteCart } = require('./cartService');
const { getProductsByIds } = require('./productService');

const checkout = async (username) => {
  try {
    const cart = await getCart(username);
    if (!cart) {
      throw new ValidationError(['Cart is empty'], 'Cannot checkout with an empty cart');
    }

    const productIds = Object.keys(cart).map(i => Number(i));
    const products = await getProductsByIds(productIds);    
    const productNameMap = products.reduce((map, product) => {
      map[product.productId] = product.name;
      return map;
    }, {});

    const productPriceMap = products.reduce((map, product) => {
      map[product.productId] = product.price;
      return map;
    }, {});

    const totalPrice = Object.entries(cart).reduce((total, [productId, quantity]) => {
      const productPrice = productPriceMap[Number(productId)];
      if (!productPrice) {
        throw new NotFoundError('Product', productId);
      }
      return total + productPrice * quantity;
    }, 0);
    
    const orderObject = {
      username,
      items: Object.entries(cart).map(([productId, quantity]) => ({
        productId,
        quantity,
        name: productNameMap[Number(productId)],
        price: productPriceMap[Number(productId)]
      })),
      totalPrice
    };

    const newOrder = await Order.create(orderObject);
    await deleteCart(username);

    return { message: 'Order created successfully', orderId: newOrder._id };
  } catch (error) {
    throw new DatabaseError('Failed to create order', 'checkout', { username, originalError: error });
  }
};

const getOrderHistory = async (username) => {
  try {
    const orders = await Order.find({ username }).sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      throw new NotFoundError('Orders', `for username: ${username}`);
    }
    return orders;
  } catch (error) {
    throw new DatabaseError('Failed to fetch order history', 'getOrderHistory', { username, originalError: error });
  }
};

const getOrderById = async (id, username) => {
  try {
    const order = await Order.findOne({ _id: id, username });
    if (!order) {
      throw new NotFoundError('Order', id);
    }
    return order;
  } catch (error) {
    throw new DatabaseError('Failed to fetch order details', 'getOrderById', { orderId: id, username, originalError: error });
  }
};

module.exports = {
  checkout,
  getOrderHistory,
  getOrderById
};