const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
  },
  items: {
    type: mongoose.Schema.Types.Mixed, 
    required: false,
  },
});

module.exports = mongoose.model("Cart", CartSchema);