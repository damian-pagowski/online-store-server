import mongoose from "mongoose";
import Blog from "./model/Blog";
require("dotenv").config();

const DB_URI = process.env.MONGOLAB_URI;

mongoose.connect(DB_URI);

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
    name: "Y-Phone Deluxe",
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
    name: "Y-Book Premium Pro",
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
    name: "Another Hipster Game",
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
    name: "Durian Potato",
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
    name: "Som Tam Air",
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

// Create a new blog post object
const article = new Blog({
  title: "Awesome Post!",
  slug: "awesome-post",
  published: true,
  content: "This is the best post ever",
  tags: ["featured", "announcement"],
});

// Insert the article in our MongoDB database
await article.save();
