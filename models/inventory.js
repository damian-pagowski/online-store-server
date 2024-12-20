const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const itemSchema = new Schema({
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true },
});
module.exports = mongoose.model('Inventory', itemSchema);
