const {
  addToCart,
  findCartItemByProductId,
  fetchProductById,
  updateProductQuantityAndSubtotal,
  updateTotalAndItemCount,
  calculateSubtotal,
  round,
} = require("../../src/cart-logic");

test("should round up price - increment integer part", () => {
  const rounded = round(79.998);
  expect(rounded).toBe(80);
});

test("should round up price - increment fractional part", () => {
  const rounded = round(79.989);
  expect(rounded).toBe(79.99);
});

test("should calculate subtotal", () => {
  const subtotal = calculateSubtotal(79.989, 2);
  expect(subtotal).toBe(159.98);
});

test("should calculate subtotal - 0 quantity", () => {
  const subtotal = calculateSubtotal(0, 79.989);
  expect(subtotal).toBe(0);
});
test("should calculate subtotal - 0 price", () => {
  const subtotal = calculateSubtotal(1, 0);
  expect(subtotal).toBe(0);
});

test("should calculate subtotal - null price", () => {
  const subtotal = calculateSubtotal(1, null);
  expect(subtotal).toBe(0);
});

test("should update cart total and item count", () => {
  const cart = {
    items: [
      {
        quantity: 1,
        subTotal: 99.33,
      },
      {
        quantity: 3,
        subTotal: 1.17,
      },
    ],
  };
  const updatedCart = updateTotalAndItemCount(cart);
  expect(updatedCart.total).toBe(100.5);
  expect(updatedCart.itemsCount).toBe(4);
});

test("should update cart total and item count - null quantity and subtotal", () => {
  const cart = {
    items: [
      {
        quantity: null,
        subTotal: null,
      },
      {
        quantity: null,
        subTotal: null,
      },
    ],
  };
  const updatedCart = updateTotalAndItemCount(cart);
  expect(updatedCart.total).toBe(0);
  expect(updatedCart.itemsCount).toBe(0);
});

test("should update cart item subtotal and quantity - quantity not set", () => {
  const product = {
    name: "Snake 3D",
    image: "/images/products/snake.png",
    description: "description",
    rating: 4,
    price: 99.99,
    productId: 1,
    category: "games",
    subcategory: "ps4",
    badges: ["Best Seller"],
  };
  const updatedItem = updateProductQuantityAndSubtotal(product, 7);
  console.log(JSON.stringify(updatedItem));
  expect(updatedItem.quantity).toBe(7);
  expect(updatedItem.price).toEqual(99.99);
  expect(updatedItem.productId).toBe(1);
  expect(updatedItem.subTotal).toBe(699.93);
});

test("should update cart item subtotal and quantity - quantity set", () => {
  const product = {
    name: "Snake 3D",
    image: "/images/products/snake.png",
    description: "description",
    rating: 4,
    price: 99.99,
    quantity: 2,
    productId: 1,
    category: "games",
    subcategory: "ps4",
    badges: ["Best Seller"],
  };
  const updatedItem = updateProductQuantityAndSubtotal(product, 7);
  console.log(JSON.stringify(updatedItem));
  expect(updatedItem.quantity).toBe(9);
  expect(updatedItem.price).toEqual(99.99);
  expect(updatedItem.productId).toBe(1);
  expect(updatedItem.subTotal).toBe(899.91);
});

// const updateProductQuantityAndSubtotal = (product, quantity) => {
//   product.quantity += quantity;
//   product.subTotal = calculateSubtotal(product.quantity, product.price);
//   return product;
// };
// exports.updateProductQuantityAndSubtotal;

// const findCartItemByProductId = (cart, productId) => {
//   return cart.items.find(item => item.productId == productId);
// };
// exports.findCartItemByProductId;

// const addToCart = async (cart, productId, quantity) => {
//   const productInCart = findCartItemByProductId(cart, productId);
//   if (productInCart) {
//     updateProductQuantityAndSubtotal(productInCart, quantity);
//   } else {
//     const productFetched = fetchProductById(productId);
//     const product = { quantity: 0, productId, price: productFetched.price };
//     cart.items.push(updateProductQuantityAndSubtotal(product, quantity));
//   }
//   return updateTotalAndItemCount(cart);
// };
// exports.addToCart = addToCart;

// const fetchProductById = async productId => {
//   const url = `${BASE_URL}/products/${productId}`;
//   console.log("Fetching: " + url);
//   const product = await fetch(url).then(res => res.json());
//   return product;
// };
// exports.fetchProductById;
