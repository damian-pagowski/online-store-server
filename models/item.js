const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const itemSchema = new Schema({
  product_code: { type: Number, required: false },
  quantity: { type: Number, required: false },
});

module.exports = mongoose.model("Item", itemSchema);
