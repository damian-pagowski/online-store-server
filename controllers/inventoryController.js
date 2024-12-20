const { getInventory } = require('../services/inventoryService');

const getInventoryHandler = async(req, res, next) => {
  try {
    const { productId } = req.params;
    const productInventory = await getInventory(productId);
    res.status(200).json(productInventory);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryHandler,
};
