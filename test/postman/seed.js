const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../../models/product');
const Inventory = require('../../models/inventory');
const User = require('../../models/user');
const productsFixture = require('../fixtures/products');
const inventoriesFixture = require('../fixtures/inventories');
const MONGOLAB_URI = process.env.MONGOLAB_URI;

const seedDatabase = async() => {
  try {
    await mongoose.connect(MONGOLAB_URI);

    // Remove user and inventory
    const deleteUsers = User.deleteMany({ username: 'testuser123' });
    const deleteInventory = Inventory.deleteMany({ productId: 1 });
    await Promise.all([deleteUsers, deleteInventory]);

    // Insert product if it doesn't exist
    const productToInsert = productsFixture.find((p) => p.productId === 1);
    if (productToInsert) {
      await Product.updateOne(
        { productId: 1 },
        { $setOnInsert: productToInsert },
        { upsert: true },
      );
    }

    // Insert inventory if it doesn't exist
    const inventoryToInsert = inventoriesFixture.find((i) => i.productId === 1) || {
      productId: 1,
      quantity: 10,
    };
    await Inventory.updateOne(
      { productId: 1 },
      { $setOnInsert: inventoryToInsert },
      { upsert: true },
    );

    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding the database:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedDatabase();
