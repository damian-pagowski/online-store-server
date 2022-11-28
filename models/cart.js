const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cartSchema = new Schema({
  productId: { type: Number, required: true },
  username: { type: String, required: false },
  quantity: { type: Number, required: false },
});

module.exports = mongoose.model("Cart", cartSchema);
