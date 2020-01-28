const express = require("express");
const router = express.Router();
const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(secretKey);
const fetch = require("node-fetch");
const BASE_URL = process.env.SERVER_URL;
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
  total: 0,
  currency: "EUR",
  itemsCount: 0,
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
const json = {
  items: [{ productId: 2, quantity: 1, subTotal: null, numberOfProducts: 1 }],
  customerId: null,
  sessionId: "P0suL1ec-4BTRX4Pa8JpOiVdHawgD3WW",
  paid: false,
  created: "2020-01-25T08:20:17.524Z",
  total: null,
  currency: "EUR",
  itemsCount: 1,
};

// name: "Y-Phone Deluxe"
// image: "http://localhost:3030/images/products/phone.webp"
// description: "Cras purus odio, vestibulum↵      in vulputate at, tempus viverra turpis. Fusce condimentum↵      nunc ac nisi vulputate fringilla. Donec lacinia congue felis↵      in faucibus."
// rating: "9/10"
// category: "phone-smartphone"
// price: "$999.99"
// productId: 2
// quantity: 1

const enrichItem = function(item) {
  const url = `${BASE_URL}/products/${item.productId}`;
  return fetch(url).then(res =>
    res.json().then(product => {
      product.subTotal = product.price * item.quantity;
      console.log("### product enriched: " + JSON.stringify(product));
      return product;
    })
  );
};

router.get("/details", async function(req, res, next) {
  // let total = 0;
  // let numberOfProducts = 0;
  // console.log("SESSION KEYS: " + JSON.stringify(req.session));
  // console.log("SESSION ID: " + req.sessionID);
  // console.log("cart in session: " + JSON.stringify(req.session.cart));

  // if (req.session.cart) {
  //   const enrichedProducts = req.session.cart.items.map(item =>
  //     { const enriched = await enrichItem(item); return enriched;}
  //   );
  //   // console.log(
  //   //   "cartItemsDetails enriched >>> " + JSON.stringify(enrichedProducts)
  //   // );

  //   // req.session.cart.items = {};
  //   // enrichedProducts.forEach(
  //   //   item => (req.session.cart.items[item.productId] = item)
  //   // );
  //   // req.session.cart.itemsCount = numberOfProducts;
  //   // req.session.cart.total = total;
  //   // req.session.save(err => console.log("error while /updating cart" + err));

  //   res.json(req.session.cart);
  // } else {
  res.json({ message: "no data" });
  // }
});

router.post("/add", async function(req, res, next) {
  const { productId, quantity } = req.body;
  const url = `${BASE_URL}/products/${productId}`;
  console.log("Fetching: " + url);
  const product = await fetch(url).then(res => res.json());

  console.log(">product: " + JSON.stringify(product));
  if (!req.session.cart) {
    const sessionCart = { ...cart };
    product.quantity = quantity;
    product.subTotal = product.quantity * product.price;
    sessionCart.items.push(product);
    sessionCart.sessionId = req.sessionID;
    req.session.cart = sessionCart;
    req.session.cart;
    req.session.save(err => console.log("error while /add - new cart" + err));
  } else {
    const isAlreadyInCart = req.session.cart.items.find(
      item => item.productId == productId
    );
    if (isAlreadyInCart) {
      const updated = req.session.cart.items.map(item => {
        if (item.productId == productId) {
          item.quantity += quantity;
          item.subTotal = item.quantity * product.price;
        }
        return item;
      });

      req.session.cart.items = updated;
    } else {
      product.quantity = quantity;
      product.subTotal = product.quantity * product.price;
      req.session.cart.items.push(product);
    }
    req.session.save(err =>
      console.log("error while /add - existing cart" + err)
    );
  }
  console.log("SESSION ID: " + req.sessionID);
  console.log(">req.user: " + JSON.stringify(req.user));
  console.log(">session.cart: " + JSON.stringify(req.session.cart));

  let itemsCount = 0;
  let total = 0;
  req.session.cart.items.forEach(element => {
    itemsCount += element.quantity;
    total += element.subTotal;
  });
  req.session.cart.total = total;
  req.session.cart.itemsCount = itemsCount;
  req.session.save(err =>
    console.log("error while /add - existing cart" + err)
  );
  res.json(req.session.cart);
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
