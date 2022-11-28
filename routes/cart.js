const express = require("express");
const router = express.Router();
const { authenticationMiddleware } = require("../controllers/authController");

const {
  addItemToCart,
  getCart,
  deleteCart,
} = require("../controllers/cartController");

router.post("/:username", authenticationMiddleware, async (req, res, next) => {
  const username = req.params["username"];
  const { productId, quantity } = req.body;
  try {
    const newItems = await addItemToCart(username, productId, quantity);
    return res.json(newItems);
  } catch (err) {
    res.status(400).json({ errors: err.message });
  }
});

router.get("/:username", authenticationMiddleware, async (req, res, next) => {
  const username = req.params["username"];
  const cart = await getCart(username);
  return res.json(cart);
});

router.delete(
  "/:username",
  authenticationMiddleware,
  async (req, res, next) => {
    const username = req.params["username"];
    await deleteCart(username);
    return res.json({ message: "cart removed" });
  }
);

module.exports = router;
