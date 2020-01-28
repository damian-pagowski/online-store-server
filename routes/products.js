const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.json(productInfo);
});

router.get("/:id", (req, res, next) => {
  const id = req.params["id"];
  const found = productInfo.find(item => item.productId == id);

  found ? res.json(found) : res.status(404).json({ message: "not found" });
});

const productInfo = [
  {
    name: "Another Hipster Game",
    image: "http://localhost:3030/images/products/game.webp",
    description: `Cras sit amet nibh libero, in gravida nulla. Nulla vel metus
      scelerisque ante sollicitudin. Cras purus odio, vestibulum
      in vulputate at, tempus viverra turpis. Fusce condimentum
      nunc ac nisi vulputate fringilla. Donec lacinia congue felis
      in faucibus.`,
    rating: "8/10",
    price: "99.99",
    productId: 1,
    category: "game-pc",
  },
  {
    name: "Y-Phone Deluxe",
    image: "http://localhost:3030/images/products/phone.webp",
    description: `Cras purus odio, vestibulum
      in vulputate at, tempus viverra turpis. Fusce condimentum
      nunc ac nisi vulputate fringilla. Donec lacinia congue felis
      in faucibus.`,
    rating: "9/10",
    category: "phone-smartphone",
    price: "999.99",
    productId: 2,
  },
  {
    name: "Y-Book Premium Pro",
    image: "http://localhost:3030/images/products/laptop.webp",
    description: `Cras sit amet nibh libero, in gravida nulla. Nulla vel metus
        scelerisque ante sollicitudin. Cras purus odio, vestibulum
        in vulputate at, tempus viverra turpis.`,
    rating: "9/10",
    price: "2999.99",
    category: "computer-laptop",
    productId: 3,
  },
];
module.exports = router;
