const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cartSchema = new Schema({
  items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
  customer_id: { type: String, required: false },
  paid: { type: Boolean, required: true, default: false },
  created: { type: Date, required: true, default: Date.now() },
  total: { type: Number, required: false, default: 0 },
  currency: { type: String, required: false, default: "EUR" },
  itemsCount: { type: Number, required: false, default: 0 },
});

module.exports = mongoose.model("Cart", cartSchema);
