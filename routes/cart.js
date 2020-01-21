const express = require("express");
const router = express.Router();
const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(secretKey);

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
  console.log("_____________________");
  console.log(JSON.stringify(Object.keys(req)));
  console.log(JSON.stringify(req.sess));

  console.log("_____________________");

  res.json(req.session.cart);
});

router.get("/details", function(req, res, next) {
  let total = 0;
  let numberOfProducts = 0;
  const currency = "usd";
  const cartItemsDetails = req.session.cart.items.map(item => {
    let i = { ...item };
    const product = stock[item.productId];
    const subTotal = product.unitPrice * item.quantity;
    i.subTotal = subTotal;
    total += subTotal;
    numberOfProducts += item.quantity;
    i.currency = product.currency;
    i.unitPrice = product.unitPrice;
    i.name = product.name;
    i.numberOfProducts = numberOfProducts;
    return i;
  });
  console.log("user " + JSON.stringify(req.user));
  console.log("cart " + JSON.stringify(req.session.cart));
  res.json({ total, currency, items: cartItemsDetails });
});

router.post("/add", function(req, res, next) {
  const { productId, quantity } = req.body;
  if (!req.session.cart) {
    const sessionCart = { ...cart };
    sessionCart.items.push({ productId, quantity });
    sessionCart.sessionId = req.sessionID;
    req.session.cart = sessionCart;
    req.session.save(err => console.log("error while /add - new cart" + err));
  } else {
    req.session.cart.items.push({ productId, quantity });
    req.session.save(err =>
      console.log("error while /add - existing cart" + err)
    );
  }
  console.log("user " + JSON.stringify(req.user));
  console.log("cart " + JSON.stringify(req.session.cart));
  res.json({ message: "added", data: req.session.cart });
});
router.post("/edit", function(req, res, next) {
  const { productId, quantity } = req.body;
  const item = req.session.cart.items.find(item => item.productId == productId);
  item.quantity = quantity;
  req.session.save(err => console.log("Error while /edit" + err));
  console.log("user " + JSON.stringify(req.user));
  console.log("cart " + JSON.stringify(req.session.cart));
  res.json({ message: "modified", data: req.session.cart });
});
router.post("/remove", function(req, res, next) {
  const { productId } = req.body;
  req.session.cart.items = req.session.cart.items.filter(
    item => item.productId != productId
  );
  req.session.save(err => console.log("ERROR while /remove" + err));
  console.log("user " + JSON.stringify(req.user));
  console.log("cart " + JSON.stringify(req.session.cart));
  res.json({ message: "removed", data: req.session.cart });
});

router.get("/checkout", async function(req, res, next) {
  // if (!req.session.user) {
  //   res.status(401).json({ message: "log in before checkout" });
  // }
  // req.session.cart.paid = true;
  // req.session.save(err => console.log("error while /checkout" + err));
  // console.log("user " + JSON.stringify(req.user));
  // console.log("cart " + JSON.stringify(req.session.cart));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: "usd",
  });

  res.json({ message: "paid", data: paymentIntent });
});

router.get("/paid", function(req, res, next) {
  res
    .status(200)
    .json({ message: "Thanks for payment. Will be sent in 1 working day" });
});
router.get("/payment", function(req, res, next) {
  res.render("payment");
});

router.get("/cancelled", function(req, res, next) {
  res.status(200).json({ message: "Sorry to see you changing your mind" });
});

router
  .get("/stripe-key", (req, res) => {
    res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  })
  .post("/pay", async (req, res) => {
    const {
      paymentMethodId,
      paymentIntentId,
      items,
      currency,
      useStripeSdk,
    } = req.body;

    const orderAmount = calculateOrderAmount(items);

    try {
      let intent;
      if (paymentMethodId) {
        // Create new PaymentIntent with a PaymentMethod ID from the client.
        intent = await stripe.paymentIntents.create({
          amount: orderAmount,
          currency: currency,
          payment_method: paymentMethodId,
          confirmation_method: "manual",
          confirm: true,
          // If a mobile client passes `useStripeSdk`, set `use_stripe_sdk=true`
          // to take advantage of new authentication features in mobile SDKs
          use_stripe_sdk: useStripeSdk,
        });
        // After create, if the PaymentIntent's status is succeeded, fulfill the order.
      } else if (paymentIntentId) {
        // Confirm the PaymentIntent to finalize payment after handling a required action
        // on the client.
        intent = await stripe.paymentIntents.confirm(paymentIntentId);
        // After confirm, if the PaymentIntent's status is succeeded, fulfill the order.
      }
      res.send(generateResponse(intent));
    } catch (e) {
      // Handle "hard declines" e.g. insufficient funds, expired card, etc
      // See https://stripe.com/docs/declines/codes for more
      res.send({ error: e.message });
    }
  });

const calculateOrderAmount = items => {
  // Replace this constant with a calculation of the order's amount
  // You should always calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

const generateResponse = intent => {
  // Generate a response based on the intent's status
  switch (intent.status) {
    case "requires_action":
    case "requires_source_action":
      // Card requires authentication
      return {
        requiresAction: true,
        clientSecret: intent.client_secret,
      };
    case "requires_payment_method":
    case "requires_source":
      // Card was not properly authenticated, suggest a new payment method
      return {
        error: "Your card was denied, please provide a new payment method",
      };
    case "succeeded":
      // Payment is complete, authentication not required
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      console.log("💰 Payment received!");
      return { clientSecret: intent.client_secret };
  }
};

module.exports = router;
