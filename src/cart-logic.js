const fetch = require("node-fetch");
const BASE_URL = process.env.SERVER_URL;

const findCartItemByProductId = (cart, productId) => {
  return cart.items.find(item => item.productId == productId);
};
exports.findCartItemByProductId = findCartItemByProductId;

const addToCart = async (cart, productId, quantity) => {
  const productInCart = findCartItemByProductId(cart, productId);
  if (productInCart) {
    updateProductQuantityAndSubtotal(productInCart, quantity);
  } else {
    const productFetched = await fetchProductById(productId);
    const product = { quantity: 0, productId, price: productFetched.price };
    cart.items.push(updateProductQuantityAndSubtotal(product, quantity));
  }
  return updateTotalAndItemCount(cart);
};
exports.addToCart = addToCart;

const fetchProductById = async productId => {
  const url = `${BASE_URL}/products/${productId}`;
  console.log("Fetching: " + url);
  const product = await fetch(url).then(res => res.json());
  return product;
};
exports.fetchProductById = fetchProductById;

const updateProductQuantityAndSubtotal = (product, quantity) => {
  const tmp = { ...product };
  tmp.quantity = tmp.quantity ? tmp.quantity + quantity : quantity;
  tmp.subTotal = calculateSubtotal(tmp.quantity, product.price);
  return tmp;
};
exports.updateProductQuantityAndSubtotal = updateProductQuantityAndSubtotal;

const updateTotalAndItemCount = cart => {
  let itemsCount = 0;
  let total = 0.0;
  cart.items.forEach(element => {
    itemsCount += element.quantity;
    total += element.subTotal;
  });
  cart.total = round(total);
  cart.itemsCount = itemsCount;
  return cart;
};
exports.updateTotalAndItemCount = updateTotalAndItemCount;
const calculateSubtotal = (quantity, unitPrice) => {
  return round(quantity * unitPrice);
};
exports.calculateSubtotal = calculateSubtotal;
const round = function(num) {
  return +(Math.round(num + "e+2") + "e-2");
};
exports.round = round;
