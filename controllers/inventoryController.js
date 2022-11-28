const Inventory = require("../models/inventory");

const removeFromInventory = async (productId) => {
  const productInventory = await Inventory.findOne({ productId });
  if (!productInventory || productInventory.quantity === 0) {
    const err = new Error(`${productId} is unavailable`);
    err.code = 400;
    throw err;
  }
  productInventory.quantity -= 1;
  await productInventory.save();
};

getInventory = (productId) => Inventory.find({ productId });

module.exports = { removeFromInventory, getInventory };
