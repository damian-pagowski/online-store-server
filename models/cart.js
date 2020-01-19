const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cartSchema = new Schema({
  items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
  customer_id: { type: String, required: false },
  session_id: { type: String, required: false },
  paid: { type: Boolean, required: true, default: false },
  created_on: { type: Date, required: true, default: Date.now() },
});

module.exports = mongoose.model("Cart", cartSchema);
