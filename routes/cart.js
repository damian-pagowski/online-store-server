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
router.get("/", function(req, res, next) {
  res.json(cart);
});

// productId
// quantity
router.post("/add", function(req, res, next) {
  if (!cart.sessionId) {
    cart.sessionId = req.sessionID;
  }
  const { productId, quantity } = req.body;
  console.log(req.body);
  console.log("session: " + JSON.stringify(req.session));
  console.log("session id : " + req.sessionID);
  cart.items.push({ productId, quantity });
  res.json({ message: "added" });
});
router.post("/edit", function(req, res, next) {
  console.log(req.body);
  const { productId, quantity } = req.body;
  const item = cart.items.find(item => item.productId == productId);
  item.quantity = quantity;
  //   push({productId, quantity})
  res.json({ message: "modified" });
});
router.post("/remove", function(req, res, next) {
  const { productId } = req.body;
  const items = cart.items.filter(item => item.productId != productId);
  cart.items = items;

  console.log(req.body);
  res.json({ message: "removed" });
});

router.get("/checkout", function(req, res, next) {
  console.log(req.body);
  cart.paid = true;
  res.json({ message: "paid" });
});

module.exports = router;
