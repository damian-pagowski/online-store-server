const express = require("express");
const router = express.Router();
const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(secretKey);
const fetch = require("node-fetch");
const BASE_URL = process.env.SERVER_URL;
const CLIENT_URL = process.env.CLIENT_URL;

const cart = {
  items: [],
  customerId: null,
  sessionId: null,
  paid: false,
  created: new Date(),
  total: 0.0,
  currency: "EUR",
  itemsCount: 0,
};

router.get("/details", async function(req, res, next) {
  if (!req.session.cart) {
    const sessionCart = { ...cart };
    req.session.cart = sessionCart;
    req.session.save(err => {
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
  const url = `${BASE_URL}/products/${productId}`;
  console.log("Fetching: " + url);
  const product = await fetch(url).then(res => res.json());

  if (product.error) {
    return res.status(400).json({ error: "product ID invalid" });
  }
  console.log(">product: " + JSON.stringify(product));
  if (!req.session.cart) {
    const sessionCart = { ...cart };
    product.quantity = quantity;
    product.subTotal = round(product.quantity * product.price);
    sessionCart.items.push(product);
    sessionCart.sessionId = req.sessionID;
    req.session.cart = sessionCart;
    req.session.cart;
    req.session.save(err => {
      {
        console.log("error while /add - NEW CART - ERROR " + err);
        console.log("error while /add - REQUEST " + req.body);
      }
    });
  } else {
    const isAlreadyInCart = req.session.cart.items.find(
      item => item.productId == productId
    );
    if (isAlreadyInCart) {
      const updated = req.session.cart.items.map(item => {
        if (item.productId == productId) {
          item.quantity += quantity;
          item.subTotal = round(item.quantity * product.price);
        }
        return item;
      });

      req.session.cart.items = updated;
    } else {
      product.quantity = quantity;
      product.subTotal = round(product.quantity * product.price);
      req.session.cart.items.push(product);
    }
    req.session.save(err => {
      console.log("error while /add - EXISTING CART - ERROR " + err);
      console.log("error while /add - REQUEST " + req.body);
    });
  }
  let itemsCount = 0;
  let total = 0.0;
  req.session.cart.items.forEach(element => {
    itemsCount += element.quantity;
    total += element.subTotal;
  });
  req.session.cart.total = round(total);
  req.session.cart.itemsCount = itemsCount;
  req.session.save(err => {
    console.log("error while /add - EXISTING CART - ERROR " + err);
    console.log("error while /add - REQUEST " + req.body);
  });
  res.status(201).json(req.session.cart);
});
router.post("/edit", function(req, res, next) {
  const { productId, quantity } = req.body;

  if (!req.session.cart) {
    return res.status(400).json({ error: "No cart in current session" });
  }
  const item = req.session.cart.items.find(item => item.productId == productId);
  if (!item) {
    return res.status(404).json({ error: "Item not in cart" });
  }
  item.quantity = quantity;
  item.subTotal = round(quantity * item.price);

  req.session.save(err => {
    console.log("error while /EDIT - ERROR " + err);
    console.log("error while /EDIT - REQUEST " + req.body);
  });

  let itemsCount = 0;
  let total = 0.0;
  req.session.cart.items.forEach(element => {
    itemsCount += element.quantity;
    total += element.subTotal;
  });
  req.session.cart.total = round(total);
  req.session.cart.itemsCount = itemsCount;
  req.session.save(err => console.log("Error while /edit" + err));
  res.json(req.session.cart);
});
router.post("/remove", function(req, res, next) {
  const { productId } = req.body;
  if (!req.session.cart) {
    res.status(400).json({ error: "No cart in current session" });
  }
  const before = req.session.cart.items;
  const filtered = req.session.cart.items.filter(
    item => item.productId != productId
  );
  if (before.length == filtered.length) {
    return res.status(404).json({ error: "Item not in cart" });
  }
  req.session.save(err => console.log("ERROR while /remove" + err));
  let itemsCount = 0;
  let total = 0.0;
  filtered.forEach(element => {
    itemsCount += element.quantity;
    total += element.subTotal;
  });
  req.session.cart.items = filtered;
  req.session.cart.total = round(total);
  req.session.cart.itemsCount = itemsCount;
  req.session.save(err => console.log("Error while /edit" + err));
  res.json(req.session.cart);
});

// Charge Route
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
  const sessionCart = { ...cart };
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
