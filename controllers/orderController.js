const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');

const { NotFoundError, ValidationError, DatabaseError } = require('../utils/errors');

const checkout = async (req, res) => {
    const username = req.currentUser.username;
    const cart = await Cart.findOne({ username });
    if (!cart || cart.items.length === 0) {
        throw new ValidationError(['Cart is empty'], 'Cannot checkout with an empty cart');
    }
    try {

        const productIds = Object.keys(cart.items).map(i => Number(i));
        const products = await Product.find({ productId: { $in: productIds } });
        const productNameMap = products.reduce((map, product) => {
            map[product.productId] = product.name;
            return map;
        }, {});
        const productPriceMap = products.reduce((map, product) => {
            map[product.productId] = product.price;
            return map;
        }, {});
        const totalPrice = Object.entries(cart.items).reduce((total, [productId, quantity]) => {
            const productPrice = productPriceMap[Number(productId)];
            if (!productPrice) {
                throw new NotFoundError('Product', productId);
            }
            return total + productPrice * quantity;
        }, 0);

        const orderObject = {
            username,
            items: Object.entries(cart.items).map(([productId, quantity]) => ({
                productId,
                quantity,
                name: productNameMap[Number(productId)],
                price: productPriceMap[Number(productId)]
            })),
            totalPrice
        };
        const newOrder = await Order.create(orderObject);
        await Cart.deleteOne({ username });

        res.status(201).json({
            message: 'Order created successfully',
            orderId: newOrder._id
        });
    } catch (error) {
        throw new DatabaseError('Failed to create order', 'checkout', { username, originalError: error });
    }
};

const getOrderHistory = async (req, res) => {
    const username = req.currentUser.username;
    try {
        const orders = await Order.find({ username}).sort({ createdAt: -1 });
        if (!orders || orders.length === 0) {
            throw new NotFoundError('Orders', `for userId: ${username}`);
        }
        res.status(200).json({ success: true, orders });
    } catch (error) {
        throw new DatabaseError('Failed to fetch order history', 'getOrderHistory', { username, originalError: error });
    }
};

const getOrderById = async (req, res) => {
    const username = req.currentUser.username;
    const { id } = req.params;
    try {
        const order = await Order.findOne({ _id: id, username });
        if (!order) {
            throw new NotFoundError('Order', id);
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        throw new DatabaseError('Failed to fetch order details', 'getOrderById', { orderId: id, username, originalError: error });
    }
};

module.exports = {
    checkout,
    getOrderHistory,
    getOrderById
};