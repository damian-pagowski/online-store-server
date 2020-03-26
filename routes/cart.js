const express = require("express");
const router = express.Router();
const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(secretKey);
const BASE_URL = process.env.SERVER_URL;
const CLIENT_URL = process.env.CLIENT_URL;
const { addToCart, removeFromCart , updateCart} = require("../src/cart");
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
  req.session.save(err => console.log("Error while /edit" + err));
  res.json(req.session.cart);
});

router.post("/remove", async function(req, res, next) {
  const { productId } = req.body;
  if (!req.session.cart) {
    res.status(400).json({ error: "No cart in current session" });
  }
  const updatedCart = await removeFromCart(req.session.cart, productId);
  req.session.cart = updatedCart;
  req.session.save(err => console.log("ERROR while /remove" + err));
  res.json(req.session.cart);
});

router.get("/charge", async (req, res) => {
  let session = {};
  let error = {};
  const cart = req.session.cart;
  const line_items = cart.items.map(item => ({
    name: item.name,
    description: item.description,
    images: [BASE_URL + item.image],
    amount: Math.floor(item.subTotal * 100),
    currency: cart.currency,
    quantity: item.quantity,
  }));
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      payment_intent_data: {
        capture_method: "manual",
      },
      success_url: `${BASE_URL}/cart/payment-success`,
      cancel_url: `${BASE_URL}/cart/payment-failed`,
    });
  } catch (err) {
    console.log(err);
    error = err;
  }
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

function round(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

module.exports = router;
