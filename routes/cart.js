const express = require("express");
const router = express.Router();

// 1 handle abandoned cart - for example if cart was created more than X hours ago and
// there is no payment, an email is sent to user
// 2 user id - if user sends checkout it must be checked if user is authenticated
// if not authenticated - redirect to register /login page
// 3 user is tracked when not authenticated. session id stored in cookie or local storage.
// not sure which one is better now when there are 'legal issues' with accepting cookies etc
// I have to check that later.
// anyways, it looks like its easier with cookie. a cookie is sent in heawder of every request.
// merging session after user does login/registration? is that a problem?
// PLAN:
// start without DB and authentication
// A just implement routes and test
// B add authentication
// c add database
// d simple ui
// e add stripe payments
const cart = {
  items: [],
  customerId: null,
  sessionId: null,
  paid: false,
  created: new Date(),
};

const stock = {
  1: { name: "YPhone", unitPrice: 1000, currency: "usd" },
  2: { name: "XBook", unitPrice: 1500, currency: "usd" },
  3: { name: "ZPad", unitPrice: 500, currency: "usd" },
};
router.get("/", function(req, res, next) {
  res.json(req.session.cart);
});

router.get("/details", function(req, res, next) {
  let total = 0;
  const currency = "usd";
  const cartItemsDetails = req.session.cart.items.map(item => {
    let i = { ...item };
    const product = stock[item.productId];
    const subTotal = product.unitPrice * item.quantity;
    i.subTotal = subTotal;
    total += subTotal;
    i.currency = product.currency;
    i.unitPrice = product.unitPrice;
    i.name = product.name;
    return i;
  });
  res.json({ total, currency, items: cartItemsDetails });
});

router.post("/add", function(req, res, next) {
  const { productId, quantity } = req.body;
  if (!req.session.cart) {
    const sessionCart = { ...cart };
    sessionCart.items.push({ productId, quantity });
    sessionCart.sessionId = req.sessionID;
    req.session.cart = sessionCart;
    req.session.save(err => console.log(err));
  } else {
    req.session.cart.items.push({ productId, quantity });
    req.session.save(err => console.log(err));
  }
  res.json({ message: "added", data: req.session.cart });
});
router.post("/edit", function(req, res, next) {
  const { productId, quantity } = req.body;
  const item = req.session.cart.items.find(item => item.productId == productId);
  item.quantity = quantity;
  req.session.save(err => console.log(err));
  res.json({ message: "modified", data: req.session.cart });
});
router.post("/remove", function(req, res, next) {
  const { productId } = req.body;
  req.session.cart.items = req.session.cart.items.filter(
    item => item.productId != productId
  );
  req.session.save(err => console.log(err));
  res.json({ message: "removed", data: req.session.cart });
});

router.get("/checkout", function(req, res, next) {
  req.session.cart.paid = true;
  req.session.save(err => console.log(err));
  res.json({ message: "paid", data: req.session.cart });
});

module.exports = router;
