const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();

const BASE_URL = `${process.env.SERVER_URL || "http://localhost"}:${process.env.SERVER_PORT || 8282}`;

// Import utilities from testUtil.js
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

  beforeEach(async () => {
    defaultUser = generateUniqueUser();
    await request(BASE_URL).post("/users").send(defaultUser).expect(201);
  });

  test("Add item to cart", async () => {
    const inventory = require("./fixtures/inventories")[0]; 
    const response = await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory.productId, quantity: 1 }
    ).expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        productId: inventory.productId,
        username: defaultUser.username,
        quantity: 1,
      })
    );
  });

  test("Quantity limit exceeded", async () => {
    const inventory = require("./fixtures/inventories")[1]; 
    const response = await makeAuthenticatedRequest(
      `/cart/${defaultUser.username}`,
      "post",
      defaultUser,
      { productId: inventory.productId, quantity: 11 }
    ).expect(400);

    expect(response.body).toEqual({
      errors: `Inventory: ${inventory.productId} is unavailable`,
    });
  });
});