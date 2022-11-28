const Inventory = require("../models/inventory");

const removeFromInventory = async (productId, quantity) => {
  const productInventory = await Inventory.findOne({ productId });
  if (!productInventory || productInventory.quantity - quantity < 0) {
    const err = new Error(`Inventory: ${productId} is unavailable`);
    err.type = "product_unavailable";
    err.code = 400;
    throw err;
  }
  productInventory.quantity -= quantity;
  await productInventory.save();
};

getInventory = (productId) => Inventory.find({ productId });

module.exports = { removeFromInventory, getInventory };
