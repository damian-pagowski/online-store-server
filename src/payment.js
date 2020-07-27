const BASE_URL = process.env.SERVER_URL;
const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(secretKey);

const extractLineItemsFromCart = (cart) => {
  return cart.items.map((item) => ({
    name: item.name,
    name: item.name,
    description: item.description,
    description: item.description,
    images: [BASE_URL + item.image],
    images: [BASE_URL + item.image],
    amount: Math.floor(item.subTotal * 100),
    amount: Math.floor(item.subTotal * 100),
    currency: cart.currency,
    currency: cart.currency,
    quantity: item.quantity,
    quantity: item.quantity,
  }));
};

exports.extractLineItemsFromCart = extractLineItemsFromCart;

const createSession = (line_items, success_url, cancel_url) => {
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    payment_intent_data: {
      capture_method: "manual",
    },
    success_url: `${BASE_URL}/cart/payment-success`,
    cancel_url: `${BASE_URL}/cart/payment-failed`,
  });
};
exports.createSession = createSession;
