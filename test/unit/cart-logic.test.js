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
  expect(updatedItem.quantity).toBe(9);
  expect(updatedItem.price).toEqual(99.99);
  expect(updatedItem.productId).toBe(1);
  expect(updatedItem.subTotal).toBe(899.91);
});

test("should find item in cart by product ID", () => {
  const cart = {
    items: [
      {
        quantity: 3,
        productId: 2,
        price: 999.99,
        subTotal: 2999.97,
      },
      {
        quantity: 4,
        productId: 3,
        price: 2999.99,
        subTotal: 11999.96,
      },
      {
        quantity: 1,
        productId: 1,
        price: 99.99,
        subTotal: 99.99,
      },
      {
        quantity: 2,
        productId: 4,
        price: 19.99,
        subTotal: 39.98,
      },
      {
        quantity: 2,
        productId: 5,
        price: 9.99,
        subTotal: 19.98,
      },
    ],
  };
  const item = findCartItemByProductId(cart, 4);
  expect(item.productId).toBe(4);
  expect(item.quantity).toBe(2);
  expect(item.price).toEqual(19.99);
  expect(item.subTotal).toBe(39.98);
});

test("should find item in cart by product ID - product not in cart", () => {
  const cart = {
    items: [
      {
        quantity: 3,
        productId: 2,
        price: "999.99",
        subTotal: 2999.97,
      },
      {
        quantity: 4,
        productId: 3,
        price: "2999.99",
        subTotal: 11999.96,
      },
      {
        quantity: 1,
        productId: 1,
        price: "99.99",
        subTotal: 99.99,
      },
      {
        quantity: 2,
        productId: 4,
        price: "19.99",
        subTotal: 39.98,
      },
      {
        quantity: 2,
        productId: 5,
        price: "9.99",
        subTotal: 19.98,
      },
    ],
  };
  const item = findCartItemByProductId(cart, 7);
  expect(item).not.toBeDefined();
});
