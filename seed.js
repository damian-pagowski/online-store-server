const mongoose = require("mongoose");
const Products = require("./models/product");
const Categories = require("./models/category");

require("dotenv").config();

const DB_URI = process.env.MONGOLAB_URI;

mongoose.set("useFindAndModify", false);
mongoose
  .connect(DB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .catch((error) => console.log(error));

const products = [
  {
    name: "Snake 3D",
    image: "/images/products/snake.png",
    description: `ante sollicitudin. Cras purus odio, vestibulum
        in vulputate at, tempus viverra turpis. Fusce condimentum
        nunc ac nisi vulputate fringilla. Donec lacinia.`,
    rating: 4,
    price: "99.99",
    productId: 1,
    category: "games",
    subcategory: "ps4",
    badges: ["Best Seller"],
  },
  {
    name: "Durian Deluxe",
    image: "/images/products/phone.webp",
    description: `Cras purus odio, vestibulum
        in vulputate at, tempus viverra turpis. Fusce condimentum
        nunc ac nisi vulputate fringilla. Donec lacinia congue felis
        in faucibus.`,
    rating: 3,
    category: "phones",
    subcategory: "smartphones",
    price: "999.99",
    productId: 2,
    badges: ["Our Choice"],
  },

  {
    name: "Durian Premium Pro",
    image: "/images/products/laptop.webp",
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
  {
    name: "Hipster Game",
    image: "/images/products/game.webp",
    description: `Cras sit amet nibh libero, in gravida nulla. Nulla vel metus
        scelerisque ante sollicitudin. Cras purus odio, vestibulum
        in vulputate at, tempus viverra turpis. Fusce condimentum
        nunc ac nisi vulputate fringilla. Donec lacinia congue felis
        in faucibus.`,
    rating: 4,
    price: "19.99",
    productId: 4,
    category: "games",
    subcategory: "pc",
    badges: ["Best Seller"],
  },
  {
    name: "Divide and Conquer",
    image: "/images/products/strategy1.jpeg",
    description: `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nulla, excepturi veritatis. 
      Doloribus, provident nisi ratione possimus aliquam eligendi! Dolorum eum sed asperiores alias natus repudiandae?`,
    rating: 5,
    price: "9.99",
    productId: 5,
    category: "games",
    subcategory: "pc",
    badges: ["Best Seller"],
  },
  {
    name: "Mockia",
    image: "/images/products/phone.webp",
    description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero, cumque. Lorem ipsum dolor sit amet.`,
    rating: 5,
    category: "phones",
    subcategory: "smartphones",
    price: "19.99",
    productId: 6,
    badges: [],
  },
  {
    name: "Age Of Colonies",
    image: "/images/products/strategy2.jpeg",
    description: `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nulla, excepturi veritatis. 
      Doloribus, provident nisi ratione possimus aliquam eligendi! Dolorum eum sed asperiores alias natus repudiandae.
       Vero, cumque. Lorem ipsum dolor sit amet.`,
    rating: 5,
    price: "5.99",
    productId: 7,
    category: "games",
    subcategory: "ps4",
    badges: ["Best Seller"],
  },
  {
    name: "Durian Air",
    image: "/images/products/laptop.webp",
    description: `Nulla, excepturi veritatis. 
      Doloribus, provident nisi ratione possimus aliquam eligendi! Dolorum eum sed asperiores alias natus repudiandae.`,
    rating: 4,
    price: "699.99",
    category: "computers",
    subcategory: "laptops",
    productId: 8,
    badges: ["Best Value"],
  },
];
const entities = products.map((p) => new Products(p));
entities.forEach((e) => e.save());

const categories = [
  {
    name: "computers",
    display: "Computers",
    subcategories: [
      { name: "laptops", display: "Laptops" },
      { name: "tablets", display: "Tablets" },
      { name: "peripherials", display: "Peripherials" },
      { name: "accessories", display: "Accessories" },
    ],
  },
  {
    name: "games",
    display: "Video Games",
    subcategories: [
      { name: "pc", display: "PC" },
      { name: "ps5", display: "PS 5" },
      { name: "ps4", display: "PS 4" },
      { name: "xbox360", display: "Bbox 360" },
    ],
  },
  {
    name: "phones",
    display: "Cell Phones",
    subcategories: [
      { name: "smartphones", display: "Smart Phones" },
      { name: "wisephones", display: "Wise Phones" },
      { name: "hipster", display: "Hipster" },
      { name: "classic", display: "Classic" },
    ],
  },
];

const entitiesCat = categories.map((c) => new Categories(c));

entitiesCat.forEach((e) => e.save());
