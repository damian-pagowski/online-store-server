const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../../models/product");
const Inventory = require("../../models/inventory");
const User = require("../../models/user");
const productsFixture = require("../fixtures/products");
const inventoriesFixture = require("../fixtures/inventories");
const MONGOLAB_URI = process.env.MONGOLAB_URI;

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGOLAB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await User.deleteOne({ username: "testuser1233" });
    await Inventory.deleteOne({ productId: 1 });

    const product = productsFixture.find((p) => p.productId === 1);
    if (product) {
      const existingProduct = await Product.findOne({ productId: 1 });
      if (!existingProduct) {
        await Product.create(product);
      }
    }

    const inventory = inventoriesFixture.find((i) => i.productId === 1) || {
      productId: 1,
      quantity: 10,
    };
    await Inventory.create(inventory);

  } catch (err) {
    console.error("Error seeding the database:", err);
  } finally {
    mongoose.disconnect();
  }
};

seedDatabase();