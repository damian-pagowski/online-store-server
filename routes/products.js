const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.json(productInfo);
});

router.get("/categories/", (req, res, next) => {
  const categories = {
    computers: {
      display: "Computers",
      subcategories: {
        laptops: "Laptops",
        tablets: "Tablets",
        peripherials: "Peripherials",
        accessories: "Accessories",
      },
    },
    games: {
      display: "Video Games",
      subcategories: {
        pc: "PC",
        ps5: "PS 5",
        ps4: "PS 4",
        xbox360: "Bbox 360",
      },
    },
    phones: {
      display: "Cell Phones",
      subcategories: {
        smartphones: "Smart Phones",
        wisephones: "Wise Phones",
        hipster: "Hipster",
        classic: "Classic",
      },
    },
  };
  res.json(categories);
});
router.get("/:id", (req, res, next) => {
  const id = req.params["id"];
  const found = productInfo.find(item => item.productId == id);

  found ? res.json(found) : res.status(404).json({ error: "not found" });
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
    rating: 4,
    price: "99.99",
    productId: 1,
    category: "games",
    subcategory: "pc",
    badges: ["Best Seller"],
  },
  {
    name: "Y-Phone Deluxe",
    image: "http://localhost:3030/images/products/phone.webp",
    description: `Cras purus odio, vestibulum
      in vulputate at, tempus viverra turpis. Fusce condimentum
      nunc ac nisi vulputate fringilla. Donec lacinia congue felis
      in faucibus.`,
    rating: 3,
    category: "cellphones",
    subcategory: "smartphones",
    price: "999.99",
    productId: 2,
    badges: ["Our Choice"],
  },
  {
    name: "Y-Book Premium Pro",
    image: "http://localhost:3030/images/products/laptop.webp",
    description: `Cras sit amet nibh libero, in gravida nulla. Nulla vel metus
        scelerisque ante sollicitudin. Cras purus odio, vestibulum
        in vulputate at, tempus viverra turpis.`,
    rating: 5,
    price: "2999.99",
    category: "computers",
    subcategory: "laptops",
    productId: 3,
    badges: ["Best Seller", "Best Value"],
  },
];
module.exports = router;
