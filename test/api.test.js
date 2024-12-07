const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();

const BASE_URL = `${process.env.SERVER_URL || "http://localhost"}:${process.env.SERVER_PORT || 3030}`;

const {
  generateUniqueUser,
  seedDatabase,
  clearDatabase,
} = require("./testUtil");

const makeAuthenticatedRequest = (endpoint, method, token, data = {}) => {
  return request(BASE_URL)
  [method](endpoint)
    .set("Authorization", `Bearer ${token}`)
    .send(data);
};

const createNewUserAndToken = async () => {
  const newUser = generateUniqueUser();

  // Create user
  await request(BASE_URL).post("/users").send(newUser).expect(201);

  // Login to get the token
  const loginResponse = await request(BASE_URL)
    .post("/users/login")
    .send({ username: newUser.username, password: newUser.password })
    .expect(200);

  return { user: newUser, token: loginResponse.body.token };
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGOLAB_URI);
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

  test("Get user details", async () => {
    const { user, token } = await createNewUserAndToken();
    const response = await makeAuthenticatedRequest("/users", "get", token).expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        username: user.username,
        email: user.email,
      })
    );
  });

  test("Delete user", async () => {
    const { token } = await createNewUserAndToken();
    await makeAuthenticatedRequest("/users", "delete", token).expect(204);
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
  const products = require("./fixtures/products");

  test("Get all products", async () => {
    const response = await request(BASE_URL)
      .get("/products")
      .expect(200);

    const expectedProducts = products.map(product => ({
      name: product.name,
      image: product.image,
      description: product.description,
      rating: product.rating,
      price: parseFloat(product.price), // Ensuring price is a number
      productId: product.productId,
      category: product.category,
      subcategory: product.subcategory,
      badges: product.badges
    }));

    const actualProducts = response.body.map(product => ({
      name: product.name,
      image: product.image,
      description: product.description,
      rating: product.rating,
      price: parseFloat(product.price), 
      productId: product.productId,
      category: product.category,
      subcategory: product.subcategory,
      badges: product.badges
    }));

    expect(actualProducts).toEqual(expectedProducts);
  });
});

// --- CATEGORY ENDPOINT ---
describe("Categories Endpoint", () => {
  const categories = require("./fixtures/categories");

  test("Get all categories", async () => {
    const response = await request(BASE_URL)
      .get("/categories")
      .expect(200);

    const expectedCategories = categories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        name: subcategory.name,
        display: subcategory.display
      }))
    }));

    const actualCategories = response.body.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        name: subcategory.name,
        display: subcategory.display
      }))
    }));

    expect(actualCategories).toEqual(expectedCategories);
  });
});

// --- CART ENDPOINT ---
describe("Cart Endpoint", () => {
  const inventories = require("./fixtures/inventories");

  test("Add item to cart", async () => {
    const { token } = await createNewUserAndToken();
    const inventory = inventories[0];
    const response = await makeAuthenticatedRequest(
      "/cart",
      "post",
      token,
      { productId: inventory.productId, quantity: 1 }
    ).expect(200);

    expect(response.body).toEqual({
      [inventory.productId]: 1,
    });
  });

  test("Add multiple items to cart", async () => {
    const { token } = await createNewUserAndToken();
    const inventory1 = inventories[0];
    const inventory2 = inventories[1];

    await makeAuthenticatedRequest(
      "/cart",
      "post",
      token,
      { productId: inventory1.productId, quantity: 2 }
    ).expect(200);

    const response = await makeAuthenticatedRequest(
      "/cart",
      "post",
      token,
      { productId: inventory2.productId, quantity: 3 }
    ).expect(200);

    expect(response.body).toEqual({
      [inventory1.productId]: 2,
      [inventory2.productId]: 3,
    });
  });

  test("Quantity limit exceeded", async () => {
    const { token } = await createNewUserAndToken();
    const inventory = inventories[1];
    const response = await makeAuthenticatedRequest(
      "/cart",
      "post",
      token,
      { productId: inventory.productId, quantity: 11 }
    ).expect(200);

    expect(response.body).toEqual({
      error: true,
      "message": "Quantity limit exceeded",
      cart: {},
    });
  });

  test("Remove item from cart", async () => {
    const { token } = await createNewUserAndToken();
    const inventory = inventories[0];

    await makeAuthenticatedRequest(
      "/cart",
      "post",
      token,
      { productId: inventory.productId, quantity: 2 }
    ).expect(200);

    const response = await makeAuthenticatedRequest(
      "/cart",
      "post",
      token,
      { productId: inventory.productId, quantity: -2 }
    ).expect(200);

    expect(response.body).toEqual({});
  });

  test("Get cart", async () => {
    const { token } = await createNewUserAndToken();
    const inventory1 = inventories[0];
    const inventory2 = inventories[1];

    await makeAuthenticatedRequest(
      "/cart",
      "post",
      token,
      { productId: inventory1.productId, quantity: 2 }
    ).expect(200);

    await makeAuthenticatedRequest(
      "/cart",
      "post",
      token,
      { productId: inventory2.productId, quantity: 3 }
    ).expect(200);

    const response = await makeAuthenticatedRequest(
      "/cart",
      "get",
      token
    ).expect(200);

    expect(response.body).toEqual({
      [inventory1.productId]: 2,
      [inventory2.productId]: 3,
    });
  });

  test("Delete cart", async () => {
    const { token } = await createNewUserAndToken();
    const inventory = inventories[0];

    await makeAuthenticatedRequest(
      "/cart",
      "post",
      token,
      { productId: inventory.productId, quantity: 1 }
    ).expect(200);

    const response = await makeAuthenticatedRequest(
      "/cart",
      "delete",
      token
    ).expect(200);

    expect(response.body).toEqual({ message: "Cart removed successfully" });
  });
});