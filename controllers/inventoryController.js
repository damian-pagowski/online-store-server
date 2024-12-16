const Inventory = require("../models/inventory");
const { DatabaseError, InventoryError } = require('../utils/errors');

const getInventoryHandler = async (req, res) => {
  const { productId } = req.params;
  const productInventory = await getInventory(productId);
  res.status(200).json(productInventory);
};

const getInventory = async (productId) => {
  try {
    const productInventory = await Inventory.findOne({ productId }, { _id: 0, __v: 0 });
    if (!productInventory) {
      throw new InventoryError(productId, 'Product not found');
    }
    return productInventory;
  } catch (error) {
    if (error instanceof InventoryError) throw error;
    throw new DatabaseError(`Failed to get inventory for product ${productId}`, error);
  }
};

const removeFromInventory = async (productId, quantity) => {
  try {
    const productInventory = await Inventory.findOne({ productId });
    if (!productInventory) {
      throw new InventoryError(productId, 'Product not found');
    }
    if (productInventory.quantity < quantity) {
      throw new InventoryError(productId, `Insufficient stock (Current: ${productInventory.quantity}, Requested: ${quantity})`);
    }
    productInventory.quantity -= quantity;
    await productInventory.save();
  } catch (error) {
    if (error instanceof InventoryError) throw error;
    throw new DatabaseError(`Failed to update inventory for product ${productId}`, error);
  }
};

module.exports = { getInventoryHandler, getInventory, removeFromInventory };