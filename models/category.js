const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const itemSchema = new Schema({
  name: { type: String, required: true },
  display: { type: String, required: true },
  subcategories: [
    {
      name: String,
      display: String,
    },
  ],
});

module.exports = mongoose.model("Category", itemSchema);
