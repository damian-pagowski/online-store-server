const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    items: [
      {
        productId: { type: Number, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],
    totalPrice: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'shipped', 'delivered', 'cancelled'], 
      default: 'pending' 
    },
    createdAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model('Order', orderSchema);