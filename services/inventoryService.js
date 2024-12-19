const Inventory = require("../models/inventory");
const { DatabaseError, InventoryError, NotFoundError } = require('../utils/errors');

const getInventory = async (productId) => {
  try {
    const productIdNumber = parseInt(productId, 10);
    if (!Number.isInteger(productIdNumber) || productIdNumber <= 0) {
      throw new InventoryError(productId, 'Invalid Product ID');
    }

    const productInventory = await Inventory.findOne({ productId }, { _id: 0, __v: 0 });
    if (!productInventory) {
      throw new NotFoundError(productId, 'Product not found');
    }
    return productInventory;
  } catch (error) {
    if (error instanceof InventoryError || error instanceof NotFoundError) throw error;
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
    return productInventory;
  } catch (error) {
    if (error instanceof InventoryError) throw error;
    throw new DatabaseError(`Failed to update inventory for product ${productId}`, error);
  }
};

module.exports = { 
  getInventory, 
  removeFromInventory 
};