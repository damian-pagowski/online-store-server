const express = require("express");
const router = express.Router();

const BASE_URL = process.env.SERVER_URL;
const CLIENT_URL = process.env.CLIENT_URL;
const { addToCart, removeFromCart , updateCart} = require("../src/cart");
const { extractLineItemsFromCart, createSession } = require("../src/payment");

const defaultCart = {
  items: [],
  paid: false,
  created: new Date(),
  total: 0.0,
  currency: "EUR",
  itemsCount: 0,
};

router.get("/details", async function(req, res, next) {
  if (!req.session.cart) {
    const sessionCart = { ...defaultCart };
    req.session.cart = sessionCart;
    await req.session.save(err => {
      {
        console.log("error while /DETAILS  ERROR " + err);
        console.log("error while /DETAILS - REQUEST " + req.body);
      }
    });
  }
  res.json(req.session.cart);
});

router.post("/add", async function(req, res, next) {
  const { productId, quantity } = req.body;
  let cart = req.session.cart
    ? req.session.cart
    : (req.session.cart = defaultCart);
  console.log("ADDING TO A CART: " + productId + " : " + quantity);
  cart = await addToCart(cart, productId, quantity);
  req.session.cart = cart;
  console.log(">>CART: " + JSON.stringify(cart));

  await req.session.save(err => {
    console.log("error while /add - REQUEST " + req.body);
  });
  res.status(201).json(cart);
});

router.post("/edit", async function(req, res, next) {
  const { productId, quantity } = req.body;
  if (!req.session.cart) {
    return res.status(400).json({ error: "No cart in current session" });
  }
  req.session.cart = await updateCart(req.session.cart, productId, quantity);
  console.log(JSON.stringify(req.session.cart))
  await req.session.save(err => console.log("Error while /edit" + err));
  res.json(req.session.cart);
});

router.post("/remove", async function(req, res, next) {
  const { productId } = req.body;
  if (!req.session.cart) {
    res.status(400).json({ error: "No cart in current session" });
  }
  req.session.cart = await removeFromCart(req.session.cart, productId);
  await req.session.save(err => console.log("ERROR while /remove" + err));
  res.json(req.session.cart);
});

router.get("/charge", async (req, res) => {
  const success_url= `${BASE_URL}/cart/payment-success`;
  const cancel_url= `${BASE_URL}/cart/payment-failed`;
  const cart = req.session.cart;
  const line_items = extractLineItemsFromCart(cart)
  const session = await createSession(line_items, success_url, cancel_url);
  if (session) {
    req.session.cart.stripe = session;
    req.session.save(err => console.log("ERROR while /charge: " + err));
  }
  res.json({ session, error });
});

router.get("/payment-success", async (req, res) => {
  console.log(req);
  const sessionCart = { ...defaultCart };
  req.session.cart = sessionCart;
  req.session.save(err => console.log("error while /add - new cart" + err));
  res.redirect(`${CLIENT_URL}/checkout-success`);
});

router.get("/payment-failed", async (req, res) => {
  console.log(req);
  res.redirect(`${CLIENT_URL}/checkout-fail`);
});

module.exports = router;
