const request = require("supertest");
const BASE_URL = "http://localhost:3030";
const mongoose = require("mongoose");
require("dotenv").config();
const DB_URI = process.env.MONGOLAB_URI;
const {
  createUserIfNotExist,
  defaultUser,
  userToDelete,
  setInventory,
  clearCart,
  setCart,
} = require("../utils/testUtil");

afterAll(async () => await mongoose.disconnect());

beforeAll(async () => {
  await mongoose.connect(DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  await createUserIfNotExist(defaultUser);
  await createUserIfNotExist(userToDelete);
});
describe("users endpoint", () => {
  test("create user", async () => {
    const now = new Date().getTime();
    const newUser = {
      username: `test${now}`,
      email: `test${now}@test.com`,
      password: "secret",
    };
    await request(BASE_URL).post("/users").send(newUser).expect(201);
  });
  test("email already registered", async () => {
    const now = new Date().getTime();
    const newUser = {
      username: `test${now}`,
      email: defaultUser.email,
      password: "secret",
    };
    const response = await request(BASE_URL)
      .post("/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual(
      expect.objectContaining({
        errors: expect.any(Array),
      })
    );
    expect(response.body.errors).toContain("email already registered");
  });
  test("username already registered", async () => {
    const now = new Date().getTime();
    const newUser = {
      username: defaultUser.username,
      email: `test${now}test2@test.com`,
      password: "secret",
    };
    const response = await request(BASE_URL)
      .post("/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual(
      expect.objectContaining({
        errors: expect.any(Array),
      })
    );
    expect(response.body.errors).toContain("username already registered");
  });
  test("get user by username", async () => {
    const response = await request(BASE_URL)
      .get(`/users/${defaultUser.username}`)
      .auth(defaultUser.username, defaultUser.password)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      username: defaultUser.username,
      email: defaultUser.email,
    });
  });
  test("remove user", async () => {
    const response = await request(BASE_URL)
      .delete(`/users/${userToDelete.username}`)
      .auth(userToDelete.username, userToDelete.password)
      .expect(202);
  });
});
describe("inventory endpoint", () => {
  test("get product availability", async () => {
    const response = await request(BASE_URL)
      .get(`/inventory/1`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      productId: 1,
      quantity: 10,
    });
  });
});
describe("products endpoint", () => {
  test("get product categories", async () => {
    const response = await request(BASE_URL)
      .get("/products/categories")
      .expect(200)
      .expect("Content-Type", /json/);
    expect(Array.isArray(response.body)).toBeTruthy();
    response.body.forEach((element) => {
      expect(element).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          display: expect.any(String),
          subcategories: expect.any(Array),
        })
      );
    });
  });
  test("list all products", async () => {
    const response = await request(BASE_URL)
      .get("/products")
      .expect(200)
      .expect("Content-Type", /json/);
    expect(Array.isArray(response.body)).toBeTruthy();
    response.body.forEach((element) => {
      expect(element).toEqual(
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
  test("get product by id", async () => {
    const response = await request(BASE_URL)
      .get("/products/1")
      .expect(200)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      name: "Snake 3D",
      image: "/images/products/snake.png",
      description:
        "ante sollicitudin. Cras purus odio, vestibulum\n        in vulputate at, tempus viverra turpis. Fusce condimentum\n        nunc ac nisi vulputate fringilla. Donec lacinia.",
      rating: 4,
      price: 99.99,
      productId: 1,
      category: "games",
      subcategory: "ps4",
      badges: ["Best Seller"],
    });
  });
  test("get product by category", async () => {
    const response = await request(BASE_URL)
      .get("/products?category=games")
      .expect(200)
      .expect("Content-Type", /json/);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.map((g) => g.name)).toEqual(
      expect.arrayContaining([
        "Snake 3D",
        "Age Of Colonies",
        "Divide and Conquer",
        "Hipster Game",
      ])
    );
  });
  test("get product by subcategory", async () => {
    const response = await request(BASE_URL)
      .get("/products?category=games&subcategory=ps4")
      .expect(200)
      .expect("Content-Type", /json/);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.map((g) => g.name)).toEqual(
      expect.arrayContaining(["Snake 3D", "Age Of Colonies"])
    );
  });
  test("search product by name", async () => {
    const response = await request(BASE_URL)
      .get("/products?search=mock")
      .expect(200)
      .expect("Content-Type", /json/);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toEqual("Mockia");
  });
});

describe("cart endpoint", () => {
  beforeEach(async () => {
    await clearCart(defaultUser.username);
  });

  test("add item to cart", async () => {
    const productId = 9;
    await setInventory(productId, 11);
    const response = await request(BASE_URL)
      .post(`/cart/${defaultUser.username}`)
      .auth(defaultUser.username, defaultUser.password)
      .send({
        productId,
        quantity: 1,
      })
      .expect(200)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual(
      expect.objectContaining({
        productId,
        username: defaultUser.username,
        quantity: 1,
      })
    );
  });
  test("add more than 10 units of product to the cart in a single request", async () => {
    const productId = 10;
    await setInventory(productId, 50);
    const response = await request(BASE_URL)
      .post(`/cart/${defaultUser.username}`)
      .auth(defaultUser.username, defaultUser.password)
      .send({
        productId,
        quantity: 11,
      })
      .expect(400);
    expect(response.body).toEqual({
      errors: "Quantity limit 10 exceeded",
    });
  });
  test("add more than 10 units of product to the cart in 2 requests", async () => {
    const productId = 11;
    await setInventory(productId, 50);
    await request(BASE_URL)
      .post(`/cart/${defaultUser.username}`)
      .auth(defaultUser.username, defaultUser.password)
      .send({
        productId,
        quantity: 5,
      })
      .expect(200);
    const response = await request(BASE_URL)
      .post(`/cart/${defaultUser.username}`)
      .auth(defaultUser.username, defaultUser.password)
      .send({
        productId,
        quantity: 6,
      })
      .expect(400);
    expect(response.body).toEqual({
      errors: "Quantity limit 10 exceeded",
    });
  });
  test("add unavailable product to cart", async () => {
    const productId = 12;
    await setInventory(productId, 1);
    const response = await request(BASE_URL)
      .post(`/cart/${defaultUser.username}`)
      .auth(defaultUser.username, defaultUser.password)
      .send({
        productId,
        quantity: 2,
      })
      .expect(400);
    expect(response.body).toEqual({
      errors: `Inventory: ${productId} is unavailable`,
    });
  });

  test("remove product from cart", async () => {
    const productId = 13;
    await setInventory(productId, 1);
    await setCart(productId, defaultUser.username, 10);
    const response = await request(BASE_URL)
      .post(`/cart/${defaultUser.username}`)
      .auth(defaultUser.username, defaultUser.password)
      .send({
        productId,
        quantity: -9,
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        productId,
        quantity: 1,
      })
    );
  });
  test("get cart", async () => {
    const productId = 14;
    const productId2 = 15;
    await setCart(productId, defaultUser.username, 1);
    await setCart(productId2, defaultUser.username, 2);

    const response = await request(BASE_URL)
      .get(`/cart/${defaultUser.username}`)
      .auth(defaultUser.username, defaultUser.password)
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        productId,
        quantity: 1,
      })
    );
    expect(response.body[1]).toEqual(
      expect.objectContaining({
        productId: productId2,
        quantity: 2,
      })
    );
  });

  test("delete cart", async () => {
    const productId = 14;
    await setCart(productId, defaultUser.username, 1);
    const response = await request(BASE_URL)
      .delete(`/cart/${defaultUser.username}`)
      .auth(defaultUser.username, defaultUser.password)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: "cart removed",
      })
    );
  });
});
