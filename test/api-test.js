require("dotenv").config();

const chai = require("chai");
const assert = require("chai").assert;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const BASE_URL = process.env.SERVER_URL;
const TIMEOUT = 60000;
const DEFAULT_CURRENCY = "EUR";

const USER = {
  email: new Date().getTime() + "@test.com",
  password: "P@ssw0rd",
  displayName: "Integration Test",
  defaultProject: "IntegrationTest",
};

const PRODUCT = {
  name: "Snake 3D",
  image: "/images/products/snake.png",
  description:
    "ante sollicitudin. Cras purus odio, vestibulum\n      in vulputate at, tempus viverra turpis. Fusce condimentum\n      nunc ac nisi vulputate fringilla. Donec lacinia.",
  rating: 4,
  price: "99.99",
  productId: 1,
  category: "games",
  subcategory: "ps4",
  badges: ["Best Seller"],
};

describe("Online Store API", function() {
  const agent = chai.request.agent(BASE_URL);

  this.timeout(TIMEOUT);
  this.afterAll(function(done) {
    agent
      .delete(`/users/`)
      .set("Content-Type", "application/json")
      .send({ email: USER.email })
      .end((err, res) => {
        assert.equal(res.status, 200);
        done();
      });
  });

  describe("Products", () => {
    it("get products", done => {
      agent.get(`/products`).end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json", "Response should be json");
        assert.isArray(res.body, "products should be returned as array");
        const product = res.body[0];

        assert.property(product, "name", "response should have name property");

        assert.property(
          product,
          "image",
          "response should have image property"
        );
        assert.property(
          product,
          "description",
          "response should have description property"
        );
        assert.property(
          product,
          "rating",
          "response should have rating property"
        );
        assert.property(
          product,
          "price",
          "response should have price property"
        );
        assert.property(
          product,
          "productId",
          "response should have productId property"
        );

        assert.property(
          product,
          "category",
          "response should have category property"
        );

        assert.property(
          product,
          "subcategory",
          "response should have subcategory property"
        );

        assert.property(
          product,
          "badges",
          "response should have badges property"
        );
        assert.isArray(product.badges, "badges shoud be array");
        done();
      });
    });

    it("get categories", done => {
      agent.get(`/products/categories`).end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json", "Response should be json");
        assert.property(
          res.body,
          "computers",
          "should return comoputers category"
        );
        assert.property(res.body, "games", "should return games category");
        assert.property(res.body, "phones", "should return phones category");
        Object.values(res.body).forEach(category => {
          assert.property(
            category,
            "display",
            "category should have display property"
          );
          assert.property(
            category,
            "subcategories",
            "category should have subcategories property"
          );
        });

        done();
      });
    });

    it("get product by ID", done => {
      agent.get(`/products/${PRODUCT.productId}`).end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json", "Response should be json");

        assert.property(res.body, "name", "response should have name property");
        assert.equal(res.body.name, PRODUCT.name);

        assert.property(
          res.body,
          "image",
          "response should have image property"
        );
        assert.equal(res.body.image, PRODUCT.image);

        assert.property(
          res.body,
          "description",
          "response should have description property"
        );
        assert.equal(res.body.description, PRODUCT.description);

        assert.property(
          res.body,
          "rating",
          "response should have rating property"
        );
        assert.equal(res.body.rating, PRODUCT.rating);

        assert.property(
          res.body,
          "price",
          "response should have price property"
        );
        assert.equal(res.body.price, PRODUCT.price);

        assert.property(
          res.body,
          "productId",
          "response should have productId property"
        );
        assert.equal(res.body.productId, PRODUCT.productId);

        assert.property(
          res.body,
          "category",
          "response should have category property"
        );
        assert.equal(res.body.category, PRODUCT.category);

        assert.property(
          res.body,
          "subcategory",
          "response should have subcategory property"
        );
        assert.equal(res.body.subcategory, PRODUCT.subcategory);

        assert.property(
          res.body,
          "badges",
          "response should have badges property"
        );

        assert.isArray(res.body.badges, "badges shoud be array");
        assert.deepEqual(res.body.badges, PRODUCT.badges);

        done();
      });
    });
  });

  describe("Users", () => {
    it("should register new user", done => {
      agent
        .post(`/users/register`)
        .set("Content-Type", "application/json")
        .send(USER)
        .end((err, res) => {
          assert.equal(res.status, 201);
          assert.equal(res.type, "application/json", "Response should be json");

          assert.property(res.body, "id", "response should have id property");
          assert.property(
            res.body,
            "email",
            "response should have email property"
          );
          assert.equal(
            res.body.email,
            USER.email,
            "User email used for registration should be returned"
          );
          done();
        });
    });
    it("should log in", done => {
      agent
        .post(`/users/login`)
        .set("Content-Type", "application/json")
        .send({ email: USER.email, password: USER.password })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json", "Response should be json");
          assert.property(res.body, "id", "response should have id property");
          assert.property(
            res.body,
            "email",
            "response should have email property"
          );
          assert.equal(
            res.body.email,
            USER.email,
            "User email used for registration should be returned"
          );
          done();
        });
    });
    it("should log out", done => {
      agent.get(`/users/logout`).end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json", "Response should be json");

        assert.property(
          res.body,
          "message",
          "response should have message property"
        );

        assert.equal(
          res.body.message,
          "logout successful",
          "User email used for registration should be returned"
        );
        done();
      });
    });
  });

  describe("Cart", () => {
    before(function(done) {
      agent
        .post(`/users/login`)
        .set("Content-Type", "application/json")
        .send({ email: USER.email, password: USER.password })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    it("should add product to cart", done => {
      agent
        .post(`/cart/add`)
        .set("Content-Type", "application/json")
        .send({ productId: PRODUCT.productId, quantity: 1 })
        .end((err, res) => {
          assert.equal(res.status, 201);
          assert.equal(res.type, "application/json", "Response should be json");
          assert.property(
            res.body,
            "items",
            "response should have items property"
          );
          assert.isArray(res.body.items, "items shoud be array");
          const cart = res.body;
          const cartItem = res.body.items[0];
          assert.equal(
            cartItem.productId,
            PRODUCT.productId,
            "previously added product should be in cart - matching product id"
          );

          assert.property(
            cart,
            "sessionId",
            "response should have sessionId property"
          );

          assert.property(cart, "paid", "response should have paid property");

          assert.isFalse(cart.paid, "cart should be not paid untill checkout");

          assert.property(
            cart,
            "created",
            "response should have created property"
          );
          assert.property(cart, "total", "response should have total property");
          assert.equal(
            cart.total,
            PRODUCT.price,
            "cart total should be equal to product price"
          );

          assert.property(
            cart,
            "currency",
            "response should have currency property"
          );
          assert.equal(
            cart.currency,
            DEFAULT_CURRENCY,
            "cart should have default currency - EUR"
          );

          assert.property(
            cart,
            "itemsCount",
            "response should have itemsCount property"
          );

          assert.equal(cart.itemsCount, 1, "cart should have only one item");
          done();
        });
    });
    it("should retrieve cart details", done => {
      agent.get(`/cart/details`).end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json", "Response should be json");
        assert.property(
          res.body,
          "items",
          "response should have items property"
        );
        assert.isArray(res.body.items, "items shoud be array");
        const cart = res.body;
        const cartItem = res.body.items[0];
        assert.equal(
          cartItem.productId,
          PRODUCT.productId,
          "previously added product should be in cart - matching product id"
        );

        assert.property(
          cart,
          "sessionId",
          "response should have sessionId property"
        );

        assert.property(cart, "paid", "response should have paid property");

        assert.isFalse(cart.paid, "cart should be not paid untill checkout");

        assert.property(
          cart,
          "created",
          "response should have created property"
        );
        assert.property(cart, "total", "response should have total property");
        assert.equal(
          cart.total,
          PRODUCT.price,
          "cart total should be equal to product price"
        );

        assert.property(
          cart,
          "currency",
          "response should have currency property"
        );
        assert.equal(
          cart.currency,
          DEFAULT_CURRENCY,
          "cart should have default currency - EUR"
        );

        assert.property(
          cart,
          "itemsCount",
          "response should have itemsCount property"
        );

        assert.equal(cart.itemsCount, 1, "cart should have only one item");
        done();
      });
    });

    it("should update cart", done => {
      agent
        .post(`/cart/edit`)
        .set("Content-Type", "application/json")
        .send({ productId: PRODUCT.productId, quantity: 2 })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json", "Response should be json");
          assert.property(
            res.body,
            "items",
            "response should have items property"
          );
          assert.isArray(res.body.items, "items shoud be array");
          const cart = res.body;
          const cartItem = res.body.items[0];
          assert.equal(
            cartItem.productId,
            PRODUCT.productId,
            "previously added product should be in cart - matching product id"
          );

          assert.property(
            cart,
            "sessionId",
            "response should have sessionId property"
          );

          assert.property(cart, "paid", "response should have paid property");

          assert.isFalse(cart.paid, "cart should be not paid untill checkout");

          assert.property(
            cart,
            "created",
            "response should have created property"
          );
          assert.property(cart, "total", "response should have total property");
          assert.equal(
            cart.total,
            PRODUCT.price * 2,
            "cart total should be equal to 2 x product price"
          );

          assert.property(
            cart,
            "currency",
            "response should have currency property"
          );
          assert.equal(
            cart.currency,
            DEFAULT_CURRENCY,
            "cart should have default currency - EUR"
          );

          assert.property(
            cart,
            "itemsCount",
            "response should have itemsCount property"
          );

          assert.equal(cart.itemsCount, 2, "cart should have 2 items");
          done();
        });
    });

    it("should remove item from cart", done => {
      agent
        .post(`/cart/remove`)
        .set("Content-Type", "application/json")
        .send({ productId: PRODUCT.productId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json", "Response should be json");
          assert.property(
            res.body,
            "items",
            "response should have items property"
          );
          assert.isArray(res.body.items, "items shoud be array");
          const cart = res.body;
          assert.equal(res.body.items.length, 0, "Cart should be empty");

          assert.property(
            cart,
            "sessionId",
            "response should have sessionId property"
          );

          assert.property(cart, "paid", "response should have paid property");

          assert.isFalse(cart.paid, "cart should be not paid untill checkout");

          assert.property(
            cart,
            "created",
            "response should have created property"
          );
          assert.property(cart, "total", "response should have total property");
          assert.equal(cart.total, 0, "cart total should be 0");

          assert.property(
            cart,
            "currency",
            "response should have currency property"
          );
          assert.equal(
            cart.currency,
            DEFAULT_CURRENCY,
            "cart should have default currency - EUR"
          );

          assert.property(
            cart,
            "itemsCount",
            "response should have itemsCount property"
          );

          assert.equal(cart.itemsCount, 0, "cart should be empty");
          done();
        });
    });
    describe("cart checkout", done => {
      before(done => {
        agent
          .post(`/cart/add`)
          .set("Content-Type", "application/json")
          .send({ productId: PRODUCT.productId, quantity: 1 })
          .end((err, res) => {
            assert.equal(res.status, 201);
            done();
          });
      });
      it("should send checkout event to payment provider", done => {
        agent.get(`/cart/charge`).end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json", "Response should be json");
          assert.property(
            res.body,
            "session",
            "response should have session property"
          );
          assert.property(
            res.body,
            "error",
            "response should have error property"
          );
          assert.property(
            res.body.session,
            "cancel_url",
            "response should have cancel_url"
          );
          assert.property(
            res.body.session,
            "display_items",
            "response should have display_items"
          );
          assert.property(
            res.body.session,
            "payment_intent",
            "response should have payment_intent"
          );
          assert.property(
            res.body.session,
            "id",
            "response should have session id"
          );
          done();
        });
      });
    });
  });
});
