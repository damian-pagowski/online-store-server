const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const itemSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  rating: { type: Number, required: true },
  price: { type: Number, required: true },
  productId: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  badges: { type: Array, required: true },
});

module.exports = mongoose.model('Product', itemSchema);
