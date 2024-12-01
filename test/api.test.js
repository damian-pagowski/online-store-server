const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();

const BASE_URL = `${process.env.SERVER_URL || "http://localhost"}:${process.env.SERVER_PORT || 3030}`;

const {
  generateUniqueUser,
  makeAuthenticatedRequest,
  seedDatabase,
  clearDatabase,
} = require("./testUtil");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGOLAB_URI, { useUnifiedTopology: true, useNewUrlParser: true });

  // Clear existing data and re-seed database
  await clearDatabase();
  await seedDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

// --- USERS ENDPOINT ---
describe("Users Endpoint", () => {
  test("Create a new user", async () => {
    const newUser = generateUniqueUser();
    await request(BASE_URL).post("/users").send(newUser).expect(201);

  });
});

// --- INVENTORY ENDPOINT ---
describe("Inventory Endpoint", () => {
  test("Get product availability", async () => {
    const inventory = require("./fixtures/inventories")[0];
    const response = await request(BASE_URL)
      .get(`/inventory/${inventory.productId}`)
      .expect(200);

    expect(response.body).toEqual({
      productId: inventory.productId,
      quantity: inventory.quantity,
    });
  });
});

// --- PRODUCTS ENDPOINT ---
describe("Products Endpoint", () => {
  test("List all products", async () => {
    const response = await request(BASE_URL).get("/products").expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    response.body.forEach((product) => {
      expect(product).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          image: expect.any(String),
          description: expect.any(String),
          rating: expect.any(Number),
          price: expect.any(Number),
          productId: expect.any(Number),
          category: expect.any(String),
          subcategory: expect.any(String),
          badges: expect.any(Array),
        })
      );
    });
  });

  test("Get product by ID", async () => {
    const product = require("./fixtures/products")[0];
    const response = await request(BASE_URL)
      .get(`/products/${product.productId}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        name: product.name,
        image: product.image,
        description: product.description,
        rating: product.rating,
        price: parseFloat(product.price),
        productId: product.productId,
        category: product.category,
        subcategory: product.subcategory,
        badges: product.badges,
      })
    );
  });
});

// --- CART ENDPOINT ---
describe("Cart Endpoint", () => {
  let defaultUser;
  const inventories = require("./fixtures/inventories");

  beforeEach(async () => {
    defaultUser = generateUniqueUser();
    await request(BASE_URL).post("/users").send(defaultUser).expect(201);
  });
  test("Add item to cart", async () => {
    const inventory = inventories[0];
    const response = await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory.productId, quantity: 1 }
    ).expect(200);

    expect(response.body).toEqual({
      [inventory.productId]: 1,
    });
  });

  test("Add multiple items to cart", async () => {
    const inventory1 = inventories[0];
    const inventory2 = inventories[1];

    // Add first item
    await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory1.productId, quantity: 2 }
    ).expect(200);

    // Add second item
    const response = await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory2.productId, quantity: 3 }
    ).expect(200);

    // Verify both items are in the cart
    expect(response.body).toEqual({
      [inventory1.productId]: 2,
      [inventory2.productId]: 3,
    });
  });

  test("Quantity limit exceeded", async () => {
    const inventory = inventories[1];
    const response = await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory.productId, quantity: 11 }
    ).expect(200);

    expect(response.body).toEqual({
      error: true,
      message: `Inventory: ${inventory.productId} - Insufficient stock`,
      cart: {
      },
    });
  });

  test("Remove item from cart", async () => {
    const inventory = inventories[0];

    // Add item to cart first
    await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory.productId, quantity: 2 }
    ).expect(200);

    // Remove item from cart
    const response = await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory.productId, quantity: -2 }
    ).expect(200);

    // Cart should now be empty
    expect(response.body).toEqual({});
  });

  test("Get cart", async () => {
    const inventory1 = inventories[0];
    const inventory2 = inventories[1];

    // Add two items to the cart
    await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory1.productId, quantity: 2 }
    ).expect(200);

    await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory2.productId, quantity: 3 }
    ).expect(200);

    // Fetch the cart
    const response = await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "get",
      defaultUser
    ).expect(200);

    // Verify cart contents
    expect(response.body).toEqual({
      [inventory1.productId]: 2,
      [inventory2.productId]: 3,
    });
  });

  test("Delete cart", async () => {
    const inventory = inventories[0];

    // Add an item to the cart
    await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory.productId, quantity: 1 }
    ).expect(200);

    // Delete the cart
    const response = await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "delete",
      defaultUser
    ).expect(200);

    // Verify the cart is deleted
    expect(response.body).toEqual({ message: "Cart removed successfully" });
  });
});