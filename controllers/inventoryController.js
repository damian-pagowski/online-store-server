const Inventory = require("../models/inventory");

const removeFromInventory = async (productId, quantity) => {
  const productInventory = await Inventory.findOne({ productId });

  if (!productInventory) {
    throw createInventoryError(productId, "Product not found");
  }

  if (productInventory.quantity < quantity) {
    throw createInventoryError(productId, "Insufficient stock");
  }

  productInventory.quantity -= quantity;
  await productInventory.save();
};

const getInventory = (productId) => {
  return Inventory.findOne({ productId }, { _id: 0, __v: 0 });
};

// Utility function for consistent inventory error creation
const createInventoryError = (productId, message) => {
  const error = new Error(`Inventory: ${productId} - ${message}`);
  error.type = "product_unavailable";
  error.code = 400;
  return error;
};

module.exports = { removeFromInventory, getInventory };