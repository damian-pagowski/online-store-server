const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const itemSchema = new Schema({
  productCsode: { type: Number, required: false },
  name: { type: String, required: false },
  image: { type: String, required: false },
  description: { type: String, required: false },
  rating: { type: String, required: false },
  category: { type: String, required: false },
  unitPrice: { type: Number, required: false },
  productId: { type: Number, required: false },
  quantity: { type: Number, required: false },
  subTotal: { type: Number, required: false },
});

module.exports = mongoose.model("Item", itemSchema);
